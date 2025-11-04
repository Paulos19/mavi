// paulos19/mavi/mavi-c44b472b3401cb9f5308079afa00599ae6792457/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from './lib/prisma';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';

// AQUI ESTÁ A EXPORTAÇÃO QUE ESTÁ FALTANDO
export const { 
  handlers, 
  auth,        // <-- Exporta o 'auth'
  signIn,      // <-- Exporta o 'signIn'
  signOut 
} = NextAuth({
  ...authConfig, // Usa as regras do auth.config.ts
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' }, // JWT é necessário para o CredentialsProvider
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        let user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // --- LÓGICA DE PROVISIONAMENTO DO ADMIN (SEEDING) ---
        if (
          !user &&
          email.toLowerCase() === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_INITIAL_PASSWORD
        ) {
          console.log('Provisionando conta de ADMIN...');
          const hashedPassword = await bcrypt.hash(password, 10);
          
          user = await prisma.user.create({
            data: {
              email: email.toLowerCase(),
              password: hashedPassword,
              role: Role.ADMIN,
              mustChangePassword: true, // Força a troca de senha
              name: "Administrador",
            },
          });

          return user;
        }
        // --- FIM DA LÓGICA DE SEEDING ---

        if (!user || !user.password) {
          // Nenhum usuário encontrado ou usuário não tem senha (ex: OAuth)
          return null;
        }

        // Verificar a senha
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          return user;
        }

        return null; // Senha incorreta
      },
    }),
  ],
});