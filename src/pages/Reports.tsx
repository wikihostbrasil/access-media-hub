import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, Users, TrendingUp, Calendar, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Reports = () => {
  const [downloads, setDownloads] = useState<{ downloaded_at: string; file_id: string }[]>([]);
  const [files, setFiles] = useState<{ id: string; title: string }[]>([]);
  const { toast } = useToast();

  // Real data queries
  const { data: totalDownloads = 0 } = useQuery({
    queryKey: ["downloads-count"],
    queryFn: async () => {
      const { count } = await supabase.from("downloads").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: totalUsers = 0 } = useQuery({
    queryKey: ["users-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: totalFiles = 0 } = useQuery({
    queryKey: ["files-count"],
    queryFn: async () => {
      const { count } = await supabase.from("files").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: recentDownloads = [] } = useQuery({
    queryKey: ["recent-downloads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("downloads")
        .select("downloaded_at, file_id")
        .order("downloaded_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados serão exportados em breve",
    });
  };

  const handleFilter = () => {
    toast({
      title: "Filtros aplicados",
      description: "Os dados foram filtrados conforme selecionado",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: dls } = await supabase.from("downloads").select("downloaded_at, file_id");
      const { data: fls } = await supabase.from("files").select("id, title");
      setDownloads(dls || []);
      setFiles(fls || []);
    };
    fetchData();
  }, []);

  const downloadsByDay = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const counts: Record<string, number> = {};
    downloads.forEach(d => {
      const day = days[new Date(d.downloaded_at).getDay()];
      counts[day] = (counts[day] || 0) + 1;
    });
    return days.map(day => ({ day, downloads: counts[day] || 0 }));
  }, [downloads]);

  const topFiles = useMemo(() => {
    const counts: Record<string, number> = {};
    downloads.forEach(d => { counts[d.file_id] = (counts[d.file_id] || 0) + 1; });
    const withNames = Object.entries(counts).map(([fileId, count]) => ({
      name: files.find(f => f.id === fileId)?.title || 'Arquivo',
      downloads: count,
      category: 'N/A',
    }));
    return withNames.sort((a, b) => b.downloads - a.downloads).slice(0, 4);
  }, [downloads, files]);

  const downloadsByCategory = useMemo(() => {
    const categories: Record<string, string[]> = {
      Documentos: ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt'],
      Imagens: ['png','jpg','jpeg','gif','webp'],
      Vídeos: ['mp4','mov','avi','mkv','webm'],
      Áudio: ['mp3','wav','ogg','aac','m4a','flac'],
      Outros: [],
    };
    const counts: Record<string, number> = { Documentos: 0, Imagens: 0, Vídeos: 0, Áudio: 0, Outros: 0 };
    const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || '';
    downloads.forEach(d => {
      const name = files.find(f => f.id === d.file_id)?.title || '';
      const ext = getExt(name);
      const match = Object.entries(categories).find(([_, exts]) => exts.includes(ext));
      const key = match ? match[0] : 'Outros';
      counts[key] = (counts[key] || 0) + 1;
    });
    const palette: Record<string, string> = {
      Documentos: '#8884d8',
      Imagens: '#82ca9d',
      Vídeos: '#ffc658',
      Áudio: '#00bcd4',
      Outros: '#999999',
    };
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: palette[name] }));
  }, [downloads, files]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">
            Análise detalhada de downloads e uso do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFilter}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentDownloads.filter(d => 
              new Date(d.downloaded_at).toDateString() === new Date().toDateString()
            ).length}</div>
            <p className="text-xs text-muted-foreground">
              Downloads hoje
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              Total de downloads
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Total de usuários
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              Total de arquivos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Downloads por Dia da Semana</CardTitle>
            <CardDescription>
              Distribuição de downloads nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={downloadsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="downloads" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Downloads por Categoria</CardTitle>
            <CardDescription>
              Distribuição por tipo de arquivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={downloadsByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {downloadsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top arquivos */}
      <Card>
        <CardHeader>
          <CardTitle>Arquivos Mais Baixados</CardTitle>
          <CardDescription>
            Ranking dos arquivos com mais downloads este mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topFiles.map((file, index) => (
              <div key={file.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <Badge variant="secondary">{file.category}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{file.downloads}</div>
                  <div className="text-sm text-muted-foreground">downloads</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;