// app/(admin)/components/TicketTypesChart.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlowType } from "@prisma/client";

// Tipo de dado que a página do servidor irá passar
export type TicketTypeData = {
  name: FlowType;
  count: number;
  percentage: number;
};

interface TicketTypesChartProps {
  data: TicketTypeData[];
}

export function TicketTypesChart({ data }: TicketTypesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Tickets Mais Comuns</CardTitle>
        <CardDescription>
          Distribuição de todos os tickets abertos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum ticket encontrado.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Problema</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Porcentagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">
                    {item.percentage.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}