import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
}

interface User {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
}

interface GroupMember extends User {
  isMember: boolean;
}

interface ManageGroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

export function ManageGroupMembersDialog({ open, onOpenChange, group }: ManageGroupMembersDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      
      if (error) throw error;
      return data as User[];
    },
    enabled: open,
  });

  const { data: groupMembers = [] } = useQuery({
    queryKey: ["group-members", group?.id],
    queryFn: async () => {
      if (!group) return [];
      const { data, error } = await supabase
        .from("user_groups")
        .select("user_id")
        .eq("group_id", group.id);
      
      if (error) throw error;
      return data.map(m => m.user_id);
    },
    enabled: open && !!group,
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ userId, groupId }: { userId: string; groupId: string }) => {
      const { error } = await supabase
        .from("user_groups")
        .insert({ user_id: userId, group_id: groupId, added_by: (await supabase.auth.getUser()).data.user?.id });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Sucesso",
        description: "Usuário adicionado ao grupo com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao adicionar usuário: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async ({ userId, groupId }: { userId: string; groupId: string }) => {
      const { error } = await supabase
        .from("user_groups")
        .delete()
        .eq("user_id", userId)
        .eq("group_id", groupId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Sucesso",
        description: "Usuário removido do grupo com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao remover usuário: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const usersWithMembership: GroupMember[] = users.map(user => ({
    ...user,
    isMember: groupMembers.includes(user.user_id),
  }));

  const filteredUsers = usersWithMembership.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleMembership = (user: GroupMember) => {
    if (!group) return;
    
    if (user.isMember) {
      removeMemberMutation.mutate({ userId: user.user_id, groupId: group.id });
    } else {
      addMemberMutation.mutate({ userId: user.user_id, groupId: group.id });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros - {group?.name}</DialogTitle>
          <DialogDescription>
            Adicione ou remova usuários deste grupo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.full_name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.role === "admin" ? "Administrador" : user.role === "operator" ? "Operador" : "Usuário"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {user.isMember && (
                    <Badge variant="default">Membro</Badge>
                  )}
                  <Button
                    size="sm"
                    variant={user.isMember ? "outline" : "default"}
                    onClick={() => handleToggleMembership(user)}
                    disabled={addMemberMutation.isPending || removeMemberMutation.isPending}
                  >
                    {user.isMember ? (
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
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}