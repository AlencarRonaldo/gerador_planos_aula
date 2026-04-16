# Material de Referência (RAG Inline) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar campo opcional de upload de PDF/TXT no Passo 2 do gerador para que a IA baseie o conteúdo das aulas exclusivamente no documento enviado.

**Architecture:** O arquivo é lido no frontend (base64 para PDF, texto puro para TXT) e enviado junto com os dados das aulas para `/api/gerar`. A API repassa o documento ao Gemini como `inlineData` multimodal quando presente. Sem referência, o fluxo permanece idêntico ao atual.

**Tech Stack:** Next.js 14 App Router, React `useState`, `FileReader`/`File.arrayBuffer()`, `@google/generative-ai` SDK (já instalado), componente `FileUpload` existente em `sapa-web/components/file-upload.tsx`.

---

## Mapa de arquivos

| Arquivo | Ação | O que muda |
|---|---|---|
| `sapa-web/app/gerador/page.tsx` | Modificar | Novo estado `refFile`, terceiro `FileUpload` no Passo 2, badge no Passo 4, lógica de leitura em `handleGenerateDrafts`, payload atualizado |
| `sapa-web/app/api/gerar/route.ts` | Modificar | Aceita `refBase64`/`refMimeType`/`refText`, constrói `contents` com ou sem `inlineData`, prompt condicional |

**Novos arquivos:** nenhum. **Novas dependências:** nenhuma.

---

## Task 1: Adicionar estado `refFile` em gerador/page.tsx

**Files:**
- Modify: `sapa-web/app/gerador/page.tsx:44-55` (bloco de estados de arquivo)

- [ ] **Step 1: Adicionar estado após `wordFile`**

Localize o bloco:
```tsx
const [excelFile, setExcelFile] = useState<File | null>(null)
const [wordFile, setWordFile] = useState<File | null>(null)
```

Adicione logo abaixo:
```tsx
const [refFile, setRefFile] = useState<File | null>(null)
```

- [ ] **Step 2: Verificar compilação**

```bash
cd "sapa-web" && npx tsc --noEmit
```
Esperado: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add sapa-web/app/gerador/page.tsx
git commit -m "feat: add refFile state for reference document upload"
```

---

## Task 2: Adicionar card de upload no Passo 2

**Files:**
- Modify: `sapa-web/app/gerador/page.tsx:326-334` (bloco `{step === 2}`)

- [ ] **Step 1: Atualizar o grid para 1 coluna em mobile / 3 em desktop**

Localize:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FileUpload label="Escopo" description=".xlsx" accept={{'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx']}} file={excelFile} onFileSelect={setExcelFile} color="indigo" />
  <FileUpload label="Modelo" description=".docx" accept={{'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx']}} file={wordFile} onFileSelect={setWordFile} color="amber" />
</div>
```

Substitua por:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <FileUpload label="Escopo" description=".xlsx" accept={{'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx']}} file={excelFile} onFileSelect={setExcelFile} color="indigo" />
  <FileUpload label="Modelo" description=".docx" accept={{'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx']}} file={wordFile} onFileSelect={setWordFile} color="amber" />
  <div className="relative">
    <FileUpload
      label="Referência"
      description="PDF ou TXT · opcional"
      accept={{'application/pdf':['.pdf'],'text/plain':['.txt']}}
      file={refFile}
      onFileSelect={setRefFile}
      color="indigo"
    />
    {!refFile && (
      <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
        opcional
      </span>
    )}
  </div>
</div>
```

- [ ] **Step 2: Verificar no browser**

Iniciar dev server:
```bash
cd sapa-web && npm run dev
```
Navegar para `http://localhost:3000/gerador`.
Avançar para o Passo 2.
Verificar: três cards aparecem na mesma linha em desktop, empilhados em mobile.
Verificar: badge "opcional" aparece no terceiro card quando vazio.
Verificar: botão "Continuar" funciona mesmo sem o terceiro arquivo.

- [ ] **Step 3: Commit**

```bash
git add sapa-web/app/gerador/page.tsx
git commit -m "feat: add optional reference file upload card in step 2"
```

---

## Task 3: Adicionar badge "Referência ativa" no Passo 4

**Files:**
- Modify: `sapa-web/app/gerador/page.tsx:360-370` (bloco `{step === 4}`)

- [ ] **Step 1: Adicionar badge condicional abaixo do parágrafo descritivo**

Localize o parágrafo:
```tsx
<p className="text-slate-500 text-sm mb-10 max-w-sm font-medium leading-relaxed text-center">A IA criará um rascunho de todas as aulas selecionadas. Você poderá revisá-las e alterá-las antes de gastar seus créditos.</p>
```

Adicione logo após o fechamento do `<p>`:
```tsx
{refFile && (
  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 mb-6">
    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
      Referência ativa: {refFile.name}
    </span>
  </div>
)}
```

- [ ] **Step 2: Verificar no browser**

Upload um PDF no Passo 2, avançar até o Passo 4.
Verificar: badge verde com nome do arquivo aparece acima do botão "Escrever Rascunhos".
Verificar: sem arquivo de referência, badge não aparece.

- [ ] **Step 3: Commit**

