// app/(admin)/admin/tickets/page.tsx
import { TicketCard } from '@/components/TicketCard'; // Reutilizamos o TicketCard
import { SupportTicket } from '@/lib/types';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Todos os Tickets - Ma.Vi Admin',
};

// A função getTickets agora busca da API que filtra por role
async function getTickets(): Promise<SupportTicket[]> {
  try {
     // Esta URL precisa ser a URL absoluta interna ou externa correta
     const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
      
    // Usamos 'fetch' com 'auth' (via cookie forwarding)
    // Mas para Server Components, é mais seguro chamar o Prisma direto
    // Vamos refatorar para chamar o Prisma
    
    // REFAZENDO: Chamada direta ao Prisma (mais seguro e eficiente)
    const { prisma } = await import('@/lib/prisma');
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: {
          select: { name: true, id: true }
        }
      }
    });

     return tickets.map((ticket: any) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        data_entrega: ticket.data_entrega ? new Date(ticket.data_entrega) : null,
      }));
  } catch (error) {
    console.error("Erro na requisição getTickets (Admin):", error);
    return [];
  }
}

export default async function AdminTicketsListPage() {
  // Garantia de que só o Admin está aqui (embora o middleware já faça isso)
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard'); 

  const tickets = await getTickets();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Todas as Solicitações</h1>
       {tickets.length === 0 ? (
        <p>Nenhuma solicitação encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              isAdminView={true} // Prop para mostrar infos de Admin
            />
          ))}
        </div>
      )}
    </div>
  );
}