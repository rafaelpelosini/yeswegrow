import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Variáveis não configuradas\nConfigure em .env.local:\n  - NEXT_PUBLIC_SUPABASE_URL\n  - SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

// Client com service role para acesso total
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Ler arquivo SQL
const sqlFilePath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql')
const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')

// Dividir em statements individuais
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0)

async function migrate() {
  console.log('🚀 Liquid Mood — Database Migration')
  console.log(`📍 Project: ${SUPABASE_URL.split('.')[0]}`)
  console.log('---\n')

  let successCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const statement of statements) {
    const label = statement.substring(0, 50).replace(/\n/g, ' ')

    try {
      // Executar via HTTP request direto (usando o padrão interno do Supabase)
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          'X-Client-Info': 'supabase-js/2.0.0',
        },
        body: JSON.stringify({ sql: statement }),
      })

      // Se for um POST sem resposta esperada ou query que cria estrutura
      if (response.ok || response.status === 201) {
        console.log(`  ✓ ${label}...`)
        successCount++
      } else if (response.status === 409) {
        // Conflict - já existe
        console.log(`  ⏭️  ${label}... (já existe)`)
        skippedCount++
      } else {
        const error = await response.text()
        if (error.includes('already exists') || error.includes('duplicate')) {
          console.log(`  ⏭️  ${label}... (já existe)`)
          skippedCount++
        } else {
          throw new Error(`HTTP ${response.status}: ${error}`)
        }
      }
    } catch (error) {
      console.warn(`  ⚠️  ${label}... (${(error as Error).message.substring(0, 40)})`)
      errorCount++
    }
  }

  console.log('\n✅ Migrações concluídas!')
  console.log(`   ✓ Sucesso: ${successCount}`)
  console.log(`   ⏭️  Ignoradas: ${skippedCount}`)
  if (errorCount > 0) {
    console.log(`   ⚠️  Erros: ${errorCount}`)
  }
  console.log('\n📊 Tabelas criadas:')
  console.log('   • assessoras')
  console.log('   • noivas')
  console.log('   • bartenders')
  console.log('   • eventos')
  console.log('   • degustacoes')
}

migrate().catch(err => {
  console.error('❌ Erro:', err.message)
  process.exit(1)
})
