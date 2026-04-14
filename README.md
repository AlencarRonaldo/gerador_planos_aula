# 📚 Gerador de Planos de Aula IA (SAPA)

O **Sistema de Apoio Pedagógico Inteligente (SAPA)** é uma ferramenta desenvolvida para automatizar a criação de planos de aula para professores de Educação Profissional. Utilizando a inteligência artificial do **Google Gemini**, o sistema extrai dados de arquivos de Escopo-Sequência (Excel) e gera documentos Word (.docx) formatados e prontos para uso.

---

## 🚀 Funcionalidades Principais

- **Leitura Inteligente de Excel**: Processa cronogramas complexos, identificando matérias, bimestres e temas das aulas.
- **Desenvolvimento com IA**: Gera automaticamente a abertura, o desenvolvimento detalhado e o fechamento de cada aula com base nos objetivos pedagógicos.
- **Datas Automáticas**: Calcula o período exato das semanas letivas a partir da data de início do ano.
- **Interface Web Moderna**: Interface amigável construída em **Streamlit**, organizada em etapas intuitivas para o professor.
- **Exportação Profissional**: Gera arquivos Word (.docx) preservando o modelo (template) oficial da escola.

---

## 🛠 Tecnologias Utilizadas

- **Linguagem**: Python 3.14+
- **Frontend**: [Streamlit](https://streamlit.io/)
- **Inteligência Artificial**: [Google Gemini 2.0 Flash](https://aistudio.google.com/app/apikey)
- **Manipulação de Documentos**: `python-docx` (Word) e `openpyxl` (Excel)
- **Design**: CSS3 customizado para interface moderna.

---

## 📦 Instalação e Execução

### 1. Pré-requisitos
Certifique-se de ter o Python instalado. Recomenda-se criar um ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### 2. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 3. Configuração Inicial
Crie ou edite o arquivo `config.json` na raiz do projeto com seus dados padrão e sua chave da API do Gemini:
```json
{
  "escola": "Sua Escola",
  "professor": "Seu Nome",
  "gemini_api_key": "SUA_CHAVE_AQUI",
  "ano_serie": "3B",
  "data_inicio_semana1": "2026-02-03"
}
```

### 4. Rodar o Sistema
Para abrir a interface web no navegador:
```bash
python -m streamlit run app.py
```

---

## 📂 Estrutura do Projeto

- `app.py`: Interface web principal (Streamlit).
- `gerar_planos.py`: Motor de lógica, processamento de Excel e integração com IA.
- `config.json`: Configurações de usuário e credenciais de API.
- `requirements.txt`: Lista de bibliotecas necessárias.
- `PROJECT_ROADMAP.md`: Planejamento de evolução para o modelo SaaS.
- `planos_gerados/`: Pasta (opcional) para salvar as gerações via linha de comando.

---

## 🔒 Segurança de Dados
O sistema foi projetado para não expor chaves de API. A `GEMINI_API_KEY` pode ser configurada via:
1. Arquivo `config.json` local.
2. Variáveis de Ambiente do Sistema/Hospedagem.
3. Campo mascarado diretamente na interface web (apenas como fallback).

---

## 📄 Licença
Este projeto é de uso pedagógico e profissional. Desenvolvido para facilitar a jornada do educador na era da inteligência artificial.

---
*Desenvolvido por: Rafael Rodrigues Vieira*
