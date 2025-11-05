// components/TicketCard.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SupportTicket } from "@/lib/types";
import { FlowType, TicketStatus } from "@prisma/client"; // Importar Enums
import { User } from "lucide-react"; // Importar ícone

interface TicketCardProps {
  ticket: SupportTicket;
  isAdminView?: boolean; // Nova prop para diferenciar a view
}

// Helper para formatar o link do WhatsApp
function formatWhatsAppLink(jid: string | null | undefined): string {
  if (!jid) return '#';
  const number = jid.split('@')[0];
  return `https://wa.me/${number.replace(/\D/g, '')}`;
}

// Helper para obter a cor do Badge com base no Status
function getStatusVariant(status: TicketStatus): "default" | "destructive" | "secondary" | "outline" {
    switch (status) {
        case 'PENDENTE': return 'default';
        case 'EM_ANALISE': return 'secondary';
        case 'AGUARDANDO_CLIENTE': return 'outline';
        case 'AGUARDANDO_ENVIO': return 'outline';
        case 'CONCLUIDO': return 'destructive'; // Assumindo que Concluído é "final"
        default: return 'default';
    }
}

// Helper para obter a cor do Badge com base no Tipo de Problema
function getFlowVariant(flow: FlowType): "default" | "destructive" | "secondary" | "outline" {
    switch (flow) {
        case 'ADAPTACAO': return 'default';
        case 'QUEBROU_MAREOU': 'destructive';
        case 'NAO_BUSCOU': return 'secondary';
        case 'ENVIO_LABORATORIO': return 'outline';
        default: return 'default';
    }
}

export function TicketCard({ ticket, isAdminView = false }: TicketCardProps) {
  const router = useRouter();

  const imageUrls = [
    ticket.comprovante_entrega,
    ticket.receita_atual,
    ticket.receita_antiga,
    ticket.foto_com_oculos,
    ticket.comprovante_pagamento,
  ].filter(url => url);

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const url = formatWhatsAppLink(ticket.whatsapp_number);
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Define o link de destino com base na view
  const detailPageUrl = isAdminView 
    ? `/admin/tickets/${ticket.id}` 
    : `/dashboard/tickets/${ticket.id}`;
    
  const assignedToName = ticket.assignedTo?.name || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link href={detailPageUrl} className="block h-full">
         <Card className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer">
           <CardHeader>
             <CardTitle>{ticket.nome_cliente || 'Nome não informado'}</CardTitle>
             <CardDescription>{ticket.whatsapp_number}</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow space-y-2">
             <div className="flex flex-wrap gap-2">
                <Badge variant={getFlowVariant(ticket.tipo_problema)}>{ticket.tipo_problema}</Badge>
                <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
             </div>
             
             {/* Exibe o assistente atribuído APENAS na visão do Admin */}
             {isAdminView && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <User className="h-3 w-3" />
                  <span>{assignedToName || "Não atribuído"}</span>
                </div>
             )}

             <p className="text-sm text-muted-foreground pt-1">
               Criado em: {ticket.createdAt.toLocaleDateString('pt-BR')}
             </p>
             {ticket.sintomas && <p className="text-sm truncate"><strong>Sintomas:</strong> {ticket.sintomas}</p>}
             {ticket.data_entrega && <p className="text-sm"><strong>Data Entrega:</strong> {ticket.data_entrega.toLocaleDateString('pt-BR')}</p>}
             {imageUrls.length > 0 && (
               <div className="mt-2">
                 <p className="text-xs font-medium text-muted-foreground">({imageUrls.length} arquivos enviados)</p>
               </div>
             )}
           </CardContent>
           <CardFooter>
             <Button
               size="sm"
               className='w-full'
               variant="outline"
               onClick={handleWhatsAppClick}
             >
               Contactar WhatsApp
             </Button>
           </CardFooter>
         </Card>
      </Link>
    </motion.div>
  );
}