import type { GameMeterSummary, Review } from "../types/community";

/** GameMeter mirrors a critic/community split without copying another review brand. */
export function summarizeReviews(reviews: Review[]): GameMeterSummary {
  if (reviews.length === 0) return { score: 0, recommendedPercent: 0, reviewCount: 0 };
  const average = reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;
  const recommended = reviews.filter((review) => review.recommended).length;
  return {
    score: Math.round(average * 10),
    recommendedPercent: Math.round((recommended / reviews.length) * 100),
    reviewCount: reviews.length,
  };
}
