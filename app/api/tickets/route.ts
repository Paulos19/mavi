import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FlowType, Role, TicketStatus } from '@prisma/client'; // Importamos os Enums gerados
import { auth } from '@/auth';

// Interface para tipar o corpo da requisição POST
// Isso corrige os erros de 'any' e 'Cannot find name'
interface TicketPostBody {
  whatsapp_number: string;
  tipo_problema: FlowType;
  nome_cliente?: string;
  comprovante_entrega?: string;
  receita_atual?: string;
  receita_antiga?: string;
  foto_com_oculos?: string;
  comprovante_pagamento?: string;
  data_entrega?: string;      // O JSON enviará datas como string ISO
  tempo_uso?: string;         // O JSON enviará números como string
  sintomas?: string;
  endereco_envio?: string;
  codigo_rastreio?: string;
}

// GET /api/tickets
// (Opcional: Para você poder consultar os tickets abertos)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    // Define a condição de busca
    let whereCondition: any = {};

    // Se não for ADMIN, filtra apenas pelos tickets atribuídos ao usuário logado
    if (session.user.role !== Role.ADMIN) {
      whereCondition.assignedToId = session.user.id;
    }
    // Se for ADMIN, 'whereCondition' fica vazio, buscando todos

    const tickets = await prisma.supportTicket.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc',
      },
      // Inclui os dados do assistente para o card
      include: {
        assignedTo: {
          select: { name: true, id: true }
        }
      }
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return NextResponse.json({ error: 'Erro ao buscar tickets.' }, { status: 500 });
  }
}

// POST /api/tickets
// (Principal: Usado pelo n8n para CRIAR um ticket)
export async function POST(request: Request) {
  try {
    // Agora o 'body' é fortemente tipado
    const body: TicketPostBody = await request.json();

    // Validação básica
    if (!body.whatsapp_number || !body.tipo_problema) {
      return NextResponse.json(
        { error: 'whatsapp_number e tipo_problema são obrigatórios.' },
        { status: 400 }
      );
    }

    // Validação do Enum
    if (!Object.values(FlowType).includes(body.tipo_problema)) {
      return NextResponse.json(
        { error: 'tipo_problema inválido. Valores válidos: ' + Object.values(FlowType).join(', ') },
        { status: 400 }
      );
    }
    
    // Objeto de dados limpo para o Prisma
    const dataToCreate = {
      whatsapp_number: body.whatsapp_number,
      tipo_problema: body.tipo_problema,
      nome_cliente: body.nome_cliente,
      status: TicketStatus.PENDENTE, // Usamos o Enum importado
      
      comprovante_entrega: body.comprovante_entrega,
      receita_atual: body.receita_atual,
      receita_antiga: body.receita_antiga,
      foto_com_oculos: body.foto_com_oculos,
      comprovante_pagamento: body.comprovante_pagamento,
      
      // Conversão de Tipos:
      // Converte a string de data (ISO) para um objeto Date
      data_entrega: body.data_entrega ? new Date(body.data_entrega) : undefined,
      
      // Converte a string 'tempo_uso' (ex: "10") para um Inteiro
      tempo_uso: body.tempo_uso ? parseInt(body.tempo_uso, 10) : undefined,

      sintomas: body.sintomas,
      endereco_envio: body.endereco_envio,
      codigo_rastreio: body.codigo_rastreio,
    };

    // Remove chaves 'undefined' para não enviar valores nulos para campos opcionais
    // Isso é uma boa prática para evitar erros do Prisma
    Object.keys(dataToCreate).forEach(key => 
      (dataToCreate as any)[key] === undefined && delete (dataToCreate as any)[key]
    );

    const newTicket = await prisma.supportTicket.create({
      data: dataToCreate,
    });

    return NextResponse.json(newTicket, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'JSON mal formatado.' }, { status: 400 });
    }
    // Adiciona log de erro de validação do Prisma (ex: 'tempo_uso' não é um número)
    if ((error as any).code?.startsWith('P')) {
       return NextResponse.json({ error: 'Erro de validação de dados do Prisma.', details: (error as any).message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Erro interno ao criar ticket.' }, { status: 500 });
  }
}