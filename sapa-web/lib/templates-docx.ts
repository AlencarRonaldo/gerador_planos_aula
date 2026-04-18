import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertMillimetersToTwip,
  ShadingType,
} from "docx";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface LessonData {
  escola: string;
  professor: string;
  turma: string;
  componente: string;
  bimestre: number;
  semana: number;
  tema: string;
  objetivos: string;
  natureza: string;
  desenvolvimento: string;
  aee?: string;
  exercicios?: string;
}

export type TemplateId = "classico" | "contemporaneo" | "minimalista";

export interface TemplateInfo {
  id: TemplateId;
  nome: string;
  descricao: string;
  preview: string;
  previewAlt: string;
}

export const TEMPLATES_INFO: TemplateInfo[] = [
  {
    id: "classico",
    nome: "Clássico BNCC",
    descricao: "Layout institucional com cabeçalho colorido, tabela estruturada e campos separados por seção — padrão BNCC.",
    preview: "#1E3A5F",
    previewAlt: "#4A90D9",
  },
  {
    id: "contemporaneo",
    nome: "Contemporâneo",
    descricao: "Design moderno com faixa de destaque, tipografia clara e organização visual por blocos coloridos.",
    preview: "#C4622D",
    previewAlt: "#F2EEE6",
  },
  {
    id: "minimalista",
    nome: "Minimalista",
    descricao: "Formato limpo e objetivo com bordas sutis, ideal para leitura rápida e impressão econômica.",
    preview: "#2D2D2D",
    previewAlt: "#F5F5F5",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
  insideHorizontal: noBorder,
  insideVertical: noBorder,
};

function hoje(): string {
  return new Date().toLocaleDateString("pt-BR");
}

function emptyPara(): Paragraph {
  return new Paragraph({ children: [] });
}

function splitLines(text: string): Paragraph[] {
  if (!text?.trim()) return [emptyPara()];
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map(
      (l) =>
        new Paragraph({
          children: [new TextRun({ text: l.trim(), size: 18 })],
          spacing: { before: 40, after: 40 },
        })
    );
}

// ─── Template 1: Clássico BNCC ───────────────────────────────────────────────

function templateClassico(data: LessonData): Document {
  const AZUL = "1E3A5F";
  const AZUL_CLARO = "4A90D9";
  const CINZA = "F0F4F8";
  const BORDA = "B0C4D8";

  const borda = {
    top: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
    left: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
    right: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
  };

  function cell(text: string, label: string, span = 1, shade = "FFFFFF"): TableCell {
    return new TableCell({
      columnSpan: span,
      shading: { type: ShadingType.SOLID, fill: shade, color: shade },
      children: [
        new Paragraph({
          spacing: { before: 80, after: 80 },
          indent: { left: 120 },
          children: [
            new TextRun({ text: label, bold: true, size: 18, color: AZUL }),
            new TextRun({ text, size: 18 }),
          ],
        }),
      ],
    });
  }

  function secao(titulo: string, linhas: Paragraph[], corFundo = AZUL_CLARO): Table {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
        left: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
        right: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
        insideHorizontal: noBorder,
        insideVertical: noBorder,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.SOLID, fill: corFundo, color: corFundo },
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  indent: { left: 120 },
                  children: [new TextRun({ text: titulo.toUpperCase(), bold: true, size: 18, color: "FFFFFF" })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: linhas,
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
            }),
          ],
        }),
      ],
    });
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
            margin: { top: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20), bottom: convertMillimetersToTwip(20), left: convertMillimetersToTwip(25) },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `Aula360 · Gerado em ${hoje()}`, size: 14, color: "999999", italics: true })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "Documento gerado pelo Aula360 — IA para Educadores", size: 14, color: "999999", italics: true })],
              }),
            ],
          }),
        },
        children: [
          // Cabeçalho azul
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borda,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 4,
                    shading: { type: ShadingType.SOLID, fill: AZUL, color: AZUL },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 120, after: 60 },
                        children: [new TextRun({ text: "PLANO DE AULA", bold: true, size: 32, color: "FFFFFF" })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 80 },
                        children: [new TextRun({ text: "Educação Profissional — Padrão BNCC", size: 16, color: "AACCEE", italics: true })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  cell(data.escola, "ESCOLA: ", 2, CINZA),
                  cell(data.professor, "PROFESSOR(A): ", 2, CINZA),
                ],
              }),
              new TableRow({
                children: [
                  cell(data.componente, "COMPONENTE: "),
                  cell(data.turma, "TURMA: "),
                  cell(String(data.bimestre) + "º", "BIMESTRE: "),
                  cell(hoje(), "DATA: "),
                ],
              }),
              new TableRow({
                children: [
                  cell(String(data.semana), "SEMANA Nº: ", 2, CINZA),
                  cell(data.natureza || "Teórica/Prática", "NATUREZA: ", 2, CINZA),
                ],
              }),
            ],
          }),
          emptyPara(),
          secao("Aprendizagem Essencial / Tema", splitLines(data.tema), AZUL_CLARO),
          emptyPara(),
          secao("Objetivo(s) da Aula", splitLines(data.objetivos), AZUL_CLARO),
          emptyPara(),
          secao("Desenvolvimento da Aula", splitLines(data.desenvolvimento), AZUL),
          emptyPara(),
          ...(data.aee?.trim() ? [secao("Adaptação AEE", splitLines(data.aee), "5A7A5A"), emptyPara()] : []),
          ...(data.exercicios?.trim() ? [secao("Exercícios / Atividades", splitLines(data.exercicios), "7A5A7A"), emptyPara()] : []),
        ],
      },
    ],
  });
}

