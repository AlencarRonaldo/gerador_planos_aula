from database import DatabaseManager
from gerar_planos import load_config
import json

def test_connection():
    config = load_config('config.json')
    db = DatabaseManager(url=config.get('supabase_url'), key=config.get('supabase_key'))
    
    print("=== Teste de Conexão Supabase ===")
    if not db.is_active():
        print("❌ Erro: Não foi possível inicializar o cliente Supabase. Verifique a URL e a KEY.")
        return

    print("✅ Conexão inicializada com sucesso.")
    
    try:
        # Tenta fazer uma consulta simples na tabela planos_gerados
        print("Buscando dados na tabela 'planos_gerados'...")
        response = db.client.table("planos_gerados").select("*", count="exact").limit(1).execute()
        print(f"✅ Tabela 'planos_gerados' encontrada! Total de registros: {response.count}")
    except Exception as e:
        print(f"❌ Erro ao acessar a tabela 'planos_gerados': {e}")
        print("DICA: Certifique-se de ter executado o SQL de criação da tabela no painel do Supabase.")

if __name__ == "__main__":
    test_connection()
