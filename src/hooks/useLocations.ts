import { useQuery } from "@tanstack/react-query";
import { locationService } from "../services/locationService";
import { StudyLocation } from "../types/location";

export const useLocations = (limit: number = 100) => {
  return useQuery<StudyLocation[]>({
    queryKey: ["locations", limit],
    queryFn: async () => {
      const response = await locationService.getLocations(limit);
      return response.locations;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    enabled: true,
  });
};

export const useLocationById = (id: string) => {
  return useQuery<StudyLocation | null>({
    queryKey: ["location", id],
    queryFn: () => locationService.getLocationById(id),
    enabled: !!id,
  });
};
