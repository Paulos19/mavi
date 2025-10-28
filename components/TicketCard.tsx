// components/TicketCard.tsx
"use client"; // Necessário para Framer Motion e useRouter

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
import Image from 'next/image'; // Importado, mas comentado no exemplo com <img>
import { useRouter } from 'next/navigation';
import { SupportTicket } from "@/lib/types";

interface TicketCardProps {
  ticket: SupportTicket;
}

// Helper para formatar o link do WhatsApp
function formatWhatsAppLink(jid: string | null | undefined): string {
  if (!jid) return '#';
  const number = jid.split('@')[0];
  return `https://wa.me/${number.replace(/\D/g, '')}`;
}

// Helper para obter a cor do Badge com base no Status
function getStatusVariant(status: SupportTicket['status']): "default" | "destructive" | "secondary" | "outline" {
    switch (status) {
        case 'PENDENTE': return 'default';
        case 'EM_ANALISE': return 'secondary';
        case 'AGUARDANDO_CLIENTE': return 'outline';
        case 'CONCLUIDO': return 'destructive';
        default: return 'default';
    }
}

// Helper para obter a cor do Badge com base no Tipo de Problema
function getFlowVariant(flow: SupportTicket['tipo_problema']): "default" | "destructive" | "secondary" | "outline" {
    switch (flow) {
        case 'ADAPTACAO': return 'default';
        case 'QUEBROU_MAREOU': return 'destructive';
        case 'NAO_BUSCOU': return 'secondary';
        case 'ENVIO_LABORATORIO': return 'outline';
        default: return 'default';
    }
}

export function TicketCard({ ticket }: TicketCardProps) {
  const router = useRouter();

  const imageUrls = [
    ticket.comprovante_entrega,
    ticket.receita_atual,
    ticket.receita_antiga,
    ticket.foto_com_oculos,
    ticket.comprovante_pagamento,
  ].filter(url => url);

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Impede que o clique no botão acione a navegação do Link externo
    e.stopPropagation();
    // 2. Abre o link do WhatsApp em uma nova aba programaticamente
    const url = formatWhatsAppLink(ticket.whatsapp_number);
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {/* O Link envolve todo o Card */}
      <Link href={`/dashboard/tickets/${ticket.id}`} className="block h-full">
         <Card className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer">
           <CardHeader>
             <CardTitle>{ticket.nome_cliente || 'Nome não informado'}</CardTitle>
             <CardDescription>{ticket.whatsapp_number}</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow space-y-2">
             <div className="space-x-2">
                <Badge variant={getFlowVariant(ticket.tipo_problema)}>{ticket.tipo_problema}</Badge>
                <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
             </div>
             <p className="text-sm text-muted-foreground">
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
             {/* Botão corrigido: onClick agora usa window.open */}
             <Button
               size="sm"
               className='w-full'
               variant="outline"
               onClick={handleWhatsAppClick} // Usa a função handler
             >
               Contactar WhatsApp
             </Button>
           </CardFooter>
         </Card>
      </Link>
    </motion.div>
  );
}