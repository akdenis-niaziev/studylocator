import React, { useEffect, useState } from "react";
import { gamificationService } from "../services/gamificationService";
import { checkInService } from "../services/checkInService";
import { UserStats, Badge, BADGE_DEFINITIONS } from "../types/gamification";
import { useAuth } from "../contexts/AuthContext";
import { motion, Variants } from "framer-motion";

export const Profile: React.FC = () => {
  const { userId, isAdmin, loginAsAdmin, logoutAdmin } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId]);

  const loadStats = () => {
    const userStats = gamificationService.getUserStats(userId);
    setStats(userStats);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAsAdmin(adminPassword)) {
      setAdminPassword("");
      setShowAdminLogin(false);
      alert("Welcome, Admin!");
    } else {
      alert("Incorrect password");
    }
  };

  // Test function to simulate a check-in
  const simulateCheckIn = () => {
    const testLocationId = "test-" + Date.now();
    const checkIn = checkInService.checkIn(testLocationId, userId);
    gamificationService.updateStatsAfterCheckIn(checkIn, userId);
    loadStats();
    alert("🎉 Test check-in complete! Your stats have been updated.");
  };

  const getLevelTitle = (level: number): string => {
    const titles = [
      "Newbie",
      "Apprentice",
      "Scholar",
      "Dedicated",
      "Focused",
      "Achiever",
      "Champion",
      "Master",
      "Legend",
      "Grandmaster",
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
  };

  const getNextLevelXP = (level: number): number => level * 100;
  const getCurrentXP = (stats: UserStats): number =>
    stats.totalCheckIns * 25 +
    Math.floor(stats.totalStudyHours * 10) +
    stats.badges.length * 50;

  // Get all possible badges
  const allBadges = Object.values(BADGE_DEFINITIONS);

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 dark:text-gray-400 text-xl">
          Loading your profile...
        </div>
      </div>
    );
  }

  const currentXP = getCurrentXP(stats);
  const nextLevelXP = getNextLevelXP(stats.level);
  const xpProgress = Math.min(
    ((currentXP % nextLevelXP) / nextLevelXP) * 100,
    100
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const scaleHover = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      className="h-full bg-gray-50 dark:bg-gray-900 pb-24 overflow-y-auto transition-colors scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Identity Card (Sticky on Desktop) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center lg:sticky lg:top-8"
            >
              {/* Avatar */}
              <motion.div
                className="relative mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-24 w-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-5xl shadow-sm border-4 border-white dark:border-gray-700 mx-auto">
                  {stats.level >= 5 ? "🦸" : stats.level >= 3 ? "🧑‍🎓" : "👤"}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-bold shadow-md">
                  Lv.{stats.level}
                </div>
              </motion.div>

              {/* Name & Title */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {getLevelTitle(stats.level)} Explorer
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-6 break-all">
                ID: {userId ? userId.substring(0, 12) + "..." : "Guest"}
              </p>

              {/* XP Bar */}
              <div className="w-full mb-6">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                  <span>XP: {currentXP}</span>
                  <span>Next: {nextLevelXP}</span>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {Math.round(nextLevelXP - (currentXP % nextLevelXP))} XP to
                  level up
                </p>
              </div>

              <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-6 mt-2 space-y-3">
                <button
                  onClick={() => setShowTestPanel(true)}
                  className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  🧪 Test Mode
                </button>

                {!isAdmin ? (
                  <div>
                    <button
                      onClick={() => setShowAdminLogin(!showAdminLogin)}
                      className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {showAdminLogin ? "Cancel Access" : "🔐 Teacher Access"}
                    </button>

                    {showAdminLogin && (
                      <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        onSubmit={handleAdminLogin}
                        className="mt-3"
                      >
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            Go
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center justify-center gap-2 mb-2">
                      ✅ Admin Active
                    </p>
                    <button
                      onClick={logoutAdmin}
                      className="text-xs text-red-500 hover:text-red-600 underline"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {/* Stats Overview */}
            <div>
              <motion.h2
                variants={itemVariants}
                className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
              >
                📊 Highlights
              </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: "🔥",
                    value: stats.currentStreak,
                    label: "Day Streak",
                    bg: "bg-orange-50 dark:bg-orange-900/20",
                    text: "text-orange-600 dark:text-orange-400",
                  },
                  {
                    icon: "📍",
                    value: stats.totalCheckIns,
                    label: "Check-ins",
                    bg: "bg-blue-50 dark:bg-blue-900/20",
                    text: "text-blue-600 dark:text-blue-400",
                  },
                  {
                    icon: "⏱️",
                    value: Math.round(stats.totalStudyHours),
                    label: "Study Hours",
                    bg: "bg-purple-50 dark:bg-purple-900/20",
                    text: "text-purple-600 dark:text-purple-400",
                  },
                  {
                    icon: "🗺️",
                    value: stats.locationsVisited.length,
                    label: "Places Visited",
                    bg: "bg-emerald-50 dark:bg-emerald-900/20",
                    text: "text-emerald-600 dark:text-emerald-400",
                  },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    whileHover="hover"
                    whileTap="tap"
                    custom={scaleHover}
                    className={`${stat.bg} rounded-2xl p-4 text-center border border-transparent hover:border-current transition-colors`}
                  >
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div
                      className={`text-2xl font-bold ${stat.text} dark:text-white mb-1`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs font-medium opacity-80 dark:text-gray-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Badges Section */}
            <div>
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between mb-4"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  🏆 Badges Earned
                </h2>
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  {stats.badges.length} / {allBadges.length}
                </span>
              </motion.div>

              {stats.badges.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700"
                >
                  <div className="text-6xl mb-4 opacity-50">🎮</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Start Your Collection
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                    Visit study locations and scan QR codes to unlock special
                    achievements and badges.
                  </p>
                  <button
                    onClick={() => setShowTestPanel(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Try Demo Check-in
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stats.badges.map((badge: Badge) => (
                    <motion.div
                      key={badge.id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="text-5xl mb-3 relative drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                        {badge.icon}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 relative">
                        {badge.name}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs relative leading-relaxed">
                        {badge.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Locked Badges */}
            <motion.div variants={itemVariants}>
              <h3 className="text-md font-semibold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide text-xs">
                <span>🔒 Locked Achievements</span>
                <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></span>
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allBadges
                  .filter(
                    (b) => !stats.badges.some((earned) => earned.id === b.id)
                  )
                  .map((badge) => (
                    <motion.div
                      key={badge.id}
                      whileHover={{ opacity: 0.8 }}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center opacity-60 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-help"
                      title={badge.description}
                    >
                      <div className="text-3xl mb-2 grayscale opacity-70">
                        {badge.icon}
                      </div>
                      <p className="text-gray-400 dark:text-gray-500 text-[10px] font-medium leading-tight">
                        {badge.name}
                      </p>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Test Panel Modal */}
      {showTestPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              🧪 Test Mode
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              Simulate a physical presence check-in to test the gamification and
              stats system.
            </p>
            <div className="space-y-3">
              <button
                onClick={simulateCheckIn}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
              >
                ✅ Simulate Check-in
              </button>
              <button
                onClick={() => setShowTestPanel(false)}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
