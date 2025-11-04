"use client";

// CORREÇÃO 1: Mudar as importações
import { useActionState } from 'react'; // <-- Mude de 'useFormState' e importe de 'react'
import { useFormStatus } from 'react-dom'; // <-- 'useFormStatus' continua vindo de 'react-dom'

import { authenticate } from '@/lib/actions';
import { Button } from "@/components/ui/button"; //
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"; //
// Assumindo que você tenha componentes Input e Label da shadcn/ui
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

export default function LoginPage() {
  // CORREÇÃO 2: Mudar o nome do hook
  const [errorMessage, dispatch] = useActionState(authenticate, undefined); // <-- Mude para useActionState

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <form action={dispatch}>
          <CardHeader>
            <CardTitle className="text-2xl">Login - Ma.Vi Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="email@exemplo.com" 
                required 
                className="p-2 border rounded"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Senha</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="p-2 border rounded"
              />
            </div>
            {errorMessage && (
              <div className="text-sm font-medium text-destructive">
                {errorMessage}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <LoginButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" aria-disabled={pending} disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}