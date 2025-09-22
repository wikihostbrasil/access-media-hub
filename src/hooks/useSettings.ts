import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AppSettingsData {
  app_name?: string;
  app_description?: string;
  max_file_size_mb?: number;
  public_registration?: boolean;
  two_factor?: boolean;
  activity_log?: boolean;
  session_timeout_min?: number;
  manual_download_approval?: boolean;
  notify_new_uploads?: boolean;
  weekly_report?: boolean;
  security_alerts?: boolean;
  smtp?: {
    host?: string;
    port?: number;
    encryption?: string;
    user?: string;
  };
}

export const useSettings = () => {
  return useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("id, data").limit(1);
      if (error) throw error;
      return (data?.[0] as { id: string; data: AppSettingsData } | undefined) || null;
    },
  });
};

export const useSaveSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: { id?: string; data: AppSettingsData }) => {
      if (payload.id) {
        const { error } = await supabase.from("app_settings").update({ data: payload.data as any }).eq("id", payload.id);
        if (error) throw error;
        return { id: payload.id };
      }
      const { data, error } = await supabase.from("app_settings").insert({ data: payload.data as any }).select("id").single();
      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["app-settings"] });
      toast({ title: "Configurações salvas", description: "Alterações aplicadas com sucesso" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao salvar configurações: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};