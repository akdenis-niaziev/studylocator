import React from "react";
import { StudyLocation, LocationTypeLabels } from "../types/location";

interface LocationCardProps {
  location: StudyLocation;
  onSelect?: (location: StudyLocation) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onSelect,
}) => {
  const getQuietnessColor = (level?: string) => {
    switch (level) {
      case "very-quiet":
        return "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800";
      case "quiet":
        return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
      case "moderate":
        return "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600";
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700 shadow-sm"
      onClick={() => onSelect?.(location)}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight">
          {location.name}
        </h3>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {location.quietnessLevel && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getQuietnessColor(
                location.quietnessLevel
              )}`}
            >
              {location.quietnessLevel.replace("-", " ")}
            </span>
          )}
          {location.type && (
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-medium">
              {LocationTypeLabels[location.type]}
            </span>
          )}
        </div>
      </div>

      {location.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
          {location.description}
        </p>
      )}

      {location.address && (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <svg
            className="w-4 h-4 mr-1 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">{location.address}</span>
        </div>
      )}

      {location.openingHours && (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <svg
            className="w-4 h-4 mr-1 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">{location.openingHours}</span>
        </div>
      )}

      {location.amenities && location.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {location.amenities.slice(0, 4).map((amenity, index) => (
            <span
              key={index}
              className="inline-block px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-full text-xs"
            >
              {amenity}
            </span>
          ))}
          {location.amenities.length > 4 && (
            <span className="inline-block px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-full text-xs">
              +{location.amenities.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};
