import { prisma }from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCreateForm } from '@/components/UserCreateForm'; // <-- IMPORTAR
import { Role, User } from '@prisma/client';

async function getAssistants(): Promise<User[]> {
  try {
    const assistants = await prisma.user.findMany({
      where: { role: Role.ASSISTANT }, // Use o Enum importado
      orderBy: { createdAt: 'desc' },
      // Opcional: não selecione a senha
      select: {
        id: true,
        name: true,
        email: true,
        whatsappNumber: true,
        mustChangePassword: true,
        createdAt: true,
        // ... inclua outros campos se precisar, exceto 'password'
        role: true,
        emailVerified: true,
        image: true
      }
    });
    // O tipo de retorno precisa ser ajustado ou o 'select' removido
    // Para simplificar, vamos remover o 'select' por agora.
    const assistantsWithPassword = await prisma.user.findMany({
      where: { role: Role.ASSISTANT },
      orderBy: { createdAt: 'desc' },
    });
    // Retorne os dados sem a senha
    return assistantsWithPassword.map(({ password, ...user }) => user) as User[];

  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function ManageUsersPage() {
  const assistants = await getAssistants();

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Assistente</CardTitle>
        </CardHeader>
        <CardContent>
          <UserCreateForm /> {/* <-- ADICIONAR O COMPONENTE AQUI */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assistentes Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assistants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum assistente cadastrado.
                  </TableCell>
                </TableRow>
              )}
              {assistants.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.whatsappNumber}</TableCell>
                  <TableCell>
                    {user.mustChangePassword ? (
                      <Badge variant="outline">Login Pendente</Badge>
                    ) : (
                      <Badge variant="default">Ativo</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}