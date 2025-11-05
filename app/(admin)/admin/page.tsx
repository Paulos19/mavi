// app/(admin)/admin/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Role, TicketStatus } from "@prisma/client";
import { List, Users, Bell, ListChecks, Hourglass } from 'lucide-react';
import Link from 'next/link';

// Esta função busca todas as métricas em paralelo
async function getAdminMetrics() {
  try {
    const [
      totalTickets,
      pendingTickets,
      inAnalysisTickets,
      completedTickets,
      totalAssistants,
      unreadNotifications
    ] = await Promise.all([
      // Métricas de Tickets
      prisma.supportTicket.count(),
      prisma.supportTicket.count({
        where: { status: TicketStatus.PENDENTE }
      }),
      prisma.supportTicket.count({
        where: { status: TicketStatus.EM_ANALISE }
      }),
      prisma.supportTicket.count({
        where: { status: TicketStatus.CONCLUIDO }
      }),
      // Métrica de Usuários
      prisma.user.count({
        where: { role: Role.ASSISTANT }
      }),
      // Métrica de Notificações
      prisma.notification.count({
        where: { isRead: false }
      })
    ]);

    return {
      totalTickets,
      pendingTickets,
      inAnalysisTickets,
      completedTickets,
      totalAssistants,
      unreadNotifications,
      error: null,
    };

  } catch (error) {
    console.error("Erro ao buscar métricas de Admin:", error);
    return {
      totalTickets: 0,
      pendingTickets: 0,
      inAnalysisTickets: 0,
      completedTickets: 0,
      totalAssistants: 0,
      unreadNotifications: 0,
      error: "Não foi possível carregar as métricas.",
    };
  }
}

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  const metricCards = [
    { 
      title: 'Total de Tickets', 
      value: metrics.totalTickets, 
      icon: List, 
      href: '/admin/tickets' 
    },
    { 
      title: 'Tickets Pendentes', 
      value: metrics.pendingTickets, 
      icon: Hourglass, 
      href: '/admin/tickets' // Idealmente: /admin/tickets?status=PENDENTE
    },
    { 
      title: 'Notificações Não Lidas', 
      value: metrics.unreadNotifications, 
      icon: Bell, 
      href: '/admin/notifications' 
    },
    { 
      title: 'Assistentes Ativos', 
      value: metrics.totalAssistants, 
      icon: Users, 
      href: '/admin/users' 
    },
    { 
      title: 'Tickets em Análise', 
      value: metrics.inAnalysisTickets, 
      icon: ListChecks, // Ícone diferente
      href: '/admin/tickets' // Idealmente: /admin/tickets?status=EM_ANALISE
    },
    { 
      title: 'Tickets Concluídos', 
      value: metrics.completedTickets, 
      icon: ListChecks, 
      href: '/admin/tickets' // Idealmente: /admin/tickets?status=CONCLUIDO
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Visão Geral do Administrador</h1>
      
      {metrics.error && (
        <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive-foreground">
          {metrics.error}
        </div>
      )}

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
      
      {/* Aqui você pode adicionar gráficos mais complexos no futuro, 
        como performance por assistente ou tipos de tickets mais comuns.
      */}
    </div>
  );
}