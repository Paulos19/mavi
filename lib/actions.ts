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
  const session = await auth(); // Pega a sessão segura no servidor

  if (!session?.user?.id) {
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

    // Atualiza o usuário no banco
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: newHashedPassword,
        mustChangePassword: false, // <-- A "trava" é removida
      },
    });

  } catch (error) {
    console.error("Erro ao trocar senha:", error);
    return { error: "Erro interno ao atualizar a senha.", success: false };
  }

  // Sucesso. Revalida o path e redireciona
  revalidatePath('/dashboard');
  redirect('/dashboard');
  
  // O redirect() lança um erro, então tecnicamente isso não é alcançado,
  // mas é bom para o 'useActionState'
  return { error: null, success: true };
}