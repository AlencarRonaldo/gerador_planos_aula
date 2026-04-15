import PizZip from "pizzip";

// --- Helpers XML -----------------------------------------------------------

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Extrai todo o texto visível de um fragmento XML Word */
function getParaText(para: string): string {
  const matches = Array.from(para.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g));
  return matches.map(m => m[1]).join("");
}

/**
 * Normaliza os parágrafos que contêm os nossos labels:
 * une todos os <w:r>...<w:t> em um único run, preservando o <w:pPr>.
 * Isso resolve o problema do Word que quebra texto em múltiplas tags.
 */
function normalizeParagraphs(xml: string, targets: string[]): string {
  return xml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, para => {
    const fullText = getParaText(para);
    if (!targets.some(t => fullText.includes(t))) return para;

    const openTag = para.match(/<w:p\b[^>]*/)?.[0] ?? "<w:p";
    const pPr = para.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0] ?? "";
    const rPr = para.match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] ?? "";

    const safeText = escXml(fullText);
    const normalRun = `<w:r>${rPr}<w:t xml:space="preserve">${safeText}</w:t></w:r>`;
    return `${openTag}>${pPr}${normalRun}</w:p>`;
  });
}

/**
 * Substitui o texto do parágrafo que contém `label`.
 * Mantém o prefixo até (e incluindo) ": " e adiciona o novo valor.
 * Equivalente ao update_field(..., value_in_next_para=False) do Python.
 */
function replaceInlinePara(xml: string, label: string, value: string): string {
  return xml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, para => {
    const fullText = getParaText(para);
    if (!fullText.includes(label)) return para;

    const colonIdx = fullText.indexOf(": ", fullText.indexOf(label));
    const prefix = colonIdx >= 0 ? fullText.slice(0, colonIdx + 2) : label;
    const newText = escXml(prefix + value);

    return para.replace(
      /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/,
      `<w:t xml:space="preserve">${newText}</w:t>`
    );
  });
}

/**
 * Substitui o texto do parágrafo SEGUINTE ao que contém `label`.
 * Equivalente ao update_field(..., value_in_next_para=True) do Python.
 */
function replaceNextPara(xml: string, label: string, value: string): string {
  // Captura pares de parágrafos consecutivos
  return xml.replace(
    /(<w:p\b[^>]*>[\s\S]*?<\/w:p>)(\s*)(<w:p\b[^>]*>[\s\S]*?<\/w:p>)/g,
    (match, p1, ws, p2) => {
      if (!getParaText(p1).includes(label)) return match;

      const openTag = p2.match(/<w:p\b[^>]*/)?.[0] ?? "<w:p";
      const pPr = p2.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0] ?? "";
      const rPr = p2.match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] ?? "";
      const newP2 = `${openTag}>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escXml(value)}</w:t></w:r></w:p>`;
      return p1 + ws + newP2;
    }
  );
}

/**
 * Adiciona parágrafos no final da célula que contém um label específico.
 */
function addToCell(xml: string, label: string, texto: string): string {
  if (!texto) return xml;
  return xml.replace(/<w:tc\b[^>]*>[\s\S]*?<\/w:tc>/g, cell => {
    if (!getParaText(cell).includes(label)) return cell;

    const linhas = texto.trim().split("\n");
    const novosParagrafos = linhas
      .map(linha => {
        const safe = escXml(linha.trim());
        return `<w:p><w:r><w:t xml:space="preserve">${safe}</w:t></w:r></w:p>`;
      })
      .join("");

    return cell.replace("</w:tc>", novosParagrafos + "</w:tc>");
  });
}

function extrairSecoes(texto: string) {
  const parse = (tag: string) => {
    const match = texto.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1].trim() : "";
  };
  const desenv = parse("DESENVOLVIMENTO");
  return {
    desenvolvimento: desenv || texto, // Fallback se não houver tags
    aee: parse("AEE"),
    exercicios: parse("EXERCICIOS")
  };
}

