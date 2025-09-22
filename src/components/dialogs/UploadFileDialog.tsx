import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

  const reset = () => {
    setTitle("");
    setDescription("");
    setFile(null);
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

      const { error: insertErr } = await supabase.from("files").insert({
        title: title || file.name,
        description: description || null,
        file_url: path,
        file_type: file.type || null,
        file_size: file.size,
        uploaded_by: user.id,
      });
      if (insertErr) throw insertErr;

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
            <Input id="file-input" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do arquivo" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" />
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