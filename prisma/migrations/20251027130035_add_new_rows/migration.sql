/*
  Warnings:

  - The values [ABERTO,EM_ANALISE_LAB,AGUARDANDO_PAGAMENTO,EM_TRANSPORTE,RESOLVIDO,CANCELADO] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `causaProblema` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `codigoRastreio` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `comprovanteEntregaUrl` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `comprovantePgtoUrl` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `dataEntrega` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `enderecoEnvio` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `fotoComOculosUrl` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `fotoOculosQuebradoUrl` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `pagamentoPendente` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `receitaAtualUrl` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `tempoUsoDias` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `tipoProblema` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the `Patient` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tipo_problema` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsapp_number` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FlowType" AS ENUM ('ADAPTACAO', 'QUEBROU_MAREOU', 'NAO_BUSCOU', 'ENVIO_LABORATORIO', 'OUTRO');

-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('PENDENTE', 'EM_ANALISE', 'AGUARDANDO_CLIENTE', 'AGUARDANDO_ENVIO', 'CONCLUIDO');
ALTER TABLE "public"."SupportTicket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SupportTicket" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
ALTER TABLE "SupportTicket" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."SupportTicket" DROP CONSTRAINT "SupportTicket_patientId_fkey";

-- AlterTable
ALTER TABLE "SupportTicket" DROP COLUMN "causaProblema",
DROP COLUMN "codigoRastreio",
DROP COLUMN "comprovanteEntregaUrl",
DROP COLUMN "comprovantePgtoUrl",
DROP COLUMN "dataEntrega",
DROP COLUMN "enderecoEnvio",
DROP COLUMN "fotoComOculosUrl",
DROP COLUMN "fotoOculosQuebradoUrl",
DROP COLUMN "pagamentoPendente",
DROP COLUMN "patientId",
DROP COLUMN "receitaAtualUrl",
DROP COLUMN "tempoUsoDias",
DROP COLUMN "tipoProblema",
ADD COLUMN     "codigo_rastreio" TEXT,
ADD COLUMN     "comprovante_entrega" TEXT,
ADD COLUMN     "comprovante_pagamento" TEXT,
ADD COLUMN     "data_entrega" TIMESTAMP(3),
ADD COLUMN     "endereco_envio" TEXT,
ADD COLUMN     "foto_com_oculos" TEXT,
ADD COLUMN     "nome_cliente" TEXT,
ADD COLUMN     "receita_antiga" TEXT,
ADD COLUMN     "receita_atual" TEXT,
ADD COLUMN     "tempo_uso" INTEGER,
ADD COLUMN     "tipo_problema" "FlowType" NOT NULL,
ADD COLUMN     "whatsapp_number" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDENTE';

-- DropTable
DROP TABLE "public"."Patient";

-- DropEnum
DROP TYPE "public"."TicketType";

-- CreateIndex
CREATE INDEX "SupportTicket_whatsapp_number_idx" ON "SupportTicket"("whatsapp_number");
