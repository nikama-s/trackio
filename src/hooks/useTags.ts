import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axiosInstance";

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
