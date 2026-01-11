import React from "react";
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

  const FitToMarkers: React.FC<{ points: StudyLocation[] }> = ({ points }) => {
    const map = useMap();
    const hasFit = React.useRef(false);

    React.useEffect(() => {
      // Only fit bounds once when points are loaded
      if (points && points.length > 0 && !destination && !hasFit.current) {
        const bounds = L.latLngBounds(
          points.map((p) => [p.latitude, p.longitude] as [number, number])
        );
        map.fitBounds(bounds.pad(0.2));
        hasFit.current = true;
      }
    }, [points, map]);
    return null;
  };

  return (
    <MapContainer center={center} zoom={13} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers points={locations} />

      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={
            new L.Icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })
          }
        >
          <Popup>You are here</Popup>
        </Marker>
      )}

      {destination && userLocation && (
        <RoutingControl
          destination={destination}
          userLocation={userLocation}
          travelMode={travelMode}
        />
      )}

      {locations.map((location) => (
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
                <p className="text-gray-500">{location.address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
