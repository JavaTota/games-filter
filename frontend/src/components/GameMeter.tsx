import {
  Box,
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
    <HStack
      gap={5}
      align="center"
      bg="surfaceMuted"
      borderWidth="1px"
      borderColor="borderSubtle"
      borderRadius="2xl"
      p={5}
    >
      <CircularProgress
        value={summary.score}
        size="86px"
        color={getScoreColor(summary.score)}
        trackColor="blackAlpha.200"
      >
        <CircularProgressLabel fontWeight="900" color="textPrimary">
          {hasReviews ? summary.score : "—"}
        </CircularProgressLabel>
      </CircularProgress>

      <Stack gap={0}>
        <HStack gap={2}>
          <Box boxSize="8px" borderRadius="full" bg="brand.400" />
          <Text fontWeight="900" fontSize="lg">
            GameMeter
          </Text>
        </HStack>
        <Text color="textPrimary">
          {hasReviews
            ? `${summary.recommendedPercent}% recommend it`
            : "No community reviews yet"}
        </Text>
        <Text fontSize="sm" color="textSecondary">
          {summary.reviewCount} {reviewLabel} · average community score
        </Text>
      </Stack>
    </HStack>
  );
}
