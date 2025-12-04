import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPublishWeek, getPublishWeek } from "../publishWeek";

export const publishWeekKeys = {
  all: ["publishWeeks"] as const,
  lists: () => [...publishWeekKeys.all, "list"] as const,
  list: (startDate: string, endDate: string) =>
    [...publishWeekKeys.lists(), { startDate, endDate }] as const,
};

export const usePublishWeekQuery = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: publishWeekKeys.list(startDate, endDate),
    queryFn: () => getPublishWeek(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useCreatePublishWeekMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: string; endDate: string }) =>
      createPublishWeek(startDate, endDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: publishWeekKeys.list(variables.startDate, variables.endDate),
      });
    },
  });
};

