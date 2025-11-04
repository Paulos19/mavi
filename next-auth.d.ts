// paulos19/mavi/mavi-c44b472b3401cb9f5308079afa00599ae6792457/next-auth.d.ts
import { Role } from '@prisma/client';
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Estende os tipos padrão do Next-Auth
declare module 'next-auth' {
  /**
   * Estende o objeto Session para incluir nossos campos customizados
   */
  interface Session {
    user: {
      id: string;
      role: Role;
      mustChangePassword: boolean;
    } & DefaultSession['user']; // Preserva os campos originais (name, email, image)
  }

  /**
   * Estende o objeto User para corresponder ao seu schema Prisma
   */
  interface User extends DefaultUser {
    role: Role;
    mustChangePassword: boolean;
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role: Role;
    mustChangePassword: boolean;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Estende o Token JWT para incluir nossos campos customizados
   */
  interface JWT {
    role: Role;
    mustChangePassword: boolean;
  }
}