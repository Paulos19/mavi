"use server";

import { revalidatePath } from 'next/cache';
import { auth, signIn } from '../auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
    // O redirect será tratado pelo middleware
    return;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email ou senha inválidos.';
        default:
          return 'Algo deu errado. Tente novamente.';
      }
    }
    // Lança o erro para depuração
    throw error;
  }
}

type ChangePasswordState = {
  error: string | null;
  success: boolean;
};

export async function changePassword(
  prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth(); // Pega a sessão atual

  // Adicionamos a checagem de email, pois vamos precisar dele
  if (!session?.user?.id || !session?.user?.email) {
    return { error: "Usuário não autenticado.", success: false };
  }

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validações
  if (!password || !confirmPassword) {
    return { error: "Ambos os campos são obrigatórios.", success: false };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres.", success: false };
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem.", success: false };
  }

  try {
    // Hash da nova senha
    const newHashedPassword = await bcrypt.hash(password, 10);

    // 1. Atualiza o usuário no banco
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: newHashedPassword,
        mustChangePassword: false, // <-- A "trava" é removida
      },
    });

    // 2. **A CORREÇÃO:** Re-autentica o usuário com a *nova* senha.
    // Isso gera um novo cookie de sessão com 'mustChangePassword: false'.
    // O 'signIn' cuidará do redirecionamento para o dashboard.
    await signIn('credentials', {
      email: session.user.email,
      password: password, // Usa a *nova* senha
      redirectTo: '/dashboard', // Redireciona para o dashboard após o sucesso
    });

    // O código abaixo não será alcançado se o signIn for bem-sucedido (ele lança um redirect)
    return { error: null, success: true };

  } catch (error) {
    // 3. Captura o erro de redirecionamento do 'signIn' para evitar um crash
    if ((error as Error).message.includes('NEXT_REDIRECT')) {
      throw error;
    }

    if (error instanceof AuthError) {
      // signIn falhou (improvável, mas possível)
      return { error: 'Falha ao re-autenticar. Tente fazer login novamente.', success: false };
    }

    console.error("Erro ao trocar senha:", error);
    return { error: "Erro interno ao atualizar a senha.", success: false };
  }
}