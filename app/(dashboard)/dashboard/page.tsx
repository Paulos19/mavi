// app/(dashboard)/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SupportTicket } from "@/lib/types";
import { List } from 'lucide-react';
import Link from 'next/link';

// Reutiliza a função getTickets (ajustada para pegar todos os status)
async function getAllTickets(): Promise<SupportTicket[]> {
 // ... (mesma lógica de fetch de app/dashboard/page.tsx anterior,
 // mas sem filtrar por status, se aplicável)
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/tickets`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
     return data.map((ticket: any) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        data_entrega: ticket.data_entrega ? new Date(ticket.data_entrega) : null,
      }));
  } catch (error) {
    console.error("Erro ao buscar todos os tickets:", error);
    return [];
  }
}

export default async function DashboardHomePage() {
  const tickets = await getAllTickets();

  // Calcular métricas
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === 'PENDENTE').length;
  const inAnalysisTickets = tickets.filter(t => t.status === 'EM_ANALISE').length;
  const completedTickets = tickets.filter(t => t.status === 'CONCLUIDO').length;
  // Adicione outras métricas conforme necessário

  const metrics = [
    { title: 'Total de Solicitações', value: totalTickets, href: '/dashboard/tickets' },
    { title: 'Pendentes', value: pendingTickets, href: '/dashboard/tickets?status=PENDENTE' }, // Link para filtro futuro
    { title: 'Em Análise', value: inAnalysisTickets, href: '/dashboard/tickets?status=EM_ANALISE' },
    { title: 'Concluídas', value: completedTickets, href: '/dashboard/tickets?status=CONCLUIDO' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Visão Geral</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Link href={metric.href} key={index} className="hover:shadow-md transition-shadow rounded-lg">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <List className="h-4 w-4 text-muted-foreground" /> {/* Ícone genérico */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
       {/* Adicionar Gráficos ou outras visualizações aqui se desejar */}
    </div>
  );
}