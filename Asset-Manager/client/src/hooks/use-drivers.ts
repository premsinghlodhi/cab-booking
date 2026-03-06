import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useDrivers(filters?: { available?: string }) {
  return useQuery({
    queryKey: [api.drivers.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.available) params.append("available", filters.available);
      
      const url = `${api.drivers.list.path}${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch drivers");
      
      return parseWithLogging(api.drivers.list.responses[200], await res.json(), "drivers.list");
    },
  });
}

export function useVerifyDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.drivers.verify.path, { id });
      const res = await fetch(url, {
        method: api.drivers.verify.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to verify driver");
      return parseWithLogging(api.drivers.verify.responses[200], await res.json(), "drivers.verify");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.drivers.list.path] });
    },
  });
}

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (availabilityStatus: boolean) => {
      const res = await fetch(api.drivers.updateStatus.path, {
        method: api.drivers.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return parseWithLogging(api.drivers.updateStatus.responses[200], await res.json(), "drivers.updateStatus");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
    },
  });
}
