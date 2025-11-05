// components/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Saindo..." : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </>
      )}
    </Button>
  );
}