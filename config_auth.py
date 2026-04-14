import httpx

def configure_supabase_auth():
    # Suas credenciais
    url = "https://bgijgonngrgnvffagsnd.supabase.co"
    # Para alterar configurações de sistema, precisaríamos da Service Role Key.
    # Como não temos, vou tentar listar os provedores para ver se a conexão está ok.
    
    headers = {
        "apikey": "sb_publishable_tP6_IXGo71cpBFfxeI5oug_yIBdq3Ts",
        "Authorization": "Bearer sb_publishable_tP6_IXGo71cpBFfxeI5oug_yIBdq3Ts"
    }

    try:
        print(f"Verificando status do Auth em {url}...")
        response = httpx.get(f"{url}/auth/v1/settings", headers=headers)
        if response.status_code == 200:
            print("✅ Conexão com o serviço de autenticação estabelecida.")
            settings = response.json()
            print(f"E-mail Confirm Required: {settings.get('mailer_secure_email_change_enabled')}")
        else:
            print(f"❌ Erro ao acessar configurações: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")

if __name__ == "__main__":
    configure_supabase_auth()
