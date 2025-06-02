import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axiosInstance";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  statusId: string;
  deadline: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: {
    id: string;
    name: string;
    color: string | null;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  statusId?: string;
  deadline?: string;
  tagIds?: string[];
};

export function useTask(id: string) {
  return useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      const response = await api.get(`/api/tasks/${id}`);
      return response.data;
    },
    retry: false
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const response = await api.put(`/api/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    }
  });
}
