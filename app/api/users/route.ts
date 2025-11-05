// app/api/users/route.ts
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { auth } from '@/auth'; // Importa do auth.ts
import { Role } from '@prisma/client';

// GET /api/users - Lista todos os assistentes
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const assistants = await prisma.user.findMany({
      where: { role: 'ASSISTANT' },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(assistants);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar assistentes' }, { status: 500 });
  }
}

// POST /api/users - Cria um novo assistente
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, name, whatsappNumber } = body;

    if (!email || !password || !name || !whatsappNumber) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAssistant = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name,
        whatsappNumber: whatsappNumber,
        role: Role.ASSISTANT,
        mustChangePassword: true, // Força o assistente a trocar a senha no primeiro login
      },
    });
    
    // Não retorne a senha
    const { password: _, ...result } = newAssistant;
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar assistente' }, { status: 500 });
  }
}