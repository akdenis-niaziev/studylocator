import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { StudyLocation } from "../types/location";

interface RoutingControlProps {
  destination: StudyLocation;
  userLocation: { lat: number; lng: number } | null;
  travelMode: "car" | "bike" | "foot";
}

export const RoutingControl = ({
  destination,
  userLocation,
  travelMode,
}: RoutingControlProps) => {
  const map = useMap();
  const [routingControl, setRoutingControl] = useState<any>(null);

  useEffect(() => {
    if (!userLocation || !destination) return;

    if (routingControl) {
      map.removeControl(routingControl);
    }

    const waypoints = [
      L.latLng(userLocation.lat, userLocation.lng),
      L.latLng(destination.latitude, destination.longitude),
    ];

    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      lineOptions: {
        styles: [{ color: "#6FA1EC", weight: 4 }],
      },
      router: new (L as any).Routing.OSRMv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile:
          travelMode === "foot"
            ? "walking"
            : travelMode === "bike"
            ? "cycling"
            : "driving",
      }),
    }).addTo(map);

    setRoutingControl(control);

    return () => {
      if (control) {
        map.removeControl(control);
      }
    };
  }, [map, destination, userLocation, travelMode]);

  return null;
};
