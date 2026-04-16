# SAPA — Dashboard & Gerador: Redesign UX/UI

**Data:** 2026-04-15
**Status:** Aprovado pelo usuário
**Escopo:** Painel de controle (`/`) + Gerador (`/gerador`) + correções de dados dinâmicos

---

## 1. Contexto e Problema

O painel atual tem três problemas críticos:

1. **Dados hardcoded:** `/ 05` e `Plano Free` estão fixos no código. Usuários com plano Full (9999 créditos, `assinatura_ativa = true`) veem informações erradas.
2. **Hierarquia visual confusa:** O card de créditos escuro e os 3 stats menores abaixo repetem a mesma informação (créditos). Há redundância e ausência de hierarquia clara.
3. **Wizard sem contexto:** O indicador de progresso são 5 pontinhos de 6px — professores não sabem em qual passo estão nem quantos faltam.

---

## 2. Decisões de Design

### 2.1 Direção Visual
**A + B combinados:** mantém a identidade quente do SAPA (terra cotta `#C4622D`, creme `#FAF8F3`, marrom escuro `#3D2B1F`) com influências de SaaS moderno (cards com sombras sutis, espaçamento generoso, hierarquia tipográfica clara).

### 2.2 Layout do Painel
**Coluna única, compacto.** Sem sidebar. Funciona bem no celular e no computador da escola. Ordem vertical:
1. Nav fixa
2. Banner de boas-vindas integrado
3. Stats (2 cards em grid)
4. Histórico recente

### 2.3 Banner de Boas-Vindas (substitui card escuro + header separado)
Card escuro `#3D2B1F` unificado que contém:
- Saudação dinâmica (Bom dia/Boa tarde/Boa noite + primeiro nome)
- Nome da escola
- Badge de plano **dinâmico**:
  - `assinatura_ativa = true` → `✦ PLANO FULL · {creditos} créditos` (badge âmbar)
  - `assinatura_ativa = false` → barra de progresso `{creditos} / 5` + botão "Upgrade →"
- Botão "**+ Novo Plano**" à direita (CTA principal)

### 2.4 Stats Row
Dois cards brancos em grid 2 colunas:
- **Total Gerado** — `totalGerado` planos (tag verde "planos criados")
- **Esta Semana** — `geradosSemana` planos (tag âmbar "novos planos")

O card de créditos separado é **removido** — a informação de créditos já está no banner.

### 2.5 Histórico Recente
Card branco com cabeçalho ("Histórico Recente" + link "Ver tudo →"). Cada item:
- Ícone 📄 em box bege
- Componente + Semana (bold)
- Metadados: "há X dias · turma · bimestre" (muted)
- Botão "↓ Word" (border, cor terra cotta)

### 2.6 Indicador de Progresso do Gerador
Substitui os 5 pontinhos por uma **barra de progresso com texto**:
```
Passo 2 de 5            40%
Arquivos Base
[████████░░░░░░░░░░░░]
```
- Label do passo atual como subtítulo
- Porcentagem calculada: `(step / 5) * 100`
- Barra preenchida na cor `#C4622D`
- Altura da barra: 5px, border-radius 3px

### 2.7 Cards de Upload de Arquivo (Step 2 do gerador)
Três cards com estado visual:
- **Padrão:** borda dashed `#E8E0D4`
- **Enviado:** borda solid `#C4622D`, fundo `#FEF0E8`, badge `✓ ok`
- **Hover:** borda `#C4622D`, fundo `#FEF0E8`

Dica contextual abaixo dos cards explicando brevemente cada arquivo.

---

## 3. Tokens de Design

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#C4622D` | Botões, badges ativos, progresso |
| `--dark` | `#3D2B1F` | Banner, nav escuro |
| `--bg` | `#FAF8F3` | Background geral |
| `--surface` | `#F2EEE6` | Inputs, ícones, fundo de dica |
| `--border` | `#E8E0D4` | Bordas de cards e inputs |
| `--text` | `#1C1917` | Texto principal |
| `--muted` | `#8C7B70` | Labels, metadados |
| `--subtle` | `#B5A89A` | Labels de stat cards |

---

## 4. Lógica Dinâmica Crítica

### Plano do usuário (painel `/`)
```typescript
const isFull = profile?.assinatura_ativa === true
const creditos = profile?.creditos ?? 0

// Badge
isFull → "✦ PLANO FULL · {creditos} créditos"
!isFull → barra de progresso {creditos}/5 + botão upgrade
```

### Progresso do wizard (`/gerador`)
```typescript
const progressPercent = Math.round((step / 5) * 100)
const stepNames = ['Identificação', 'Arquivos Base', 'Configurações', 'Gerar Rascunhos', 'Revisão']
const stepLabel = stepNames[step - 1]
```

---

## 5. Arquivos Afetados

| Arquivo | Mudança |
|---|---|
| `sapa-web/app/page.tsx` | Banner dinâmico, remover card créditos escuro, nova stats row, histórico refinado |
| `sapa-web/app/gerador/page.tsx` | Substituir dots por progress bar + label |

Nenhum novo arquivo necessário. Nenhuma mudança de schema ou API.

---

## 6. O que NÃO muda

- Paleta de cores (apenas reorganização)
- Lógica de geração de planos
- Integração Supabase
- Páginas de histórico, perfil, admin
- Fluxo de 5 passos do gerador (apenas o indicador visual)
