import { useEffect, useRef, useCallback } from "react";
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
  const routingControlRef = useRef<any>(null);
  const hasFittedBoundsRef = useRef(false);
  const lastDestinationIdRef = useRef<string | null>(null);
  const lastTravelModeRef = useRef<string | null>(null);

  // Clean up routing control
  const cleanupControl = useCallback(() => {
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (e) {
        // Control might already be removed
      }
      routingControlRef.current = null;
    }
  }, [map]);

  useEffect(() => {
    if (!userLocation || !destination) {
      cleanupControl();
      return;
    }

    // Check if we need to create a new route
    const destinationChanged = lastDestinationIdRef.current !== destination.id;
    const travelModeChanged = lastTravelModeRef.current !== travelMode;
    const needsNewRoute = destinationChanged || travelModeChanged;

    if (!needsNewRoute && routingControlRef.current) {
      // Only update the start waypoint silently (user location changed)
      // Don't rebuild the entire route
      return;
    }

    // Clean up existing control before creating a new one
    cleanupControl();

    // Reset fit bounds flag only when destination changes
    if (destinationChanged) {
      hasFittedBoundsRef.current = false;
    }

    lastDestinationIdRef.current = destination.id;
    lastTravelModeRef.current = travelMode;

    const waypoints = [
      L.latLng(userLocation.lat, userLocation.lng),
      L.latLng(destination.latitude, destination.longitude),
    ];

    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: !hasFittedBoundsRef.current, // Only fit on first render
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null, // Don't create default markers - we handle them ourselves
      lineOptions: {
        styles: [{ color: "#3B82F6", weight: 5, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
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

    // Mark that we've fitted bounds
    control.on("routesfound", () => {
      hasFittedBoundsRef.current = true;
    });

    routingControlRef.current = control;

    return () => {
      cleanupControl();
    };
  }, [map, destination?.id, travelMode, cleanupControl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupControl();
      lastDestinationIdRef.current = null;
      lastTravelModeRef.current = null;
      hasFittedBoundsRef.current = false;
    };
  }, [cleanupControl]);

  return null;
};
