import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
  profiles?: {
    full_name: string;
  };
}

export const useGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user counts and creator names separately  
      const groupsWithExtra = await Promise.all(
        data.map(async (group) => {
          const { data: userGroups } = await supabase
            .from("user_groups")
            .select("id")
            .eq("group_id", group.id);

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", group.created_by)
            .single();

          return {
            ...group,
            user_count: userGroups?.length || 0,
            profiles: profile || null,
          };
        })
      );

      return groupsWithExtra as Group[];
    },
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (groupData: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("groups")
        .insert({
          ...groupData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso!",
      });
    },
    onError: (error) => {
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
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Sucesso",
        description: "Grupo excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir grupo: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};