import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FileData {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  is_permanent?: boolean;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface DownloadRecord {
  id: string;
  file_id: string;
  user_id: string;
  downloaded_at: string;
  profiles?: {
    full_name: string;
  };
}

export const useFiles = (isAdmin = false) => {
  return useQuery({
    queryKey: ["files", isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // If admin, show all files (including deleted, expired, blocked)
      if (isAdmin) {
        return data as FileData[];
      }
      
      // For regular users, filter files based on visibility rules
      const now = new Date();
      const visibleFiles = data.filter(file => {
        // Only show active files
        if (file.status && file.status !== 'active') return false;

        // Skip deleted files for regular users
        if (file.deleted_at) return false;

        // If permanent, always show
        if (file.is_permanent) return true;
        
        // If not permanent, check validity window (inclusive of end date)
        const startsOk = !file.start_date || new Date(file.start_date) <= now;
        let endsOk = true;
        if (file.end_date) {
          const end = new Date(file.end_date);
          end.setHours(23, 59, 59, 999); // inclusive through the end of the day
          endsOk = now <= end;
        }
        return startsOk && endsOk;
      });
      
      return visibleFiles as FileData[];
    },
  });
};

export const useFileDownloads = (fileId: string) => {
  return useQuery({
    queryKey: ["file-downloads", fileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("downloads")
        .select("*")
        .eq("file_id", fileId)
        .order("downloaded_at", { ascending: false });

      if (error) throw error;
      
      // Get user names separately
      const userIds = [...new Set(data.map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const downloadsWithProfiles = data.map(download => ({
        ...download,
        profiles: profiles?.find(p => p.user_id === download.user_id) || null
      }));

      return downloadsWithProfiles as DownloadRecord[];
    },
    enabled: !!fileId,
  });
};

export const useCreateFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fileData: Omit<FileData, "id" | "created_at" | "updated_at" | "uploaded_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("files")
        .insert({
          ...fileData,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast({
        title: "Sucesso",
        description: "Arquivo criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar arquivo: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fileId: string) => {
      // Soft delete - just mark as deleted
      const { error } = await supabase
        .from("files")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast({
        title: "Sucesso",
        description: "Arquivo excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir arquivo: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};