import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { lessons, apiKey, refBase64, refMimeType, refText } = body

    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json({ error: "Nenhuma aula informada." }, { status: 400 });
    }

    const finalKey = process.env.GEMINI_API_KEY || "AIzaSyA0qkT71Y-uwh6J1y99TqnWmmPRpewglHo";

    console.log("[GERAR] Recebendo requisição, lessons:", lessons?.length)
    console.log("[GERAR] API Key disponível:", !!finalKey)

    if (!finalKey) {
      console.error("[GERAR] API Key não encontrada")
      return NextResponse.json({ error: "Chave de API não configurada no servidor." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(finalKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const context = lessons.map((l: any, i: number) =>
      `Aula ${i+1}: Tema="${l.titulo || l.titulo_aula}", Objetivo="${l.obj || l.objetivo}", Habilidades="${l.hab || l.habilidades_tecnicas}"`
    ).join("\n");

    const hasRef = !!(refBase64 || refText)

    const refInstruction = hasRef
      ? `\nMATERIAL DE REFERÊNCIA OBRIGATÓRIO:\nO documento fornecido é a ementa/material oficial desta disciplina.\nBaseie TODO o conteúdo EXCLUSIVAMENTE neste documento.\nNão invente conteúdos que não estejam presentes nele.\n`
      : ""

    const promptText = `Você é um Coordenador Pedagógico e Professor Expert em Educação Profissional Técnica.
Sua tarefa é elaborar um plano de aula para o componente: ${lessons[0].componente || 'Técnico'}.
${refInstruction}

ESTRUTURA PEDAGÓGICA OBRIGATÓRIA (Padrão Nova Escola):
Para CADA aula de 50 minutos, siga rigorosamente:

1. INTRODUÇÃO E ACOLHIMENTO (10 min):
   - Proponha uma pergunta disparadora sobre o tema.
   - Conexão com o objetivo: ${lessons[0].obj || lessons[0].objetivo || 'Aplicação profissional'}

2. DESENVOLVIMENTO E PRÁTICA (30 min):
   - Contextualização: Apresente um problema do mundo real relacionado ao tema.
   - Mão na Massa: Atividade prática onde o aluno PRODUZ algo (código, cálculo, projeto, etc).
   - Inclua instruções passo a passo.

3. FECHAMENTO E SISTEMATIZAÇÃO (10 min):
   - Avaliação formativa rápida (ex: Ticket de Saída, quiz rápido).
   - Síntese dos conceitos trabalhados.

REGRAS DE OURO:
- Cada seção DEVE ter a duração indicada.
- NÃO use frases genéricas como "o professor explicará o conteúdo".
- Em vez disso, diga: "O professor demonstra no [recurso] como..."
- Seja ultra-específico nos passos da atividade prática.
- Mencione qual recurso usar: computador, lousa, projetor, etc.

REFERÊNCIA PEDAGÓGICA: BNCC, Metodologias Ativas (PBL, Cooperativa) e Contexto Profissional.

DADOS DA SEMANA:
- Tema: ${lessons[0].tema || 'Conforme cronograma'}
- Habilidades: ${lessons[0].hab || lessons[0].habilidades_tecnicas || ''}
- Aulas: ${lessons.length} aulas de 50 min.

AULAS PARA DESENVOLVER:
${context}
${refText ? `\nCONTEÚDO DE REFERÊNCIA (TXT):\n${refText}\n` : ""}
---
TAREFA: Gere o conteúdo dividido em 3 seções claras usando estas tags exatas:

<DESENVOLVIMENTO>
(Para cada aula, escreva as 3 etapas acima com tempos específicos. Use apenas texto puro, sem markdown.)
</DESENVOLVIMENTO>

<AEE>
(Sugestões de adaptação para alunos com necessidades especiais (AEE) de forma integrada a este conteúdo técnico. Texto puro.)
</AEE>

<EXERCICIOS>
(Crie uma lista de 3 a 5 exercícios práticos ou teóricos com gabarito ao final. Texto puro.)
</EXERCICIOS>

REGRAS:
- NÃO use markdown (sem **, sem #).
- Seja específico e profissional.
- Mencione o uso dos recursos (computador, lousa, etc.).`;

    // Constrói o array de parts: PDF inline (se presente) + prompt
    const parts: any[] = []
    if (refBase64 && refMimeType) {
      parts.push({ inlineData: { data: refBase64, mimeType: refMimeType } })
    }
    parts.push({ text: promptText })

    try {
      const result = await model.generateContent(parts);
      const text = result.response.text();
      console.log("[GERAR] Sucesso! Texto gerado:", text?.substring(0, 100))
      return NextResponse.json({ content: text.trim() });
    } catch (genError: any) {
      console.error("[GERAR] Erro na geração:", genError.message || genError)
      return NextResponse.json({ error: "Erro ao gerar conteúdo: " + (genError.message || genError) }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Erro na API de geração:", error);
    const errorMessage = error.message?.includes('api') 
      ? "Erro na configuração da API. Entre em contato com o suporte."
      : error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
