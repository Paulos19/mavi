// components/AssignToAssistant.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

interface AssignToAssistantProps {
  itemId: string; // ID do Ticket ou Notificação
  itemType: 'ticket' | 'notification'; // Para saber qual API chamar
  currentAssignedToId: string | null;
}

// Cache simples para a lista de assistentes
let assistantsCache: User[] | null = null;

export function AssignToAssistant({ itemId, itemType, currentAssignedToId }: AssignToAssistantProps) {
  const [assistants, setAssistants] = useState<User[]>(assistantsCache || []);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(currentAssignedToId || "null");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAssistants, setIsFetchingAssistants] = useState(!assistantsCache);
  const router = useRouter();

  // Busca a lista de assistentes na montagem (apenas se não estiver em cache)
  useEffect(() => {
    if (assistantsCache) return;
    
    async function fetchAssistants() {
      try {
        const res = await fetch('/api/users'); // API que você já tem
        if (!res.ok) throw new Error('Falha ao buscar assistentes');
        const data = await res.json();
        assistantsCache = data; // Salva em cache
        setAssistants(data);
      } catch (error) {
        toast.error("Erro ao carregar lista de assistentes.");
      } finally {
        setIsFetchingAssistants(false);
      }
    }
    fetchAssistants();
  }, []);

  const handleAssign = async () => {
    setIsLoading(true);
    const apiUrl = itemType === 'ticket' ? `/api/tickets/${itemId}` : `/api/notifications/${itemId}`;
    
    // Se "Ninguém" for selecionado, enviamos null
    const newAssignedToId = selectedAssistantId === "null" ? null : selectedAssistantId;

    // Não faz nada se a atribuição não mudou
    if (newAssignedToId === currentAssignedToId) {
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: newAssignedToId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao atribuir');
      }

      toast.success(`Atribuição atualizada com sucesso!`);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao atualizar atribuição.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Select
        value={selectedAssistantId}
        onValueChange={setSelectedAssistantId}
        disabled={isLoading || isFetchingAssistants}
      >
        <SelectTrigger className="w-full flex-1">
          <SelectValue placeholder="Atribuir a..." />
        </SelectTrigger>
        <SelectContent>
          {isFetchingAssistants ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
              <SelectItem value="null">Ninguém (Não atribuído)</SelectItem>
              {assistants.map((assistant) => (
                <SelectItem key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
      <Button
        onClick={handleAssign}
        disabled={isLoading || (selectedAssistantId === (currentAssignedToId || "null"))}
        size="sm"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
      </Button>
    </div>
  );
}