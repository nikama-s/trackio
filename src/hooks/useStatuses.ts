import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axiosInstance";
import { notifications } from "@mantine/notifications";

export type Status = {
  id: string;
  name: string;
  color: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function useStatuses() {
  return useQuery<Status[]>({
    queryKey: ["statuses"],
    queryFn: async () => {
      const response = await api.get("/api/statuses");
      return response.data;
    },
    retry: false
  });
}

export function useCreateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const response = await api.post("/api/statuses", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to create status",
        color: "red"
      });
    }
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: { name?: string; color?: string };
    }) => {
      const response = await api.put(`/api/statuses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to update status",
        color: "red"
      });
    }
  });
}

export function useDeleteStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/statuses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to delete status",
        color: "red"
      });
    }
  });
}
