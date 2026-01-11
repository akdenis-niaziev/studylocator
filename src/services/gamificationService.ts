import { UserStats, Badge, Achievement, BADGE_DEFINITIONS } from "../types/gamification.ts";
import { CheckIn } from "../types/checkin.ts";
import { checkInService } from "./checkInService.ts";

const STORAGE_KEY = "study-spaces-user-stats";
const DEFAULT_USER_ID = "default-user";

class GamificationService {
  getUserStats(userId: string = DEFAULT_USER_ID): UserStats {
    const data = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    
    if (!data) {
      return this.createDefaultStats(userId);
    }
    
    const stats = JSON.parse(data);
    return {
      ...stats,
      lastCheckIn: stats.lastCheckIn ? new Date(stats.lastCheckIn) : undefined,
      badges: stats.badges.map((b: any) => ({
        ...b,
        earnedDate: new Date(b.earnedDate)
      }))
    };
  }

  private createDefaultStats(userId: string): UserStats {
    return {
      userId,
      totalCheckIns: 0,
      currentStreak: 0,
      longestStreak: 0,
      locationsVisited: [],
      totalStudyHours: 0,
      badges: [],
      level: 1
    };
  }

  private saveUserStats(stats: UserStats): void {
    localStorage.setItem(`${STORAGE_KEY}-${stats.userId}`, JSON.stringify(stats));
  }

  updateStatsAfterCheckIn(checkIn: CheckIn, userId: string = DEFAULT_USER_ID): UserStats {
    const stats = this.getUserStats(userId);
    
    stats.totalCheckIns += 1;
    
    if (!stats.locationsVisited.includes(checkIn.locationId)) {
      stats.locationsVisited.push(checkIn.locationId);
    }
    
    stats.currentStreak = this.calculateStreak(userId);
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    stats.lastCheckIn = checkIn.timestamp;
    
    const newBadges = this.checkForNewBadges(stats);
    stats.badges.push(...newBadges);
    
    stats.level = this.calculateLevel(stats);
    
    this.saveUserStats(stats);
    return stats;
  }

  updateStatsAfterCheckOut(checkIn: CheckIn, userId: string = DEFAULT_USER_ID): UserStats {
    const stats = this.getUserStats(userId);
    
    if (checkIn.duration) {
      stats.totalStudyHours += checkIn.duration / 60;
    }
    
    const newBadges = this.checkForNewBadges(stats);
    stats.badges.push(...newBadges);
    
    stats.level = this.calculateLevel(stats);
    
    this.saveUserStats(stats);
    return stats;
  }

