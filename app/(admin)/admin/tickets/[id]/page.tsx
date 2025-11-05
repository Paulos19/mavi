// app/(admin)/admin/tickets/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Importar Label
import Link from 'next/link';
import { UpdateTicketStatus } from '@/components/UpdateTicketStatus';
import { Metadata } from 'next';
import { SupportTicket } from '@/lib/types';
import { auth } from '@/auth'; // Importar auth
import { FlowType, TicketStatus } from '@prisma/client';
import { User } from 'lucide-react'; // Importar ícone

// Importar o componente de atribuição
import { AssignToAssistant } from '@/components/AssignToAssistant';

// Tipo estendido para incluir o assistente
type TicketWithAssignee = SupportTicket & {
  assignedTo: { name: string } | null;
};

// Função de busca de dados do ADMIN (sem restrições de ID)
async function getTicketById(id: string): Promise<TicketWithAssignee | null> {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { name: true } // Inclui o nome do assistente atribuído
        }
      }
    });

     if (!ticket) return null;

     // Assegura que o tipo de retorno corresponde à nossa interface estendida
     return {
        ...(ticket as any), // O tipo do Prisma já corresponde
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        data_entrega: ticket.data_entrega,
     };

  } catch (error) {
    console.error("Erro ao buscar ticket por ID (Admin):", error);
    return null;
  }
}

// Para metadados dinâmicos
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const ticket = await getTicketById(params.id);
  return {
    title: ticket ? `Ticket ${ticket.nome_cliente || params.id} (Admin)` : 'Ticket Não Encontrado',
  };
}

// --- Helpers (Copie-os do seu ficheiro original do dashboard) ---

function formatWhatsAppLink(jid: string | null | undefined): string {
  if (!jid) return '#';
  const number = jid.split('@')[0];
  return `https://wa.me/${number.replace(/\D/g, '')}`;
}

function getStatusVariant(status: TicketStatus): "default" | "destructive" | "secondary" | "outline" {
     switch (status) {
        case 'PENDENTE': return 'default';
        case 'EM_ANALISE': return 'secondary';
        case 'AGUARDANDO_CLIENTE': return 'outline';
        case 'AGUARDANDO_ENVIO': return 'outline';
        case 'CONCLUIDO': return 'destructive';
        default: return 'default';
    }
}

function getFlowVariant(flow: FlowType): "default" | "destructive" | "secondary" | "outline" {
     switch (flow) {
        case 'ADAPTACAO': return 'default';
        case 'QUEBROU_MAREOU': return 'destructive';
        case 'NAO_BUSCOU': return 'secondary';
        case 'ENVIO_LABORATORIO': return 'outline';
        default: return 'default';
    }
}
// --- Fim dos Helpers ---


export default async function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  // Verificação de segurança (embora o middleware já trate)
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const ticket = await getTicketById(params.id);

  if (!ticket) {
    notFound(); // Exibe página 404
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
         <h1 className="text-3xl font-bold">Detalhes da Solicitação (Admin)</h1>
          <Button asChild variant="outline">
            <Link href="/admin/tickets">Voltar para Lista</Link>
          </Button>
       </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
             <div>
                <CardTitle>{ticket.nome_cliente || 'Nome não informado'}</CardTitle>
                <CardDescription className="mt-1">{ticket.whatsapp_number}</CardDescription>
                
                {/* INFORMAÇÃO DE ATRIBUIÇÃO */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-2">
                  <User className="h-4 w-4" />
                  <span>{ticket.assignedTo?.name || "Não atribuído"}</span>
                </div>
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
                     <img
                        src={image.url!}
                        alt={image.label}
                        className="w-full h-32 object-cover"
                    />
                    <p className="text-xs text-center p-1 bg-muted truncate">{image.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
         <CardFooter className="flex flex-col gap-4 border-t pt-6">
            {/* 1. Componente de Atribuição */}
            <div className="w-full space-y-2">
              <Label htmlFor="assign-select">Atribuir Assistente</Label>
              <AssignToAssistant
                itemId={ticket.id}
                itemType="ticket"
                currentAssignedToId={ticket.assignedToId ?? null}
              />
            </div>
            
            {/* 2. Componente de Status */}
             <div className="w-full space-y-2">
                <Label htmlFor="status-select">Mudar Status</Label>
                <UpdateTicketStatus ticketId={ticket.id} currentStatus={ticket.status} />
             </div>
            
            {/* 3. Botão de Contato */}
           <Button asChild size="sm" variant="secondary" className="w-full">
             <Link href={formatWhatsAppLink(ticket.whatsapp_number)} target="_blank" rel="noopener noreferrer">
               Contactar via WhatsApp
             </Link>
           </Button>
         </CardFooter>
      </Card>
    </div>
  );
}