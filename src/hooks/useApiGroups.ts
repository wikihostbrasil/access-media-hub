import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_count: number;
  created_by_name?: string;
}

export const useGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      return apiClient.getGroups() as Promise<Group[]>;
    },
  });
};