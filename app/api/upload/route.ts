import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Helper para converter Base64 em Buffer
function base64ToBuffer(base64: string): Buffer {
  // Remove o prefixo (ex: "data:image/png;base64,") se ele existir
  const base64Data = base64.split(';base64,').pop();
  if (!base64Data) {
    throw new Error('Base64 string is invalid');
  }
  return Buffer.from(base64Data, 'base64');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, base64Data } = body;

    if (!fileName || !base64Data) {
      return NextResponse.json(
        { error: 'fileName e base64Data são obrigatórios.' },
        { status: 400 }
      );
    }

    // Converte o Base64 de volta para um arquivo (Buffer)
    const fileBuffer = base64ToBuffer(base64Data);

    // Faz o upload para o Vercel Blob
    // O 'pathname' é como o arquivo será salvo no blob (ex: uploads/comprovante.png)
    const blob = await put(`uploads/${fileName}`, fileBuffer, {
      access: 'public', // Torna o arquivo publicamente acessível
      // Adicione 'contentType' se souber o tipo da imagem (ex: 'image/png')
    });

    // Retorna a URL pública do arquivo
    return NextResponse.json({ url: blob.url }, { status: 200 });

  } catch (error) {
    console.error('Erro no upload para o Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar upload.' },
      { status: 500 }
    );
  }
}