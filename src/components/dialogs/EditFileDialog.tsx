import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: { id: string; title: string; description?: string | null } | null;
}

export const EditFileDialog = ({ open, onOpenChange, file }: EditFileDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (file) {
      setTitle(file.title || "");
      setDescription(file.description || "");
    }
  }, [file]);

  const handleSave = async () => {
    if (!file) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("files")
        .update({ title, description: description || null })
        .eq("id", file.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["files"] });
      toast({ title: "Arquivo atualizado", description: "As alterações foram salvas" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Arquivo</DialogTitle>
          <DialogDescription>Atualize o título e a descrição</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="ftitle">Título</Label>
            <Input id="ftitle" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fdesc">Descrição</Label>
            <Textarea id="fdesc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};