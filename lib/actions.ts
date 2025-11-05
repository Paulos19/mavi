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
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return { error: "Usuário não autenticado.", success: false };
  }

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

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
    const newHashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: newHashedPassword,
        mustChangePassword: false,
      },
    });

    await signIn('credentials', {
      email: session.user.email,
      password: password,
      redirectTo: '/dashboard',
    });

    return { error: null, success: true };

  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Falha ao re-autenticar. Tente fazer login novamente.', success: false };
    }

    throw error;
  }
}