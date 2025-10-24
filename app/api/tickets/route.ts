// /app/api/tickets/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API para o n8n criar um novo ticket
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      whatsappNumber, 
      nomeCompleto, 
      cidade, 
      tipoProblema, 
      // ...outros dados coletados pela IA
    } = body;

    if (!whatsappNumber || !nomeCompleto || !tipoProblema) {
      return NextResponse.json({ error: 'Dados essenciais faltando' }, { status: 400 });
    }

    // Encontra ou cria o paciente
    const patient = await prisma.patient.upsert({
      where: { whatsappNumber: whatsappNumber },
      update: { nomeCompleto, cidade },
      create: { whatsappNumber, nomeCompleto, cidade },
    });

    // Cria o ticket de suporte e o associa ao paciente
    const newTicket = await prisma.supportTicket.create({
      data: {
        patientId: patient.id,
        tipoProblema: tipoProblema, // ex: "ADAPTACAO"
        // ...salva os outros campos (sintomas, dataEntrega, etc.)
        sintomas: body.sintomas || null,
        dataEntrega: body.dataEntrega ? new Date(body.dataEntrega) : null,
      },
    });

    return NextResponse.json(newTicket, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// API para o Dashboard buscar os tickets
export async function GET() {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        patient: true, // Inclui dados do paciente
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}