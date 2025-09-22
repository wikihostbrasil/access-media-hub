import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileIcon, Download, Search, Plus, Upload, BarChart3, Edit, Trash2 } from "lucide-react";
import { useFiles, useDeleteFile } from "@/hooks/useFiles";
import { DownloadDetailsModal } from "@/components/DownloadDetailsModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UploadFileDialog } from "@/components/dialogs/UploadFileDialog";
import { CreateCategoryDialog } from "@/components/dialogs/CreateCategoryDialog";
import { supabase } from "@/integrations/supabase/client";

const Files = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const [openUpload, setOpenUpload] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const { data: files, isLoading } = useFiles();
  const deleteFile = useDeleteFile();

  const filteredFiles = files?.filter(file =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileExtension = (filename: string) => {
    const ext = filename.split('.').pop()?.toUpperCase();
    return ext || 'FILE';
  };

  const handleShowDownloads = (fileId: string, fileName: string) => {
    setSelectedFileId(fileId);
    setSelectedFileName(fileName);
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) {
      deleteFile.mutate(fileId);
    }
  };

  const handleDirectDownload = async (file: { id: string; file_url: string; title?: string }) => {
    try {
      const { data: userResp } = await supabase.auth.getUser();
      const user = userResp.user;
      const { data, error } = await supabase.storage.from("files").createSignedUrl(file.file_url, 60);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
      if (user) {
        await supabase.from("downloads").insert({ file_id: file.id, user_id: user.id });
      }
    } catch (e) {
      // noop
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando arquivos...</div>
      </div>
    );
  }

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
          <Button onClick={() => setOpenUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Arquivo
          </Button>
          <Button variant="outline" onClick={() => setOpenCategory(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Arquivos</CardTitle>
          <CardDescription>
            Total de {filteredFiles.length} arquivos disponíveis
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
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Enviado por</TableHead>
                <TableHead>Data Upload</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{file.title}</div>
                      {file.description && (
                        <div className="text-sm text-muted-foreground">
                          {file.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getFileExtension(file.title)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(file.file_size)}</TableCell>
                  <TableCell>
                    <span className="font-medium">
                      0
                    </span>
                  </TableCell>
                  <TableCell>
                    Usuário
                  </TableCell>
                  <TableCell>
                    {format(new Date(file.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleShowDownloads(file.id, file.title)}
                      >
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDirectDownload(file)}>
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteFile(file.id, file.title)}
                        disabled={deleteFile.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum arquivo encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DownloadDetailsModal
        isOpen={!!selectedFileId}
        onClose={() => {
          setSelectedFileId(null);
          setSelectedFileName("");
        }}
        fileId={selectedFileId || ""}
        fileName={selectedFileName}
      />

      <UploadFileDialog open={openUpload} onOpenChange={setOpenUpload} />
      <CreateCategoryDialog open={openCategory} onOpenChange={setOpenCategory} />
    </div>
  );
};

export default Files;