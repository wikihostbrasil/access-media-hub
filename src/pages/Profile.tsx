import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Bell, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  receive_notifications: boolean;
  whatsapp?: string;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    full_name: "",
    whatsapp: "",
    receive_notifications: true,
  });
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        whatsapp: profile.whatsapp || "",
        receive_notifications: profile.receive_notifications,
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar perfil: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateProfileMutation.mutateAsync(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize seus dados pessoais e de contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                O email não pode ser alterado através do perfil
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Receber Notificações
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre novos arquivos e atualizações
                  </p>
                </div>
                <Switch
                  checked={formData.receive_notifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, receive_notifications: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              
              <Button type="button" variant="outline" onClick={handleSignOut}>
                Sair
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conta criada em:</span>
              <span>{new Date(profile.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última atualização:</span>
              <span>{new Date(profile.updated_at).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID do usuário:</span>
              <span className="font-mono text-sm">{profile.user_id.slice(0, 8)}...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}