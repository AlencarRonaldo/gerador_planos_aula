# 🚀 Roadmap do Projeto: Gerador de Planos de Aula (SaaS)

Este documento serve como a "Fonte da Verdade" para o desenvolvimento do sistema. Ele registra o estado atual, as conquistas alcançadas e os próximos passos para a monetização.

---

## 📍 Estado Atual (Snapshot: Abril 2026)
O sistema está em fase de **Protótipo Funcional de Alta Fidelidade** (MVP - Minimum Viable Product).

### ✅ Funcionalidades Ativas:
- **Interface Web Moderna**: Interface construída em Streamlit com design de cards e fluxo em 4 etapas.
- **Integração com Gemini IA**: Geração inteligente de desenvolvimento de aula baseada no Escopo-Sequência.
- **Processamento de Excel**: Leitura dinâmica de abas, componentes (matérias) e bimestres.
- **Lógica de Calendário**: Cálculo automático de datas das semanas com base no início do ano letivo.
- **Suporte a Diferentes Matérias**: Lógica inteligente para encontrar "Inteligência Artificial", "Versionamento", etc., em diferentes colunas do Excel.
- **Geração de Documentos**: Preenchimento automático de templates Word (.docx) preservando a formatação original.
- **Segurança de API**: Chave do Gemini carregada silenciosamente via `config.json` ou Variáveis de Ambiente.
- **Acesso Rápido**: Link integrado para o portal "Sala do Futuro".

---

## 🏆 Conquistas e Validações (Log de Sucesso)
*Cada vez que uma funcionalidade for testada e aprovada, ela deve ser registrada aqui.*

- [x] **Abr/2026**: Implementação da Interface Streamlit com 4 etapas.
- [x] **Abr/2026**: Correção da lógica de datas para semanas avançadas (Semana 8+).
- [x] **Abr/2026**: Implementação do filtro por Bimestre e Natureza da Aula (Teórica/Prática).
- [x] **Abr/2026**: Mascaramento total da API Key para futura hospedagem segura.
- [x] **Abr/2026**: Fase 2 completa — Auth, middleware, perfil e dashboard dinâmico.

---

## 🛠 Próximos Passos (Rumo ao SaaS Pago)

### Fase 1: Persistência (Banco de Dados)
- [x] Conectar o Streamlit ao **Supabase (PostgreSQL)**.
- [x] Criar tabela `planos_gerados` para salvar o histórico de cada geração.
- [x] Salvar o arquivo `.docx` final em um Storage (Nuvem) em vez de apenas download local.

### Fase 2: Gestão de Usuários (Acesso)
- [x] Implementar **Login/Senha** (Supabase Auth).
- [x] Proteção de rotas via middleware (/, /gerador, /historico, /perfil → redirect /login).
- [x] Rota `/auth/callback` para confirmação de e-mail pós-cadastro.
- [x] Criar Perfil do Professor (Escola padrão, Matéria favorita, logout).
- [x] Dashboard dinâmico (nome real, iniciais e escola do perfil).

### Fase 3: Monetização (Pagamento)
- [x] Integrar com **Asaas** (Pagamentos PIX, Boleto, Cartão).
- [x] Criar lógica de **Créditos**: "O professor paga R$ X para gerar Y planos".
- [x] Criar lógica de **Assinatura Mensal** (Básico, Pro, Premium).
- [x] Criar Dashboard de Assinante (Ver créditos, Status do plano).
- [x] Configurar Webhook do Asaas no painel do Asaas (URL: https://sapa-web-lac.vercel.app/api/asaas/webhook)

### Fase 4: Expansão Tecnológica
- [x] Migrar Frontend para **Next.js** (para maior performance e SEO).
- [ ] Criar App Mobile (ou PWA) para o professor consultar o plano direto no celular na sala de aula.

---

## 📈 Visão de Negócio
O objetivo é reduzir o tempo de planejamento do professor de **3 horas para 3 minutos**. 
*Valor sugerido:* R$ 29,90/mês ou R$ 2,00 por plano avulso.

---
*Atualizado em: 18 de Abril de 2026*
