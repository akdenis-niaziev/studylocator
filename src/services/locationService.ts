import {
  StudyLocation,
  LocationsResponse,
  LocationType,
} from "../types/location";
import axios from "axios";
import { checkInService } from "./checkInService";
const mockLocations: StudyLocation[] = [
  {
    id: "1",
    name: "Central Library Reading Room",
    description: "Quiet reading area with individual desks",
    latitude: 50.8503,
    longitude: 4.3517,
    address: "Central Library, City Center",
    openingHours: "08:00 - 22:00",
    amenities: ["WiFi", "Power outlets", "Temperature control"],
    quietnessLevel: "very-quiet",
    type: LocationType.LIBRARY,
  },
  {
    id: "2",
    name: "University Study Hall",
    description: "Academic study space on campus",
    latitude: 50.8469,
    longitude: 4.3585,
    address: "University Campus Building A",
    openingHours: "07:00 - 23:00",
    amenities: ["WiFi", "Printer", "Library access"],
    quietnessLevel: "quiet",
    type: LocationType.LIBRARY,
  },
  {
    id: "3",
    name: "Public Park Quiet Zone",
    description: "Outdoor study area with benches and shade",
    latitude: 50.8456,
    longitude: 4.3622,
    address: "Central Park, Open Air",
    openingHours: "06:00 - 20:00",
    amenities: ["Natural light", "Fresh air"],
    quietnessLevel: "moderate",
    type: LocationType.PUBLIC_SPACE,
  },
  {
    id: "4",
    name: "Studio Workspace",
    description: "Private study pods for rent",
    latitude: 50.8534,
    longitude: 4.3456,
    address: "Downtown Studio Complex",
    openingHours: "06:00 - 22:00",
    amenities: ["WiFi", "Power outlets", "Soundproof pods"],
    quietnessLevel: "very-quiet",
    type: LocationType.COWORKING,
  },
  {
    id: "5",
    name: "Community Center Study Room",
    description: "Free public study space",
    latitude: 50.8388,
    longitude: 4.3745,
    address: "Community Center South",
    openingHours: "09:00 - 17:00",
    amenities: ["WiFi", "Tables", "Chairs"],
    quietnessLevel: "quiet",
    type: LocationType.PUBLIC_SPACE,
  },
  // Amsterdam locations
  {
    id: "6",
    name: "Amsterdam Central Library",
    description: "Modern library with study spaces",
    latitude: 52.3676,
    longitude: 4.9041,
    address: "Oosterdokskade 143, Amsterdam",
    openingHours: "10:00 - 22:00",
    amenities: ["WiFi", "Power outlets", "Coffee bar"],
    quietnessLevel: "very-quiet",
    type: LocationType.LIBRARY,
  },
  {
    id: "7",
    name: "UvA Study Commons",
    description: "University study area",
    latitude: 52.3547,
    longitude: 4.9551,
    address: "University of Amsterdam",
    openingHours: "08:00 - 20:00",
    amenities: ["WiFi", "Group rooms", "Silent zones"],
    quietnessLevel: "quiet",
    type: LocationType.LIBRARY,
  },
  // Paris locations
  {
    id: "8",
    name: "Bibliothèque Nationale",
    description: "Historic national library",
    latitude: 48.8566,
    longitude: 2.3522,
    address: "58 Rue de Richelieu, Paris",
    openingHours: "09:00 - 18:00",
    amenities: ["WiFi", "Historic reading rooms"],
    quietnessLevel: "very-quiet",
    type: LocationType.LIBRARY,
  },
  {
    id: "9",
    name: "Sorbonne Study Hall",
    description: "University library",
    latitude: 48.8489,
    longitude: 2.3431,
    address: "17 Rue de la Sorbonne, Paris",
    openingHours: "08:00 - 21:00",
    amenities: ["WiFi", "Research materials", "Power outlets"],
    quietnessLevel: "quiet",
    type: LocationType.LIBRARY,
  },
  // London locations
  {
    id: "10",
    name: "British Library Reading Rooms",
    description: "World-class study facility",
    latitude: 51.5299,
    longitude: -0.127,
    address: "96 Euston Road, London",
    openingHours: "09:30 - 20:00",
    amenities: ["WiFi", "Power outlets", "Lockers"],
    quietnessLevel: "very-quiet",
    type: LocationType.LIBRARY,
  },
  {
    id: "11",
    name: "Kings College Study Space",
    description: "University study area",
    latitude: 51.5115,
    longitude: -0.116,
    address: "Strand, London",
    openingHours: "07:00 - 23:00",
    amenities: ["WiFi", "24/7 access areas", "Group study"],
    quietnessLevel: "quiet",
    type: LocationType.LIBRARY,
  },
  // Berlin locations
  {
    id: "12",
    name: "Staatsbibliothek Berlin",
    description: "State library with modern facilities",
    latitude: 52.5074,
    longitude: 13.3698,
    address: "Unter den Linden 8, Berlin",
    openingHours: "09:00 - 21:00",
    amenities: ["WiFi", "Power outlets", "Research areas"],
    quietnessLevel: "very-quiet",
    type: LocationType.LIBRARY,
  },
  {
    id: "13",
    name: "Humboldt University Library",
    description: "Academic library",
    latitude: 52.5186,
    longitude: 13.3947,
    address: "Unter den Linden, Berlin",
    openingHours: "08:00 - 22:00",
    amenities: ["WiFi", "Study carrels", "Group rooms"],
    quietnessLevel: "quiet",
    type: LocationType.LIBRARY,
  },
];

