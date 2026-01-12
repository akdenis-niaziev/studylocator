import React, { useState, useEffect } from "react";
import { StudyLocation, LocationTypeLabels } from "../types/location";
import { reviewService } from "../services/reviewService";
import { Review } from "../types/review";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { CloseButton } from "./CloseButton";

interface DetailsPanelProps {
  location?: StudyLocation;
  isLoading?: boolean;
  onNavigate?: (mode: "car" | "bike" | "foot") => void;
  isNavigating?: boolean;
  onCancelNavigation?: () => void;
  onClose?: () => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  location,
  isLoading,
  onNavigate,
  isNavigating,
  onCancelNavigation,
  onClose,
}) => {
  const { userId } = useAuth();
  const [showQRCode, setShowQRCode] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (location) {
      loadReviews();
      setShowQRCode(false); // Reset when location changes
    }
  }, [location]);

  const loadReviews = () => {
    if (location) {
      setReviews(reviewService.getReviewsForLocation(location.id));
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !userId) return;

    setIsSubmittingReview(true);
    reviewService.addReview(
      location.id,
      userId,
      newReview.rating,
      newReview.comment
    );
    setNewReview({ rating: 5, comment: "" });
    loadReviews();
    setIsSubmittingReview(false);
  };

  const getGoogleMapsUrl = () => {
    if (!location) return "";
    return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="h-full flex items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="text-5xl sm:text-6xl mb-4"
          >
            📍
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Select a location to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={location.id}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full overflow-y-auto bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="bg-blue-600 dark:bg-blue-700 text-white p-4 sm:p-6 sticky top-0 z-10 shadow-md"
      >
        <div className="flex justify-between items-start mb-2 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">{location.name}</h2>
          {onClose && (
            <CloseButton onClick={onClose} className="shrink-0 -mt-1 -mr-2" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {location.quietnessLevel && (
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
              {location.quietnessLevel.replace("-", " ")}
            </span>
          )}
          {location.type && (
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
              {LocationTypeLabels[location.type]}
            </span>
          )}
        </div>
      </motion.div>

      <div className="p-4 sm:p-6 space-y-6">
        {location.description && (
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
              About
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
              {location.description}
            </p>
          </motion.div>
        )}

        {location.address && (
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center text-sm sm:text-base">
              <svg
                className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Location
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3">
              {location.address}
            </p>
            <div className="flex flex-col gap-3">
              {!isNavigating ? (
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mr-2">
                    Navigate:
                  </span>
                  {[
                    { mode: "foot", icon: "🚶", label: "Walk" },
                    { mode: "bike", icon: "🚲", label: "Bike" },
                    { mode: "car", icon: "🚗", label: "Car" },
                  ].map((nav) => (
                    <motion.button
                      key={nav.mode}
                      onClick={() =>
                        onNavigate?.(nav.mode as "foot" | "bike" | "car")
                      }
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-2xl p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={nav.label}
                    >
                      {nav.icon}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={onCancelNavigation}
                  className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-all border border-red-200 dark:border-red-800 flex items-center justify-center gap-2"
                >
                  <span>⏹️</span> Stop Navigation
                </motion.button>
              )}

              <div className="flex flex-wrap gap-2">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/50"
                >
                  <span>🗺️</span> Google Maps
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/50 flex items-center justify-center gap-2"
                >
                  {showQRCode ? "🙈 Hide" : "📱 Show"} QR Code
                </motion.button>
              </div>
            </div>
            <AnimatePresence>
              {showQRCode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="bg-white p-3 rounded-xl shadow-lg mb-3"
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=studyspaces-gent-${location.id}&color=2563EB`}
                        alt="Location QR Code"
                        className="w-32 h-32 sm:w-40 sm:h-40"
                      />
                    </motion.div>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <span>📱</span> Scan to check-in
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      Use the Scan tab to earn XP!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {location.openingHours && (
            <motion.div variants={itemVariants}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center text-sm sm:text-base">
                <svg
                  className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Hours
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                {location.openingHours}
              </p>
            </motion.div>
          )}

          {typeof location.capacity === "number" && (
            <motion.div variants={itemVariants}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center text-sm sm:text-base">
                <svg
                  className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 3h14v2H3V3zm0 4h10v2H3V7zm0 4h6v2H3v-2z" />
                </svg>
                Capacity
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                {location.capacity} places
              </p>
            </motion.div>
          )}
        </div>

        {typeof location.currentOccupancy === "number" && location.capacity && (
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center text-sm sm:text-base">
              <svg
                className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 3h12v2H4V3zm0 4h8v2H4V7zm0 4h6v2H4v-2z" />
              </svg>
              Current Occupancy
            </h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      location.currentOccupancy / location.capacity > 0.8
                        ? "bg-red-500"
                        : location.currentOccupancy / location.capacity > 0.5
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        (location.currentOccupancy / location.capacity) * 100,
                        100
                      )}%`,
                    }}
                    transition={{ duration: 1, type: "spring" }}
                  />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-bold w-12 text-right">
                  {Math.round(
                    (location.currentOccupancy / location.capacity) * 100
                  )}
                  %
                </span>
              </div>
              <p className="text-right text-xs text-gray-400 mt-1">
                {location.currentOccupancy} / {location.capacity} occupied
              </p>
            </div>
          </motion.div>
        )}

        {location.amenities && location.amenities.length > 0 && (
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center text-sm sm:text-base">
              <span className="mr-2">✨</span>
              Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {location.amenities.map((amenity, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="inline-block px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 rounded-lg text-xs font-medium shadow-sm"
                >
                  {amenity}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews Section */}
        <motion.div
          variants={itemVariants}
          className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
              <span>⭐</span> Reviews
              <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {reviews.length}
              </span>
            </h3>
          </div>

          {/* Add Review Form */}
          <motion.form
            initial={false}
            onSubmit={handleSubmitReview}
            className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50"
          >
            <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
              Write a review
            </h4>
            <div className="flex items-center mb-3 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 w-fit">
              <span className="text-xs mr-3 text-gray-600 dark:text-gray-400 font-medium">
                Rating:
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    type="button"
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`text-xl focus:outline-none transition-colors ${
                      star <= newReview.rating
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  >
                    ★
                  </motion.button>
                ))}
              </div>
            </div>
            <textarea
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              placeholder="Share your experience (e.g., quietness, wifi speed, coffee)..."
              className="w-full text-sm p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all resize-none shadow-sm"
              rows={3}
              required
            />
            <motion.button
              type="submit"
              disabled={isSubmittingReview}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-xl transition-all disabled:opacity-50 font-semibold shadow-lg shadow-blue-500/20"
            >
              {isSubmittingReview ? "Posting..." : "📝 Post Review"}
            </motion.button>
          </motion.form>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-2 opacity-50">💭</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  No reviews yet. Be the first to share!
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                          {review.userName ? review.userName.charAt(0) : "?"}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {review.userName || "Anonymous"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex text-yellow-400 text-xs mb-2">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-xs text-center text-gray-400 dark:text-gray-600 font-mono">
            Location ID: {location.id} • {location.latitude.toFixed(4)},{" "}
            {location.longitude.toFixed(4)}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
