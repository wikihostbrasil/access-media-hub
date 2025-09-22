import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Calendar, TrendingUp, FileText } from "lucide-react";

const Downloads = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - em uma implementação real viria do Supabase
  const downloads = [
    {
      id: 1,
      fileName: "manual-usuario.pdf",
      userName: "João Silva",
      userEmail: "joao@empresa.com",
      downloadDate: "2024-01-22 14:30",
      fileSize: "2.3 MB",
      category: "Documentos",
      ip: "192.168.1.100",
    },
    {
      id: 2,
      fileName: "logo-empresa.png",
      userName: "Maria Santos",
      userEmail: "maria@empresa.com",
      downloadDate: "2024-01-22 13:15",
      fileSize: "1.8 MB",
      category: "Imagens",
      ip: "192.168.1.101",
    },
    {
      id: 3,
      fileName: "video-tutorial.mp4",
      userName: "Pedro Costa",
      userEmail: "pedro@empresa.com",
      downloadDate: "2024-01-22 10:45",
      fileSize: "25.6 MB",
      category: "Vídeos",
      ip: "192.168.1.102",
    },
  ];

  const filteredDownloads = downloads.filter(download =>
    download.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    download.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayDownloads = downloads.filter(d => 
    d.downloadDate.startsWith("2024-01-22")
  ).length;

  const totalSize = downloads.reduce((acc, d) => {
    const size = parseFloat(d.fileSize.replace(/[^\d.]/g, ''));
    return acc + size;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Downloads</h1>
          <p className="text-muted-foreground">
            Monitore e analise todos os downloads realizados
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayDownloads}</div>
            <p className="text-xs text-muted-foreground">
              +2% em relação a ontem
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downloads.length}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSize.toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">
              Transferido hoje
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arquivo Popular</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">manual-usuario.pdf</div>
            <p className="text-xs text-muted-foreground">
              Mais baixado
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Downloads</CardTitle>
          <CardDescription>
            Histórico completo de downloads com detalhes dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por arquivo ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDownloads.map((download) => (
                <TableRow key={download.id}>
                  <TableCell className="font-medium">
                    {download.fileName}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{download.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        {download.userEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{download.category}</Badge>
                  </TableCell>
                  <TableCell>{download.fileSize}</TableCell>
                  <TableCell>{download.downloadDate}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {download.ip}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Downloads;