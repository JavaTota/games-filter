import type { GameMeterSummary, Review } from "../types/community";

export function summarizeReviews(reviews: Review[]): GameMeterSummary {
  if (reviews.length === 0) {
    return {
      score: 0,
      recommendedPercent: 0,
      reviewCount: 0,
    };
  }

  const totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
  const recommendedCount = reviews.filter((review) => review.recommended).length;

  return {
    score: Math.round((totalScore / reviews.length) * 10),
    recommendedPercent: Math.round(
      (recommendedCount / reviews.length) * 100,
    ),
    reviewCount: reviews.length,
  };
}
