import { Role } from '@prisma/client';
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    // TODA A LÓGICA DE ROTA VAI AQUI
    authorized({ auth, request: { nextUrl } }) {
      const session = auth; // 'auth' é a sessão
      const isLoggedIn = !!session?.user;
      const userRole = session?.user?.role;
      const mustChangePassword = session?.user?.mustChangePassword;

      // Definição de Rotas
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLoginPage = nextUrl.pathname.startsWith('/auth/login');
      const isOnPasswordChangePage = nextUrl.pathname === '/dashboard/force-password-change';

      // --- REGRA 1: Forçar troca de senha ---
      if (isLoggedIn && mustChangePassword) {
        if (isOnPasswordChangePage) {
          return true; // Permite que o usuário fique na página de troca de senha
        }
        // Se estiver em qualquer outra página, força o redirecionamento
        return Response.redirect(new URL('/dashboard/force-password-change', nextUrl));
      }
      
      // --- REGRA 2: Proteger a página de troca de senha ---
      if (isLoggedIn && !mustChangePassword && isOnPasswordChangePage) {
        // Se o usuário já trocou a senha e tenta acessar a pág. de troca,
        // redireciona para o dashboard principal
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // --- REGRA 3: Proteger o Dashboard ---
      if (isOnDashboard) {
        if (!isLoggedIn) {
          return false; // Nega acesso -> redireciona para a página 'signIn'
        }
        // Se está logado, checa a role
        if (userRole === 'ADMIN' || userRole === 'ASSISTANT') {
          return true; // Permite o acesso
        } else {
          // Role não permitida (ex: 'USER'), nega e redireciona para a home
          return Response.redirect(new URL('/', nextUrl)); 
        }
      }

      // --- REGRA 4: Proteger a página de Login ---
      if (isOnLoginPage && isLoggedIn) {
        // Se está logado e tenta acessar /auth/login, redireciona para o dashboard
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // --- REGRA 5: Permite todas as outras rotas ---
      return true;
    },

    // Estes callbacks definem O QUE vai na sessão (estão corretos)
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as Role;
        session.user.mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
  providers: [], // Preenchido pelo auth.ts
} satisfies NextAuthConfig;