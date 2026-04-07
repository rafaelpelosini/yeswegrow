#!/usr/bin/env node

/**
 * Liquid Mood — Database Migration
 * Conecta diretamente ao PostgreSQL do Supabase e executa SQL
 */

import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Carregar variáveis
import 'dotenv/config'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD

if (!SUPABASE_URL || !SUPABASE_DB_PASSWORD) {
  console.error('❌ Erro: Variáveis não configuradas')
  console.log('\nConfigure em .env.local:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co')
  console.log('  SUPABASE_DB_PASSWORD=[sua senha PostgreSQL]')
  process.exit(1)
}

// Parse Supabase URL para extrair project ID
const projectId = SUPABASE_URL.split('.')[0].split('//')[1]
const dbHost = `${projectId}.db.supabase.co`
const dbPort = 5432
const dbName = 'postgres'
const dbUser = 'postgres'
const dbPassword = SUPABASE_DB_PASSWORD

// PostgreSQL client
const client = new Client({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function migrate() {
  console.log('🚀 Liquid Mood — Database Migration via PostgreSQL')
  console.log(`📍 Host: ${dbHost}`)
  console.log(`📍 Database: ${dbName}`)
  console.log('---\n')

  try {
    // Conectar
    console.log('📡 Conectando ao PostgreSQL...')
    await client.connect()
    console.log('✓ Conectado!\n')

    // Ler arquivo SQL
    const sqlFilePath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')

    // Dividir em statements individuais
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`📊 Executando ${statements.length} operações SQL...\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      const label = statement.substring(0, 50).replace(/\n/g, ' ')

      try {
        await client.query(statement)
        console.log(`  ${i + 1}/${statements.length} ✓ ${label}...`)
        successCount++
      } catch (error) {
        // Ignorar erros de "já existe"
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`  ${i + 1}/${statements.length} ⏭️  ${label}... (já existe)`)
        } else {
          console.warn(`  ${i + 1}/${statements.length} ⚠️  ${label}...`)
          console.warn(`      → ${error.message.substring(0, 60)}`)
          errorCount++
        }
      }
    }

    // Verificar tabelas criadas
    console.log('\n📋 Verificando tabelas criadas...')
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    const tables = result.rows.map(r => r.table_name)
    const expectedTables = ['assessoras', 'noivas', 'bartenders', 'eventos', 'degustacoes']

    for (const table of expectedTables) {
      if (tables.includes(table)) {
        console.log(`  ✓ ${table}`)
      } else {
        console.log(`  ❌ ${table} (não encontrada)`)
      }
    }

    console.log('\n✅ Migration concluída!')
    console.log(`   ✓ Sucessos: ${successCount}`)
    if (errorCount > 0) {
      console.log(`   ⚠️  Erros: ${errorCount}`)
    }
  } catch (error) {
    console.error('\n❌ Erro de conexão:')
    console.error(`   ${error.message}`)

    if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      console.error('\n💡 Dica: Verifique host/porta ou firewall')
    }
    if (error.message?.includes('password authentication failed')) {
      console.error('\n💡 Dica: Verifique a senha no SUPABASE_DB_PASSWORD')
    }

    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
