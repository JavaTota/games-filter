import { Box, CircularProgress, CircularProgressLabel, HStack, Stack, Text } from "@chakra-ui/react";
import type { GameMeterSummary } from "../types/community";

export default function GameMeter({ summary }: { summary: GameMeterSummary }) {
  return (
    <HStack gap={5} align="center">
      <CircularProgress value={summary.score} size="86px" color={summary.score >= 70 ? "green.400" : summary.score >= 50 ? "yellow.400" : "red.400"} trackColor="whiteAlpha.200">
        <CircularProgressLabel fontWeight="800">{summary.reviewCount ? summary.score : "—"}</CircularProgressLabel>
      </CircularProgress>
      <Stack gap={0}>
        <Text fontWeight="800" fontSize="lg">GameMeter</Text>
        <Text>{summary.reviewCount ? `${summary.recommendedPercent}% recommend it` : "No community reviews yet"}</Text>
        <Text fontSize="sm" color="gray.400">{summary.reviewCount} {summary.reviewCount === 1 ? "review" : "reviews"} · score is average rating × 10</Text>
      </Stack>
    </HStack>
  );
}
