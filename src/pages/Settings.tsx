import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Save, Shield, Bell, Database, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings, useSaveSettings } from "@/hooks/useSettings";

const Settings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettings();
  const saveSettings = useSaveSettings();

  const [form, setForm] = useState({
    app_name: "Gerenciador de Downloads",
    app_description: "Sistema para gerenciamento e controle de downloads de arquivos",
    max_file_size_mb: 100,
    public_registration: true,
    two_factor: true,
    activity_log: true,
    session_timeout_min: 60,
    manual_download_approval: false,
    notify_new_uploads: true,
    weekly_report: true,
    security_alerts: true,
    smtp: {
      host: "",
      port: 587,
      encryption: "TLS",
      user: "",
    },
  });

  // Load existing settings into form
  useEffect(() => {
    if (settings?.data) {
      setForm({ ...form, ...settings.data, smtp: { ...form.smtp, ...(settings.data.smtp || {}) } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.id]);

  const handleSave = async () => {
    saveSettings.mutate({ id: settings?.id, data: form });
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações globais da aplicação
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Configurações básicas da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="app-name">Nome da Aplicação</Label>
              <Input id="app-name" value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="app-description">Descrição</Label>
               <Textarea 
                id="app-description" 
                value={form.app_description}
                onChange={(e) => setForm({ ...form, app_description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max-file-size">Tamanho Máximo de Arquivo (MB)</Label>
              <Input id="max-file-size" type="number" value={form.max_file_size_mb} onChange={(e) => setForm({ ...form, max_file_size_mb: Number(e.target.value) })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Cadastro Público</Label>
                <p className="text-sm text-muted-foreground">
                  Usuários podem se cadastrar sem convite
                </p>
              </div>
               <Switch checked={form.public_registration} onCheckedChange={(v) => setForm({ ...form, public_registration: v })} />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança e acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de Dois Fatores</Label>
                <p className="text-sm text-muted-foreground">
                  Obrigatória para administradores
                </p>
              </div>
               <Switch checked={form.two_factor} onCheckedChange={(v) => setForm({ ...form, two_factor: v })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Log de Atividades</Label>
                <p className="text-sm text-muted-foreground">
                  Registrar todas as ações dos usuários
                </p>
              </div>
               <Switch checked={form.activity_log} onCheckedChange={(v) => setForm({ ...form, activity_log: v })} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
              <Input id="session-timeout" type="number" value={form.session_timeout_min} onChange={(e) => setForm({ ...form, session_timeout_min: Number(e.target.value) })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aprovar Downloads Manualmente</Label>
                <p className="text-sm text-muted-foreground">
                  Administrador deve aprovar cada download
                </p>
              </div>
              <Switch checked={form.manual_download_approval} onCheckedChange={(v) => setForm({ ...form, manual_download_approval: v })} />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure quando e como receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar Novos Uploads</Label>
                <p className="text-sm text-muted-foreground">
                  Email quando novos arquivos são enviados
                </p>
              </div>
               <Switch checked={form.notify_new_uploads} onCheckedChange={(v) => setForm({ ...form, notify_new_uploads: v })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatório Semanal</Label>
                <p className="text-sm text-muted-foreground">
                  Relatório automático de downloads
                </p>
              </div>
               <Switch checked={form.weekly_report} onCheckedChange={(v) => setForm({ ...form, weekly_report: v })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Segurança</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre tentativas suspeitas
                </p>
              </div>
              <Switch checked={form.security_alerts} onCheckedChange={(v) => setForm({ ...form, security_alerts: v })} />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configurações de Email
            </CardTitle>
            <CardDescription>
              Configure o servidor SMTP para envio de emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="smtp-host">Servidor SMTP</Label>
              <Input id="smtp-host" placeholder="smtp.gmail.com" value={form.smtp.host || ""} onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, host: e.target.value } })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="smtp-port">Porta</Label>
                <Input id="smtp-port" type="number" value={form.smtp.port || 587} onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, port: Number(e.target.value) } })} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="smtp-encryption">Criptografia</Label>
                <Input id="smtp-encryption" value={form.smtp.encryption || "TLS"} onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, encryption: e.target.value } })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="smtp-user">Usuário</Label>
              <Input id="smtp-user" type="email" placeholder="seu-email@empresa.com" value={form.smtp.user || ""} onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, user: e.target.value } })} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="smtp-password">Senha</Label>
              <Input id="smtp-password" type="password" />
            </div>

            <Button variant="outline" className="w-full">
              Testar Conexão
            </Button>
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Informações sobre o estado atual do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <span>Banco de Dados</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Servidor de Arquivos</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Serviço de Email</span>
                <Badge className="bg-yellow-100 text-yellow-800">Configurar</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Backup Automático</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Espaço em Disco</span>
                <span>45% usado (2.1 GB de 4.7 GB)</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Versão do Sistema</span>
                <span>v1.2.0</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Último Backup</span>
                <span>Hoje às 03:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;