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

---

## 🛠 Próximos Passos (Rumo ao SaaS Pago)

### Fase 1: Persistência (Banco de Dados)
- [x] Conectar o Streamlit ao **Supabase (PostgreSQL)**.
- [ ] Criar tabela `planos_gerados` para salvar o histórico de cada geração.
- [ ] Salvar o arquivo `.docx` final em um Storage (Nuvem) em vez de apenas download local.

### Fase 2: Gestão de Usuários (Acesso)
- [ ] Implementar **Login/Senha** (Supabase Auth).
- [ ] Criar Perfil do Professor (Foto, Escola padrão, Matérias favoritas).

### Fase 3: Monetização (Pagamento)
- [ ] Integrar com **Stripe** ou **Mercado Pago**.
- [ ] Criar lógica de **Créditos**: "O professor paga R$ X para gerar Y planos" ou "Assinatura Mensal".
- [ ] Criar Dashboard de Assinante (Ver faturas, Status do plano).

### Fase 4: Expansão Tecnológica
- [ ] Migrar Frontend para **Next.js** (para maior performance e SEO).
- [ ] Criar App Mobile (ou PWA) para o professor consultar o plano direto no celular na sala de aula.

---

## 📈 Visão de Negócio
O objetivo é reduzir o tempo de planejamento do professor de **3 horas para 3 minutos**. 
*Valor sugerido:* R$ 29,90/mês ou R$ 2,00 por plano avulso.

---
*Atualizado em: 13 de Abril de 2026*
