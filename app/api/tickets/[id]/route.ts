// app/api/tickets/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TicketStatus } from '@prisma/client';
import { auth } from '@/auth'; // Importar o auth

// PATCH /api/tickets/[id] - Atualiza status (Assistente) OU atribuição (Admin)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const ticketId = params.id;
    const body = await request.json();
    const { status, assignedToId } = body;

    let dataToUpdate: any = {
      updatedAt: new Date(),
    };

    // Lógica de atualização de STATUS (Qualquer um pode fazer)
    if (status) {
      if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
        return NextResponse.json(
          { error: 'Status inválido.' },
          { status: 400 }
        );
      }
      dataToUpdate.status = status;
    }

    // Lógica de ATRIBUIÇÃO (Apenas ADMIN)
    if (assignedToId !== undefined) {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Apenas Admins podem atribuir tickets.' },
          { status: 403 }
        );
      }
      // Se 'assignedToId' for null, desatribui
      dataToUpdate.assignedToId = assignedToId;
    }

    if (Object.keys(dataToUpdate).length === 1) { // Apenas updatedAt
        return NextResponse.json({ error: 'Nenhum dado válido para atualizar.' }, { status: 400 });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar ticket:", error);
    return NextResponse.json({ error: 'Erro interno ao atualizar ticket.' }, { status: 500 });
  }
}

// Opcional: GET /api/tickets/[id] (mantém o mesmo)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ... (código GET existente sem alterações)
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: { // Inclui os dados do assistente atribuído
          select: { id: true, name: true, email: true }
        }
      }
    });
     if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Erro ao buscar ticket por ID via API:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar ticket.' }, { status: 500 });
  }
}