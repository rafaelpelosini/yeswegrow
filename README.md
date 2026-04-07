# Liquid Mood - Premium Wedding Drink Curation

Liquid Mood é um sistema premium de curadoria de drinks para casamentos, alimentado por IA Claude.

## 🚀 Tech Stack

- **Frontend**: Next.js 15+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta Supabase
- API Key da Anthropic (Claude)

## 🛠️ Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com seus valores:

```bash
cp .env.example .env.local
```

Variáveis necessárias:
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço (backend apenas)
- `ANTHROPIC_API_KEY`: Sua API key da Anthropic

### 3. Desenvolver

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📚 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── cardapio/       # Rota para gerar cardápio com Claude
│   ├── page.tsx            # Home page
│   ├── layout.tsx
│   └── globals.css
├── components/             # Componentes React
├── lib/
│   └── supabase.ts        # Cliente Supabase
├── types/
│   └── index.ts           # Tipos TypeScript
└── utils/
    └── claude.ts          # Utilitários Claude API
```

## 🔑 Endpoints da API

### POST `/api/cardapio`

Gera um cardápio personalizado de drinks baseado nos dados informados.

**Request Body:**
```json
{
  "noivaNome": "Maria",
  "noivoNome": "João",
  "tema": "Tropical",
  "preferenciasAlcoolicas": "Rum, Vodka",
  "preferenciasNaoAlcoolicas": "Suco de abacaxi"
}
```

**Response:**
```json
{
  "success": true,
  "cardapio": "[{\"name\": \"...\", \"description\": \"...\", ...}]"
}
```

## 📝 Fase 1 - Roadmap

- [x] Scaffold Next.js com TypeScript e Tailwind
- [x] Integração Supabase (cliente)
- [x] Integração Claude API
- [x] Rota API `/api/cardapio`
- [ ] Interface de Noiva (migrar do HTML)
- [ ] Autenticação Supabase
- [ ] CRUD de drinks no banco
- [ ] Deploy na Vercel

## 🚀 Deploy na Vercel

1. Push para GitHub
2. Importar repositório na Vercel
3. Adicionar variáveis de ambiente
4. Deploy automático

## 📖 Documentação

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Claude API Docs](https://docs.anthropic.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📬 Feedback

Para questões ou melhorias, abra uma issue no repositório.
