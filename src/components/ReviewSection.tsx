import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useCachedQuery } from "../lib/queryCache";
import { AppLink } from "../lib/router";
import { deleteReview, getReviews, saveReview } from "../services/communityService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import type { Review } from "../types/community";
import type { GameDetail } from "../types/game";
import { summarizeReviews } from "../utils/gameMeter";
import GameMeter from "./GameMeter";

export default function ReviewSection({ game }: { game: GameDetail }) {
  const { session } = useAuth();
  const toast = useToast();
  const queryKey = `reviews:${game.id}`;
  const query = useCachedQuery(queryKey, () => getReviews(game.id), {
    enabled: isSupabaseConfigured,
    ttlMs: 30_000,
  });

  const reviews = query.data ?? [];
  const ownReview = reviews.find(
    (review) => review.user_id === session?.user.id,
  );
  const summary = useMemo(() => summarizeReviews(reviews), [reviews]);

  const removeReview = async (review: Review) => {
    if (!window.confirm("Delete your review?")) return;

    try {
      await deleteReview(review.id);
      query.refetch();
      toast({ title: "Review deleted.", status: "success", duration: 1800 });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Review could not be deleted.",
        status: "error",
      });
    }
  };

  return (
    <Stack gap={6}>
      <GameMeter summary={summary} />

      {!isSupabaseConfigured && (
        <Alert status="info">
          <AlertIcon />
          Community features activate after Supabase environment variables are
          configured.
        </Alert>
      )}

      {isSupabaseConfigured && !session && (
        <Alert status="info">
          <AlertIcon />
          <Text>
            <AppLink to="/auth">Sign in</AppLink> to rate and review this game.
          </Text>
        </Alert>
      )}

      {session && (
        <ReviewForm
          key={ownReview?.updated_at ?? "new-review"}
          game={game}
          review={ownReview}
          userId={session.user.id}
          displayName={
            session.user.user_metadata?.display_name ||
            session.user.email?.split("@")[0] ||
            "Player"
          }
          onSaved={query.refetch}
        />
      )}

      <Stack gap={4}>
        {query.isLoading && <Text>Loading community reviews…</Text>}

        {query.error && (
          <Alert status="error">
            <AlertIcon />
            {query.error.message}
            <Button ml={3} size="xs" onClick={query.refetch}>
              Retry
            </Button>
          </Alert>
        )}

        {reviews.map((review) => (
          <Box key={review.id} borderWidth="1px" borderRadius="xl" p={5}>
            <HStack justify="space-between" align="start">
              <Stack gap={1}>
                <Text fontWeight="800">{review.display_name}</Text>
                <HStack>
                  <Badge colorScheme="purple">{review.score}/10</Badge>
                  <Badge colorScheme={review.recommended ? "green" : "red"}>
                    {review.recommended
                      ? "Recommends"
                      : "Does not recommend"}
                  </Badge>
                </HStack>
              </Stack>

              {review.user_id === session?.user.id && (
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => void removeReview(review)}
                >
                  Delete
                </Button>
              )}
            </HStack>

            <Text mt={3} whiteSpace="pre-wrap">
              {review.body}
            </Text>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

interface ReviewFormProps {
  game: GameDetail;
  review?: Review;
  userId: string;
  displayName: string;
  onSaved: () => void;
}

/** One form handles create and edit because the database enforces one review per user/game. */
function ReviewForm({
  game,
  review,
  userId,
  displayName,
  onSaved,
}: ReviewFormProps) {
  const toast = useToast();
  const [score, setScore] = useState(review?.score ?? 8);
  const [recommended, setRecommended] = useState(review?.recommended ?? true);
  const [body, setBody] = useState(review?.body ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (body.trim().length < 10) {
      toast({
        title: "Write at least 10 characters.",
        status: "warning",
      });
      return;
    }

    setSaving(true);

    try {
      await saveReview({
        user_id: userId,
        game_id: game.id,
        game_name: game.name,
        display_name: displayName,
        score,
        recommended,
        body: body.trim(),
      });

      onSaved();
      toast({
        title: review ? "Review updated." : "Review published.",
        status: "success",
        duration: 1800,
      });
    } catch (error) {
      toast({
        title:
          error instanceof Error ? error.message : "Review could not be saved.",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="xl" p={5}>
      <Stack gap={4}>
        <Text fontWeight="700">
          {review ? "Update your review" : "Review this game"}
        </Text>

        <HStack align="end">
          <FormControl>
            <FormLabel>Score</FormLabel>
            <Select
              value={score}
              onChange={(event) => setScore(Number(event.target.value))}
            >
              {Array.from({ length: 10 }, (_, index) => index + 1)
                .reverse()
                .map((value) => (
                  <option key={value} value={value}>
                    {value}/10
                  </option>
                ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Recommend?</FormLabel>
            <Select
              value={String(recommended)}
              onChange={(event) => setRecommended(event.target.value === "true")}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormControl>
        </HStack>

        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What worked, what did not, and who would you recommend it to?"
          minH="120px"
          maxLength={2000}
        />

        <Button
          colorScheme="green"
          isLoading={saving}
          onClick={() => void submit()}
        >
          {review ? "Update review" : "Publish review"}
        </Button>
      </Stack>
    </Box>
  );
}
