import { CheckIn, CheckInStats, LocationCheckInData } from "../types/checkin.ts";
import { StudyLocation } from "../types/location.ts";

const STORAGE_KEY = "study-spaces-checkins";

class CheckInService {
  getAllCheckIns(): CheckIn[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const checkIns = JSON.parse(data);
    return checkIns.map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp),
      checkOutTime: c.checkOutTime ? new Date(c.checkOutTime) : undefined
    }));
  }

  private saveCheckIns(checkIns: CheckIn[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));
  }

  checkIn(locationId: string, userId?: string): CheckIn {
    const checkIns = this.getAllCheckIns();
    
    const newCheckIn: CheckIn = {
      id: `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      locationId,
      timestamp: new Date(),
      userId: userId || `anonymous-${Date.now()}`,
      isActive: true
    };

    checkIns.push(newCheckIn);
    this.saveCheckIns(checkIns);
    
    return newCheckIn;
  }

  checkOut(checkInId: string): CheckIn | null {
    const checkIns = this.getAllCheckIns();
    const checkIn = checkIns.find(c => c.id === checkInId);
    
    if (!checkIn) return null;

    checkIn.checkOutTime = new Date();
    checkIn.isActive = false;
    checkIn.duration = Math.round((checkIn.checkOutTime.getTime() - checkIn.timestamp.getTime()) / 60000);
    
    this.saveCheckIns(checkIns);
    return checkIn;
  }

  getActiveCheckIn(userId: string): CheckIn | null {
    const checkIns = this.getAllCheckIns();
    return checkIns.find(c => c.userId === userId && c.isActive) || null;
  }

  getLocationCheckIns(locationId: string): CheckIn[] {
    const checkIns = this.getAllCheckIns();
    return checkIns.filter(c => c.locationId === locationId);
  }

  getUserCheckIns(userId: string): CheckIn[] {
    const checkIns = this.getAllCheckIns();
    return checkIns.filter(c => c.userId === userId);
  }

  getCurrentOccupancy(locationId: string): number {
    const checkIns = this.getAllCheckIns();
    return checkIns.filter(c => c.locationId === locationId && c.isActive).length;
  }

  getStats(): CheckInStats {
    const checkIns = this.getAllCheckIns();
    const activeCheckIns = checkIns.filter(c => c.isActive);
    
    const completedCheckIns = checkIns.filter(c => c.duration);
    const totalDuration = completedCheckIns.reduce((sum, c) => sum + (c.duration || 0), 0);
    const averageDuration = completedCheckIns.length > 0 
      ? Math.round(totalDuration / completedCheckIns.length) 
      : 0;

    const locationCounts = checkIns.reduce((acc, c) => {
      acc[c.locationId] = (acc[c.locationId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularLocations = Object.entries(locationCounts)
      .map(([locationId, count]) => ({ locationId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCheckIns: checkIns.length,
      activeCheckIns: activeCheckIns.length,
      averageDuration,
      popularLocations
    };
  }

  getLocationData(location: StudyLocation): LocationCheckInData {
    const checkIns = this.getLocationCheckIns(location.id);
    const currentOccupancy = this.getCurrentOccupancy(location.id);
    
    const hourCounts = checkIns.reduce((acc, c) => {
      const hour = c.timestamp.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const popularTimes = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);

    const lastCheckIn = checkIns.length > 0 
      ? checkIns.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
      : undefined;

    return {
      locationId: location.id,
      locationName: location.name,
      totalCheckIns: checkIns.length,
      currentOccupancy,
      capacity: location.capacity || 0,
      lastCheckIn,
      popularTimes
    };
  }

  validateQRCode(qrCode: string): string | null {
    const prefix = "studyspaces-gent-";
    if (!qrCode.startsWith(prefix)) return null;
    
    return qrCode.substring(prefix.length);
  }

  generateQRCode(locationId: string): string {
    return `studyspaces-gent-${locationId}`;
  }

  cleanupOldCheckIns(daysToKeep: number = 30): void {
    const checkIns = this.getAllCheckIns();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filteredCheckIns = checkIns.filter(c => 
      c.timestamp >= cutoffDate || c.isActive
    );
    
    this.saveCheckIns(filteredCheckIns);
  }
}

export const checkInService = new CheckInService();
