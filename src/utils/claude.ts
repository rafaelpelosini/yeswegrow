import Anthropic from '@anthropic-ai/sdk'
import { BASE_CL } from './base-cl'

const client = new Anthropic()

interface CardapioParams {
  respostas: Record<string, string>
}

export async function generateCardapio(params: CardapioParams): Promise<string> {
  const baseClJson = JSON.stringify(
    BASE_CL.map((drink) => ({
      id: drink.id,
      nome_original: drink.nome_original,
      tipo: drink.tipo,
      base_alcoolica: drink.base,
      ingredientes: drink.ingredientes,
      sensorial: drink.sensorial,
      momento_ideal: drink.momento_ideal,
    })),
    null,
    2
  )

  const respostasFormatadas = Object.entries(params.respostas)
    .map(([pergunta, resposta]) => `${pergunta}: ${resposta}`)
    .join('\n')

  const prompt = `Você é o bartender-curador da Cozinha Líquida, bar de coquetelaria autoral em São Paulo.

Seu estilo: técnica clássica aplicada a insumos brasileiros. Você não cria drinks genéricos de casamento. Você cria um set que conta a história deste casal específico — sem usar os nomes deles, mas usando tudo que eles revelaram sobre si.

BASE DE COQUETELARIA DA CL (use SEMPRE estes drinks como âncora):
${baseClJson}

PERFIL DO CASAL:
${respostasFormatadas}

REGRAS DE CRIAÇÃO:
1. Selecione 6 drinks da base acima — nunca invente drinks fora dela
2. Use os 2 autorais (Cambugim e Cariñito) + 4 clássicos escolhidos por afinidade com o perfil
3. Um drink por momento: chegada / coquetel / jantar / brinde / pista / final de noite
4. Para cada drink crie um nome em português — curto, com caráter, que evoque lugar, sensação ou referência cultural brasileira. Evite adjetivos românticos genéricos como "Romance", "Amor", "Eterno", "Sunset", "Golden"
5. A narrativa de cada drink conecta à história do casal sem mencionar nomes — use lugares, sensações, momentos que eles descreveram
6. O nome do set captura a identidade emocional desta noite em 3-5 palavras

ANTI-PADRÕES — nunca use:
- Nomes genéricos: "Romance", "Amor Eterno", "Sunset", "Golden", "Dream"
- Ingredientes que não estão na base
- Narrativas que poderiam servir para qualquer casal

Responda APENAS com JSON válido:
{
  "set_name": "Nome do Set em 3-5 palavras",
  "set_narrative": "Uma frase que captura a essência emocional desta noite",
  "drinks": [
    {
      "id": 1,
      "nome": "Nome em português, curto",
      "drink_original": "Nome do drink na base CL",
      "momento": "chegada|coquetel|jantar|brinde|pista|final_noite",
      "tipo": "Autoral CL ou Clássico",
      "sensorial": "Descrição sensorial curta",
      "narrativa": "Como este drink conecta à história do casal",
      "ingredientes": "Lista de ingredientes",
      "copo": "Tipo de copo",
      "modo_preparo": "Modo de preparo"
    }
  ]
}`

  const message = await client.messages.create({
    model: 'claude-opus-4-1',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  if (message.content[0].type === 'text') {
    return message.content[0].text
  }

  throw new Error('Unexpected response format from Claude API')
}

