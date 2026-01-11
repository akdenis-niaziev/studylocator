export interface UserStats {
  userId: string;
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  locationsVisited: string[];
  totalStudyHours: number;
  badges: Badge[];
  level: number;
  lastCheckIn?: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  category: BadgeCategory;
}

export enum BadgeCategory {
  STREAK = "streak",
  EXPLORATION = "exploration",
  DEDICATION = "dedication",
  SOCIAL = "social"
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  reward?: Badge;
}

export const BADGE_DEFINITIONS = {
  FIRST_CHECKIN: {
    id: "first-checkin",
    name: "First Steps",
    description: "Complete your first check-in",
    icon: "🎯",
    category: BadgeCategory.DEDICATION
  },
  STREAK_7: {
    id: "streak-7",
    name: "Week Warrior",
    description: "Study for 7 consecutive days",
    icon: "🔥",
    category: BadgeCategory.STREAK
  },
  STREAK_30: {
    id: "streak-30",
    name: "Monthly Master",
    description: "Study for 30 consecutive days",
    icon: "🏆",
    category: BadgeCategory.STREAK
  },
  EXPLORER_5: {
    id: "explorer-5",
    name: "Explorer",
    description: "Visit 5 different locations",
    icon: "🗺️",
    category: BadgeCategory.EXPLORATION
  },
  EXPLORER_10: {
    id: "explorer-10",
    name: "City Navigator",
    description: "Visit 10 different locations",
    icon: "🧭",
    category: BadgeCategory.EXPLORATION
  },
  HOURS_10: {
    id: "hours-10",
    name: "Getting Started",
    description: "Study for 10 hours",
    icon: "📚",
    category: BadgeCategory.DEDICATION
  },
  HOURS_50: {
    id: "hours-50",
    name: "Dedicated Learner",
    description: "Study for 50 hours",
    icon: "📖",
    category: BadgeCategory.DEDICATION
  },
  HOURS_100: {
    id: "hours-100",
    name: "Study Champion",
    description: "Study for 100 hours",
    icon: "🎓",
    category: BadgeCategory.DEDICATION
  }
};
