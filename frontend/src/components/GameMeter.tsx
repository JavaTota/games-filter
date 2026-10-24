import {
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";

import type { GameMeterSummary } from "../types/community";

interface Props {
  summary: GameMeterSummary;
}

function getScoreColor(score: number) {
  if (score >= 70) return "green.400";
  if (score >= 50) return "yellow.400";
  return "red.400";
}

export default function GameMeter({ summary }: Props) {
  const hasReviews = summary.reviewCount > 0;
  const reviewLabel = summary.reviewCount === 1 ? "review" : "reviews";

  return (
    <HStack gap={5} align="center">
      <CircularProgress
        value={summary.score}
        size="86px"
        color={getScoreColor(summary.score)}
        trackColor="whiteAlpha.200"
      >
        <CircularProgressLabel fontWeight="800">
          {hasReviews ? summary.score : "—"}
        </CircularProgressLabel>
      </CircularProgress>

      <Stack gap={0}>
        <Text fontWeight="800" fontSize="lg">
          GameMeter
        </Text>
        <Text>
          {hasReviews
            ? `${summary.recommendedPercent}% recommend it`
            : "No community reviews yet"}
        </Text>
        <Text fontSize="sm" color="gray.400">
          {summary.reviewCount} {reviewLabel} · score is the average rating × 10
        </Text>
      </Stack>
    </HStack>
  );
}
