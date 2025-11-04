// app/(dashboard)/components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils"; // Utilitário do Shadcn UI
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  List,
  PanelLeftClose,
  PanelLeftOpen,
  MessageCircle,
  Bell, // Ícone exemplo
} from 'lucide-react'; // Ícones

const navItems = [
  { href: '/dashboard', label: 'Estatísticas', icon: LayoutDashboard },
  { href: '/dashboard/tickets', label: 'Solicitações', icon: List },
  { href: '/dashboard/notifications', label: 'Notificações', icon: Bell }
  // Adicione mais links se necessário
];

export function Sidebar() {
  const [isRetracted, setIsRetracted] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isRetracted ? '5rem' : '16rem' }} // Larguras: 80px vs 256px
      transition={{ duration: 0.2 }}
      className="hidden md:flex flex-col border-r bg-background"
    >
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
              Ma.Vi Dashboard
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
    </motion.aside>
  );
}