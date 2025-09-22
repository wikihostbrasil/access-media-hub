import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/hooks/useUsers";
import { useGroups } from "@/hooks/useGroups";
import { useCategories } from "@/hooks/useCategories";

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
  
  const { data: users } = useUsers();
  const { data: groups } = useGroups();
  const { data: categories } = useCategories();

  const reset = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setSelectedUsers([]);
    setSelectedGroups([]);
    setSelectedCategories([]);
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

          <div className="grid gap-2">
            <Label>Usuários com Acesso</Label>
            <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.user_id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers([...selectedUsers, user.user_id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.user_id));
                      }
                    }}
                  />
                  <Label htmlFor={`user-${user.id}`} className="text-sm">{user.full_name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Grupos com Acesso</Label>
            <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
              {groups?.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedGroups([...selectedGroups, group.id]);
                      } else {
                        setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                      }
                    }}
                  />
                  <Label htmlFor={`group-${group.id}`} className="text-sm">{group.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Categorias com Acesso</Label>
            <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, category.id]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                      }
                    }}
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm">{category.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={loading}>{loading ? "Enviando..." : "Enviar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};