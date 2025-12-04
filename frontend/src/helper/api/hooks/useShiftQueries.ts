import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createShifts,
  deleteShiftById,
  getShiftById,
  getShifts,
  updateShiftById,
} from "../shift";

export const shiftKeys = {
  all: ["shifts"] as const,
  lists: () => [...shiftKeys.all, "list"] as const,
  list: (startDate?: string, endDate?: string) =>
    [...shiftKeys.lists(), { startDate, endDate }] as const,
  details: () => [...shiftKeys.all, "detail"] as const,
  detail: (id: string) => [...shiftKeys.details(), id] as const,
};

export const useShiftsQuery = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: shiftKeys.list(startDate, endDate),
    queryFn: () => getShifts(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useShiftByIdQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: shiftKeys.detail(id!),
    queryFn: () => getShiftById(id!),
    enabled: !!id,
  });
};

export const useCreateShiftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => createShifts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
    },
  });
};

export const useUpdateShiftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateShiftById(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.all });
    },
  });
};

export const useDeleteShiftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShiftById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
    },
  });
};

