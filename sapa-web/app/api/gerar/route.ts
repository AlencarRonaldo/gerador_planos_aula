import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lessons, apiKey, refBase64, refMimeType, refText } = await req.json();

    const finalKey = process.env.GEMINI_API_KEY || apiKey;

    if (!finalKey) {
      return NextResponse.json({ error: "Chave de API não configurada no servidor." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(finalKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const context = lessons.map((l: any, i: number) =>
      `Aula ${i+1}: Tema="${l.titulo || l.titulo_aula}", Objetivo="${l.obj || l.objetivo}", Habilidades="${l.hab || l.habilidades_tecnicas}"`
    ).join("\n");

    const hasRef = !!(refBase64 || refText)

    const refInstruction = hasRef
      ? `\nMATERIAL DE REFERÊNCIA OBRIGATÓRIO:\nO documento fornecido é a ementa/material oficial desta disciplina.\nBaseie TODO o conteúdo EXCLUSIVAMENTE neste documento.\nNão invente conteúdos que não estejam presentes nele.\n`
      : ""

    const promptText = `Você é um Coordenador Pedagógico e Professor Expert em Educação Profissional Técnica.
Sua tarefa é elaborar o conteúdo para o componente: ${lessons[0].componente || 'Técnico'}.
${refInstruction}
REFERÊNCIA PEDAGÓGICA: BNCC, Metodologias Ativas (PBL, Cooperativa) e Contexto Profissional.
RECURSOS: Computadores, Lousa, Material Digital, Projetor.

DADOS DA SEMANA:
- Tema: ${lessons[0].tema || 'Conforme cronograma'}
- Aulas: ${lessons.length} aulas de 50 min.

AULAS PARA DESENVOLVER:
${context}
${refText ? `\nCONTEÚDO DE REFERÊNCIA (TXT):\n${refText}\n` : ""}
---
TAREFA: Gere o conteúdo dividido em 3 seções claras usando estas tags exatas:

<DESENVOLVIMENTO>
(Para cada aula, escreva Abertura, Desenvolvimento e Fechamento de forma detalhada e didática. Use apenas texto puro, sem markdown.)
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

    const result = await model.generateContent(parts);
    const text = result.response.text();

    return NextResponse.json({ content: text.trim() });
  } catch (error: any) {
    console.error("Erro na API de geração:", error);
    const errorMessage = error.message?.includes('api') 
      ? "Erro na configuração da API. Entre em contato com o suporte."
      : error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
