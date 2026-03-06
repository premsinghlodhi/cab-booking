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

export function useRides(filters?: { role?: "user" | "driver" | "admin"; status?: string }) {
  return useQuery({
    queryKey: [api.rides.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      
      const url = `${api.rides.list.path}${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch rides");
      
      const data = await res.json();
      return parseWithLogging(api.rides.list.responses[200], data, "rides.list");
    },
  });
}

export function useRide(id: number | null) {
  return useQuery({
    queryKey: [api.rides.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.rides.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch ride");
      return parseWithLogging(api.rides.get.responses[200], await res.json(), "rides.get");
    },
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5s for live tracking
  });
}

export function useBookRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.rides.book.input>) => {
      const res = await fetch(api.rides.book.path, {
        method: api.rides.book.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to book ride");
      return parseWithLogging(api.rides.book.responses[201], await res.json(), "rides.book");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.rides.list.path] });
    },
  });
}

export function useUpdateRideStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "pending" | "accepted" | "ongoing" | "completed" | "cancelled" }) => {
      const url = buildUrl(api.rides.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.rides.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update ride status");
      return parseWithLogging(api.rides.updateStatus.responses[200], await res.json(), "rides.updateStatus");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.rides.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.rides.get.path, variables.id] });
    },
  });
}
