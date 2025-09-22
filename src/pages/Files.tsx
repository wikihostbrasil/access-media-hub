import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileIcon, Download, Search, Plus, Upload } from "lucide-react";

const Files = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - em uma implementação real viria do Supabase
  const files = [
    {
      id: 1,
      name: "documento.pdf",
      size: "2.3 MB",
      category: "Documentos",
      downloads: 15,
      uploadDate: "2024-01-15",
    },
    {
      id: 2,
      name: "imagem.jpg",
      size: "1.8 MB", 
      category: "Imagens",
      downloads: 8,
      uploadDate: "2024-01-20",
    },
  ];

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Arquivos</h1>
          <p className="text-muted-foreground">
            Gerencie e organize todos os arquivos disponíveis para download
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Arquivo
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Arquivos</CardTitle>
          <CardDescription>
            Total de {files.length} arquivos disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Data Upload</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4" />
                    {file.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{file.category}</Badge>
                  </TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>{file.downloads}</TableCell>
                  <TableCell>{file.uploadDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </div>
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

export default Files;