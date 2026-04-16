# Dashboard & Gerador UX Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar o painel de controle e o wizard do gerador para melhorar usabilidade para professores — banner dinâmico de boas-vindas, cards de stats limpos, barra de progresso com contexto no wizard.

**Architecture:** Dois arquivos alterados — `app/page.tsx` (Server Component, busca dados do Supabase e renderiza painel) e `app/gerador/page.tsx` (Client Component com máquina de estados de 5 passos). Sem novos arquivos, sem mudanças de schema ou API.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase SSR, Lucide React

---

## Task 1: Atualizar query e banner de boas-vindas no painel

**Files:**
- Modify: `sapa-web/app/page.tsx`

### O que mudar

O painel atual tem:
- Header com saudação + botão separados
- Card escuro de créditos hardcoded (`/ 05`, `Plano Free`)
- 3 stat cards (Total, Semana, Créditos — redundante)
- 2 cards de dicas + banner CTA no final

O painel novo terá:
- Banner escuro unificado: saudação + escola + badge dinâmico de plano + botão "Novo Plano"
- 2 stat cards (Total Gerado, Esta Semana)
- Histórico refinado com metadados completos
- Remove dicas e CTA banner

---

- [ ] **Step 1: Adicionar `assinatura_ativa` ao SELECT da query**

Em `sapa-web/app/page.tsx`, linha 17, mudar:
```typescript
const { data: profile } = await supabase
  .from('perfis')
  .select('nome_completo, escola_padrao, creditos')
  .eq('id', user.id)
  .maybeSingle()
```
Para:
```typescript
const { data: profile } = await supabase
  .from('perfis')
  .select('nome_completo, escola_padrao, creditos, assinatura_ativa')
  .eq('id', user.id)
  .maybeSingle()
```
E adicionar variável logo abaixo:
```typescript
const isFull = profile?.assinatura_ativa === true
```

- [ ] **Step 2: Substituir o `<header>` e o card escuro de créditos pelo banner unificado**

Localizar o bloco que começa em `{/* ── Header ── */}` e vai até o fechamento do card `{/* ── Card de Créditos (dark hero) ── */}` (aproximadamente linhas 82–132) e substituir por:

```tsx
{/* ── Banner de Boas-Vindas ── */}
<div className="col-span-1 md:col-span-12 p-6 md:p-8 bg-[#3D2B1F] rounded-[32px] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-[#3D2B1F]/20">
  <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-[#C4622D]/10 rounded-full blur-[60px]" />
  <div className="relative z-10">
    <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-1">
      {greeting}
    </p>
    <h1 className="font-display text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-1">
      Prof. {nome.split(' ')[0] || 'Professor'}
    </h1>
    {escola && (
      <p className="text-sm text-white/40 font-medium mb-4">{escola}</p>
    )}
    {isFull ? (
      <span className="inline-flex items-center gap-1.5 bg-[#C4622D]/25 text-[#E07A4A] border border-[#C4622D]/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
        ✦ Plano Full · {creditos} créditos
      </span>
    ) : (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Free</span>
          <div className="flex items-baseline gap-1">
            <span className="text-white font-black text-lg">{creditos}</span>
            <span className="text-white/30 text-sm">/ 5</span>
          </div>
        </div>
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#C4622D] rounded-full" style={{ width: `${Math.min((creditos / 5) * 100, 100)}%` }} />
        </div>
      </div>
    )}
  </div>
  <div className="relative z-10 flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
    <Link href="/gerador" className="w-full md:w-auto">
      <button className="w-full md:w-auto px-8 py-4 bg-[#C4622D] text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-[#C4622D]/20 hover:bg-[#9C4A1F] transition-all">
        <PlusCircle size={18} />
        Novo Plano
      </button>
    </Link>
    {!isFull && (
      <Link href="/planos" className="w-full md:w-auto text-center text-[10px] font-black text-white/40 hover:text-[#E07A4A] transition-colors uppercase tracking-widest">
        Fazer Upgrade →
      </Link>
    )}
  </div>
</div>
```

- [ ] **Step 3: Substituir os 3 stat cards por 2**

Localizar os três `{/* ── Stats Row ── */}` cards (aproximadamente linhas 186–223) e substituir pelos dois cards:

