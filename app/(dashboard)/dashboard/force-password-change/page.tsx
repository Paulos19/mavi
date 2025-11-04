// paulos19/mavi/mavi-c44b472b3401cb9f5308079afa00599ae6792457/app/(dashboard)/dashboard/force-password-change/page.tsx
"use client";
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { changePassword } from '@/lib/actions'; // Criaremos esta ação
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { toast } from "sonner"; //

// Estado inicial para o useActionState
const initialState = {
  error: null as string | null,
  success: false,
};

export default function ForcePasswordChangePage() {
  const [state, dispatch] = useActionState(changePassword, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success("Senha atualizada com sucesso! Redirecionando...");
      // O redirect na action deve cuidar disso, mas podemos forçar
      window.location.href = '/dashboard';
    }
  }, [state]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <form action={dispatch}>
          <CardHeader>
            <CardTitle className="text-2xl">Defina sua Nova Senha</CardTitle>
            <CardDescription>
              Por segurança, você deve definir uma nova senha no seu primeiro acesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="password">Nova Senha</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="p-2 border rounded"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="confirmPassword">Confirme a Nova Senha</label>
              <input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                required 
                className="p-2 border rounded"
              />
            </div>
            {state?.error && (
              <div className="text-sm font-medium text-destructive">
                {state.error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" aria-disabled={pending} disabled={pending}>
      {pending ? "Salvando..." : "Definir Nova Senha"}
    </Button>
  );
}