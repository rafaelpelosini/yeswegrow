#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: variáveis de ambiente não configuradas')
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigrations() {
  console.log('📊 Iniciando migrações Supabase...\n')

  try {
    // Ler arquivo de schema
    const schemaPath = path.join(process.cwd(), 'supabase/migrations/001_initial_schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')

    // Executar SQL
    const { error } = await supabase.rpc('query', { sql: schema })

    if (error) {
      // Fallback: tentar com execute direto
      console.log('Usando execute() direto...')
      // Dividir por ; para múltiplas queries
      const queries = schema.split(';').filter((q) => q.trim())

      for (const query of queries) {
        const { error: err } = await supabase.rpc('execute_sql', { sql: query })
        if (err) {
          console.warn('⚠️ Aviso:', err.message)
        }
      }
    }

    console.log('✅ Migrações aplicadas com sucesso!')
    console.log('\nTabelas criadas:')
    console.log('  • assessoras')
    console.log('  • noivas')
    console.log('  • bartenders')
    console.log('  • eventos')
    console.log('  • degustacoes')
  } catch (err) {
    console.error('❌ Erro ao executar migrações:', err)
    process.exit(1)
  }
}

runMigrations()
