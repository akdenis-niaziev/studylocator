export interface CheckIn {
  id: string;
  locationId: string;
  timestamp: Date;
  userId?: string;
  duration?: number;
  checkOutTime?: Date;
  isActive: boolean;
}

export interface CheckInStats {
  totalCheckIns: number;
  activeCheckIns: number;
  averageDuration: number;
  popularLocations: {
    locationId: string;
    count: number;
  }[];
}

export interface LocationCheckInData {
  locationId: string;
  locationName: string;
  totalCheckIns: number;
  currentOccupancy: number;
  capacity: number;
  lastCheckIn?: Date;
  popularTimes: {
    hour: number;
    count: number;
  }[];
}
