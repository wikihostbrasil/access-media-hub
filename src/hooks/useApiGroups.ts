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

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      return apiClient.createGroup(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar grupo: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.deleteGroup(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Sucesso",
        description: "Grupo deletado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao deletar grupo: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};