import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; //

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;
  const mustChangePassword = session?.user?.mustChangePassword;

  // Definição de Rotas
  const isOnAdminPanel = nextUrl.pathname.startsWith('/admin');
  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
  const isOnLoginPage = nextUrl.pathname.startsWith('/auth/login');

  // --- REGRA 1: Forçar troca de senha (ADMIN) ---
  if (isLoggedIn && mustChangePassword) {
    const changePage = '/dashboard/force-password-change'; // Mover para fora do dashboard
    if (nextUrl.pathname !== changePage) {
      return NextResponse.redirect(new URL(changePage, nextUrl));
    }
    return NextResponse.next(); // Permite ficar na página de troca
  }
  
  // --- REGRA 2: Proteger a página de troca de senha ---
  if (isLoggedIn && !mustChangePassword && nextUrl.pathname.startsWith('/dashboard/force-password-change')) {
     // Se já trocou a senha, vá para a rota correta (admin ou assistente)
     const homeUrl = userRole === 'ADMIN' ? '/admin' : '/dashboard';
     return NextResponse.redirect(new URL(homeUrl, nextUrl));
  }

  // --- REGRA 3: Proteger o Painel ADMIN ---
  if (isOnAdminPanel) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/auth/login', nextUrl)); // Redireciona para /auth/login
    if (userRole === 'ADMIN') return NextResponse.next(); // Permite
    return NextResponse.redirect(new URL('/dashboard', nextUrl)); // Nega (ASSISTANT vai pro dashboard)
  }

  // --- REGRA 4: Proteger o Painel ASSISTENTE ---
  if (isOnDashboard) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/auth/login', nextUrl)); // Redireciona para /auth/login
    if (userRole === 'ASSISTANT') return NextResponse.next(); // Permite
    return NextResponse.redirect(new URL('/admin', nextUrl)); // Nega (ADMIN vai pro admin)
  }

  // --- REGRA 5: Proteger a página de Login ---
  if (isOnLoginPage && isLoggedIn) {
    const homeUrl = userRole === 'ADMIN' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(homeUrl, nextUrl));
  }

  // Permite todas as outras rotas (ex: /)
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
  ],
};