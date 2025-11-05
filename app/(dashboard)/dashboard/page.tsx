// app/(dashboard)/dashboard/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { auth } from '@/auth';
import { prisma } from "@/lib/prisma";
import { Role, TicketStatus } from "@prisma/client";
import { List, Bell, ListChecks, Hourglass } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// --- CORREÇÃO AQUI ---
// O caminho relativo "../components/" estava incorreto.
// Usamos o alias "@/app/(admin)/..." para encontrar os componentes que criámos.
import { TicketTypesChart, TicketTypeData } from "@/components/TicketTypesChart";
// (Não precisamos do AssistantPerformanceChart aqui, apenas do TicketTypesChart)
// --- FIM DA CORREÇÃO ---


// 1. Função para buscar métricas dos cards (filtrada por assistente)
async function getAssistantMetrics(assistantId: string) {
  try {
    const [
      totalTickets,
      pendingTickets,
      inAnalysisTickets,
      completedTickets,
      unreadNotifications
    ] = await Promise.all([
      prisma.supportTicket.count({
        where: { assignedToId: assistantId }
      }),
      prisma.supportTicket.count({
        where: { assignedToId: assistantId, status: TicketStatus.PENDENTE }
      }),
      prisma.supportTicket.count({
        where: { assignedToId: assistantId, status: TicketStatus.EM_ANALISE }
      }),
      prisma.supportTicket.count({
        where: { assignedToId: assistantId, status: TicketStatus.CONCLUIDO }
      }),
      prisma.notification.count({
        where: { assignedToId: assistantId, isRead: false }
      })
    ]);

    return {
      totalTickets,
      pendingTickets,
      inAnalysisTickets,
      completedTickets,
      unreadNotifications,
      error: null,
    };

  } catch (error) {
    console.error("Erro ao buscar métricas do Assistente:", error);
    return {
      totalTickets: 0,
      pendingTickets: 0,
      inAnalysisTickets: 0,
      completedTickets: 0,
      unreadNotifications: 0,
      error: "Não foi possível carregar as métricas.",
    };
  }
}

// 2. Função para buscar tipos de tickets (filtrada por assistente)
async function getAssistantTicketTypes(assistantId: string, totalTickets: number): Promise<TicketTypeData[]> {
  if (totalTickets === 0) return [];
  try {
    const typeCounts = await prisma.supportTicket.groupBy({
      by: ['tipo_problema'],
      where: { assignedToId: assistantId },
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' }
      }
    });

    return typeCounts.map(t => ({
      name: t.tipo_problema,
      count: t._count.id,
      percentage: (t._count.id / totalTickets) * 100
    }));
  } catch (error) {
    console.error("Erro ao buscar tipos de tickets do Assistente:", error);
    return [];
  }
}

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  
  const assistantId = session.user.id;
  const metrics = await getAssistantMetrics(assistantId);
  const ticketTypeData = await getAssistantTicketTypes(assistantId, metrics.totalTickets);

  const metricCards = [
    { 
      title: 'Minhas Solicitações Totais', 
      value: metrics.totalTickets, 
      icon: List, 
      href: '/dashboard/tickets' 
    },
    { 
      title: 'Pendentes (Minhas)', 
      value: metrics.pendingTickets, 
      icon: Hourglass, 
      href: '/dashboard/tickets' 
    },
    { 
      title: 'Minhas Notificações', 
      value: metrics.unreadNotifications, 
      icon: Bell, 
      href: '/dashboard/notifications' 
    },
    { 
      title: 'Em Análise (Minhas)', 
      value: metrics.inAnalysisTickets, 
      icon: ListChecks, 
      href: '/dashboard/tickets'
    },
    { 
      title: 'Concluídas (Minhas)', 
      value: metrics.completedTickets, 
      icon: ListChecks, 
      href: '/dashboard/tickets'
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Visão Geral</h1>
      
      {metrics.error && (
        <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive-foreground">
          {metrics.error}
        </div>
      )}

      {/* Cards de Métrica */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((metric) => (
          <Link href={metric.href} key={metric.title} className="hover:shadow-md transition-shadow rounded-lg">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Renderizar o gráfico de tipos de tickets */}
      <div className="grid grid-cols-1 gap-6">
        <TicketTypesChart data={ticketTypeData} />
      </div>
    </div>
  );
}