export const locationService = {
  async getLocations(limit: number = 10): Promise<LocationsResponse> {
    try {
      // Fetch from the Gent open data API with specified limit
      const url = `https://data.stad.gent/api/explore/v2.1/catalog/datasets/bloklocaties-gent/records?limit=${limit}`;
      console.log(`Fetching from API: ${url}`);
      const response = await axios.get(url);

      // Log full response structure for debugging
      console.log("Full API Response:", response.data);

      if (response.data.results) {
        console.log("First record structure:", response.data.results[0]);
      }

      // Parse the API response - structure: { results: [...] }
      if (
        response.data &&
        response.data.results &&
        Array.isArray(response.data.results)
      ) {
        const locations: StudyLocation[] = response.data.results.map(
          (record: any, index: number) => {
            // Extract coordinates - check different possible field names
            let latitude = 51.0537; // Default Gent latitude
            let longitude = 3.725; // Default Gent longitude

            // Try to get coordinates from various possible API response structures
            if (
              record.geo_punt &&
              typeof record.geo_punt.lat === "number" &&
              typeof record.geo_punt.lon === "number"
            ) {
              latitude = record.geo_punt.lat;
              longitude = record.geo_punt.lon;
            } else if (record.geo_point_2d) {
              latitude = record.geo_point_2d.lat || latitude;
              longitude = record.geo_point_2d.lon || longitude;
            } else if (record.geometry?.coordinates) {
              // GeoJSON format: [longitude, latitude]
              longitude = record.geometry.coordinates[0] || longitude;
              latitude = record.geometry.coordinates[1] || latitude;
            } else if (record.latitude && record.longitude) {
              latitude = record.latitude;
              longitude = record.longitude;
            }

            // Log all records for debugging
            console.log(`Location ${index}:`, {
              name: record.naam,
              straatnaam: record.straatnaam,
              huisnummer: record.huisnummer,
              adres: record.adres,
              geo_point_2d: record.geo_point_2d,
              geometry: record.geometry,
              latitude,
              longitude,
            });

            // Address
            let address = record.adres || "Gent, Belgium";
            if (!address && record.straatnaam && record.huisnummer) {
              address = `${record.straatnaam} ${record.huisnummer}, Gent`;
            } else if (!address && record.straatnaam) {
              address = `${record.straatnaam}, Gent`;
            }

            const id = (
              record.id ??
              record.objectid ??
              `location-${index}`
            ).toString();

            let currentOccupancy =
              typeof record.gereserveerde_plaatsen !== "undefined"
                ? Number(record.gereserveerde_plaatsen)
                : 0;

            // Add local check-ins to occupancy
            const localOccupancy = checkInService.getCurrentOccupancy(id);
            currentOccupancy += localOccupancy;

            return {
              id,
              name: record.titel || record.naam || "Study Location",
              description:
                record.teaser_text ||
                record.beschrijving ||
                "Quiet study space",
              latitude,
              longitude,
              address,
              capacity: record.totale_capaciteit
                ? Number(record.totale_capaciteit)
                : undefined,
              currentOccupancy,
              openingHours: record.openingsuren || null,
              amenities: record.voorzieningen
                ? record.voorzieningen.split(",").map((a: string) => a.trim())
                : [record.tag_1, record.tag_2].filter(Boolean),
              quietnessLevel: "quiet",
              imageUrl: record.teaser_img_url || record.afbeelding,
              type: LocationType.QUIET_ZONE,
            };
          }
        );

        console.log(`Loaded ${locations.length} locations from Gent API`);
        console.log("Processed locations:", locations);
        return {
          locations,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        console.warn(
          "Unexpected API response structure, using fallback mock data"
        );
        console.warn("Response data keys:", Object.keys(response.data));
        return {
          locations: mockLocations,
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch (apiError) {
      console.error("API call failed, falling back to mock data:", apiError);
      return {
        locations: mockLocations,
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  async getLocationById(id: string): Promise<StudyLocation | null> {
    const response = await this.getLocations();
    return response.locations.find((loc) => loc.id === id) || null;
  },

  async addLocation(
    location: Omit<StudyLocation, "id">
  ): Promise<StudyLocation> {
    const newLocation: StudyLocation = {
      ...location,
      id: Date.now().toString(),
    };
    return newLocation;
  },
};
