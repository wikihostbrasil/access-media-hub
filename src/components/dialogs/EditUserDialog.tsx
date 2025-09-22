import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FolderOpen, UserPlus, UserMinus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  receive_notifications: boolean;
}

interface Group {
  id: string;
  name: string;
  description?: string;
}

interface GroupWithMembership extends Group {
  isMember: boolean;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    receive_notifications: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update form data when user changes
  useState(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        receive_notifications: user.receive_notifications,
      });
    }
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Group[];
    },
    enabled: open,
  });

  const { data: userGroups = [] } = useQuery({
    queryKey: ["user-groups", user?.user_id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_groups")
        .select("group_id")
        .eq("user_id", user.user_id);
      
      if (error) throw error;
      return data.map(g => g.group_id);
    },
    enabled: open && !!user,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { full_name: string; receive_notifications: boolean }) => {
      if (!user) throw new Error("Usuário não encontrado");
      
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", user.user_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Sucesso",
        description: "Dados do usuário atualizados com sucesso!",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar usuário: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addToGroupMutation = useMutation({
    mutationFn: async ({ userId, groupId }: { userId: string; groupId: string }) => {
      const { error } = await supabase
        .from("user_groups")
        .insert({ 
          user_id: userId, 
          group_id: groupId, 
          added_by: (await supabase.auth.getUser()).data.user?.id 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      toast({
        title: "Sucesso",
        description: "Usuário adicionado ao grupo com sucesso!",
      });
    },
  });

  const removeFromGroupMutation = useMutation({
    mutationFn: async ({ userId, groupId }: { userId: string; groupId: string }) => {
      const { error } = await supabase
        .from("user_groups")
        .delete()
        .eq("user_id", userId)
        .eq("group_id", groupId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      toast({
        title: "Sucesso",
        description: "Usuário removido do grupo com sucesso!",
      });
    },
  });

  const groupsWithMembership: GroupWithMembership[] = groups.map(group => ({
    ...group,
    isMember: userGroups.includes(group.id),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
  };

  const handleToggleGroup = (group: GroupWithMembership) => {
    if (!user) return;
    
    if (group.isMember) {
      removeFromGroupMutation.mutate({ userId: user.user_id, groupId: group.id });
    } else {
      addToGroupMutation.mutate({ userId: user.user_id, groupId: group.id });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuário - {user.full_name}</DialogTitle>
          <DialogDescription>
            Edite as informações e grupos do usuário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notifications"
                checked={formData.receive_notifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, receive_notifications: checked }))}
              />
              <Label htmlFor="notifications">Receber notificações</Label>
            </div>

            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Grupos do Usuário
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {groupsWithMembership.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-muted-foreground">{group.description}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {group.isMember && (
                      <Badge variant="default">Membro</Badge>
                    )}
                    <Button
                      size="sm"
                      variant={group.isMember ? "outline" : "default"}
                      onClick={() => handleToggleGroup(group)}
                      disabled={addToGroupMutation.isPending || removeFromGroupMutation.isPending}
                    >
                      {group.isMember ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remover
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Adicionar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              
              {groups.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum grupo disponível
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}