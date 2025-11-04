import { auth } from './auth'; // Importa do auth.ts (que contém a config)

// Exporta a função 'auth' como o middleware
export default auth;

// O matcher continua o mesmo
export const config = {
  matcher: [
    // Roda em todas as rotas, exceto as de assets, api, etc.
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
  ],
};