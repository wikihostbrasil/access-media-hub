import { useState } from "react";
import { Files, Users, FolderOpen, Settings, Download, BarChart3 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface Profile {
  role: 'admin' | 'operator' | 'user';
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      return data as Profile;
    },
    enabled: !!user,
  });

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground";

  const userRole = profile?.role || 'user';

  const menuItems = [
    { title: "Arquivos", url: "/files", icon: Files, roles: ['admin', 'operator', 'user'] },
    { title: "Usuários", url: "/users", icon: Users, roles: ['admin', 'operator'] },
    { title: "Grupos", url: "/groups", icon: FolderOpen, roles: ['admin', 'operator'] },
    { title: "Categorias", url: "/categories", icon: FolderOpen, roles: ['admin', 'operator'] },
    { title: "Downloads", url: "/downloads", icon: Download, roles: ['admin'] },
    { title: "Relatórios", url: "/reports", icon: BarChart3, roles: ['admin'] },
    { title: "Configurações", url: "/settings", icon: Settings, roles: ['admin', 'operator', 'user'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}