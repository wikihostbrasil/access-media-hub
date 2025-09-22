import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Save, Shield, Bell, Database, Mail } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações globais da aplicação
          </p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
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
              <Input id="app-name" defaultValue="Gerenciador de Downloads" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="app-description">Descrição</Label>
              <Textarea 
                id="app-description" 
                defaultValue="Sistema para gerenciamento e controle de downloads de arquivos"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max-file-size">Tamanho Máximo de Arquivo (MB)</Label>
              <Input id="max-file-size" type="number" defaultValue="100" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Cadastro Público</Label>
                <p className="text-sm text-muted-foreground">
                  Usuários podem se cadastrar sem convite
                </p>
              </div>
              <Switch defaultChecked />
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
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Log de Atividades</Label>
                <p className="text-sm text-muted-foreground">
                  Registrar todas as ações dos usuários
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aprovar Downloads Manualmente</Label>
                <p className="text-sm text-muted-foreground">
                  Administrador deve aprovar cada download
                </p>
              </div>
              <Switch />
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
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatório Semanal</Label>
                <p className="text-sm text-muted-foreground">
                  Relatório automático de downloads
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Segurança</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre tentativas suspeitas
                </p>
              </div>
              <Switch defaultChecked />
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
              <Input id="smtp-host" placeholder="smtp.gmail.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="smtp-port">Porta</Label>
                <Input id="smtp-port" type="number" defaultValue="587" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="smtp-encryption">Criptografia</Label>
                <Input id="smtp-encryption" defaultValue="TLS" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="smtp-user">Usuário</Label>
              <Input id="smtp-user" type="email" placeholder="seu-email@empresa.com" />
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