```bash
git add sapa-web/app/gerador/page.tsx
git commit -m "feat: show reference active badge on generation step"
```

---

## Task 4: Ler e enviar o arquivo de referência na geração

**Files:**
- Modify: `sapa-web/app/gerador/page.tsx:145-186` (função `handleGenerateDrafts`)

- [ ] **Step 1: Adicionar leitura do arquivo antes do loop de semanas**

Localize o início de `handleGenerateDrafts`:
```tsx
const handleGenerateDrafts = async () => {
  if (creditosAtuais < selectedWeeks.length) {
    alert(`Saldo insuficiente. Você precisa de ${selectedWeeks.length} créditos, mas possui ${creditosAtuais}.`)
    return
  }

  setIsGenerating(true)
  try {
    const newDrafts: Record<number, any> = {}
```

Substitua por:
```tsx
const handleGenerateDrafts = async () => {
  if (creditosAtuais < selectedWeeks.length) {
    alert(`Saldo insuficiente. Você precisa de ${selectedWeeks.length} créditos, mas possui ${creditosAtuais}.`)
    return
  }

  // Ler o arquivo de referência uma vez, reutilizar em todo o loop
  let refBase64: string | undefined
  let refMimeType: string | undefined
  let refText: string | undefined

  setIsGenerating(true)

  if (refFile) {
    if (refFile.type === 'text/plain') {
      refText = await refFile.text()
    } else {
      if (refFile.size > 15 * 1024 * 1024) {
        setIsGenerating(false)
        alert('Arquivo de referência muito grande. Limite: 15MB.')
        return
      }
      const buffer = await refFile.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      refBase64 = btoa(binary)
      refMimeType = refFile.type
    }
  }

  try {
    const newDrafts: Record<number, any> = {}
```

- [ ] **Step 2: Atualizar o `fetch` dentro do loop para incluir os novos campos**

Localize:
```tsx
const response = await fetch('/api/gerar', {
  method: 'POST',
  body: JSON.stringify({ lessons: weekLessons })
})
```

Substitua por:
```tsx
const response = await fetch('/api/gerar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ lessons: weekLessons, refBase64, refMimeType, refText })
})
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd sapa-web && npx tsc --noEmit
```
Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add sapa-web/app/gerador/page.tsx
git commit -m "feat: read reference file and pass to API in generation request"
```

---

## Task 5: Atualizar /api/gerar/route.ts para inline data

**Files:**
- Modify: `sapa-web/app/api/gerar/route.ts`

- [ ] **Step 1: Aceitar os novos campos e construir `contents` condicionalmente**

O arquivo atual é pequeno (63 linhas). Substitua o conteúdo completo por:

```ts
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
    // Nota: quando há inlineData, todos os parts devem ser objetos Part — nunca string pura
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd sapa-web && npx tsc --noEmit
```
Esperado: sem erros.

- [ ] **Step 3: Teste manual — sem referência**

1. Abrir `http://localhost:3000/gerador`
2. Preencher Passo 1, avançar
3. Subir apenas Excel e Word (sem referência), avançar
4. Configurar componente/bimestre/semana, avançar
5. Clicar "Escrever Rascunhos"
6. Verificar: geração funciona normalmente, sem erros no console

- [ ] **Step 4: Teste manual — com PDF**

1. Repetir fluxo, desta vez subindo um PDF de ementa no Passo 2
2. Verificar: badge "Referência ativa" aparece no Passo 4
3. Clicar "Escrever Rascunhos"
4. Verificar: conteúdo gerado faz referência ao material enviado
5. Verificar no console do servidor: sem erros

- [ ] **Step 5: Teste manual — com TXT**

1. Repetir com um arquivo `.txt` contendo texto de ementa
2. Verificar: fluxo funciona, conteúdo reflete o TXT

- [ ] **Step 6: Teste multi-semana com PDF**

1. Selecionar 3 semanas no Passo 3 com um PDF de referência no Passo 2
2. Clicar "Escrever Rascunhos"
3. Verificar: todas as 3 semanas são geradas (nenhuma falha de API)
4. Verificar: o conteúdo das 3 semanas reflete o mesmo documento de referência
5. Verificar no console do servidor: 3 chamadas ao Gemini com sucesso (o PDF não é relido a cada iteração do loop)

- [ ] **Step 7: Teste de limite — PDF > 15MB**

1. Tentar subir um PDF acima de 15MB
2. Verificar: spinner aparece brevemente, depois alert "Arquivo de referência muito grande. Limite: 15MB." e geração para

- [ ] **Step 8: Commit final**

```bash
git add sapa-web/app/api/gerar/route.ts
git commit -m "feat: support PDF/TXT inline reference in Gemini generation API"
```

---

## Verificação final end-to-end

- [ ] Fluxo completo sem referência: idêntico ao antes (sem regressão)
- [ ] Fluxo completo com PDF: badge ativo, conteúdo fiel ao documento
- [ ] Fluxo completo com TXT: funciona, conteúdo fiel ao texto
- [ ] PDF > 15MB: bloqueado com mensagem clara
- [ ] Build de produção sem erros: `cd sapa-web && npm run build`
