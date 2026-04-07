-- Liquid Mood Database Schema
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
-- Públicas podem ler assessoras (para links de afiliado)
create policy "Assessoras are publicly readable"
  on assessoras for select
  using (true);

-- Noivas podem ser criadas publicamente
create policy "Noivas can be created"
  on noivas for insert
  with check (true);

-- Noivas podem ser lidas por assessora
create policy "Noivas readable by assessora"
  on noivas for select
  using (
    auth.uid() is null 
    or assessora_id = auth.uid()
  );
