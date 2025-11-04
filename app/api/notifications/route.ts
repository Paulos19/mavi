
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/notifications - Lista todas as notificações
export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: 'Erro ao buscar notificações.' }, { status: 500 });
  }
}

// POST /api/notifications - Cria uma nova notificação (Usado pelo n8n)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { whatsapp_number, motivo } = body;

    if (!whatsapp_number || !motivo) {
      return NextResponse.json(
        { error: 'whatsapp_number e motivo são obrigatórios.' },
        { status: 400 }
      );
    }

    const newNotification = await prisma.notification.create({
      data: {
        whatsapp_number,
        motivo,
      },
    });

    return NextResponse.json(newNotification, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json({ error: 'Erro interno ao criar notificação.' }, { status: 500 });
  }
}