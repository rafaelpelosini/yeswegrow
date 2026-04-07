#!/bin/bash

# Liquid Mood — Database Migration via PostgreSQL Direct Connection
# Uses psql to execute SQL file on Supabase PostgreSQL

# Extract connection details from Supabase URL
# Format: https://[project-id].[region].supabase.co
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
PROJECT_ID=$(echo "$SUPABASE_URL" | cut -d'/' -f3 | cut -d'.' -f1)

# Supabase PostgreSQL connection details
DB_HOST="${PROJECT_ID}.db.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Variável SUPABASE_DB_PASSWORD não configurada"
    echo "Configure em .env.local com a senha do PostgreSQL"
    exit 1
fi

echo "🚀 Liquid Mood — Database Migration via PostgreSQL"
echo "📍 Host: $DB_HOST"
echo "📍 Database: $DB_NAME"
echo "---"
echo ""

# Execute SQL file
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f supabase/migrations/001_initial_schema.sql \
    --set ON_ERROR_STOP=on

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration concluída com sucesso!"
    echo ""
    echo "📊 Tabelas criadas:"
    echo "   ✓ assessoras"
    echo "   ✓ noivas"
    echo "   ✓ bartenders"
    echo "   ✓ eventos"
    echo "   ✓ degustacoes"
else
    echo ""
    echo "❌ Erro durante execução da migration"
    exit 1
fi
