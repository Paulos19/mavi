// app/(admin)/admin/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Role, TicketStatus } from "@prisma/client";
import { List, Users, Bell, ListChecks, Hourglass } from 'lucide-react';
import Link from 'next/link';
// Importar os novos componentes de gráfico
import { AssistantPerformanceChart, AssistantPerformanceData } from "../../../components/AssistantPerformanceChart";
import { TicketTypesChart, TicketTypeData } from "../../../components/TicketTypesChart";

// Esta função busca as métricas dos cards
async function getMetricCardData() {
  try {
    const [
      pendingTickets,
      totalAssistants,
      unreadNotifications,
      inAnalysisTickets,
      completedTickets
    ] = await Promise.all([
      prisma.supportTicket.count({ where: { status: TicketStatus.PENDENTE } }),
      prisma.user.count({ where: { role: Role.ASSISTANT } }),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.supportTicket.count({ where: { status: TicketStatus.EM_ANALISE } }),
      prisma.supportTicket.count({ where: { status: TicketStatus.CONCLUIDO } })
    ]);
    return { pendingTickets, totalAssistants, unreadNotifications, inAnalysisTickets, completedTickets, error: null };
  } catch (error) {
    console.error("Erro ao buscar métricas dos cards:", error);
    return { pendingTickets: 0, totalAssistants: 0, unreadNotifications: 0, inAnalysisTickets: 0, completedTickets: 0, error: "Erro ao carregar métricas dos cards" };
  }
}

// 2. Nova função para buscar dados de performance
async function getAssistantPerformance(): Promise<AssistantPerformanceData[]> {
  try {
    const assistants = await prisma.user.findMany({
      where: { role: Role.ASSISTANT },
      select: { id: true, name: true }
    });

    const totalCounts = await prisma.supportTicket.groupBy({
      by: ['assignedToId'],
      where: { assignedToId: { in: assistants.map(a => a.id) } },
      _count: { id: true }, // <-- CORREÇÃO 1 (de _all para id)
    });

    const completedCounts = await prisma.supportTicket.groupBy({
      by: ['assignedToId'],
      where: {
        status: TicketStatus.CONCLUIDO,
        assignedToId: { in: assistants.map(a => a.id) }
      },
      _count: { id: true }, // <-- CORREÇÃO 2 (de _all para id)
    });

    const totalMap = new Map(totalCounts.map(t => [t.assignedToId, t._count.id])); // <-- CORREÇÃO 2.1
    const completedMap = new Map(completedCounts.map(c => [c.assignedToId, c._count.id])); // <-- CORREÇÃO 2.2

    const performanceData = assistants.map(assistant => {
      const total = totalMap.get(assistant.id) || 0;
      const completed = completedMap.get(assistant.id) || 0;
      return {
        name: assistant.name,
        total,
        completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0
      };
    });

    return performanceData.sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error("Erro ao buscar performance de assistentes:", error);
    return [];
  }
}

// 3. Nova função para buscar tipos de tickets
async function getTicketTypes(totalTickets: number): Promise<TicketTypeData[]> {
  if (totalTickets === 0) return [];
  try {
    const typeCounts = await prisma.supportTicket.groupBy({
      by: ['tipo_problema'],
      _count: { id: true }, // <-- CORREÇÃO 3 (de _all para id)
      orderBy: {
        _count: { id: 'desc' } // <-- CORREÇÃO 4 (de _all para id)
      }
    });

    return typeCounts.map(t => ({
      name: t.tipo_problema,
      count: t._count.id, // <-- CORREÇÃO 4.1
      percentage: (t._count.id / totalTickets) * 100 // <-- CORREÇÃO 4.2
    }));
  } catch (error) {
    console.error("Erro ao buscar tipos de tickets:", error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  // 4. Buscar todos os dados em paralelo
  const totalTickets = await prisma.supportTicket.count();
  const [
    cardMetrics,
    performanceData,
    ticketTypeData
  ] = await Promise.all([
    getMetricCardData(),
    getAssistantPerformance(),
    getTicketTypes(totalTickets)
  ]);

  const metricCards = [
    { title: 'Total de Tickets', value: totalTickets, icon: List, href: '/admin/tickets' },
    { title: 'Tickets Pendentes', value: cardMetrics.pendingTickets, icon: Hourglass, href: '/admin/tickets' },
    { title: 'Notificações Não Lidas', value: cardMetrics.unreadNotifications, icon: Bell, href: '/admin/notifications' },
    { title: 'Assistentes Ativos', value: cardMetrics.totalAssistants, icon: Users, href: '/admin/users' },
    { title: 'Tickets em Análise', value: cardMetrics.inAnalysisTickets, icon: ListChecks, href: '/admin/tickets' },
    { title: 'Tickets Concluídos', value: cardMetrics.completedTickets, icon: ListChecks, href: '/admin/tickets' },
  ];

  return (
    // 5. Adicionar 'space-y-6' para espaçar os elementos
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Visão Geral do Administrador</h1>
      
      {cardMetrics.error && (
        <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive-foreground">
          {cardMetrics.error}
        </div>
      )}

      {/* Cards de Métrica */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((metric) => (
          <Link href={metric.href} key={metric.title}>
             <Card className="hover:shadow-md transition-shadow">
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
      
      {/* 6. Renderizar os novos gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssistantPerformanceChart data={performanceData} />
        <TicketTypesChart data={ticketTypeData} />
      </div>
    </div>
  );
}