// paulos19/mavi/mavi-c44b472b3401cb9f5308079afa00599ae6792457/app/(dashboard)/dashboard/notifications/page.tsx
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Notification } from '@prisma/client'; // Importa o tipo
import { Button } from '@/components/ui/button';
import { MarkAsReadButton } from '@/components/MarkAsReadButton';

export const metadata: Metadata = {
  title: 'Notificações - Ma.Vi Dashboard',
};

// Função para buscar notificações no servidor
async function getNotifications(): Promise<Notification[]> {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return notifications;
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }
}

// Helper para formatar o link do WhatsApp
function formatWhatsAppLink(jid: string): string {
  const number = jid.split('@')[0];
  return `https://wa.me/${number.replace(/\D/g, '')}`;
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold">Notificações</h1>
         <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
           {unreadCount} não lidas
         </Badge>
      </div>

       {notifications.length === 0 ? (
        <Card className="text-center p-10">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma notificação</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Alertas importantes aparecerão aqui.
          </p>
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
                  <Badge variant={notification.isRead ? "secondary" : "default"}>
                    {notification.isRead ? "Lida" : "Nova"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                 <p className="text-sm text-muted-foreground">
                    Recebido em: {notification.createdAt.toLocaleString('pt-BR')}
                 </p>
                 <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                       <Link href={formatWhatsAppLink(notification.whatsapp_number)} target="_blank" rel="noopener noreferrer">
                         Contatar Cliente
                       </Link>
                    </Button>
                      <MarkAsReadButton notificationId={notification.id} isRead={notification.isRead} />   
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}