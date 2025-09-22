import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DownloadWithDetails {
  id: string;
  file_id: string;
  user_id: string;
  downloaded_at: string;
  files: {
    title: string;
    file_size?: number;
    file_type?: string;
  };
  profiles: {
    full_name: string;
  };
}

export const useDownloads = () => {
  return useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("downloads")
        .select("*")
        .order("downloaded_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get file and profile data separately
      const downloadsWithDetails = await Promise.all(
        data.map(async (download) => {
          const { data: file } = await supabase
            .from("files")
            .select("title, file_size, file_type")
            .eq("id", download.file_id)
            .single();

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", download.user_id)
            .single();

          return {
            ...download,
            files: file || { title: "Arquivo", file_size: null, file_type: null },
            profiles: profile || { full_name: "Usuário" },
          };
        })
      );

      return downloadsWithDetails as DownloadWithDetails[];
    },
  });
};

export const useDownloadStats = () => {
  return useQuery({
    queryKey: ["download-stats"],
    queryFn: async () => {
      // Get today's downloads
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayData, error: todayError } = await supabase
        .from("downloads")
        .select("id")
        .gte("downloaded_at", today.toISOString());

      if (todayError) throw todayError;

      // Get total downloads
      const { data: totalData, error: totalError } = await supabase
        .from("downloads")
        .select("id");

      if (totalError) throw totalError;

      // Get unique users this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const { data: monthlyUsers, error: monthlyError } = await supabase
        .from("downloads")
        .select("user_id")
        .gte("downloaded_at", thisMonth.toISOString());

      if (monthlyError) throw monthlyError;

      const uniqueUsers = new Set(monthlyUsers.map(d => d.user_id)).size;

      return {
        todayCount: todayData.length,
        totalCount: totalData.length,
        uniqueUsersThisMonth: uniqueUsers,
      };
    },
  });
};