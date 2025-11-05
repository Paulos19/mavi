// app/(admin)/components/AssistantPerformanceChart.tsx
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
import { Progress } from "@/components/ui/progress"; // Assumindo que você tem 'components/ui/progress.tsx'

// Este é o tipo de dado que a página do servidor irá passar
export type AssistantPerformanceData = {
  name: string | null;
  total: number;
  completed: number;
  completionRate: number;
};

interface AssistantPerformanceChartProps {
  data: AssistantPerformanceData[];
}

export function AssistantPerformanceChart({ data }: AssistantPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Assistente</CardTitle>
        <CardDescription>
          Tickets totais atribuídos vs. concluídos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum assistente encontrado ou nenhum ticket atribuído.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assistente</TableHead>
                <TableHead className="text-center">Concluídos</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-right">Taxa de Conclusão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((assistant) => (
                <TableRow key={assistant.name}>
                  <TableCell className="font-medium">{assistant.name || 'Sem Nome'}</TableCell>
                  <TableCell className="text-center">{assistant.completed}</TableCell>
                  <TableCell className="text-center">{assistant.total}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        {assistant.completionRate.toFixed(0)}%
                      </span>
                      <Progress
                        value={assistant.completionRate}
                        className="h-2 w-[80px]"
                      />
                    </div>
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