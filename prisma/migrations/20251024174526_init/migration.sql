-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('ADAPTACAO', 'QUEBRA_MAREOU', 'NAO_BUSCOU_ENTREGA', 'ENVIO_LAB', 'OUTRO');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('ABERTO', 'EM_ANALISE_LAB', 'AGUARDANDO_PAGAMENTO', 'EM_TRANSPORTE', 'RESOLVIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "cidade" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "tipoProblema" "TicketType" NOT NULL DEFAULT 'OUTRO',
    "status" "TicketStatus" NOT NULL DEFAULT 'ABERTO',
    "sintomas" TEXT,
    "dataEntrega" TIMESTAMP(3),
    "tempoUsoDias" INTEGER,
    "causaProblema" TEXT,
    "comprovanteEntregaUrl" TEXT,
    "receitaAtualUrl" TEXT,
    "fotoComOculosUrl" TEXT,
    "fotoOculosQuebradoUrl" TEXT,
    "pagamentoPendente" BOOLEAN NOT NULL DEFAULT false,
    "comprovantePgtoUrl" TEXT,
    "enderecoEnvio" TEXT,
    "codigoRastreio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_whatsappNumber_key" ON "Patient"("whatsappNumber");

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
