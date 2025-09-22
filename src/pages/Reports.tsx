import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, Users, TrendingUp, Calendar, Filter } from "lucide-react";

const Reports = () => {
  // Mock data para os gráficos
  const downloadsByDay = [
    { day: 'Seg', downloads: 24 },
    { day: 'Ter', downloads: 18 },
    { day: 'Qua', downloads: 35 },
    { day: 'Qui', downloads: 28 },
    { day: 'Sex', downloads: 42 },
    { day: 'Sáb', downloads: 15 },
    { day: 'Dom', downloads: 8 },
  ];

  const downloadsByCategory = [
    { name: 'Documentos', value: 45, color: '#8884d8' },
    { name: 'Imagens', value: 30, color: '#82ca9d' },
    { name: 'Vídeos', value: 15, color: '#ffc658' },
    { name: 'Software', value: 10, color: '#ff7300' },
  ];

  const topFiles = [
    { name: 'manual-usuario.pdf', downloads: 125, category: 'Documentos' },
    { name: 'logo-empresa.png', downloads: 98, category: 'Imagens' },
    { name: 'video-tutorial.mp4', downloads: 76, category: 'Vídeos' },
    { name: 'software-v2.exe', downloads: 54, category: 'Software' },
  ];

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
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
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
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs ontem
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">670</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> vs semana anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+8.2%</div>
            <p className="text-xs text-muted-foreground">
              vs mês anterior
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