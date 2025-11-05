// app/(admin)/layout.tsx
import { AdminSidebar } from './components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ALTERAÇÃO AQUI: troque 'min-h-screen' por 'h-screen overflow-hidden'
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <AdminSidebar />
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}