import {
  Alert, AlertIcon, Avatar, Badge, Box, Button, FormControl, FormLabel, HStack,
  Select, Stack, Text, Textarea, useToast,
} from "@chakra-ui/react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useCachedQuery } from "../lib/queryCache";
import { AppLink } from "../lib/router";
import { deleteReview, getReviews, saveReview, setReviewHelpful } from "../services/communityService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import type { Review } from "../types/community";
import type { GameDetail } from "../types/game";
import GameMeter from "./GameMeter";

export default function ReviewSection({ game }: { game: GameDetail }) {
  const { session } = useAuth();
  const toast = useToast();
  const queryKey = `reviews:${game.id}:${session?.user.id ?? "guest"}`;
  const query = useCachedQuery(queryKey, () => getReviews(game.id), { enabled: true, ttlMs: 30_000 });
  const reviews = query.data?.reviews ?? [];
  const ownReview = reviews.find((review) => review.user_id === session?.user.id);
  const stats = query.data?.stats;

  const removeReview = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await deleteReview(game.id);
      query.refetch();
      toast({ title: "Review deleted.", status: "success", duration: 1800 });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Review could not be deleted.", status: "error" });
    }
  };

  const toggleHelpful = async (review: Review) => {
    if (!session) return toast({ title: "Sign in to vote on reviews.", status: "info" });
    try {
      await setReviewHelpful(review.id, !review.viewer_helpful);
      query.refetch();
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Vote could not be saved.", status: "error" });
    }
  };

  return (
    <Stack gap={6}>
      <GameMeter summary={{
        score: stats?.score ?? 0,
        recommendedPercent: stats?.recommended_percent ?? 0,
        reviewCount: stats?.review_count ?? 0,
      }} />

      {!isSupabaseConfigured && <Alert status="info"><AlertIcon />Configure Supabase Auth to sign in and review games.</Alert>}
      {isSupabaseConfigured && !session && <Alert status="info"><AlertIcon /><Text><AppLink to="/auth">Sign in</AppLink> to rate and review this game.</Text></Alert>}

      {session && (
        <ReviewForm
          key={ownReview?.updated_at ?? "new-review"}
          game={game}
          review={ownReview}
          onSaved={query.refetch}
        />
      )}

      <Stack gap={4}>
        {query.isLoading && <Text>Loading community reviews…</Text>}
        {query.error && <Alert status="error"><AlertIcon />{query.error.message}<Button ml={3} size="xs" onClick={query.refetch}>Retry</Button></Alert>}
        {reviews.map((review) => (
          <Box key={review.id} borderWidth="1px" borderRadius="xl" p={5}>
            <HStack justify="space-between" align="start">
              <HStack align="start">
                <Avatar size="sm" name={review.display_name} src={review.avatar_url ?? undefined} />
                <Stack gap={1}>
                  <Text fontWeight="800">{review.display_name}</Text>
                  <HStack><Badge colorScheme="purple">{review.score}/10</Badge><Badge colorScheme={review.recommended ? "green" : "red"}>{review.recommended ? "Recommends" : "Does not recommend"}</Badge></HStack>
                </Stack>
              </HStack>
              {review.user_id === session?.user.id && <Button size="xs" colorScheme="red" variant="ghost" onClick={() => void removeReview()}>Delete</Button>}
            </HStack>
            <Text mt={3} whiteSpace="pre-wrap">{review.body}</Text>
            <Button mt={3} size="xs" variant={review.viewer_helpful ? "solid" : "outline"} onClick={() => void toggleHelpful(review)}>
              Helpful · {review.helpful_count}
            </Button>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

interface ReviewFormProps { game: GameDetail; review?: Review; onSaved: () => void; }

/** The API upserts by user + game, so this form can create once and edit thereafter. */
function ReviewForm({ game, review, onSaved }: ReviewFormProps) {
  const toast = useToast();
  const [score, setScore] = useState(review?.score ?? 8);
  const [recommended, setRecommended] = useState(review?.recommended ?? true);
  const [body, setBody] = useState(review?.body ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (body.trim().length < 10) return toast({ title: "Write at least 10 characters.", status: "warning" });
    setSaving(true);
    try {
      await saveReview(game.id, { game_name: game.name, score, recommended, body: body.trim() });
      onSaved();
      toast({ title: review ? "Review updated." : "Review published.", status: "success", duration: 1800 });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Review could not be saved.", status: "error" });
    } finally { setSaving(false); }
  };

  return (
    <Box borderWidth="1px" borderRadius="xl" p={5}>
      <Stack gap={4}>
        <Text fontWeight="700">{review ? "Edit your review" : "Review this game"}</Text>
        {review && <Text fontSize="sm" color="gray.400">You already reviewed this game. Saving here updates that review rather than creating another.</Text>}
        <HStack align="end">
          <FormControl><FormLabel>Score</FormLabel><Select value={score} onChange={(event) => setScore(Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => index + 1).reverse().map((value) => <option key={value} value={value}>{value}/10</option>)}</Select></FormControl>
          <FormControl><FormLabel>Recommend?</FormLabel><Select value={String(recommended)} onChange={(event) => setRecommended(event.target.value === "true")}><option value="true">Yes</option><option value="false">No</option></Select></FormControl>
        </HStack>
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="What worked, what did not, and who would you recommend it to?" minH="120px" maxLength={2000} />
        <Button colorScheme="green" isLoading={saving} onClick={() => void submit()}>{review ? "Update review" : "Publish review"}</Button>
      </Stack>
    </Box>
  );
}
