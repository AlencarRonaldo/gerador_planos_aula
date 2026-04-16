# Design: Material de Referência (RAG Inline com Gemini)

**Data:** 2026-04-15
**Status:** Aprovado
**Escopo:** Adicionar campo opcional de upload de documento (PDF/TXT) no Passo 2 do gerador. O documento é enviado inline ao Gemini para que a IA baseie o conteúdo das aulas exclusivamente nele.

---

## Problema

A IA atualmente gera conteúdo baseado no seu treinamento geral. Professores que possuem ementa oficial, capítulo de livro didático ou material curricular específico não têm como forçar a IA a usar esse conteúdo — ela "inventa" ou generaliza.

## Solução

Upload opcional de um arquivo de referência no Passo 2. O arquivo é lido no cliente, convertido para base64 (PDF) ou texto puro (TXT), e enviado junto com os dados das aulas para `/api/gerar`. O Gemini recebe o documento como parte multimodal inline e é instruído a usar exclusivamente esse conteúdo.

Não há persistência — o arquivo existe apenas na sessão atual do browser.

---

## Arquitetura

### Frontend: `sapa-web/app/gerador/page.tsx`

**Novo estado:**
```ts
const [refFile, setRefFile] = useState<File | null>(null)
```

**Passo 2 — Arquivos Base:**
Terceiro card `<FileUpload>` ao lado de Escopo e Modelo:
- Label: `"Referência"`
- Description: `"PDF ou TXT · opcional"`
- Aceita: `application/pdf`, `text/plain`
- Não bloqueia o botão "Continuar"
- Quando presente: exibe badge `"Referência ativa"` no Passo 4

**Em `handleGenerateDrafts`:**
```ts
let refBase64: string | undefined
let refMimeType: string | undefined
let refText: string | undefined

if (refFile) {
  if (refFile.type === 'text/plain') {
    refText = await refFile.text()
  } else {
    // PDF
    if (refFile.size > 15 * 1024 * 1024) {
      alert('Arquivo de referência muito grande. Limite: 15MB.')
      return
    }
    const buffer = await refFile.arrayBuffer()
    refBase64 = Buffer.from(buffer).toString('base64')  // ou btoa via Uint8Array
    refMimeType = refFile.type
  }
}

// No fetch:
body: JSON.stringify({ lessons: weekLessons, refBase64, refMimeType, refText })
```

O `refBase64`/`refText` é calculado **uma única vez** fora do loop de semanas e reutilizado em todas as chamadas.

---

### Backend: `sapa-web/app/api/gerar/route.ts`

**Desestruturação do body:**
```ts
const { lessons, apiKey, refBase64, refMimeType, refText } = await req.json()
```

**Construção do `contents`:**
```ts
const parts: any[] = []

if (refBase64 && refMimeType) {
  parts.push({ inlineData: { data: refBase64, mimeType: refMimeType } })
}

const promptText = buildPrompt(lessons, !!refBase64 || !!refText, refText)
parts.push(promptText)

const result = await model.generateContent(parts)
```

**Prompt condicional:**
Quando há referência, o prompt inclui a seção:
```
MATERIAL DE REFERÊNCIA OBRIGATÓRIO:
O documento acima é a ementa/material oficial desta disciplina.
Baseie TODO o conteúdo EXCLUSIVAMENTE neste documento.
Não invente conteúdos que não estejam nele.
```

Quando não há referência: prompt idêntico ao atual (zero impacto em usuários sem referência).

---

## UI — Passo 2 após a mudança

```
┌─────────────────┐  ┌─────────────────┐  ┌────────────────────────┐
│  Escopo         │  │  Modelo         │  │  Referência            │
│  .xlsx          │  │  .docx          │  │  PDF ou TXT · opcional │
│  [obrigatório]  │  │  [obrigatório]  │  │  [opcional]            │
└─────────────────┘  └─────────────────┘  └────────────────────────┘
```

No mobile: empilha verticalmente (grid já responsivo no projeto).

---

## Casos extremos

| Situação | Comportamento |
|---|---|
| Sem referência | Fluxo atual, sem mudança |
| PDF > 15MB | Alert no frontend, geração bloqueada |
| TXT qualquer tamanho | Injetado como texto no prompt (sem base64) |
| PDF escaneado (imagem) | Gemini ainda processa via OCR interno |
| Múltiplas semanas selecionadas | `refBase64` lido uma vez, reutilizado em todo o loop |

---

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `sapa-web/app/gerador/page.tsx` | Novo estado `refFile`, terceiro FileUpload, lógica de leitura, badge no Passo 4, payload atualizado |
| `sapa-web/app/api/gerar/route.ts` | Aceita `refBase64`/`refMimeType`/`refText`, constrói `contents` com ou sem inline data, prompt condicional |

**Novos arquivos:** nenhum.
**Novas dependências:** nenhuma.

---

## Critérios de sucesso

1. Campo de referência aparece no Passo 2, não impede avançar se vazio
2. Com PDF presente: conteúdo gerado faz referência direta ao material enviado
3. Sem PDF: comportamento idêntico ao atual
4. PDF > 15MB: bloqueado com mensagem clara antes de enviar
5. TXT funciona como alternativa sem base64
