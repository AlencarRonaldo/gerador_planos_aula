import { GoogleGenerativeAI } from "@google/generative-ai";
import PizZip from "pizzip";

/**
 * Chama a API do Gemini com tratamento de erro e modelo estável.
 */
export async function callGemini(lessons: any[], apiKey: string) {
  const finalKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
  if (!finalKey) {
    throw new Error("Chave de API do Gemini não configurada.");
  }

  const genAI = new GoogleGenerativeAI(finalKey);
  // gemini-1.5-flash é a versão estável recomendada
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const context = lessons.map((l, i) => 
    `Aula ${i+1}: Tema="${l.titulo_aula || l.titulo}", Objetivo="${l.objetivo || l.obj}", Habilidades="${l.habilidades_tecnicas || l.hab}"`
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

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Limpeza básica para garantir texto plano
    return text.replace(/\*/g, '').trim();
  } catch (error: any) {
    console.error("Erro Gemini:", error);
    throw new Error(`IA Indisponível: ${error.message}`);
  }
}

/**
 * Motor de manipulação de Word (Replica a lógica do Python em JS).
 * Busca strings específicas no XML do Word e injeta os valores.
 */
export async function fillWordTemplate(templateBuffer: ArrayBuffer, data: any) {
  const zip = new PizZip(templateBuffer);
  let xmlContent = zip.file("word/document.xml")?.asText();

  if (!xmlContent) throw new Error("Documento Word inválido.");

  // Função para substituir texto preservando a estrutura XML básica do Word
  // O Word costuma quebrar palavras com tags <w:t>, essa é uma versão simplificada
  const replaceText = (xml: string, search: string, value: string) => {
    // Regex para encontrar o texto mesmo que o Word tenha quebrado as tags
    // Nota: Esta é uma solução de compromisso. Para templates complexos, 
    // recomenda-se o uso de bibliotecas de alto nível ou tags {tag}.
    return xml.split(search).join(`${search}${value}`);
  };

  // Mapeamento de campos igual ao Python
  const fields = [
    { search: "ESCOLA: ", val: data.escola },
    { search: "PROFESSOR(A): ", val: data.professor },
    { search: "COMPONENTE CURRICULAR: ", val: data.componente },
    { search: "ANO/SÉRIE: ", val: data.turma },
    { search: "BIMESTRE: ", val: String(data.bimestre) },
    { search: "AULA NO ES: ", val: `Semana ${data.semana} (${data.natureza || 'Teórica/Prática'})` },
    { search: "APRENDIZAGEM ESSENCIAL:", val: `\n${data.tema || ''}` },
    { search: "OBJETIVO DA AULA:", val: `\n${data.objetivos || ''}` },
    { search: "DESENVOLVIMENTO", val: `\n\n${data.desenvolvimento || ''}` }
  ];

  fields.forEach(f => {
    if (f.val) xmlContent = replaceText(xmlContent!, f.search, f.val);
  });

  zip.file("word/document.xml", xmlContent);

  return zip.generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export function gerarNomeArquivo(anoSerie: string, weekNum: number, componente: string) {
  const safeComp = componente.substring(0, 30).replace(/[/\\?%*:|"<>]/g, '-');
  return `${anoSerie} - Sem${String(weekNum).padStart(2, '0')} - Plano-de-Aula - ${safeComp}.docx`;
}
