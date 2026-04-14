import psycopg2

def check_users():
    # Conexão direta com o PostgreSQL para checar a tabela de usuários do Supabase
    db_config = {
        "dbname": "postgres",
        "user": "postgres",
        "password": "J6t2hybt26@",
        "host": "db.bgijgonngrgnvffagsnd.supabase.co",
        "port": "5432"
    }

    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        
        # O Supabase guarda os usuários no schema 'auth', tabela 'users'
        cur.execute("SELECT email, confirmed_at FROM auth.users;")
        users = cur.fetchall()
        
        print("=== Usuários Cadastrados no Supabase ===")
        if not users:
            print("Nenhum usuário encontrado.")
        for email, confirmed in users:
            status = "Confirmado" if confirmed else "PENDENTE (Verifique o e-mail)"
            print(f"- {email} | Status: {status}")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Erro ao consultar usuários: {e}")

if __name__ == "__main__":
    check_users()
