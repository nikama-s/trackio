import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axiosInstance";
import { AxiosError } from "axios";
import { notifications } from "@mantine/notifications";

export type Tag = {
  id: string;
  name: string;
  color: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await api.get("/api/tags");
      return response.data;
    },
    retry: false
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const response = await api.post("/api/tags", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.error) {
        notifications.show({
          title: "Error",
          message: error.response.data.error,
          color: "red"
        });
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to create tag",
          color: "red"
        });
      }
    }
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: { name?: string; color?: string };
    }) => {
      const response = await api.patch(`/api/tags/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.error) {
        notifications.show({
          title: "Error",
          message: error.response.data.error,
          color: "red"
        });
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to update tag",
          color: "red"
        });
      }
    }
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/tags/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.error) {
        notifications.show({
          title: "Error",
          message: error.response.data.error,
          color: "red"
        });
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to delete tag",
          color: "red"
        });
      }
    }
  });
}
