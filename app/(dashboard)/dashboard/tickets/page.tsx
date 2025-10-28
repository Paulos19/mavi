// app/(dashboard)/tickets/page.tsx
import { TicketCard } from '@/components/TicketCard';
import { SupportTicket } from '@/lib/types';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solicitações - Ma.Vi Dashboard',
};

// Função getTickets (a mesma que você tinha antes)
async function getTickets(): Promise<SupportTicket[]> {
  // ... (código fetch para /api/tickets)
  try {
     const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/tickets`, { cache: 'no-store' });
    if (!res.ok) {
        console.error("Erro ao buscar tickets:", res.status, await res.text());
        return [];
    }
    const data = await res.json();
     return data.map((ticket: any) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        data_entrega: ticket.data_entrega ? new Date(ticket.data_entrega) : null,
      }));
  } catch (error) {
    console.error("Erro na requisição getTickets:", error);
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