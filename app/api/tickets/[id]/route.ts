// app/api/tickets/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TicketStatus } from '@prisma/client'; // Importa o Enum

// PATCH /api/tickets/[id] - Atualiza o status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const body = await request.json();
    const newStatus = body.status as TicketStatus;

    // Validação básica
    if (!newStatus || !Object.values(TicketStatus).includes(newStatus)) {
      return NextResponse.json(
        { error: 'Status inválido ou não fornecido.' },
        { status: 400 }
      );
    }

    // Verifica se o ticket existe
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket não encontrado.' }, { status: 404 });
    }

    // Atualiza o ticket no banco
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        updatedAt: new Date(), // Atualiza o timestamp
      },
    });

    return NextResponse.json(updatedTicket, { status: 200 });

  } catch (error) {
    console.error("Erro ao atualizar status do ticket:", error);
     if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'JSON mal formatado.' }, { status: 400 });
    }
     if ((error as any).code?.startsWith('P')) { // Erro do Prisma
       return NextResponse.json({ error: 'Erro de banco de dados.', details: (error as any).message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar ticket.' }, { status: 500 });
  }
}

// Opcional: GET /api/tickets/[id] - Se precisar buscar um ticket específico via API
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
   try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
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