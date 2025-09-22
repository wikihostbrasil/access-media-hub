import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: { 
    id: string; 
    title: string; 
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status?: string | null;
    is_permanent?: boolean | null;
  } | null;
}

export const EditFileDialog = ({ open, onOpenChange, file }: EditFileDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [isPermanent, setIsPermanent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (file) {
      setTitle(file.title || "");
      setDescription(file.description || "");
      setStartDate(file.start_date ? new Date(file.start_date).toISOString().split('T')[0] : "");
      setEndDate(file.end_date ? new Date(file.end_date).toISOString().split('T')[0] : "");
      setStatus(file.status || "active");
      setIsPermanent(file.is_permanent || false);
    }
  }, [file]);

  const handleSave = async () => {
    if (!file) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("files")
        .update({ 
          title, 
          description: description || null,
          start_date: startDate || null,
          end_date: endDate || null,
          status,
          is_permanent: isPermanent
        })
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
          <DialogDescription>Atualize as informações do arquivo</DialogDescription>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input 
                id="start_date" 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">Data de Fim</Label>
              <Input 
                id="end_date" 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Arquivo Permanente</Label>
              <p className="text-sm text-muted-foreground">
                Arquivos permanentes ficam sempre disponíveis
              </p>
            </div>
            <Switch
              checked={isPermanent}
              onCheckedChange={setIsPermanent}
            />
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