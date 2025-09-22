import { useState } from "react";
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

// Mock settings until we create the actual table
export const useSettings = () => {
  return {
    data: null,
    isLoading: false,
  };
};

export const useSaveSettings = () => {
  const { toast } = useToast();

  return {
    mutate: async (payload: { id?: string; data: AppSettingsData }) => {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ 
        title: "Configurações salvas", 
        description: "Alterações aplicadas com sucesso" 
      });
    },
    isPending: false,
  };
};