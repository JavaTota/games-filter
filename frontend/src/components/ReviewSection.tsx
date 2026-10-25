import {
  Alert,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";

import { useAuth } from "../context/useAuth";
import { useCachedQuery } from "../lib/queryCache";
import { AppLink } from "../lib/router";
import {
  deleteReview,
  getReviews,
  saveReview,
  setReviewHelpful,
} from "../services/communityService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import type { Review } from "../types/community";
import type { GameDetail } from "../types/game";
import GameMeter from "./GameMeter";

interface Props {
  game: GameDetail;
}

export default function ReviewSection({ game }: Props) {
  const { session } = useAuth();
  const toast = useToast();
  const userId = session?.user.id;

  const reviewsQuery = useCachedQuery(
    `reviews:${game.id}:${userId ?? "guest"}`,
    () => getReviews(game.id),
    { ttlMs: 30_000 },
  );

  const reviews = reviewsQuery.data?.reviews ?? [];
  const stats = reviewsQuery.data?.stats;
  const ownReview = reviews.find((review) => review.user_id === userId);

  const showError = (error: unknown, fallback: string) => {
    toast({
      title: error instanceof Error ? error.message : fallback,
      status: "error",
    });
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Delete your review?")) return;

    try {
      await deleteReview(game.id);
      reviewsQuery.refetch();
      toast({ title: "Review deleted.", status: "success", duration: 1800 });
    } catch (error) {
      showError(error, "Review could not be deleted.");
    }
  };

  const handleHelpfulVote = async (review: Review) => {
    if (!session) {
      toast({ title: "Sign in to vote on reviews.", status: "info" });
      return;
    }

    try {
      await setReviewHelpful(review.id, !review.viewer_helpful);
      reviewsQuery.refetch();
    } catch (error) {
      showError(error, "Vote could not be saved.");
    }
  };

  return (
    <Stack gap={6}>
      <GameMeter
        summary={{
          score: stats?.score ?? 0,
          recommendedPercent: stats?.recommended_percent ?? 0,
          reviewCount: stats?.review_count ?? 0,
        }}
      />

      {!isSupabaseConfigured && (
        <Alert status="info" borderRadius="xl">
          <AlertIcon />
          Configure Supabase Auth to sign in and review games.
        </Alert>
      )}

      {isSupabaseConfigured && !session && (
        <Alert status="info" borderRadius="xl">
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
          onSaved={reviewsQuery.refetch}
        />
      )}

      <Stack gap={4}>
        {reviewsQuery.isLoading && (
          <Text color="textSecondary">Loading community reviews…</Text>
        )}

        {reviewsQuery.error && (
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            {reviewsQuery.error.message}
            <Button ml={3} size="xs" onClick={reviewsQuery.refetch}>
              Retry
            </Button>
          </Alert>
        )}

        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwner={review.user_id === userId}
            onDelete={handleDeleteReview}
            onHelpful={() => handleHelpfulVote(review)}
          />
        ))}
      </Stack>
    </Stack>
  );
}

interface ReviewCardProps {
  review: Review;
  isOwner: boolean;
  onDelete: () => void;
  onHelpful: () => void;
}

function ReviewCard({ review, isOwner, onDelete, onHelpful }: ReviewCardProps) {
  return (
    <Box
      bg="surface"
      borderWidth="1px"
      borderColor="borderSubtle"
      borderRadius="2xl"
      p={{ base: 4, md: 5 }}
    >
      <HStack justify="space-between" align="start">
        <HStack align="start">
          <Avatar
            size="sm"
            name={review.display_name}
            src={review.avatar_url ?? undefined}
          />

          <Stack gap={1}>
            <Text fontWeight="900">{review.display_name}</Text>
            <HStack flexWrap="wrap">
              <Badge colorScheme="purple" borderRadius="full">
                {review.score}/10
              </Badge>
              <Badge
                colorScheme={review.recommended ? "green" : "red"}
                borderRadius="full"
              >
                {review.recommended ? "Recommends" : "Does not recommend"}
              </Badge>
            </HStack>
          </Stack>
        </HStack>

        {isOwner && (
          <Button size="xs" colorScheme="red" variant="ghost" onClick={onDelete}>
            Delete
          </Button>
        )}
      </HStack>

      <Text mt={4} color="textSecondary" lineHeight="1.7" whiteSpace="pre-wrap">
        {review.body}
      </Text>

      <Button
        mt={4}
        size="xs"
        variant={review.viewer_helpful ? "solid" : "outline"}
        colorScheme={review.viewer_helpful ? "brand" : "gray"}
        onClick={onHelpful}
      >
        Helpful · {review.helpful_count}
      </Button>
    </Box>
  );
}

interface ReviewFormProps {
  game: GameDetail;
  review?: Review;
  onSaved: () => void;
}

function ReviewForm({ game, review, onSaved }: ReviewFormProps) {
  const toast = useToast();
  const [score, setScore] = useState(review?.score ?? 8);
  const [recommended, setRecommended] = useState(review?.recommended ?? true);
  const [body, setBody] = useState(review?.body ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const reviewBody = body.trim();

    if (reviewBody.length < 10) {
      toast({ title: "Write at least 10 characters.", status: "warning" });
      return;
    }

    setSaving(true);

    try {
      await saveReview(game.id, {
        game_name: game.name,
        score,
        recommended,
        body: reviewBody,
      });

      onSaved();
      toast({
        title: review ? "Review updated." : "Review published.",
        status: "success",
        duration: 1800,
      });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Review could not be saved.",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      bg="surface"
      borderWidth="1px"
      borderColor="borderSubtle"
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
    >
      <Stack gap={4}>
        <Box>
          <Text fontWeight="900" fontSize="lg">
            {review ? "Edit your review" : "Review this game"}
          </Text>
          <Text fontSize="sm" color="textSecondary" mt={1}>
            {review
              ? "Saving will update your existing review for this game."
              : "Share enough detail to help another player decide."}
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
          <FormControl>
            <FormLabel color="textSecondary">Score</FormLabel>
            <Select value={score} onChange={(event) => setScore(Number(event.target.value))}>
              {Array.from({ length: 10 }, (_, index) => 10 - index).map((value) => (
                <option key={value} value={value}>
                  {value}/10
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel color="textSecondary">Recommend?</FormLabel>
            <Select
              value={String(recommended)}
              onChange={(event) => setRecommended(event.target.value === "true")}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormControl>
        </SimpleGrid>

        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What worked, what did not, and who would you recommend it to?"
          minH="140px"
          maxLength={2000}
        />

        <Button colorScheme="brand" isLoading={saving} onClick={handleSubmit}>
          {review ? "Update review" : "Publish review"}
        </Button>
      </Stack>
    </Box>
  );
}
