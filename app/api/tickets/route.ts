// /app/api/tickets/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TicketStatus, TicketType } from '@prisma/client'; // Importar Enums

const prisma = new PrismaClient();

// API para o n8n criar ou atualizar um ticket
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      whatsappNumber,
      nomeCompleto,
      cidade,
      tipoProblema,
      // --- Campos adicionais baseados no schema ---
      sintomas,
      dataEntrega, // Espera string ISO ou formato que Date() entenda
      tempoUsoDias,
      causaProblema,
      comprovanteEntregaUrl,
      receitaAtualUrl,
      // ATENÇÃO: Adicionar campo para receitasAntigasUrl se necessário coletar
      fotoComOculosUrl,
      fotoOculosQuebradoUrl,
      // pagamentoPendente não precisa vir, a lógica de reenvio define
      comprovantePgtoUrl,
      enderecoEnvio,
      codigoRastreio,
      // --- Campo para identificar ticket existente (opcional na criação) ---
      ticketId
    } = body;

    // Validação inicial para criação
    if (!ticketId && (!whatsappNumber || !nomeCompleto || !tipoProblema)) {
      return NextResponse.json({ error: 'Dados essenciais para criação faltando (whatsappNumber, nomeCompleto, tipoProblema)' }, { status: 400 });
    }

    let ticket;

    if (ticketId) {
      // --- ATUALIZAR TICKET EXISTENTE ---
      // Converte tempoUsoDias para número, se presente
      const tempoUsoDiasNum = tempoUsoDias ? parseInt(tempoUsoDias, 10) : undefined;
      // Converte dataEntrega para Date, se presente
      const dataEntregaDate = dataEntrega ? new Date(dataEntrega) : undefined;

      // Monta o objeto de dados apenas com os campos fornecidos
      const dataToUpdate: any = {};
      if (sintomas !== undefined) dataToUpdate.sintomas = sintomas;
      if (dataEntregaDate !== undefined && !isNaN(dataEntregaDate.getTime())) dataToUpdate.dataEntrega = dataEntregaDate;
      if (tempoUsoDiasNum !== undefined && !isNaN(tempoUsoDiasNum)) dataToUpdate.tempoUsoDias = tempoUsoDiasNum;
      if (causaProblema !== undefined) dataToUpdate.causaProblema = causaProblema;
      if (comprovanteEntregaUrl !== undefined) dataToUpdate.comprovanteEntregaUrl = comprovanteEntregaUrl;
      if (receitaAtualUrl !== undefined) dataToUpdate.receitaAtualUrl = receitaAtualUrl;
      if (fotoComOculosUrl !== undefined) dataToUpdate.fotoComOculosUrl = fotoComOculosUrl;
      if (fotoOculosQuebradoUrl !== undefined) dataToUpdate.fotoOculosQuebradoUrl = fotoOculosQuebradoUrl;
      if (comprovantePgtoUrl !== undefined) dataToUpdate.comprovantePgtoUrl = comprovantePgtoUrl;
      if (enderecoEnvio !== undefined) dataToUpdate.enderecoEnvio = enderecoEnvio;
      if (codigoRastreio !== undefined) dataToUpdate.codigoRastreio = codigoRastreio;
       // Poderia adicionar lógica para mudar o STATUS aqui se necessário

      ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: dataToUpdate,
        include: { patient: true } // Inclui dados do paciente na resposta
      });

      return NextResponse.json(ticket, { status: 200 }); // Status 200 OK para atualização

    } else {
      // --- CRIAR NOVO TICKET ---
      // Encontra ou cria o paciente
      const patient = await prisma.patient.upsert({
        where: { whatsappNumber: whatsappNumber },
        update: { nomeCompleto, cidade }, // Atualiza nome/cidade se paciente existe
        create: { whatsappNumber, nomeCompleto, cidade },
      });

       // Converte tipoProblema string para o Enum TicketType
       const tipoProblemaEnum = tipoProblema as TicketType;
       if (!Object.values(TicketType).includes(tipoProblemaEnum)) {
         return NextResponse.json({ error: 'Tipo de problema inválido' }, { status: 400 });
       }

      // Cria o ticket de suporte e o associa ao paciente
      ticket = await prisma.supportTicket.create({
        data: {
          patientId: patient.id,
          tipoProblema: tipoProblemaEnum, // Usa o Enum validado
          // Outros campos iniciais podem ser adicionados aqui se vierem na criação
          sintomas: body.sintomas || null, // Exemplo: detalhesIniciais poderiam vir aqui
        },
         include: { patient: true } // Inclui dados do paciente na resposta
      });

      return NextResponse.json(ticket, { status: 201 }); // Status 201 Created para criação
    }

  } catch (error) {
    console.error('Erro ao processar ticket:', error);
     // Adiciona mais detalhes do erro no log do servidor
     let errorMessage = 'Erro interno do servidor';
     if (error instanceof Error) {
       errorMessage = error.message;
       console.error(error.stack);
     } else {
       console.error(error);
     }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
     await prisma.$disconnect(); // Garante que a conexão com o BD seja fechada
  }
}

// GET continua igual...
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
   } finally {
     await prisma.$disconnect(); // Garante que a conexão com o BD seja fechada
  }
}