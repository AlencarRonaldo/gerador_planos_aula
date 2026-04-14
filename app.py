import streamlit as st
import pandas as pd
import openpyxl
import io
import zipfile
import os
import re
from datetime import datetime, timedelta
from pathlib import Path
from gerar_planos import (
    executar_geracao, 
    read_excel, 
    get_weeks, 
    get_componentes,
    get_bimestres,
    get_week_dates,
    get_week_lessons,
    parse_semanas,
    load_config
)
from database import DatabaseManager

# Configuração da Página
st.set_page_config(
    page_title="Gerador de Planos de Aula IA", 
    page_icon="📚", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CSS Customizado ---
st.markdown("""
<style>
    .main { background-color: #f8f9fa; }
    [data-testid="stSidebar"] { padding-top: 0rem !important; }
    .portal-button {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        background-color: #ffffff; color: #1F2937; padding: 10px; border-radius: 8px;
        text-decoration: none; font-weight: 600; font-size: 0.9rem; border: 1px solid #e5e7eb;
        margin-bottom: 1rem; transition: all 0.2s;
    }
    .portal-button:hover { background-color: #f3f4f6; border-color: #4F46E5; color: #4F46E5; }
    .stButton>button {
        width: 100%; border-radius: 8px; height: 3em;
        background-color: #4F46E5; color: white; font-weight: bold; border: none;
    }
    .card {
        background-color: white; padding: 1.5rem; border-radius: 12px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); margin-bottom: 1rem; border: 1px solid #e5e7eb;
    }
    .step-header {
        color: #1F2937; font-weight: 800; font-size: 1.1rem;
        margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;
    }
    .step-number {
        background-color: #4F46E5; color: white; border-radius: 50%;
        width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;
    }
</style>
""", unsafe_allow_html=True)

# --- Carregar Configurações ---
try:
    default_config = load_config("config.json")
except:
    default_config = {}

# Inicializa o Banco de Dados (de forma silenciosa)
db = DatabaseManager(
    url=default_config.get("supabase_url"), 
    key=default_config.get("supabase_key")
)

api_key_system = os.environ.get("GEMINI_API_KEY") or default_config.get("gemini_api_key", "")

# --- Barra Lateral (Configurações Técnicas) ---
with st.sidebar:
    st.markdown('<div style="text-align: center; margin-top: -20px;">', unsafe_allow_html=True)
    st.image("https://cdn-icons-png.flaticon.com/512/3426/3426653.png", width=50)
    st.markdown('</div>', unsafe_allow_html=True)
    st.title("Painel Técnico")
    
    st.markdown(f"""
        <a href="https://saladofuturo.educacao.sp.gov.br/escolha-de-perfil" target="_blank" class="portal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/3976/3976631.png" width="20">
            Sala do Futuro
        </a>
    """, unsafe_allow_html=True)

    with st.expander("📅 Configuração de Datas", expanded=False):
        try:
            data_ini_val = datetime.strptime(default_config.get("data_inicio_semana1", "2026-02-03"), "%Y-%m-%d")
        except:
            data_ini_val = datetime(2026, 2, 3)
        data_inicio = st.date_input("Início do Ano", value=data_ini_val)
        dias_aula = st.multiselect("Dias de Aula", options=[0,1,2,3,4,5,6], default=default_config.get("dias_aula", [0,3]),
                                  format_func=lambda x: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"][x])
    
    with st.expander("🔑 Inteligência Artificial", expanded=False):
        api_key_input = st.text_input("Chave API Gemini", type="password", placeholder="Usando chave do sistema...")
        api_key = api_key_input if api_key_input else api_key_system

# --- Conteúdo Principal ---
st.markdown('<h2 style="color: #1F2937; margin-top: -30px;">📚 Gerador de Planos de Aula</h2>', unsafe_allow_html=True)

# ETAPA 1: Dados do Plano
st.markdown('<div class="card">', unsafe_allow_html=True)
st.markdown('<div class="step-header"><div class="step-number">1</div> Dados do Plano</div>', unsafe_allow_html=True)
c_prof, c_esc, c_turma = st.columns([2, 2, 1])
with c_prof:
    professor = st.text_input("Nome do Professor", default_config.get("professor", "Rafael Rodrigues Vieira"))
with c_esc:
    escola = st.text_input("Nome da Escola", default_config.get("escola", "Ayrton Senna"))
with c_turma:
    ano_serie = st.text_input("Ano / Turma", default_config.get("ano_serie", "3B"))
st.markdown('</div>', unsafe_allow_html=True)

# ETAPA 2: Arquivos Base
st.markdown('<div class="card">', unsafe_allow_html=True)
st.markdown('<div class="step-header"><div class="step-number">2</div> Arquivos Base</div>', unsafe_allow_html=True)
col1, col2 = st.columns(2)
with col1:
    excel_file = st.file_uploader("Escopo Sequência (Excel)", type=["xlsx"])
with col2:
    template_file = st.file_uploader("Modelo de Plano de aula", type=["docx"])
st.markdown('</div>', unsafe_allow_html=True)

# ETAPA 3: Configurações de Geração
if excel_file:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="step-header"><div class="step-number">3</div> Configurações</div>', unsafe_allow_html=True)
    
    try:
        wb = openpyxl.load_workbook(excel_file, read_only=True)
        abas = wb.sheetnames
        
        c1, c2, c3 = st.columns(3)
        with c1:
            aba_sel = st.selectbox("Aba do Excel", options=abas)
        with c2:
            excel_file.seek(0)
            bimestres = get_bimestres(excel_file, aba_sel)
            bimestre_sel = st.selectbox("Bimestre Letivo", options=bimestres)
        with c3:
            excel_file.seek(0)
            componentes = get_componentes(excel_file, aba_sel)
            comp_index = componentes.index(default_config["componente"]) if default_config.get("componente") in componentes else 0
            componente_sel = st.selectbox("Componente Curricular", options=componentes, index=comp_index)

        excel_file.seek(0)
        lessons = read_excel(excel_file, aba_sel, componente_filter=componente_sel, bimestre_filter=bimestre_sel)
        weeks = get_weeks(lessons)
        
        if weeks:
            st.markdown("---")
            modo_selecao = st.radio("Como deseja selecionar as semanas?", ["Por Lista de Datas", "Por Intervalo Numérico"], horizontal=True)
            
            selected_weeks = []
            if modo_selecao == "Por Lista de Datas":
                week_options = []
                week_map = {}
                for w in weeks:
                    wl = get_week_lessons(lessons, w)
                    d1, d2, _, _ = get_week_dates(data_inicio.strftime("%Y-%m-%d"), w, dias_aula)
                    label = f"Semana {w:02d} ({d1} a {d2}) → {wl[0]['tema_semana'][:60]}..."
                    week_options.append(label)
                    week_map[label] = w
                selected_labels = st.multiselect("Escolha uma ou mais semanas:", options=week_options, default=week_options[:1])
                selected_weeks = [week_map[label] for label in selected_labels]
            else:
                semanas_str = st.text_input("Intervalo das Semanas (Ex: 9-12)", value=f"{min(weeks)}-{max(weeks)}")
                try: selected_weeks = parse_semanas(semanas_str, weeks)
                except: st.error("Formato inválido.")
            
            if selected_weeks:
                st.info(f"💡 {len(selected_weeks)} planos de aula serão gerados para o {bimestre_sel}º Bimestre.")
        else:
            st.warning("Não foram encontradas aulas para estes filtros.")
            selected_weeks = []
    except Exception as e:
        st.error(f"Erro ao processar dados: {e}")
    st.markdown('</div>', unsafe_allow_html=True)

    # ETAPA 4: Finalizar
    if template_file and selected_weeks:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown('<div class="step-header"><div class="step-number">4</div> Finalizar</div>', unsafe_allow_html=True)
        
        if st.button("🚀 GERAR PLANOS AGORA"):
            try:
                config = {
                    "escola": escola, "professor": professor, "ano_serie": ano_serie,
                    "aba": aba_sel, "bimestre": bimestre_sel, "componente": componente_sel,
                    "gemini_api_key": api_key, "data_inicio_semana1": data_inicio.strftime("%Y-%m-%d"),
                    "dias_aula": dias_aula
                }
                status_container = st.status("📝 Criando documentos Word com IA...", expanded=True)
                excel_file.seek(0)
                template_file.seek(0)
                
                arquivos = executar_geracao(config, excel_file, template_file, selected_weeks, 
                                          output_callback=status_container.write)
                
                status_container.update(label="✅ Geração finalizada!", state="complete", expanded=False)
                
                if arquivos:
                    # SALVAR NO BANCO (Se estiver ativo)
                    if db.is_active():
                        with st.spinner("💾 Salvando registros no banco de dados..."):
                            for name, content in arquivos:
                                # Tenta descobrir a semana a partir do nome do arquivo (ex: Sem09)
                                match = re.search(r"Sem(\d+)", name)
                                semana_num = int(match.group(1)) if match else 0
                                
                                db.salvar_plano(
                                    professor=professor, escola=escola, turma=ano_serie,
                                    componente=componente_sel, bimestre=bimestre_sel, 
                                    semana=semana_num, filename=name, content=content
                                )

                    zip_buffer = io.BytesIO()
                    with zipfile.ZipFile(zip_buffer, "w") as zip_f:
                        for name, content in arquivos:
                            zip_f.writestr(name, content)
                    
                    st.success(f"Tudo pronto! Foram gerados {len(arquivos)} planos.")
                    st.download_button(
                        label="📥 BAIXAR TODOS OS PLANOS EM ZIP",
                        data=zip_buffer.getvalue(),
                        file_name=f"planos_{ano_serie}_{bimestre_sel}B.zip",
                        mime="application/zip"
                    )
            except Exception as e:
                st.error(f"Ocorreu um erro: {e}")
        st.markdown('</div>', unsafe_allow_html=True)
else:
    st.markdown('<div style="text-align: center; padding: 2rem; color: #6B7280; font-style: italic;">Complete as etapas acima para liberar a geração.</div>', unsafe_allow_html=True)