// ─── Template 2: Contemporâneo ───────────────────────────────────────────────

function templateContemporaneo(data: LessonData): Document {
  const TERRA = "C4622D";
  const TERRA_LIGHT = "F2EEE6";
  const GRAPHITE = "1C1917";

  function bloco(titulo: string, linhas: Paragraph[]): (Paragraph | Table)[] {
    return [
      new Paragraph({
        spacing: { before: 280, after: 80 },
        children: [
          new TextRun({ text: "▌ ", bold: true, size: 22, color: TERRA }),
          new TextRun({ text: titulo.toUpperCase(), bold: true, size: 18, color: GRAPHITE }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: "E8E0D4" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "E8E0D4" },
          left: { style: BorderStyle.THICK, size: 12, color: TERRA },
          right: noBorder,
          insideHorizontal: noBorder,
          insideVertical: noBorder,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { type: ShadingType.SOLID, fill: TERRA_LIGHT, color: TERRA_LIGHT },
                children: linhas,
                margins: { top: 80, bottom: 80, left: 160, right: 160 },
              }),
            ],
          }),
        ],
      }),
    ];
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
            margin: { top: convertMillimetersToTwip(15), right: convertMillimetersToTwip(20), bottom: convertMillimetersToTwip(20), left: convertMillimetersToTwip(20) },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: noBorder,
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: TERRA },
                  left: noBorder,
                  right: noBorder,
                  insideHorizontal: noBorder,
                  insideVertical: noBorder,
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        shading: { type: ShadingType.SOLID, fill: TERRA, color: TERRA },
                        children: [
                          new Paragraph({
                            spacing: { before: 120, after: 120 },
                            indent: { left: 200 },
                            children: [new TextRun({ text: "PLANO DE AULA", bold: true, size: 28, color: "FFFFFF" })],
                          }),
                        ],
                      }),
                      new TableCell({
                        shading: { type: ShadingType.SOLID, fill: TERRA, color: TERRA },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            indent: { right: 200 },
                            children: [
                              new TextRun({ text: `Semana ${data.semana}  ·  ${data.bimestre}º Bimestre`, size: 18, color: "FFDDCC", bold: true }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `Aula360 — ${data.escola} · ${hoje()}`, size: 14, color: "AAAAAA", italics: true })],
              }),
            ],
          }),
        },
        children: [
          // Ficha de identificação
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "E8E0D4" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "E8E0D4" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "E8E0D4" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "E8E0D4" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E8E0D4" },
              insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E8E0D4" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 2,
                    shading: { type: ShadingType.SOLID, fill: "F8F4EF", color: "F8F4EF" },
                    children: [new Paragraph({ spacing: { before: 80, after: 80 }, indent: { left: 120 }, children: [new TextRun({ text: "Escola: ", bold: true, size: 18, color: TERRA }), new TextRun({ text: data.escola, size: 18, color: GRAPHITE })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.SOLID, fill: "F8F4EF", color: "F8F4EF" },
                    children: [new Paragraph({ spacing: { before: 80, after: 80 }, indent: { left: 120 }, children: [new TextRun({ text: "Turma: ", bold: true, size: 18, color: TERRA }), new TextRun({ text: data.turma, size: 18, color: GRAPHITE })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 2,
                    shading: { type: ShadingType.SOLID, fill: "F8F4EF", color: "F8F4EF" },
                    children: [new Paragraph({ spacing: { before: 80, after: 80 }, indent: { left: 120 }, children: [new TextRun({ text: "Professor(a): ", bold: true, size: 18, color: TERRA }), new TextRun({ text: data.professor, size: 18, color: GRAPHITE })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.SOLID, fill: "F8F4EF", color: "F8F4EF" },
                    children: [new Paragraph({ spacing: { before: 80, after: 80 }, indent: { left: 120 }, children: [new TextRun({ text: "Data: ", bold: true, size: 18, color: TERRA }), new TextRun({ text: hoje(), size: 18, color: GRAPHITE })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 3,
                    shading: { type: ShadingType.SOLID, fill: "F8F4EF", color: "F8F4EF" },
                    children: [new Paragraph({ spacing: { before: 80, after: 80 }, indent: { left: 120 }, children: [new TextRun({ text: "Componente Curricular: ", bold: true, size: 18, color: TERRA }), new TextRun({ text: data.componente, size: 18, color: GRAPHITE })] })],
                  }),
                ],
              }),
            ],
          }),
          ...bloco("Aprendizagem Essencial / Tema", splitLines(data.tema)),
          ...bloco("Objetivos da Aula", splitLines(data.objetivos)),
          ...bloco("Desenvolvimento Metodológico", splitLines(data.desenvolvimento)),
          ...(data.aee?.trim() ? bloco("Adaptação AEE", splitLines(data.aee)) : []),
          ...(data.exercicios?.trim() ? bloco("Exercícios e Atividades", splitLines(data.exercicios)) : []),
        ],
      },
    ],
  });
}

// ─── Template 3: Minimalista ─────────────────────────────────────────────────

function templateMinimalista(data: LessonData): Document {
  const GRAPHITE = "1C1917";
  const MUTED = "888888";
  const BORDA = "DDDDDD";
  const FUNDO = "F9F9F9";

  function cabecalhoSec(titulo: string): Paragraph {
    return new Paragraph({
      spacing: { before: 320, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDA } },
      children: [new TextRun({ text: titulo.toUpperCase(), bold: true, size: 20, color: GRAPHITE })],
    });
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
            margin: { top: convertMillimetersToTwip(25), right: convertMillimetersToTwip(25), bottom: convertMillimetersToTwip(25), left: convertMillimetersToTwip(30) },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GRAPHITE } },
                spacing: { after: 0 },
                children: [
                  new TextRun({ text: "PLANO DE AULA", bold: true, size: 24, color: GRAPHITE }),
                  new TextRun({ text: `  ·  Semana ${data.semana}  ·  ${data.bimestre}º Bimestre  ·  ${hoje()}`, size: 16, color: MUTED }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDA } },
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `${data.escola}  ·  Aula360`, size: 14, color: MUTED, italics: true })],
              }),
            ],
          }),
        },
        children: [
          // Identificação em tabela
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
              left: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
              right: { style: BorderStyle.SINGLE, size: 4, color: BORDA },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: BORDA },
              insideVertical: { style: BorderStyle.SINGLE, size: 2, color: BORDA },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.SOLID, fill: FUNDO, color: FUNDO },
                    margins: { top: 80, bottom: 80, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: "Escola: ", bold: true, size: 18, color: GRAPHITE }), new TextRun({ text: data.escola, size: 18 })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.SOLID, fill: FUNDO, color: FUNDO },
                    margins: { top: 80, bottom: 80, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: "Professor(a): ", bold: true, size: 18, color: GRAPHITE }), new TextRun({ text: data.professor, size: 18 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.SOLID, fill: FUNDO, color: FUNDO },
                    margins: { top: 80, bottom: 80, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: "Componente: ", bold: true, size: 18, color: GRAPHITE }), new TextRun({ text: data.componente, size: 18 })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.SOLID, fill: FUNDO, color: FUNDO },
                    margins: { top: 80, bottom: 80, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: "Turma: ", bold: true, size: 18, color: GRAPHITE }), new TextRun({ text: data.turma, size: 18 })] })],
                  }),
                ],
              }),
            ],
          }),

          cabecalhoSec("Tema / Aprendizagem Essencial"),
          ...splitLines(data.tema),

          cabecalhoSec("Objetivos da Aula"),
          ...splitLines(data.objetivos),

          cabecalhoSec("Desenvolvimento"),
          ...splitLines(data.desenvolvimento),

          ...(data.aee?.trim() ? [cabecalhoSec("Adaptação AEE"), ...splitLines(data.aee)] : []),
          ...(data.exercicios?.trim() ? [cabecalhoSec("Exercícios"), ...splitLines(data.exercicios)] : []),
        ],
      },
    ],
  });
}

// ─── Função principal ─────────────────────────────────────────────────────────

export async function gerarComTemplate(templateId: TemplateId, data: LessonData): Promise<Blob> {
  let doc: Document;

  switch (templateId) {
    case "classico":
      doc = templateClassico(data);
      break;
    case "contemporaneo":
      doc = templateContemporaneo(data);
      break;
    case "minimalista":
    default:
      doc = templateMinimalista(data);
  }

  return await Packer.toBlob(doc);
}
