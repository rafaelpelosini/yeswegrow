# Liquid Mood — Fase 1 Concluída ✅

## Status Atual

- ✅ Next.js 15 + TypeScript + Tailwind
- ✅ Supabase client configurado  
- ✅ Claude API integrada e testada
- ✅ 7 perguntas conversacionais (formulário adaptativo)
- ✅ API `/api/cardapio` funcional
- ✅ Design art déco com identidade visual
- ⏳ Banco de dados — **pronto para aplicar**

---

## 🔄 Próximo Passo: Criar Tabelas no Supabase

### Via Dashboard (Mais fácil)

1. **Acesse**: https://supabase.com/dashboard
2. **Projeto**: Clique em **CLL** (qmgymfsgrdlqoelressp)
3. **SQL Editor**: Menu lateral → SQL Editor
4. **Criar novo query**:
   - Clique em **"New Query"** ou botão `+`
   - Nome: "001 - Initial Schema"
5. **Copiar e colar** o conteúdo do arquivo:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
6. **Executar**: Clique em `▶ Run` (Cmd+Enter)

Se funcionar, você verá:
```
Success - No rows returned
```

---

### Verificar se funcionou

Após executar, vá para **Database** → **Tables** no Supabase e confirme que existem:

- `assessoras`
- `noivas`
- `bartenders`
- `eventos`
- `degustacoes`

---

## 🎯 O que cada tabela armazena

### `noivas` ⭐ Principal
- **nome**: Nome da noiva
- **email**: Para newsletter
- **data_casamento**: Data do evento
- **respostas**: JSON com as 8 perguntas respondidas
- **cardapio**: JSON with drinks gerados pela Claude
- **status**: `cardapio_gerado` | `agendada_degustacao` | `evento_concluido`

### `assessoras`
- Profissionais parceiras que compartilham o link de afiliado
- **slug**: Para gerar link único (ex: `/assessora/ana-silva`)
- **comissão**: 10% do ticket

### `bartenders`
- Profissionais que executam os eventos

### `eventos`
- Vincula: noiva + assessora + bartender + data + valor

### `degustacoes`
- Agendamentos de prova dos drinks

---

## 📱 Estrutura Front-end

```
src/
├── app/
│   ├── page.tsx              → CardapioForm (conversacional)
│   └── api/cardapio/         → POST para Claude
├── components/
│   ├── CardapioForm.tsx      → 7 perguntas + fluxo
│   └── DrinksList.tsx        → Mostra cardápio gerado
├── lib/supabase.ts           → Client Supabase
├── types/index.ts            → Tipos TypeScript
└── utils/claude.ts           → Integração Claude
```

---

## 🚀 Após criar as tabelas

1. Salvar uma noiva no Supabase:
   ```typescript
   // src/app/api/cardapio/route.ts
   const { data, error } = await supabase
     .from('noivas')
     .insert({
       nome: body.noivaNome,
       respostas: body.respostas,
       cardapio: resultado,
     })
   ```

2. Permitir assessora salvar link de afiliado

3. Dashboard da assessora (`/assessora/[slug]`)

---

## 📞 Credenciais

Estão em `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `ANTHROPIC_API_KEY` ✅

---

## 📝 Próximas Fases

**Fase 2**: Assessoras + Dashboard
- Link de afiliado `/assessora/[slug]`
- Pipeline Kanban
- Comissões automáticas

**Fase 3**: Integrações
- WhatsApp (n8n + Evolution API)
- Compartilhamento de cardápio
- Analytics

---

**Desenvolvido com** ❤️ **para Cozinha Líquida**
