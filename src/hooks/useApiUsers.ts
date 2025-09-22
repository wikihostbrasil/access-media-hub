import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: "admin" | "operator" | "user";
  receive_notifications: boolean;
  whatsapp?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  email: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return apiClient.getUsers() as Promise<UserProfile[]>;
    },
  });
};