# 🗄️ Liquid Mood — Database Migration Guide

## Status: ✅ Pronto para aplicar

O arquivo SQL com toda a estrutura do banco está pronto em `supabase/migrations/001_initial_schema.sql`.

## Como Aplicar a Migration

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse seu projeto Supabase**
   - URL: https://app.supabase.com/projects
   - Selecione o projeto **CLL** (Liquid Mood)

2. **Abra o SQL Editor**
   - Clique em qualquer projeto
   - No menu esquerdo, procure por **SQL Editor** ou **Query**
   - Clique no botão **+ New Query**

3. **Copie o SQL**
   ```bash
   # Copiar comando (macOS/Linux):
   cat supabase/migrations/001_initial_schema.sql | pbcopy
   
   # Copiar comando (Windows):
   type supabase/migrations/001_initial_schema.sql | clip
   ```

4. **Cole no Supabase SQL Editor**
   - Cole o SQL no editor
   - Clique em **RUN** ou **▶ Execute** (canto superior)
   - Espere a conclusão (cerca de 5 segundos)

5. **Verifique**
   - Vá em **Table Editor**
   - Você deve ver as 5 novas tabelas:
     - ✅ assessoras
     - ✅ noivas
     - ✅ bartenders
     - ✅ eventos
     - ✅ degustacoes

### Opção 2: Via Supabase CLI

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase

# Autenticar
supabase login

# Aplicar migration
supabase db push

# Ou executar arquivo direto
supabase db remote set
supabase migration execute supabase/migrations/001_initial_schema.sql
```

### Opção 3: Via psql (Avançado)

Se tiver `psql` instalado:

```bash
# Configure a senha em .env.local
SUPABASE_DB_PASSWORD=sua_senha_postgres

# Execute
node scripts/migrate.mjs
```

**Nota**: A senha do PostgreSQL está em Supabase Dashboard > Settings > Database > Connection String

---

## O que será criado?

### Tabelas (5)

1. **assessoras** — Parceiras/afiliadas
   - id, nome, email, telefone, slug
   - Indicação de afiliados (indicada_por)
   - Status, nível de acesso

2. **noivas** — Noivas/clientes
   - id, nome, email, telefone
   - Data do casamento
   - Respostas do formulário (respostas JSONB)
   - Cardápio gerado (cardapio JSONB)
   - Status do fluxo

3. **bartenders** — Profissionais responsáveis
   - id, nome, email, telefone
   - Avaliação média, quantidade de eventos
   - Status (ativo/inativo)

4. **eventos** — Casamentos agendados
   - id, referências a noiva/assessora/bartender
   - Data, valor total, comissão da assessora
   - Status do processo

5. **degustacoes** — Tastings/degustações
   - id, referência a noiva/assessora
   - Data agendada, status, notas

### Índices (7)
Para otimizar buscas comuns

### Row Level Security (RLS)
Segurança por linha para dados sensíveis

### Policies (3)
Controle de acesso para assessoras e noivas

---

## Próximos Passos

Após aplicar a migration:

1. ✅ **Salvar dados do formulário** no banco
   - Atualizar `CardapioForm.tsx` para inserir em `noivas` table

2. ✅ **Dashboard da Assessora**
   - Ver suas noivas e events
   - Comissões e ganhos

3. ✅ **Autenticação**
   - Integrar Supabase Auth
   - Login para assessoras

---

**Dúvidas?** Verifique se:
- ✓ Projeto Supabase está acessível
- ✓ Variáveis em `.env.local` estão corretas
- ✓ Não há erro de conexão no console
