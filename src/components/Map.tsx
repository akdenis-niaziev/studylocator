import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { StudyLocation } from "../types/location";
import { RoutingControl } from "./RoutingControl";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Create custom icons outside component to prevent re-creation
const userLocationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  locations: StudyLocation[];
  onLocationSelect?: (location: StudyLocation) => void;
  destination?: StudyLocation | null;
  userLocation?: { lat: number; lng: number } | null;
  travelMode?: "car" | "bike" | "foot";
}

export const Map: React.FC<MapProps> = ({
  locations,
  onLocationSelect,
  destination,
  userLocation,
  travelMode = "foot",
}) => {
  const center: [number, number] = [51.0537, 3.725]; // Gent center

  // Memoize locations to prevent unnecessary re-renders
  const memoizedLocations = useMemo(
    () => locations,
    [JSON.stringify(locations.map((l) => l.id))]
  );

  const FitToMarkers: React.FC<{
    points: StudyLocation[];
    isNavigating: boolean;
  }> = ({ points, isNavigating }) => {
    const map = useMap();
    const hasFit = React.useRef(false);

    React.useEffect(() => {
      // Only fit bounds once when points are loaded AND not navigating
      if (points && points.length > 0 && !isNavigating && !hasFit.current) {
        const bounds = L.latLngBounds(
          points.map((p) => [p.latitude, p.longitude] as [number, number])
        );
        map.fitBounds(bounds.pad(0.2));
        hasFit.current = true;
      }
    }, [points.length, isNavigating, map]);
    return null;
  };

  return (
    <MapContainer center={center} zoom={13} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers points={memoizedLocations} isNavigating={!!destination} />

      {/* User location marker - always RED */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userLocationIcon}
          zIndexOffset={1000}
        >
          <Popup>
            <div className="marker-popup">
              <h3>📍 You are here</h3>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Destination marker - GREEN when navigating */}
      {destination && (
        <Marker
          position={[destination.latitude, destination.longitude]}
          icon={destinationIcon}
          zIndexOffset={999}
        >
          <Popup>
            <div className="marker-popup">
              <h3>🎯 {destination.name}</h3>
              {destination.address && <p>{destination.address}</p>}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Routing line */}
      {destination && userLocation && (
        <RoutingControl
          destination={destination}
          userLocation={userLocation}
          travelMode={travelMode}
        />
      )}

      {/* Location markers - skip destination if navigating to avoid duplicate */}
      {memoizedLocations
        .filter((location) => !destination || location.id !== destination.id)
        .map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            eventHandlers={{
              click: () => onLocationSelect?.(location),
            }}
          >
            <Popup>
              <div className="marker-popup">
                <h3>{location.name}</h3>
                {location.description && <p>{location.description}</p>}
                {location.address && (
                  <p className="text-gray-500 dark:text-gray-400">
                    {location.address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};
