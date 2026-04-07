/**
 * API Route para executar migrations do banco de dados
 * Usa chave de serviço para criar tabelas via Supabase Admin API
 *
 * POST /api/migrate?token=admin_secret
 */

const ADMIN_TOKEN = process.env.MIGRATION_ADMIN_TOKEN || 'liquid-mood-admin'

export async function POST(request: Request) {
  try {
    // Validar token admin
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (!token || token !== ADMIN_TOKEN) {
      return Response.json(
        { error: 'Unauthorized: Token inválido ou não fornecido' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: 'Credenciais Supabase não configuradas' },
        { status: 500 }
      )
    }

    // SQL statements para criar tabelas
    const statements = [
      `CREATE TABLE IF NOT EXISTS assessoras (
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
      )`,

      `CREATE TABLE IF NOT EXISTS noivas (
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
      )`,

      `CREATE TABLE IF NOT EXISTS bartenders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nome text NOT NULL,
        email text UNIQUE,
        telefone text,
        avaliacao_media numeric(3,2) DEFAULT 0,
        eventos_realizados int DEFAULT 0,
        status text DEFAULT 'ativo',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )`,

      `CREATE TABLE IF NOT EXISTS eventos (
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
      )`,

      `CREATE TABLE IF NOT EXISTS degustacoes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        noiva_id uuid REFERENCES noivas(id) ON DELETE CASCADE,
        assessora_id uuid REFERENCES assessoras(id) ON DELETE SET NULL,
        data_agendada timestamptz,
        status text DEFAULT 'agendada',
        notas text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )`,

      `CREATE INDEX IF NOT EXISTS idx_noivas_assessora ON noivas(assessora_id)`,
      `CREATE INDEX IF NOT EXISTS idx_noivas_status ON noivas(status)`,
      `CREATE INDEX IF NOT EXISTS idx_eventos_noiva ON eventos(noiva_id)`,
      `CREATE INDEX IF NOT EXISTS idx_eventos_assessora ON eventos(assessora_id)`,
      `CREATE INDEX IF NOT EXISTS idx_eventos_bartender ON eventos(bartender_id)`,
      `CREATE INDEX IF NOT EXISTS idx_degustacoes_noiva ON degustacoes(noiva_id)`,
      `CREATE INDEX IF NOT EXISTS idx_assessoras_slug ON assessoras(slug)`,

      `ALTER TABLE assessoras ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE noivas ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE bartenders ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE eventos ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE degustacoes ENABLE ROW LEVEL SECURITY`,

      `CREATE POLICY IF NOT EXISTS "Assessoras are publicly readable" ON assessoras FOR SELECT USING (true)`,
      `CREATE POLICY IF NOT EXISTS "Noivas can be created" ON noivas FOR INSERT WITH CHECK (true)`,
      `CREATE POLICY IF NOT EXISTS "Noivas readable by assessora" ON noivas FOR SELECT USING (auth.uid() IS NULL OR assessora_id = auth.uid())`,
    ]

    const results = { success: 0, skipped: 0, errors: [] as string[] }

    // Executar cada statement via RPC endpoint do Supabase
    for (const sql of statements) {
      try {
        const label = sql.substring(0, 50).replace(/\n/g, ' ')

        // Construir request para Supabase ExecuteSQL endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql_string: sql }),
        })

        if (response.ok) {
          results.success++
        } else {
          const text = await response.text()
          if (text.includes('already exists')) {
            results.skipped++
          } else {
            results.errors.push(`${label}: ${response.status} ${text.substring(0, 100)}`)
          }
        }
      } catch (err) {
        results.errors.push((err as Error).message)
      }
    }

    // Tentar verificar tabelas
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/information_schema_tables`, {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    })

    let tables: string[] = []
    if (checkResponse.ok) {
      tables = (await checkResponse.json())
        .filter((t: any) => t.table_schema === 'public')
        .map((t: any) => t.table_name)
    }

    return Response.json({
      status: 'success',
      message: 'Migration executada',
      results,
      tables,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  return Response.json({
    message: 'Execute POST /api/migrate?token=liquid-mood-admin',
  })
}

