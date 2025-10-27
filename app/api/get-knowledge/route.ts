import { NextResponse, NextRequest } from 'next/server';

// Este é o conteúdo hardcoded do "GUIA DO SUPORTE - PRINCIPAIS OBJEÇÕES.pdf"
// Em um sistema RAG real, isso viria de um banco de vetores.
const KNOWLEDGE_BASE_MAVI = `
### [cite_start]Fluxo de Atendimento - Dificuldade de Adaptação ao Óculos [cite: 163]

[cite_start]Mensagem 1-Apresentação e pedido inicial: "Olá, bom dia! Aqui é a ATENDENTE X e vou te ajudar. Poderia me enviar uma foto do seu comprovante de entrega e da receita do seu óculos, por favor? Se tiver receitas antigas guardadas, pode me mandar também. Elas podem ajudar a comparar o seu grau atual com os anteriores." [cite: 166]
[cite_start]Mensagem 2 - Conferência do tempo de uso: "Estou vendo que você recebeu seus óculos há X dias. Desde então, você tem usado todos os dias, tirando apenas para dormir e tomar banho? Você já usava óculos antes desse?" [cite: 168]
[cite_start]Mensagem 3 - Investigar sintomas: "Quais sintomas você está sentindo com os óculos? É visão embaçada, dor de cabeça, tontura?" [cite: 170] [cite_start]"A dificuldade é só para enxergar de longe, só para perto ou para os dois?" [cite: 171] [cite_start]"Se você movimentar o óculos um pouquinho para cima ou para baixo, a visão melhora?" [cite: 172]
[cite_start]Mensagem 4 - Solicitar foto com óculos no rosto: "Pode me enviar uma foto sua usando os óculos? A câmera precisa ficar de frente, alinhada com os seus olhos. Isso vai me ajudar a ver se está tudo certo com a posição do óculos." [cite: 174]
[cite_start]Mensagem 5 - Explicação sobre adaptação: "Os óculos novos precisam de um tempo para o olho se acostumar. Esse período pode levar até 30 dias. Nesse tempo, use todos os dias, tirando só para dormir e tomar banho. Se depois desse período você ainda sentir dificuldade, pode me procurar novamente que vamos verificar juntos." [cite: 176]
[cite_start]Mensagem 6-Se o problema continuar após 30 dias: "Entendi. Para darmos continuidade, vou pedir que você envie seus óculos para o nosso laboratório. Assim conseguimos conferir se as lentes foram feitas exatamente conforme a receita e se todas as medidas estão corretas. Caso seja identificado algum erro, fazemos a troca e enviamos novamente para você. Se estiver tudo certo, podemos orientar sobre os próximos passos para melhorar sua adaptação." [cite: 178, 179]
[cite_start]Mensagem 7 - Garantia: "Só lembrando que a garantia do laboratório é de 90 dias a partir da entrega do óculos. Após esse prazo, infelizmente não conseguimos acionar a garantia." [cite: 181]

### [cite_start]Fluxo de Atendimento - Óculos quebrou ou mareou [cite: 182]

[cite_start]Mensagem 1-Apresentação e pedido inicial: "Olá, bom dia! Aqui é a Lhorrane e vou te ajudar. Para entendermos direitinho, pode me enviar uma foto do seu comprovante de entrega e também do óculos, por favor?" [cite: 185]
[cite_start]Mensagem 2 - Conferir informações: "Obrigado pelas fotos! Você lembra quando o óculos quebrou/mareou? Foi durante o uso normal ou aconteceu algum acidente (por exemplo, caiu, sentou em cima, puxou a perninha)?" [cite: 187]
[cite_start]Mensagem 3 - Explicação sobre garantia (até 3 meses): "Estou vendo aqui que o óculos tem menos de 3 meses. Nesse caso, se a quebra foi causada pela pressão da lente (geralmente acontece nas quinas da armação), a garantia cobre a troca da armação. Você tem duas opções:" [cite: 189]
[cite_start]"1 Enviar o óculos pelo correio. Nós fazemos a troca da armação e reembolsamos o valor do envio via Pix. Se tivermos a mesma armação em estoque, trocamos por uma igual. Se não, adaptamos em outra bem parecida." [cite: 190, 191]
[cite_start]"2 Receber o valor da armação de volta via Pix (R$ 47,00)." [cite: 192]
[cite_start]Mensagem 4 - Caso tenha mais de 3 meses ou seja mau uso: "Nesse caso, como já passou de 3 meses ou se a quebra foi por mau uso (por exemplo: perninha entortada, armação empenada ou forçada), a garantia de fábrica não cobre. Mas para te ajudar, podemos vender a armação pelo mesmo valor de custo: R$ 47,00. O envio do óculos pelo correio ficaria por sua conta." [cite: 194]
[cite_start]Mensagem 5 - Encerramento cordial: "Você prefere que eu te envie as instruções para mandar o óculos pelos Correios, ou prefere a devolução do valor da armação via Pix? Assim já agilizamos para você." [cite: 196]

### [cite_start]Fluxo de Atendimento - Não fui buscar meu óculos no dia da entrega [cite: 197]

[cite_start]Mensagem 1-Apresentação e pedido inicial: "Olá, bom dia! Aqui é a ATENDENTE e vou te ajudar. Para localizar seu pedido, pode me enviar uma foto do comprovante do óculos e me dizer de qual cidade você é, por favor?" [cite: 199]
[cite_start]Mensagem 2 - Informar como funciona o envio: "Fulano, conforme combinado no atendimento, a entrega foi realizada no dia X. Como você não conseguiu comparecer, o óculos retornou para o laboratório. Nesse caso, fazemos o envio pelo correio após o pagamento do valor restante do óculos + a taxa de frete de R$ 33,00. Após o pagamento, é só me enviar o comprovante aqui para darmos continuidade." [cite: 201] [cite_start]"O pagamento do valor restante pode ser efetuado via pix?" [cite: 202]
[cite_start]Mensagem 3 - Enviar dados de pagamento: "Segue os dados para pagamento:" [cite: 204] [cite_start]"PIX (CPF): 704.727.681-58- Ketlen Priscila Batista Soares Ribeiro" [cite: 205]
[cite_start]Mensagem 4 - Solicitar comprovante e endereço: "Após o pagamento, me envie o comprovante por aqui. Em seguida, vou precisar do seu endereço completo (Rua, número, bairro, cidade e CEP) para o envio do óculos." [cite: 207]
[cite_start]Mensagem 5 - Após envio do óculos: "O seu óculos já foi postado! Aqui está o código de rastreio para que você acompanhe: XXXXXXX. Qualquer dúvida pode falar comigo por aqui" [cite: 209]

### [cite_start]Orientações para envio do óculos ao laboratório (quando o cliente precisa enviar para nós) [cite: 210, 211]

[cite_start]"Fulano, você vai enviar o óculos para o nosso endereço:" [cite: 212] [cite_start]"Rua General Mendes Pereira, nº 345 - Bairro Ponto Central - Feira de Santana ВА - СЕР 44075-355- Destinatário: Ketlen Ribeiro" [cite: 213]
[cite_start]"Nós reembolsaremos o valor do frete. Mas peço que siga algumas orientações para não pagar taxas desnecessárias:" [cite: 214]
[cite_start]"1. A embalagem pode ser feita em casa mesmo: use uma caixa pequena ou material firme. Coloque o óculos dentro da bolsinha, bem protegido, e inclua os papéis (comprovantes e receitas)." [cite: 215, 216]
[cite_start]"2. No Correio, não peça o aviso de recebimento, pois ele gera uma taxa extra. O comprovante já terá o código de rastreio." [cite: 217, 218]
[cite_start]"3. Quando perguntarem o valor do produto, declare R$ 300,00. Esse valor serve apenas para cálculo do seguro, e nós já garantimos a proteção do óculos. Não precisa declarar valor maior." [cite: 219, 220, 221]
[cite_start]"4. Reembolsamos apenas a taxa de frete + seguro. Não reembolsamos caixa vendida pelo Correio nem taxa de aviso de recebimento. Seguindo essas orientações, o valor médio do envio fica em R$ 33,00." [cite: 222, 223]
[cite_start]"Seguindo esses passos, você garante o envio seguro sem pagar nada a mais. Ficou alguma dúvida quanto ao envio?" [cite: 224]
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contexto = searchParams.get('contexto');

  if (contexto === 'mavi') {
    // Retorna o conteúdo do PDF hardcoded
    return NextResponse.json({ knowledgeText: KNOWLEDGE_BASE_MAVI });
  }

  // Se o contexto não for 'mavi' ou não for fornecido
  return NextResponse.json(
    { error: "Parâmetro 'contexto=mavi' é obrigatório." },
    { status: 400 }
  );
}