  calculateStreak(userId: string = DEFAULT_USER_ID): number {
    const checkIns = checkInService.getUserCheckIns(userId);
    if (checkIns.length === 0) return 0;
    
    const sortedCheckIns = checkIns.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    const checkInDates = new Set(
      sortedCheckIns.map(c => {
        const date = new Date(c.timestamp);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );
    
    while (true) {
      if (checkInDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        if (streak === 0 && currentDate.getTime() === today.getTime()) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    
    return streak;
  }

  private checkForNewBadges(stats: UserStats): Badge[] {
    const newBadges: Badge[] = [];
    const earnedBadgeIds = stats.badges.map(b => b.id);
    
    if (stats.totalCheckIns >= 1 && !earnedBadgeIds.includes(BADGE_DEFINITIONS.FIRST_CHECKIN.id)) {
      newBadges.push({
        ...BADGE_DEFINITIONS.FIRST_CHECKIN,
        earnedDate: new Date()
      });
    }
    
    if (stats.currentStreak >= 7 && !earnedBadgeIds.includes(BADGE_DEFINITIONS.STREAK_7.id)) {
      newBadges.push({
        ...BADGE_DEFINITIONS.STREAK_7,
        earnedDate: new Date()
      });
    }
    
    if (stats.currentStreak >= 30 && !earnedBadgeIds.includes(BADGE_DEFINITIONS.STREAK_30.id)) {
      newBadges.push({
        ...BADGE_DEFINITIONS.STREAK_30,
        earnedDate: new Date()
      });
    }
    
    if (stats.locationsVisited.length >= 5 && !earnedBadgeIds.includes(BADGE_DEFINITIONS.EXPLORER_5.id)) {
      newBadges.push({
        ...BADGE_DEFINITIONS.EXPLORER_5,
        earnedDate: new Date()
      });
    }
    
    if (stats.locationsVisited.length >= 10 && !earnedBadgeIds.includes(BADGE_DEFINITIONS.EXPLORER_10.id)) {
      newBadges.push({
        ...BADGE_DEFINITIONS.EXPLORER_10,
        earnedDate: new Date()
      });
    }
    
    if (stats.totalStudyHours >= 10 && !earnedBadgeIds.includes(BADGE_DEFINITIONS.HOURS_10.id)) {
      newBadges.push({
        ...BADGE_DEFINITIONS.HOURS_10,
        earnedDate: new Date()
      });
    }
    
    if (stats.totalStudyHours >= 50 && !earnedBadgeIds.includes(BADGE_DEFINITIONS.HOURS_50.id)) {
      newBadges.push({
        ...BADGE_DEFINITIONS.HOURS_50,
        earnedDate: new Date()
      });
    }
    
    if (stats.totalStudyHours >= 100 && !earnedBadgeIds.includes(BADGE_DEFINITIONS.HOURS_100.id)) {
      newBadges.push({
        ...BADGE_DEFINITIONS.HOURS_100,
        earnedDate: new Date()
      });
    }
    
    return newBadges;
  }

  private calculateLevel(stats: UserStats): number {
    const points = 
      stats.totalCheckIns + 
      (stats.locationsVisited.length * 10) + 
      Math.floor(stats.totalStudyHours);
    
    return Math.floor(points / 50) + 1;
  }

  getAchievements(userId: string = DEFAULT_USER_ID): Achievement[] {
    const stats = this.getUserStats(userId);
    
    return [
      {
        id: "streak-7",
        title: "Week Warrior",
        description: "Study for 7 consecutive days",
        progress: stats.currentStreak,
        target: 7,
        completed: stats.currentStreak >= 7,
        reward: stats.badges.find(b => b.id === BADGE_DEFINITIONS.STREAK_7.id)
      },
      {
        id: "streak-30",
        title: "Monthly Master",
        description: "Study for 30 consecutive days",
        progress: stats.currentStreak,
        target: 30,
        completed: stats.currentStreak >= 30,
        reward: stats.badges.find(b => b.id === BADGE_DEFINITIONS.STREAK_30.id)
      },
      {
        id: "explorer-5",
        title: "Explorer",
        description: "Visit 5 different locations",
        progress: stats.locationsVisited.length,
        target: 5,
        completed: stats.locationsVisited.length >= 5,
        reward: stats.badges.find(b => b.id === BADGE_DEFINITIONS.EXPLORER_5.id)
      },
      {
        id: "explorer-10",
        title: "City Navigator",
        description: "Visit 10 different locations",
        progress: stats.locationsVisited.length,
        target: 10,
        completed: stats.locationsVisited.length >= 10,
        reward: stats.badges.find(b => b.id === BADGE_DEFINITIONS.EXPLORER_10.id)
      },
      {
        id: "hours-100",
        title: "Study Champion",
        description: "Study for 100 hours",
        progress: Math.floor(stats.totalStudyHours),
        target: 100,
        completed: stats.totalStudyHours >= 100,
        reward: stats.badges.find(b => b.id === BADGE_DEFINITIONS.HOURS_100.id)
      }
    ];
  }

  getLevelProgress(userId: string = DEFAULT_USER_ID): { level: number; progress: number; nextLevel: number } {
    const stats = this.getUserStats(userId);
    const points = 
      stats.totalCheckIns + 
      (stats.locationsVisited.length * 10) + 
      Math.floor(stats.totalStudyHours);
    
    const currentLevelPoints = (stats.level - 1) * 50;
    const progress = ((points - currentLevelPoints) / 50) * 100;
    
    return {
      level: stats.level,
      progress: Math.min(progress, 100),
      nextLevel: stats.level + 1
    };
  }

  resetUserStats(userId: string = DEFAULT_USER_ID): void {
    localStorage.removeItem(`${STORAGE_KEY}-${userId}`);
  }
}

export const gamificationService = new GamificationService();
export { DEFAULT_USER_ID };
