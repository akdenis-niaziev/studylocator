import { useState, useEffect, useCallback } from "react";
import { useLocations } from "./hooks/useLocations";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import { Map } from "./components/Map";
import { LocationList } from "./components/LocationList";
import { DetailsPanel } from "./components/DetailsPanel";
import { StudyLocation } from "./types/location";
import { QRScanner } from "./components/QRScanner";
import { Dashboard } from "./components/Dashboard";
import { Profile } from "./components/Profile";
import { DetailBottomSheet } from "./components/BottomSheet";

type View = "explore" | "scan" | "profile" | "admin";

function App() {
  const { isAdmin } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [locationLimit, setLocationLimit] = useState<number>(10);
  const {
    data: locations = [],
    isLoading,
    refetch,
  } = useLocations(locationLimit);
  const [selectedLocation, setSelectedLocation] = useState<
    StudyLocation | undefined
  >();
  const [currentView, setCurrentView] = useState<View>("explore");
  const [showMap, setShowMap] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Navigation State
  const [navDestination, setNavDestination] = useState<StudyLocation | null>(
    null
  );
  const [travelMode, setTravelMode] = useState<"car" | "bike" | "foot">("foot");

  // Memoize userLocation updates to prevent unnecessary re-renders
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    }

    const watchId = fetchUserLocation();

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const fetchUserLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      return navigator.geolocation.watchPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;

          // Only update if location changed significantly (more than ~10 meters)
          setUserLocation((prev) => {
            if (!prev) return { lat: newLat, lng: newLng };

            const latDiff = Math.abs(prev.lat - newLat);
            const lngDiff = Math.abs(prev.lng - newLng);

            // ~0.0001 degrees is roughly 10 meters
            if (latDiff > 0.0001 || lngDiff > 0.0001) {
              return { lat: newLat, lng: newLng };
            }
            return prev;
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000, // Cache location for 30 seconds
          timeout: 10000,
        }
      );
    }
  }, []);

  const startNavigation = (mode: "car" | "bike" | "foot") => {
    if (!selectedLocation) return;

    setTravelMode(mode);
    setNavDestination(selectedLocation);

    // Ensure we have user location
    if (!userLocation) {
      fetchUserLocation();
    }

    // On mobile, show map to see route
    if (window.innerWidth < 768) {
      setShowMap(true);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "scan":
        return (
          <QRScanner
            onCheckInSuccess={() => {
              refetch();
              setCurrentView("profile");
            }}
            onClose={() => setCurrentView("explore")}
          />
        );
      case "profile":
        return <Profile />;
      case "admin":
        return isAdmin ? <Dashboard /> : <Profile />; // Redirect to profile if not admin
      case "explore":
      default:
        return (
          <div className="flex w-full h-full">
            <div
              className={`w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-colors ${
                showMap ? "hidden md:flex" : "flex"
              }`}
            >
              <LocationList
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => {
                  setSelectedLocation(loc);
                  if (window.innerWidth < 768) setShowMap(true);
                }}
                isLoading={isLoading}
              />
            </div>

            <div
              className={`flex-1 flex h-full overflow-hidden ${
                !showMap ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="flex-1 overflow-hidden relative">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Loading map...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Map
                      locations={locations}
                      onLocationSelect={setSelectedLocation}
                      destination={navDestination}
                      userLocation={userLocation}
                      travelMode={travelMode}
                    />
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="md:hidden absolute top-3 right-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md text-sm font-semibold text-gray-700 dark:text-gray-200 z-[1000] active:scale-95 transition-all border border-gray-200 dark:border-gray-600"
                    >
                      {showMap ? "📋 List" : "🗺️ Map"}
                    </button>
                  </>
                )}
              </div>

              <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 hidden lg:flex flex-col overflow-y-auto transition-colors">
                <DetailsPanel
                  location={selectedLocation}
                  isLoading={isLoading}
                  onNavigate={startNavigation}
                  isNavigating={!!navDestination}
                  onCancelNavigation={() => setNavDestination(null)}
                  onClose={() => setSelectedLocation(undefined)}
                />
              </div>

              {/* Mobile Bottom Sheet for Details */}
              <DetailBottomSheet
                isOpen={!!selectedLocation}
                onClose={() => setSelectedLocation(undefined)}
              >
                <DetailsPanel
                  location={selectedLocation}
                  isLoading={isLoading}
                  onNavigate={startNavigation}
                  isNavigating={!!navDestination}
                  onCancelNavigation={() => setNavDestination(null)}
                  onClose={() => setSelectedLocation(undefined)}
                />
              </DetailBottomSheet>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 transition-colors">
        <div className="max-w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div
            className="flex items-center"
            onClick={() => setCurrentView("explore")}
          >
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-xl mr-2 sm:mr-3 cursor-pointer">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Study Locator
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <DesktopNavLink
              active={currentView === "explore"}
              onClick={() => setCurrentView("explore")}
              label="Explore"
            />
            <DesktopNavLink
              active={currentView === "scan"}
              onClick={() => setCurrentView("scan")}
              label="Scan"
            />
            <DesktopNavLink
              active={currentView === "profile"}
              onClick={() => setCurrentView("profile")}
              label="Profile"
            />
            {isAdmin && (
              <DesktopNavLink
                active={currentView === "admin"}
                onClick={() => setCurrentView("admin")}
                label="Admin"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {currentView === "explore" && (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <label
                    htmlFor="limit"
                    className="text-xs font-medium text-gray-600 dark:text-gray-300"
                  >
                    Limit:
                  </label>
                  <select
                    id="limit"
                    value={locationLimit}
                    onChange={(e) => setLocationLimit(Number(e.target.value))}
                    className="px-2 pr-6 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <svg
                    className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative pb-16 md:pb-0">
        {renderContent()}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around px-2 py-1 pb-safe z-40 transition-colors">
        <NavButton
          active={currentView === "explore"}
          onClick={() => setCurrentView("explore")}
          icon="🗺️"
          label="Explore"
        />
        <NavButton
          active={currentView === "scan"}
          onClick={() => setCurrentView("scan")}
          icon="📷"
          label="Scan"
        />
        <NavButton
          active={currentView === "profile"}
          onClick={() => setCurrentView("profile")}
          icon="👤"
          label="Profile"
        />
        {isAdmin && (
          <NavButton
            active={currentView === "admin"}
            onClick={() => setCurrentView("admin")}
            icon="📊"
            label="Admin"
          />
        )}
      </div>
    </div>
  );
}

const NavButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center min-w-[60px] py-2 px-3 rounded-xl transition-all active:scale-95 ${
      active
        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-semibold mt-0.5">{label}</span>
  </button>
);

const DesktopNavLink = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
    }`}
  >
    {label}
  </button>
);

export default App;
