// app/(dashboard)/layout.tsx (Versão Final Limpa)
import { Sidebar } from './components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}