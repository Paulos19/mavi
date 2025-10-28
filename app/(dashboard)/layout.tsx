// app/(dashboard)/layout.tsx
import { Sidebar } from './components/Sidebar'; // Criaremos este

export default function DashboardLayout({
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