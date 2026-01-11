export interface Review {
  id: string;
  locationId: string;
  userId: string;
  rating: number;
  comment: string;
  timestamp: Date;
  userName?: string;
}
