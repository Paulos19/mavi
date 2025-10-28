// components/UpdateTicketStatus.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface UpdateTicketStatusProps {
  ticketId: string;
  currentStatus: TicketStatus;
}

const statusOptions = Object.values(TicketStatus); // Pega todos os valores do Enum

export function UpdateTicketStatus({ ticketId, currentStatus }: UpdateTicketStatusProps) {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) return; // Não faz nada se o status não mudou

    setIsLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar status');
      }

      toast.success("Status atualizado com sucesso!"); // Feedback de sucesso
      // Atualiza os dados da página atual sem recarregar tudo
      router.refresh();

    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status. Tente novamente."); // Feedback de erro
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
       <Select
         value={selectedStatus}
         onValueChange={(value) => setSelectedStatus(value as TicketStatus)}
         disabled={isLoading}
        >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Mudar status..." />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleUpdateStatus}
        disabled={isLoading || selectedStatus === currentStatus}
        size="sm"
      >
        {isLoading ? 'Salvando...' : 'Salvar Status'}
      </Button>
    </div>
  );
}