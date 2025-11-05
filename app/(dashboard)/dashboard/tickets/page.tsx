// app/(dashboard)/dashboard/tickets/page.tsx
import { TicketCard } from '@/components/TicketCard';
import { SupportTicket } from '@/lib/types';
import { Metadata } from 'next';
import { auth } from '@/auth'; // 1. Importar o auth
import { prisma } from '@/lib/prisma'; // 2. Importar o prisma
import { Role } from '@prisma/client'; // 3. Importar o Role

export const metadata: Metadata = {
  title: 'Solicitações - Ma.Vi Dashboard',
};

// 4. Função getTickets refatorada para buscar dados diretamente
async function getTickets(): Promise<SupportTicket[]> {
  // Obtém a sessão diretamente no servidor
  const session = await auth();

  // O middleware já deve proteger esta página, mas é uma boa verificação
  if (!session?.user?.id) {
    console.error("getTickets: Tentativa de acesso não autorizada.");
    return [];
  }

  try {
    let whereCondition: any = {};

    // A lógica de filtragem da API agora vive aqui:
    // Se o utilizador NÃO for Admin, filtra pelos seus tickets atribuídos.
    if (session.user.role !== Role.ADMIN) {
      whereCondition.assignedToId = session.user.id;
    }
    // Se for Admin, whereCondition fica vazio, buscando todos os tickets.

    const tickets = await prisma.supportTicket.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        assignedTo: { // Incluímos isto para o TicketCard (caso o admin o use)
          select: { name: true, id: true }
        }
      }
    });
    
    // O mapeamento de datas continua igual
    return tickets.map((ticket: any) => ({
      ...ticket,
      createdAt: new Date(ticket.createdAt),
      updatedAt: new Date(ticket.updatedAt),
      data_entrega: ticket.data_entrega ? new Date(ticket.data_entrega) : null,
    }));

  } catch (error) {
    console.error("Erro ao buscar tickets direto do DB:", error);
    return [];
  }
}

export default async function TicketsListPage() {
  const tickets = await getTickets();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Todas as Solicitações</h1>
       {tickets.length === 0 ? (
        <p>Nenhuma solicitação encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}