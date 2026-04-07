# 🍸 Liquid Mood — Refatoração da Curadoria de Drinks

## O que foi mudado

### 1. **Nova Base de Drinks da Cozinha Líquida** (`src/utils/base-cl.ts`)

Criou-se o arquivo com os **10 drinks principais**:

- **2 Autorais CL**:
  - `Cambugim` (Rum Agricole + Cambugim fresco)
  - `Cariñito` (Cachaça + Vermouth)

- **8 Clássicos** com reinterpretação:
  - Daiquiri (chegada)
  - Negroni (complexidade)
  - Margarita (energia)
  - Sazerac (força)
  - Mojito (refrescância)
  - Martini (elegância)
  - Old Fashioned (final de noite)

Cada drink tem: ingredientes, modo de preparo, sensorial, momento ideal.

### 2. **Motor de Curadoria Reescrito** (`src/utils/claude.ts`)

Novo prompt para Claude que:

✅ **Seleciona 6 drinks da base** (nunca inventa fora dela)
✅ **Usa 2 autorais + 4 clássicos** escolhidos por afinidade com perfil
✅ **Um drink por momento**: chegada → coquetel → jantar → brinde → pista → final noite
✅ **Nomes em português** curtos com caráter (evita genéricos tipo "Romance", "Sunset")
✅ **Narrativa conectada ao casal** (usa suas respostas sem mencionar nomes)
✅ **Resultado em JSON estruturado** com set_name, set_narrative, drinks[]

### 3. **Componente DrinksList Redesenhado** (`src/components/DrinksList.tsx`)

**Paleta de cores CL**:
- Fundo: `#0d2424` (verde-petróleo escuro)
- Dourado: `#c9a84c` (arte déco)
- Creme: `#f5f0e8` (luz morna)

**Estrutura**:
- Header com set_name e set_narrative (contexto emocional)
- Cada drink expandível com:
  - Nome em português + drink original
  - Momento (chegada/coquetel/etc)
  - Tipo (Autoral CL ou Clássico)
  - Sensorial (descrição tátil/olfativa)
  - Narrativa (conexão com casal)
  - Modo de preparo + copo
  - Ingredientes

**CTAs Novos**:
- `💬 Continuar no WhatsApp` → Leva cardápio formatado para conversa
- `📅 Agendar Degustação` → Inicia conversa de agendamento

### 4. **Endpoint API Simplificado** (`src/app/api/cardapio/route.ts`)

Agora recebe:
```json
{
  "respostas": {
    "festa": "Na pista até o fim",
    "decisao": "Na intuição",
    "conheceu": "No bar...",
    "hora": "Meia-noite",
    "sentir": "Euforia",
    "sabor": "Coco com gengibre",
    "palavra": "Selvageria"
  }
}
```

Passa direto para Claude com os dados do casal.

### 5. **Supabase Integrado** (Automático)

Dados salvos após geração:
- `nome`, `email`, `data_casamento`
- `respostas` (JSONB com 8 perguntas)
- `cardapio` (JSONB com drinks selecionados)
- `status: 'cardapio_gerado'`

---

## Como Testar

1. **Acesse**: http://localhost:3000
2. **Preencha**: nome, email, data
3. **Responda** 8 perguntas conversacionais
4. **Receba**: Cardápio curado pela IA
5. **Compartilhe**: Via WhatsApp ou agende degustação
6. **Verifique**: Dados salvos em Supabase

---

## Exemplos de Output do Claude

### Set Name
❌ ~~"Romance Perfeito"~~ ~~"Amor Eterno"~~ ~~"Golden Night"~~
✅ "Selvageria Tropical" / "Ritmo da Madrugada" / "Brasa e Orvalho"

### Drink Name
❌ ~~"Romance"~~ ~~"Dream Sunset"~~
✅ "Cambugim da Favela" / "Brinde de Faveiro" / "Meia-noite na Lapa"

### Narrativa
Exemplo para casal que se conheceu numa festa:
> "Cambugim da Favela arranca a noite — massa de corpo como a energia no começo. O gengibre pica como aquele primeiro papo gritado, impossível ignorar. Rum agricole: aquela doçura que desmente a potência."

---

## Build & Deploy

✅ TypeScript validado
✅ Compilação bem-sucedida
✅ Pronto para Vercel

```bash
npm run build    # Gera .next otimizado
npm run start    # Roda produção
```

---

## Próximos Passos

1. **Dashboard Assessora** — Ver suas noivas e comissões
2. **Autenticação** — Login com Supabase Auth
3. **Affiliate Links** — Slugs únicos para cada assessora
4. **Analytics** — Quantas degustações → conversões