// --- Função principal -------------------------------------------------------

export async function fillWordTemplate(templateBuffer: ArrayBuffer, data: {
  escola: string;
  professor: string;
  turma: string;
  componente: string;
  bimestre: number;
  semana: number;
  tema: string;
  objetivos: string;
  natureza: string;
  desenvolvimento: string; // Agora pode vir com tags ou texto puro
}) {
  const zip = new PizZip(templateBuffer);
  let xml = zip.file("word/document.xml")?.asText();
  if (!xml) throw new Error("Documento Word inválido.");

  const secoes = extrairSecoes(data.desenvolvimento);

  const TARGETS = [
    "ESCOLA", "PROFESSOR", "COMPONENTE", "ANO/S", "BIMESTRE",
    "AULA NO", "APRENDIZAGEM", "HABILIDADE", "CONHECIMENTOS",
    "QUANT.", "OBJETIVO", "DATA DE", "Desenvolvimento:", "ADAPTAÇÃO AEE:"
  ];

  // 1. Normalizar parágrafos
  xml = normalizeParagraphs(xml, TARGETS);

  // 2. Campos inline
  const hoje = new Date().toLocaleDateString("pt-BR");
  const aulaInfo = `Semana ${data.semana} (${data.natureza || "Teórica/Prática"})`;
  const conhecPrevios = `Conteúdos anteriores de ${data.componente}. Unidade: ${data.tema || ""}`;

  xml = replaceInlinePara(xml, "ESCOLA: ",                  data.escola);
  xml = replaceInlinePara(xml, "PROFESSOR(A): ",            data.professor);
  xml = replaceInlinePara(xml, "COMPONENTE CURRICULAR: ",   data.componente);
  xml = replaceInlinePara(xml, "ANO/S",                     data.turma);
  xml = replaceInlinePara(xml, "BIMESTRE: ",                String(data.bimestre));
  xml = replaceInlinePara(xml, "AULA NO ES: ",              aulaInfo);
  xml = replaceInlinePara(xml, "QUANT. DE AULAS PREVISTAS: ", "4");
  xml = replaceInlinePara(xml, "DATA DE ELABORA",           hoje);

  // 3. Campos próximos parágrafos
  xml = replaceNextPara(xml, "APRENDIZAGEM ESSENCIAL:", data.tema);
  xml = replaceNextPara(xml, "HABILIDADE RELACIONADA:",  data.objetivos);
  xml = replaceNextPara(xml, "CONHECIMENTOS PR",         conhecPrevios);
  xml = replaceNextPara(xml, "OBJETIVO DA AULA:",        data.objetivos);

  // 4. Desenvolvimento e AEE
  xml = addToCell(xml, "Desenvolvimento:", secoes.desenvolvimento);
  xml = addToCell(xml, "ADAPTAÇÃO AEE:", secoes.aee);

  // 5. Exercícios como Anexo (Se houver)
  if (secoes.exercicios) {
    const anexoXml = `
      <w:p><w:r><w:br w:type="page"/></w:r></w:p>
      <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>ANEXO: LISTA DE EXERCÍCIOS - SEMANA ${data.semana}</w:t></w:r></w:p>
      ${secoes.exercicios.split("\n").map(l => `<w:p><w:r><w:t xml:space="preserve">${escXml(l.trim())}</w:t></w:r></w:p>`).join("")}
    `;
    xml = xml.replace("</w:body>", `${anexoXml}</w:body>`);
  }

  zip.file("word/document.xml", xml);

  return zip.generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export function gerarNomeArquivo(anoSerie: string, weekNum: number, componente: string) {
  const safeComp = componente.substring(0, 30).replace(/[/\\?%*:|"<>]/g, "-");
  return `${anoSerie} - Sem${String(weekNum).padStart(2, "0")} - Plano-de-Aula - ${safeComp}.docx`;
}
