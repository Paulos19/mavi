import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const body = await request.json();
    const { isRead } = body;

    if (typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'O campo isRead (boolean) é obrigatório.' },
        { status: 400 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: ticketId },
      data: {
        isRead: isRead,
      },
    });

    return NextResponse.json(updatedNotification, { status: 200 });

  } catch (error) {
    console.error("Erro ao atualizar notificação:", error);
    return NextResponse.json({ error: 'Erro interno ao atualizar notificação.' }, { status: 500 });
  }
}