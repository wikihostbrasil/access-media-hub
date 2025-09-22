import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserSearchSelect } from "@/components/UserSearchSelect";
import { GroupSearchSelect } from "@/components/GroupSearchSelect";
import { CategorySearchSelect } from "@/components/CategorySearchSelect";

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded?: () => void;
}

export const UploadFileDialog = ({ open, onOpenChange, onUploaded }: UploadFileDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [isPermanent, setIsPermanent] = useState(true);
  

  const reset = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setSelectedUsers([]);
    setSelectedGroups([]);
    setSelectedCategories([]);
    setStartDate("");
    setEndDate("");
    setStatus("active");
    setIsPermanent(true);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        toast({ title: "Arquivo obrigatório", description: "Selecione um arquivo para enviar", variant: "destructive" });
        return;
      }

      setLoading(true);
      const { data: userResp } = await supabase.auth.getUser();
      const user = userResp.user;
      if (!user) throw new Error("Usuário não autenticado");

      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("files")
        .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: fileData, error: insertErr } = await supabase.from("files").insert({
        title: title || file.name,
        description: description || null,
        file_url: path,
        file_type: file.type || null,
        file_size: file.size,
        start_date: startDate || null,
        end_date: endDate || null,
        status: status,
        is_permanent: isPermanent,
        uploaded_by: user.id,
      }).select().single();
      if (insertErr) throw insertErr;

      // Create file permissions for selected users, groups, and categories
      const permissions = [];
      
      for (const userId of selectedUsers) {
        permissions.push({ file_id: fileData.id, user_id: userId });
      }
      
      for (const groupId of selectedGroups) {
        permissions.push({ file_id: fileData.id, group_id: groupId });
      }
      
      for (const categoryId of selectedCategories) {
        permissions.push({ file_id: fileData.id, category_id: categoryId });
      }
      
      if (permissions.length > 0) {
        const { error: permErr } = await supabase.from("file_permissions").insert(permissions);
        if (permErr) throw permErr;
      }

      await queryClient.invalidateQueries({ queryKey: ["files"] });
      toast({ title: "Sucesso", description: "Arquivo enviado e cadastrado" });
      onUploaded?.();
      onOpenChange(false);
      reset();
    } catch (e: any) {
      toast({ title: "Falha no upload", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar arquivo</DialogTitle>
          <DialogDescription>Selecione um arquivo e preencha as informações</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="file-input">Arquivo</Label>
            <Input id="file-input" type="file" onChange={(e) => { const f = e.target.files?.[0] || null; setFile(f); if (f) setTitle(f.name); }} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do arquivo" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" />
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="permanent">Arquivo Permanente</Label>
              <Switch
                id="permanent"
                checked={isPermanent}
                onCheckedChange={setIsPermanent}
              />
            </div>
            
            {!isPermanent && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">Data de Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <UserSearchSelect 
            selectedUsers={selectedUsers} 
            onSelectionChange={setSelectedUsers}
          />

          <GroupSearchSelect 
            selectedGroups={selectedGroups} 
            onSelectionChange={setSelectedGroups}
          />

          <CategorySearchSelect 
            selectedCategories={selectedCategories} 
            onSelectionChange={setSelectedCategories}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={loading}>{loading ? "Enviando..." : "Enviar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};