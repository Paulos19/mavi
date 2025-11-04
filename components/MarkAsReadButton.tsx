// paulos19/mavi/mavi-c44b472b3401cb9f5308079afa00599ae6792457/components/MarkAsReadButton.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"; // Assumindo que você tenha o Sonner configurado

interface MarkAsReadButtonProps {
  notificationId: string;
  isRead: boolean;
}

export function MarkAsReadButton({ notificationId, isRead }: MarkAsReadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleRead = async () => {
    setIsLoading(true);
    try {
      const newStatus = !isRead;
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar notificação');
      }
      
      toast.success(`Notificação marcada como ${newStatus ? "lida" : "não lida"}.`);
      router.refresh(); // Atualiza os Server Components na página

    } catch (error) {
      console.error("Erro ao atualizar notificação:", error);
      toast.error("Erro ao atualizar notificação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={isRead ? "secondary" : "default"}
      onClick={handleToggleRead}
      disabled={isLoading}
    >
      {isLoading ? "Salvando..." : (isRead ? "Marcar como Não Lida" : "Marcar como Lida")}
    </Button>
  );
}