```tsx
{/* ── Stats Row ── */}
<div className="col-span-1 md:col-span-6 p-6 bg-white border border-[#E8E0D4] rounded-[32px] shadow-sm">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-[#5A7A5A]/10 rounded-2xl flex items-center justify-center text-[#5A7A5A] flex-shrink-0">
      <BarChart3 size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-[#8C7B70] uppercase tracking-widest mb-0.5">Total gerado</p>
      <p className="text-3xl font-black text-[#1C1917] leading-none mb-1">{totalGerado}</p>
      <span className="text-[9px] font-black uppercase text-[#5A7A5A] bg-[#5A7A5A]/10 px-2 py-0.5 rounded">Planos criados</span>
    </div>
  </div>
</div>

<div className="col-span-1 md:col-span-6 p-6 bg-white border border-[#E8E0D4] rounded-[32px] shadow-sm">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-[#C89B3C]/10 rounded-2xl flex items-center justify-center text-[#C89B3C] flex-shrink-0">
      <CalendarDays size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-[#8C7B70] uppercase tracking-widest mb-0.5">Esta semana</p>
      <p className="text-3xl font-black text-[#1C1917] leading-none mb-1">{geradosSemana}</p>
      <span className="text-[9px] font-black uppercase text-[#C89B3C] bg-[#C89B3C]/10 px-2 py-0.5 rounded">Novos planos</span>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Refinar os itens do histórico com metadados completos**

No bloco de histórico, dentro do `.map((plano) => ...)`, atualizar o conteúdo do item para:

```tsx
<div key={plano.id} className="p-4 md:px-6 md:py-4 flex justify-between items-center hover:bg-[#FAF8F3] transition-colors">
  <div className="flex items-center gap-3 md:gap-4">
    <div className="w-10 h-10 bg-[#F2EEE6] rounded-xl flex items-center justify-center text-[#8C7B70]">
      <FileText size={18} />
    </div>
    <div>
      <p className="text-xs md:text-sm font-bold text-[#1C1917] line-clamp-1">
        {plano.componente} · Semana {plano.semana}
      </p>
      <p className="text-[10px] md:text-[11px] text-[#8C7B70] font-medium">
        {plano.turma && `${plano.turma} · `}
        {plano.bimestre && `${plano.bimestre}º Bim · `}
        {new Date(plano.created_at).toLocaleDateString('pt-BR')}
      </p>
    </div>
  </div>
  <a href={plano.arquivo_url} target="_blank" rel="noopener noreferrer">
    <button className="px-4 py-2 border-2 border-[#E8E0D4] text-[#C4622D] font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[#FAF8F3] transition-colors">
      ↓ Word
    </button>
  </a>
</div>
```

- [ ] **Step 5: Remover cards de dicas e banner CTA do final**

Apagar completamente os blocos:
- `{/* ── Dicas ── */}` (dois cards: verde e âmbar, aproximadamente linhas 226–252)
- `{/* ── CTA Banner ── */}` (aproximadamente linhas 255–268)

- [ ] **Step 6: Remover imports não utilizados**

Após as remoções, verificar se `Sparkles`, `ArrowRight`, `Search`, `Zap` ainda são usados. Se não, remover do import de `lucide-react`.

- [ ] **Step 7: Commit Task 1**

```bash
git add sapa-web/app/page.tsx
git commit -m "feat: redesign dashboard — dynamic welcome banner, 2-stat row, refined history"
```

---

## Task 2: Substituir indicador de progresso no gerador

**Files:**
- Modify: `sapa-web/app/gerador/page.tsx`

### O que mudar

O nav atual tem 5 pontinhos de 1.5–2px sem contexto. Substituir pela barra de progresso com nome do passo e porcentagem, integrada ao nav existente.

---

- [ ] **Step 1: Adicionar constantes de progresso no topo do componente**

Logo após as declarações de estado em `GeradorPage`, adicionar:

```typescript
const stepNames = ['Identificação', 'Arquivos Base', 'Configurações', 'Gerar Rascunhos', 'Revisão']
const progressPercent = Math.round((step / 5) * 100)
const stepLabel = stepNames[step - 1] ?? ''
```

- [ ] **Step 2: Substituir os pontinhos pelo progress bar no nav**

Localizar dentro do nav do gerador o bloco dos pontinhos:
```tsx
<div className="flex gap-1.5 bg-[#E8E0D4] p-1.5 rounded-full">
  {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${step >= i ? 'bg-[#C4622D]' : 'bg-white'}`} />)}
</div>
```

Substituir por:
```tsx
<div className="flex flex-col items-end gap-1 min-w-[140px]">
  <div className="flex justify-between items-center w-full">
    <span className="text-[9px] font-black text-[#C4622D] uppercase tracking-widest">
      Passo {step} de 5 · {stepLabel}
    </span>
    <span className="text-[9px] font-black text-[#8C7B70]">{progressPercent}%</span>
  </div>
  <div className="w-full h-1.5 bg-[#E8E0D4] rounded-full overflow-hidden">
    <div
      className="h-full bg-[#C4622D] rounded-full transition-all duration-300"
      style={{ width: `${progressPercent}%` }}
    />
  </div>
</div>
```

- [ ] **Step 3: Adicionar dica contextual no Step 2 (Arquivos Base)**

Dentro do bloco `{step === 2 && (...)}`, logo após o `<div className="grid ...">` dos FileUploads, adicionar:

```tsx
<div className="bg-[#F2EEE6] border border-[#E8E0D4] rounded-2xl p-4 text-sm text-[#8C7B70] leading-relaxed space-y-1">
  <p><span className="font-black text-[#1C1917]">Escopo:</span> planilha .xlsx com componentes curriculares e semanas</p>
  <p><span className="font-black text-[#1C1917]">Modelo:</span> seu arquivo .docx com o layout oficial da escola</p>
  <p><span className="font-black text-[#8C7B70]">Referência:</span> ementa ou apostila em PDF/TXT — opcional</p>
</div>
```

- [ ] **Step 4: Commit Task 2**

```bash
git add sapa-web/app/gerador/page.tsx
git commit -m "feat: replace wizard dots with progress bar + contextual hint in step 2"
```

---

## Verificação Final

- [ ] Abrir `http://localhost:3000` — banner escuro mostra saudação, escola e badge do plano
- [ ] Verificar que badge mostra "✦ Plano Full · 9999 créditos" para o usuário admin
- [ ] Verificar que sem plano Full aparece barra de progresso com créditos/5
- [ ] Navegar para `/gerador` — verificar barra de progresso com texto em todos os 5 steps
- [ ] No step 2 do gerador, verificar que a dica contextual aparece abaixo dos cards de upload
- [ ] Verificar que não há erros de TypeScript no console
