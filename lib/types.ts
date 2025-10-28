import { FlowType, TicketStatus } from '@prisma/client';

export interface SupportTicket {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  whatsapp_number: string;
  nome_cliente?: string | null; // Permite null vindo do DB
  tipo_problema: FlowType;
  status: TicketStatus;
  comprovante_entrega?: string | null;
  receita_atual?: string | null;
  receita_antiga?: string | null;
  foto_com_oculos?: string | null;
  comprovante_pagamento?: string | null;
  data_entrega?: Date | null;
  tempo_uso?: number | null;
  sintomas?: string | null;
  endereco_envio?: string | null;
  codigo_rastreio?: string | null;
}