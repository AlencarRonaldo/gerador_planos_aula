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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const context = lessons.map((l: any, i: number) => 
      `Aula ${i+1}: Tema="${l.titulo || l.titulo_aula}", Objetivo="${l.obj || l.objetivo}", Habilidades="${l.hab || l.habilidades_tecnicas}"`
    ).join("\n");

    const prompt = `
      Você é um assistente pedagógico especializado. Com base nas aulas abaixo de uma mesma semana:
      ${context}

      Crie um plano de aula detalhado com as seguintes seções (USE APENAS TEXTO PLANO, SEM MARKDOWN, SEM ASTERISCOS):

      ABERTURA: (Contextualização e motivação inicial)
      DESENVOLVIMENTO: (Passo a passo detalhado das atividades da semana)
      FECHAMENTO: (Sintese e verificação)

      Foque em metodologias ativas e clareza para o professor.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return NextResponse.json({ content: text.replace(/\*/g, '').trim() });
  } catch (error: any) {
    console.error("Erro na API de geração:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
