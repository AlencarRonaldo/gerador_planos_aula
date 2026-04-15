import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lessons, apiKey } = await req.json();
    
    // Prioriza a chave vinda do ambiente (SaaS) ou permite a do usuário (fallback)
    const finalKey = process.env.GEMINI_API_KEY || apiKey;
    
    if (!finalKey) {
      return NextResponse.json({ error: "Chave de API não configurada no servidor." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(finalKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const context = lessons.map((l: any, i: number) => 
      `Aula ${i+1}: Tema="${l.titulo || l.titulo_aula}", Objetivo="${l.obj || l.objetivo}", Habilidades="${l.hab || l.habilidades_tecnicas}"`
    ).join("\n");

    const prompt = `Você é um Coordenador Pedagógico e Professor Expert em Educação Profissional Técnica.
Sua tarefa é elaborar o conteúdo para o componente: ${lessons[0].componente || 'Técnico'}.

REFERÊNCIA PEDAGÓGICA: BNCC, Metodologias Ativas (PBL, Cooperativa) e Contexto Profissional.
RECURSOS: Computadores, Lousa, Material Digital, Projetor.

DADOS DA SEMANA:
- Tema: ${lessons[0].tema || 'Conforme cronograma'}
- Aulas: ${lessons.length} aulas de 50 min.

AULAS PARA DESENVOLVER:
${context}

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

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return NextResponse.json({ content: text.trim() });
  } catch (error: any) {
    console.error("Erro na API de geração:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
