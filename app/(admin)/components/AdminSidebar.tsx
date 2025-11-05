"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LogoutButton } from "@/components/LogoutButton";
import { SupportTicket } from '@/lib/types';
import {
  LayoutDashboard,
  List,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Bell,
  Loader2,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Estatísticas', icon: LayoutDashboard },
  { href: '/admin/tickets', label: 'Todos os Tickets', icon: List },
  { href: '/admin/notifications', label: 'Todas as Notificações', icon: Bell },
  { href: '/admin/users', label: 'Gerenciar Assistentes', icon: Users },
];

export function AdminSidebar() {
  const [isRetracted, setIsRetracted] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Estado para métricas da barra de progresso
  const [totalTickets, setTotalTickets] = useState(0);
  const [completedTickets, setCompletedTickets] = useState(0);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Buscar métricas (Admin vê TODOS os tickets)
  useEffect(() => {
    if (status === "authenticated") {
      setIsLoadingMetrics(true);
      // A API /api/tickets já retorna TODOS os tickets para o Admin
      fetch('/api/tickets')
        .then(res => res.json())
        .then((data: SupportTicket[]) => {
          if (Array.isArray(data)) {
            setTotalTickets(data.length);
            const completed = data.filter(t => t.status === 'CONCLUIDO').length;
            setCompletedTickets(completed);
          }
        })
        .catch(err => console.error("Erro ao buscar métricas da sidebar (Admin):", err))
        .finally(() => setIsLoadingMetrics(false));
    }
  }, [status]); // Executa quando o status da sessão muda

  const progressValue = totalTickets > 0 ? (completedTickets / totalTickets) * 100 : 0;
  const userName = session?.user?.name || "Administrador";
  const userEmail = session?.user?.email || "";

  return (
    <motion.aside
      initial={false}
      animate={{ width: isRetracted ? '5rem' : '16rem' }}
      transition={{ duration: 0.2 }}
      // 'h-full' corrige o layout, 'justify-between' empurra o card para baixo
      className="hidden md:flex h-full flex-col justify-between border-r bg-background"
    >
      {/* Topo da Sidebar (Navegação) */}
      <div>
        <div className="flex h-16 items-center border-b px-4 justify-between">
          <AnimatePresence>
            {!isRetracted && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.1 }}
                className="font-semibold"
              >
                Ma.Vi ADMIN
              </motion.span>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRetracted(!isRetracted)}
            className="ml-auto"
          >
            {isRetracted ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-muted text-primary",
                    isRetracted && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <AnimatePresence>
                    {!isRetracted && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.1, duration: 0.1 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Card do Utilizador (Rodapé) */}
      <div className="border-t p-3">
        {status === 'loading' || isLoadingMetrics ? (
            <div className="flex items-center justify-center p-4">
               <Loader2 className={cn("h-5 w-5 text-muted-foreground animate-spin", isRetracted && "h-6 w-6")} />
            </div>
        ) : (
          <AnimatePresence>
            {!isRetracted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.1 }}
                className="space-y-3"
              >
                {/* Info do Utilizador */}
                <div>
                  <div className="text-sm font-semibold truncate" title={userName}>
                    {userName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate" title={userEmail}>
                    {userEmail}
                  </div>
                </div>

                {/* Barra de Progresso (Métricas Globais) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tickets Concluídos</span>
                    <span>{completedTickets} / {totalTickets}</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>
                
                {/* Botão de Logout */}
                <LogoutButton />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
      
    </motion.aside>
  );
}