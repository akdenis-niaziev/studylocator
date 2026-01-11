export interface StudyLocation {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  type: LocationType;
  capacity?: number;
  currentOccupancy?: number;
  openingHours?: string;
  amenities?: string[];
  imageUrl?: string;
  quietnessLevel?: "very-quiet" | "quiet" | "moderate";
  qrCode?: string;
}

export enum LocationType {
  LIBRARY = "library",
  QUIET_ZONE = "quiet-zone",
  COLLABORATIVE = "collaborative",
  CAFE = "cafe",
  COWORKING = "coworking",
  PUBLIC_SPACE = "public-space",
  ENTREPRENEURIAL = "entrepreneurial",
}

export interface LocationsResponse {
  locations: StudyLocation[];
  lastUpdated?: string;
}

export interface MapBounds {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

export const LocationTypeLabels: Record<LocationType, string> = {
  [LocationType.LIBRARY]: "Bibliotheek",
  [LocationType.QUIET_ZONE]: "Stiltezone",
  [LocationType.COLLABORATIVE]: "Samenwerkingsruimte",
  [LocationType.CAFE]: "Café",
  [LocationType.COWORKING]: "Co-working Space",
  [LocationType.PUBLIC_SPACE]: "Publieke Ruimte",
  [LocationType.ENTREPRENEURIAL]: "Ondernemershub",
};
