import { Review } from "../types/review";

const STORAGE_KEY = "study-spaces-reviews";

class ReviewService {
  getAllReviews(): Review[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const reviews = JSON.parse(data);
    return reviews.map((r: any) => ({
      ...r,
      timestamp: new Date(r.timestamp),
    }));
  }

  getReviewsForLocation(locationId: string): Review[] {
    const allReviews = this.getAllReviews();
    return allReviews
      .filter((r) => r.locationId === locationId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  addReview(
    locationId: string,
    userId: string,
    rating: number,
    comment: string
  ): Review {
    const reviews = this.getAllReviews();

    const newReview: Review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      locationId,
      userId,
      rating,
      comment,
      timestamp: new Date(),
      userName: userId.startsWith("guest") ? "Guest User" : "Verified User",
    };

    reviews.push(newReview);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));

    return newReview;
  }
}

export const reviewService = new ReviewService();
