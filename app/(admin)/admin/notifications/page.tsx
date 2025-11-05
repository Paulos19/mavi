// app/(admin)/admin/notifications/page.tsx
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Notification, User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { MarkAsReadButton } from '@/components/MarkAsReadButton';
import { AssignToAssistant } from '@/components/AssignToAssistant'; // Importar

export const metadata: Metadata = {
  title: 'Todas as Notificações - Ma.Vi Admin',
};

// Tipo estendido para incluir o assistente
type NotificationWithAssignee = Notification & {
  assignedTo: { name: string } | null;
};

async function getNotifications(): Promise<NotificationWithAssignee[]> {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: {
          select: { name: true }
        }
      }
    });
    return notifications as NotificationWithAssignee[];
  } catch (error) {
    console.error("Erro ao buscar notificações (Admin):", error);
    return [];
  }
}

function formatWhatsAppLink(jid: string): string {
  const number = jid.split('@')[0];
  return `https://wa.me/${number.replace(/\D/g, '')}`;
}

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold">Todas as Notificações</h1>
         <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
           {unreadCount} não lidas
         </Badge>
      </div>

       {notifications.length === 0 ? (
        <Card className="text-center p-10">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma notificação</h3>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.isRead ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{notification.motivo}</CardTitle>
                    <CardDescription className="pt-1">
                      Cliente: {notification.whatsapp_number}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant={notification.isRead ? "secondary" : "default"} className="mb-1">
                      {notification.isRead ? "Lida" : "Nova"}
                    </Badge>
                    <br/>
                    <Badge variant="outline">
                      {notification.assignedTo ? `Atribuído a: ${notification.assignedTo.name}` : "Não atribuído"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground">
                    Recebido em: {notification.createdAt.toLocaleString('pt-BR')}
                 </p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                 {/* Componente de Atribuição */}
                 <AssignToAssistant
                    itemId={notification.id}
                    itemType="notification"
                    currentAssignedToId={notification.assignedToId ?? null}
                 />
                 <div className="flex gap-2 w-full sm:w-auto">
                    <Button asChild size="sm" variant="outline" className="w-full">
                       <Link href={formatWhatsAppLink(notification.whatsapp_number)} target="_blank" rel="noopener noreferrer">
                         Contatar
                       </Link>
                    </Button>
                    {/* O MarkAsReadButton continua funcionando */}
                    <MarkAsReadButton notificationId={notification.id} isRead={notification.isRead} />   
                 </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}