import { useState, useEffect, Fragment } from "react";
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
import { AudioPlayer } from "@/components/AudioPlayer";
import { EditFileDialog } from "@/components/dialogs/EditFileDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

const Files = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editingFile, setEditingFile] = useState<{ id: string; title: string; description?: string | null; start_date?: string | null; end_date?: string | null; status?: string | null; is_permanent?: boolean | null } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openUpload, setOpenUpload] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  
  const { data: profile } = useQuery({
    queryKey: ["profile-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
      return data as { role: "admin" | "operator" | "user" } | null;
    },
    enabled: !!user,
  });
  
  const { data: files, isLoading } = useFiles(profile?.role === 'admin');
  const deleteFile = useDeleteFile();

  // Read search from query param (q)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) setSearchTerm(q);
  }, [location.search]);

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

  // Admin-only: download counts per file
  const { data: downloadCounts } = useQuery({
    queryKey: ["download-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("downloads").select("file_id");
      if (error) throw error;
      const map: Record<string, number> = {};
      data.forEach((d: any) => { map[d.file_id] = (map[d.file_id] || 0) + 1; });
      return map;
    },
    enabled: profile?.role === 'admin',
  });

  const isAudioFile = (filename: string, mimeType?: string) => {
    const audioExtensions = ['MP3', 'WAV', 'OGG', 'AAC', 'M4A', 'FLAC'];
    const extension = filename.split('.').pop()?.toUpperCase();
    return audioExtensions.includes(extension || '') || mimeType?.startsWith('audio/');
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
        {profile?.role !== 'user' && (
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
        )}
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
                {profile?.role === 'admin' && <TableHead>Downloads</TableHead>}
                <TableHead>Enviado por</TableHead>
                {profile?.role === 'admin' && <TableHead>Data Upload</TableHead>}
                <TableHead>Datas Vigência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <Fragment key={file.id}>
                  <TableRow>
                    <TableCell className="flex items-center gap-2">
                      <FileIcon className="h-4 w-4" />
                      <div className="flex-1">
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
                    {profile?.role === 'admin' && (
                      <TableCell>
                        <span className="font-medium">{downloadCounts?.[file.id] || 0}</span>
                      </TableCell>
                    )}
                    <TableCell>Usuário</TableCell>
                    {profile?.role === 'admin' && (
                      <TableCell>
                        {format(new Date(file.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="text-xs">
                        {file.start_date && (
                          <div>Início: {format(new Date(file.start_date), "dd/MM/yyyy", { locale: ptBR })}</div>
                        )}
                        {file.end_date && (
                          <div>Fim: {format(new Date(file.end_date), "dd/MM/yyyy", { locale: ptBR })}</div>
                        )}
                        {file.is_permanent && <div className="text-green-600">Permanente</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={file.status === 'active' ? 'default' : 'secondary'}>
                          {file.status === 'active' ? 'Ativo' : file.status === 'inactive' ? 'Inativo' : 'Arquivado'}
                        </Badge>
                        {file.deleted_at && <Badge variant="destructive">Excluído</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {profile?.role === 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowDownloads(file.id, file.title)}
                          >
                            <BarChart3 className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleDirectDownload(file)}>
                          <Download className="h-3 w-3" />
                        </Button>
                        {(profile?.role !== 'user' && file.uploaded_by === user?.id) && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => { 
                              setEditingFile({ 
                                id: file.id, 
                                title: file.title, 
                                description: file.description,
                                start_date: file.start_date,
                                end_date: file.end_date,
                                status: file.status,
                                is_permanent: file.is_permanent
                              }); 
                              setOpenEdit(true); 
                            }}>
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {isAudioFile(file.title, file.file_type) && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={profile?.role === 'admin' ? 8 : 6} className="pt-0">
                        <div className="mt-2">
                          <AudioPlayer fileUrl={file.file_url} fileName={file.title} fileId={file.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              {filteredFiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={profile?.role === 'admin' ? 8 : 6} className="text-center py-8 text-muted-foreground">
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
      <EditFileDialog open={openEdit} onOpenChange={setOpenEdit} file={editingFile} />
    </div>
  );
};

export default Files;