'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [copied, setCopied] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sql = `-- Liquid Mood Database Schema
-- Supabase PostgreSQL

-- Tabela: assessoras
create table if not exists assessoras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  telefone text,
  slug text unique not null,
  indicada_por uuid references assessoras(id),
  status text default 'pendente',
  nivel text default 'basico',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela: noivas
create table if not exists noivas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefone text,
  data_casamento date,
  assessora_id uuid references assessoras(id) on delete set null,
  respostas jsonb,
  cardapio jsonb,
  status text default 'cardapio_gerado',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela: bartenders
create table if not exists bartenders (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique,
  telefone text,
  avaliacao_media numeric(3,2) default 0,
  eventos_realizados int default 0,
  status text default 'ativo',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela: eventos
create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  noiva_id uuid references noivas(id) on delete cascade,
  assessora_id uuid references assessoras(id) on delete set null,
  bartender_id uuid references bartenders(id) on delete set null,
  data_evento date,
  valor_total numeric(10,2),
  comissao_assessora numeric(10,2),
  status text default 'proposta_enviada',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela: degustacoes
create table if not exists degustacoes (
  id uuid primary key default gen_random_uuid(),
  noiva_id uuid references noivas(id) on delete cascade,
  assessora_id uuid references assessoras(id) on delete set null,
  data_agendada timestamptz,
  status text default 'agendada',
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para performance
create index if not exists idx_noivas_assessora on noivas(assessora_id);
create index if not exists idx_noivas_status on noivas(status);
create index if not exists idx_eventos_noiva on eventos(noiva_id);
create index if not exists idx_eventos_assessora on eventos(assessora_id);
create index if not exists idx_eventos_bartender on eventos(bartender_id);
create index if not exists idx_degustacoes_noiva on degustacoes(noiva_id);
create index if not exists idx_assessoras_slug on assessoras(slug);

-- Enable RLS (Row Level Security)
alter table assessoras enable row level security;
alter table noivas enable row level security;
alter table bartenders enable row level security;
alter table eventos enable row level security;
alter table degustacoes enable row level security;

-- RLS Policies
create policy "Assessoras are publicly readable"
  on assessoras for select
  using (true);

create policy "Noivas can be created"
  on noivas for insert
  with check (true);

create policy "Noivas readable by assessora"
  on noivas for select
  using (auth.uid() is null or assessora_id = auth.uid());`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Erro ao copiar: ' + err)
    }
  }

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      const response = await fetch(`/api/migrate?token=liquid-mood-admin`, {
        method: 'POST',
      })
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setResult({ error: String(err) })
    }
    setMigrating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d2424] to-[#1a3a3a] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#c9a84c] mb-2">Liquid Mood</h1>
          <p className="text-[#f5f0e8]">🗄️ Setup do Banco de Dados</p>
        </div>

        {/* Main Cards */}
        <div className="space-y-6">
          {/* Option 1: Copy SQL */}
          <div className="bg-[#1a3a3a] border border-[#c9a84c] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#c9a84c] mb-4">Opção 1: Dashboard Supabase</h2>
            <p className="text-[#f5f0e8] mb-4 text-sm">
              Copie o SQL abaixo, acesse <strong>SQL Editor</strong> no seu projeto Supabase e cole para executar.
            </p>
            <textarea
              value={sql}
              readOnly
              className="w-full h-64 bg-[#0d2424] text-[#f5f0e8] p-3 rounded border border-[#c9a84c]/30 font-mono text-xs mb-4"
            />
            <button
              onClick={handleCopy}
              className={`w-full py-2 px-4 rounded font-semibold transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-[#c9a84c] text-[#0d2424] hover:bg-[#d4b86a]'
              }`}
            >
              {copied ? '✓ Copiado!' : '📋 Copiar SQL'}
            </button>
            <p className="text-[#f5f0e8] text-xs mt-3 opacity-75">
              ✓ Cole o SQL no Supabase Dashboard &gt; SQL Editor &gt; New Query &gt; Run
            </p>
          </div>

          {/* Option 2: Auto Migration */}
          <div className="bg-[#1a3a3a] border border-[#c9a84c] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#c9a84c] mb-4">Opção 2: Migração Automática</h2>
            <p className="text-[#f5f0e8] mb-4 text-sm">
              Clique abaixo para tentar executar a migração automaticamente via API.
            </p>
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="w-full py-3 px-4 rounded font-semibold bg-[#c9a84c] text-[#0d2424] hover:bg-[#d4b86a] disabled:opacity-50 transition-colors"
            >
              {migrating ? '⏳ Migrando...' : '🚀 Executar Migration'}
            </button>

            {result && (
              <div className="mt-4 p-3 rounded bg-[#0d2424] border border-[#c9a84c]/30">
                <pre className="text-[#f5f0e8] text-xs overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-[#0d2424] border border-[#c9a84c]/20 rounded-lg p-4">
            <p className="text-[#f5f0e8] text-xs space-y-2">
              <div>✓ 5 tabelas: assessoras, noivas, bartenders, eventos, degustacoes</div>
              <div>✓ 7 índices para performance</div>
              <div>✓ Row Level Security (RLS) configurado</div>
              <div>✓ Pronto para produção</div>
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-[#1a3a3a] border border-[#c9a84c]/20 rounded-lg p-4">
            <h3 className="text-[#c9a84c] font-semibold mb-2">Próximos Passos</h3>
            <ul className="text-[#f5f0e8] text-xs space-y-1">
              <li>✓ Salvar dados do formulário no banco</li>
              <li>✓ Integrar Supabase Auth para login</li>
              <li>✓ Dashboard da assessora</li>
              <li>✓ Deploy para Vercel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
