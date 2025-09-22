import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteUserDialog = ({ open, onOpenChange }: InviteUserDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendInvite = async () => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      toast({ title: "Convite enviado", description: "O usuário receberá um email com o link de acesso" });
      setEmail("");
      setFullName("");
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Falha ao enviar convite", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/auth`;
    await navigator.clipboard.writeText(link);
    toast({ title: "Link copiado", description: "Envie o link de cadastro para o usuário" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar usuário</DialogTitle>
          <DialogDescription>Envie um convite por email ou compartilhe o link de cadastro</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="iname">Nome</Label>
            <Input id="iname" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="iemail">Email</Label>
            <Input id="iemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" />
          </div>
          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={handleCopyLink}>Copiar link de cadastro</Button>
            <Button type="button" onClick={handleSendInvite} disabled={!email || loading}>{loading ? "Enviando..." : "Enviar convite"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};