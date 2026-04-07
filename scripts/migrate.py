#!/usr/bin/env python3
"""
Liquid Mood — Database Migration via Supabase API
Executa SQL diretamente no PostgreSQL via service role
"""

import os
import requests
import json
import sys
from pathlib import Path

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print('❌ Erro: Variáveis não configuradas')
    print('Configure em .env.local:')
    print('  - NEXT_PUBLIC_SUPABASE_URL')
    print('  - SUPABASE_SERVICE_ROLE_KEY')
    sys.exit(1)

# Schema SQL
SQL_QUERIES = [
    """CREATE TABLE IF NOT EXISTS assessoras (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nome text NOT NULL,
        email text UNIQUE NOT NULL,
        telefone text,
        slug text UNIQUE NOT NULL,
        indicada_por uuid REFERENCES assessoras(id),
        status text DEFAULT 'pendente',
        nivel text DEFAULT 'basico',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    )""",

    """CREATE TABLE IF NOT EXISTS noivas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nome text NOT NULL,
        email text,
        telefone text,
        data_casamento date,
        assessora_id uuid REFERENCES assessoras(id) ON DELETE SET NULL,
        respostas jsonb,
        cardapio jsonb,
        status text DEFAULT 'cardapio_gerado',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    )""",

    """CREATE TABLE IF NOT EXISTS bartenders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nome text NOT NULL,
        email text UNIQUE,
        telefone text,
        avaliacao_media numeric(3,2) DEFAULT 0,
        eventos_realizados int DEFAULT 0,
        status text DEFAULT 'ativo',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    )""",

    """CREATE TABLE IF NOT EXISTS eventos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        noiva_id uuid REFERENCES noivas(id) ON DELETE CASCADE,
        assessora_id uuid REFERENCES assessoras(id) ON DELETE SET NULL,
        bartender_id uuid REFERENCES bartenders(id) ON DELETE SET NULL,
        data_evento date,
        valor_total numeric(10,2),
        comissao_assessora numeric(10,2),
        status text DEFAULT 'proposta_enviada',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    )""",

    """CREATE TABLE IF NOT EXISTS degustacoes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        noiva_id uuid REFERENCES noivas(id) ON DELETE CASCADE,
        assessora_id uuid REFERENCES assessoras(id) ON DELETE SET NULL,
        data_agendada timestamptz,
        status text DEFAULT 'agendada',
        notas text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    )""",

    "CREATE INDEX IF NOT EXISTS idx_noivas_assessora ON noivas(assessora_id)",
    "CREATE INDEX IF NOT EXISTS idx_noivas_status ON noivas(status)",
    "CREATE INDEX IF NOT EXISTS idx_eventos_noiva ON eventos(noiva_id)",
    "CREATE INDEX IF NOT EXISTS idx_eventos_assessora ON eventos(assessora_id)",
    "CREATE INDEX IF NOT EXISTS idx_eventos_bartender ON eventos(bartender_id)",
    "CREATE INDEX IF NOT EXISTS idx_degustacoes_noiva ON degustacoes(noiva_id)",
    "CREATE INDEX IF NOT EXISTS idx_assessoras_slug ON assessoras(slug)",

    "ALTER TABLE assessoras ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE noivas ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE bartenders ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE eventos ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE degustacoes ENABLE ROW LEVEL SECURITY",
]

def execute_sql(query):
    """Executa SQL via endpoint PostgreSQL REST"""
    url = f"{SUPABASE_URL}/rest/v1/rpc"
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY,
    }
    
    # Payload para PostgreSQL
    payload = {
        "sql_string": query
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        return response.status_code == 200
    except Exception as e:
        return False

def main():
    print("🚀 Liquid Mood — Database Migration via Supabase MCP")
    print(f"📍 Projeto: {SUPABASE_URL.split('.')[0]}")
    print("---\n")

    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY,
    }

    # URL para execute SQL (admin endpoint)
    sql_url = f"{SUPABASE_URL}/rest/v1/query"
    
    created = 0
    skipped = 0
    errors = []

    for i, query in enumerate(SQL_QUERIES, 1):
        label = query[:45].replace('\n', ' ')

        try:
            payload = {"sql": query}
            response = requests.post(sql_url, json=payload, headers=headers, timeout=10)

            if response.status_code in [200, 201]:
                print(f"  ✓ {label}...")
                created += 1
            elif "already exists" in response.text.lower():
                print(f"  ⏭️  {label}... (exists)")
                skipped += 1
            else:
                print(f"  ⚠️  {label}... ({response.status_code})")
        except Exception as e:
            print(f"  ❌ {label}... ({str(e)[:30]})")
            errors.append(str(e))

    # Tentar verificar tabelas
    print("\n📊 Verificando tabelas...")
    try:
        # Usar endpoint que lista tabelas
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/information_schema.tables",
            headers=headers,
            params={"table_schema": "eq.public"}
        )
        if resp.status_code == 200:
            tables = resp.json()
            table_names = [t.get('table_name') for t in tables if t.get('table_name')]
            for name in ['assessoras', 'noivas', 'bartenders', 'eventos', 'degustacoes']:
                if name in table_names:
                    print(f"   ✓ {name}")
    except:
        pass

    print(f"\n✅ Conclusão:")
    print(f"   Criadas: {created}")
    print(f"   Ignoradas: {skipped}")
    if errors:
        print(f"   Erros: {len(errors)}")

if __name__ == "__main__":
    main()
