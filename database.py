import os
import httpx
from postgrest import SyncPostgrestClient
from datetime import datetime

class DatabaseManager:
    def __init__(self, url: str = None, key: str = None):
        """Inicializa a conexão com o Supabase de forma leve usando Postgrest."""
        self.url = url or os.environ.get("SUPABASE_URL")
        self.key = key or os.environ.get("SUPABASE_KEY")
        self.client = None

        if self.url and self.key:
            # Constrói a URL da API REST do Supabase
            rest_url = f"{self.url}/rest/v1"
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {self.key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            }
            try:
                self.client = SyncPostgrestClient(rest_url, headers=headers)
            except Exception as e:
                print(f"Erro ao conectar ao banco de dados: {e}")

    def is_active(self) -> bool:
        """Verifica se o banco de dados está configurado e ativo."""
        return self.client is not None

    def salvar_plano(self, professor: str, escola: str, turma: str, componente: str, bimestre: int, semana: int, filename: str, content: bytes):
        """Salva o registro da geração do plano no banco de dados."""
        if not self.is_active():
            return False

        try:
            data = {
                "professor": professor,
                "escola": escola,
                "turma": turma,
                "componente": componente,
                "bimestre": bimestre,
                "semana": semana,
                "arquivo_nome": filename, # Corrigido de 'filename' para 'arquivo_nome'
                "tamanho_kb": round(len(content) / 1024, 2)
            }
            # Insere o registro via API REST (Postgrest)
            self.client.table("planos_gerados").insert(data).execute()
            return True
        except Exception as e:
            print(f"Erro ao salvar no banco: {e}")
            return False

    def listar_historico(self, professor_nome: str):
        """Retorna os últimos planos gerados pelo professor."""
        if not self.is_active():
            return []
        
        try:
            response = self.client.table("planos_gerados") \
                .select("*") \
                .eq("professor", professor_nome) \
                .order("data_geracao", desc=True) \
                .limit(10) \
                .execute()
            return response.data
        except:
            return []
