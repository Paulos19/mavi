// app/api/notifications/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Importar o auth

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const notificationId = params.id;
    const body = await request.json();
    const { isRead, assignedToId } = body;

    let dataToUpdate: any = {};

    // Lógica de atualização de isRead (Qualquer um pode fazer)
    if (typeof isRead === 'boolean') {
      dataToUpdate.isRead = isRead;
    }

    // Lógica de ATRIBUIÇÃO (Apenas ADMIN)
    if (assignedToId !== undefined) {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Apenas Admins podem atribuir notificações.' },
          { status: 403 }
        );
      }
      dataToUpdate.assignedToId = assignedToId;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ error: 'Nenhum dado válido para atualizar.' }, { status: 400 });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedNotification, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error);
    return NextResponse.json({ error: 'Erro interno ao atualizar notificação.' }, { status: 500 });
  }
}