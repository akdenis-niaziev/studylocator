import { useEffect, useState } from "react";
import { checkInService } from "../services/checkInService";
import { locationService } from "../services/locationService";
import { CheckInStats, LocationCheckInData } from "../types/checkin";
import { StudyLocation } from "../types/location";
import { motion, Variants } from "framer-motion";

export function Dashboard() {
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [locations, setLocations] = useState<StudyLocation[]>([]);
  const [locationData, setLocationData] = useState<LocationCheckInData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const checkInStats = checkInService.getStats();
    setStats(checkInStats);

    const response = await locationService.getLocations();
    const allLocations = response.locations;
    setLocations(allLocations);

    const locationCheckInData = allLocations.map((loc) =>
      checkInService.getLocationData(loc)
    );
    setLocationData(locationCheckInData);

    setLoading(false);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-full bg-gray-50 dark:bg-gray-900 pb-24 overflow-y-auto transition-colors scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="px-4 py-6 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm sm:shadow-none sm:static">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                variants={itemVariants}
                className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
              >
                Admin Dashboard
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-gray-500 dark:text-gray-400 text-sm mt-1"
              >
                Real-time study location analytics
              </motion.p>
            </div>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadDashboardData}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-500/20"
            >
              🔄 Refresh
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Check-ins
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.totalCheckIns}
                    </p>
                  </div>
                  <div className="text-3xl p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    📊
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Active Check-ins
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                      {stats.activeCheckIns}
                    </p>
                  </div>
                  <div className="text-3xl p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    👥
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 sm:col-span-2 lg:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Avg. Duration (min)
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.averageDuration}
                    </p>
                  </div>
                  <div className="text-3xl p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    ⏱️
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {stats && stats.popularLocations.length > 0 && (
          <motion.div variants={itemVariants} className="px-4 sm:px-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🏆 Popular Locations
              </h2>
              <div className="space-y-3">
                {stats.popularLocations.map((loc, index) => {
                  const location = locations.find(
                    (l) => l.id === loc.locationId
                  );
                  return (
                    <div
                      key={loc.locationId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${
                            index === 0
                              ? "bg-yellow-400"
                              : index === 1
                              ? "bg-gray-400"
                              : index === 2
                              ? "bg-orange-400"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {location?.name || loc.locationId}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {location?.address}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">
                        {loc.count} check-ins
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Locations Table - Mobile Scrollable */}
        <motion.div variants={itemVariants} className="px-4 sm:px-6 pb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                📍 All Locations
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Occupancy
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Check-ins
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Check-in
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {locationData.map((data) => {
                    const location = locations.find(
                      (l) => l.id === data.locationId
                    );
                    const occupancyPercentage =
                      data.capacity > 0
                        ? Math.round(
                            (data.currentOccupancy / data.capacity) * 100
                          )
                        : 0;

                    return (
                      <tr
                        key={data.locationId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {data.locationName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {location?.address}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {location?.type || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                              {data.currentOccupancy}/{data.capacity}
                            </span>
                            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <motion.div
                                className={`h-2 rounded-full ${
                                  occupancyPercentage > 80
                                    ? "bg-red-500"
                                    : occupancyPercentage > 50
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.min(
                                    occupancyPercentage,
                                    100
                                  )}%`,
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {data.totalCheckIns}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {data.lastCheckIn
                            ? new Date(data.lastCheckIn).toLocaleString(
                                "nl-BE",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Banner */}
          <motion.div
            variants={itemVariants}
            className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3"
          >
            <span className="text-xl">💡</span>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Use this dashboard to monitor study space usage across the campus.
              Real-time occupancy data helps in managing resources efficiently.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
