// app/(dashboard)/tickets/[id]/page.tsx
import { notFound } from 'next/navigation';
import {prisma} from '@/lib/prisma';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';
import { UpdateTicketStatus } from '@/components/UpdateTicketStatus'; // Componente Cliente
import { Metadata } from 'next';
import { SupportTicket } from '@/lib/types';

// Função para buscar um ticket específico por ID (Server-side)
async function getTicketById(id: string): Promise<SupportTicket | null> {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });
     if (!ticket) return null;

     // Converte datas para evitar problemas de serialização se necessário
     // (Prisma geralmente lida bem, mas é bom garantir)
     return {
        ...ticket,
        createdAt: ticket.createdAt, // Mantém como Date
        updatedAt: ticket.updatedAt, // Mantém como Date
        data_entrega: ticket.data_entrega, // Mantém como Date | null
     };

  } catch (error) {
    console.error("Erro ao buscar ticket por ID:", error);
    return null;
  }
}

// Para metadados dinâmicos (opcional)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const ticket = await getTicketById(params.id);
  return {
    title: ticket ? `Ticket ${ticket.nome_cliente || params.id}` : 'Ticket Não Encontrado',
  };
}

// Helper (pode mover para utils)
function formatWhatsAppLink(jid: string | null | undefined): string {
  if (!jid) return '#';
  const number = jid.split('@')[0];
  return `https://wa.me/${number.replace(/\D/g, '')}`;
}
// Helper (pode mover para utils)
function getStatusVariant(status: SupportTicket['status']): "default" | "destructive" | "secondary" | "outline" {
    // ... (mesma lógica do TicketCard)
     switch (status) {
        case 'PENDENTE': return 'default';
        case 'EM_ANALISE': return 'secondary';
        case 'AGUARDANDO_CLIENTE': return 'outline';
        case 'CONCLUIDO': return 'destructive';
        default: return 'default';
    }
}
// Helper (pode mover para utils)
function getFlowVariant(flow: SupportTicket['tipo_problema']): "default" | "destructive" | "secondary" | "outline" {
   // ... (mesma lógica do TicketCard)
     switch (flow) {
        case 'ADAPTACAO': return 'default';
        case 'QUEBROU_MAREOU': return 'destructive';
        case 'NAO_BUSCOU': return 'secondary';
        case 'ENVIO_LABORATORIO': return 'outline';
        default: return 'default';
    }
}


export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await getTicketById(params.id);

  if (!ticket) {
    notFound(); // Exibe página 404 se o ticket não for encontrado
  }

  const imageUrls = [
    { label: 'Comp. Entrega', url: ticket.comprovante_entrega },
    { label: 'Receita Atual', url: ticket.receita_atual },
    { label: 'Receita Antiga', url: ticket.receita_antiga },
    { label: 'Foto c/ Óculos', url: ticket.foto_com_oculos },
    { label: 'Comp. Pagamento', url: ticket.comprovante_pagamento },
  ].filter(img => img.url);

  return (
    <div className="container mx-auto py-8">
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold">Detalhes da Solicitação</h1>
          <Button asChild variant="outline">
            <Link href="/dashboard/tickets">Voltar para Lista</Link>
          </Button>
       </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
             <div>
                <CardTitle>{ticket.nome_cliente || 'Nome não informado'}</CardTitle>
                <CardDescription className="mt-1">{ticket.whatsapp_number}</CardDescription>
             </div>
             <div className="text-right">
                 <Badge variant={getFlowVariant(ticket.tipo_problema)} className="mb-1">{ticket.tipo_problema}</Badge>
                 <br />
                 <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
             </div>
           </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <p className="text-sm text-muted-foreground">
            Criado em: {ticket.createdAt.toLocaleString('pt-BR')} | Atualizado em: {ticket.updatedAt.toLocaleString('pt-BR')}
          </p>
          {ticket.sintomas && <p><strong>Sintomas:</strong> {ticket.sintomas}</p>}
          {ticket.data_entrega && <p><strong>Data Entrega:</strong> {ticket.data_entrega.toLocaleDateString('pt-BR')}</p>}
          {ticket.tempo_uso && <p><strong>Tempo de Uso (dias):</strong> {ticket.tempo_uso}</p>}
          {ticket.endereco_envio && <p><strong>Endereço Envio:</strong> {ticket.endereco_envio}</p>}
          {ticket.codigo_rastreio && <p><strong>Rastreio:</strong> {ticket.codigo_rastreio}</p>}

          {/* Imagens Maiores */}
          {imageUrls.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Arquivos Enviados:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageUrls.map((image, index) => (
                  <Link href={image.url!} key={index} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Imagem maior */}
                     <img
                        src={image.url!}
                        alt={image.label}
                        className="w-full h-32 object-cover" // Ajuste altura conforme necessário
                    />
                    <p className="text-xs text-center p-1 bg-muted truncate">{image.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
         <CardFooter className="flex flex-col sm:flex-row items-center gap-4 border-t pt-4">
            {/* Componente para Atualizar Status */}
           <UpdateTicketStatus ticketId={ticket.id} currentStatus={ticket.status} />

           <Button asChild size="sm" variant="secondary" className="w-full sm:w-auto sm:ml-auto">
             <Link href={formatWhatsAppLink(ticket.whatsapp_number)} target="_blank" rel="noopener noreferrer">
               Contactar via WhatsApp
             </Link>
           </Button>
         </CardFooter>
      </Card>
    </div>
  );
}