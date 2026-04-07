'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import DrinksList from './DrinksList'

interface Respostas {
  [key: string]: string
}

let supabase: any = null

try {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
} catch (err) {
  console.error('Erro ao conectar Supabase:', err)
}

interface Pergunta {
  id: string
  label: string
  texto: string
  detalhe?: string
  tipo: 'opcoes' | 'texto'
  opcoes?: Array<{ label: string; emoji: string }>
  max?: number
}

const PERGUNTAS: Pergunta[] = [
  {
    id: 'festa',
    label: 'A festa',
    texto: 'Como vocês imaginam a festa?',
    tipo: 'opcoes',
    opcoes: [
      { label: 'Na pista até o fim', emoji: '🎉' },
      { label: 'Conversando em grupinhos', emoji: '💬' },
    ],
  },
  {
    id: 'decisao',
    label: 'As decisões',
    texto: 'A gente decide como?',
    tipo: 'opcoes',
    opcoes: [
      { label: 'Na intuição', emoji: '⚡' },
      { label: 'Pensando bastante', emoji: '🤔' },
    ],
  },
  {
    id: 'conheceu',
    label: 'A história',
    texto: 'Como vocês se conheceram?',
    detalhe: 'Uma frase. Não precisa ser bonito — precisa ser verdadeiro.',
    tipo: 'texto',
  },
  {
    id: 'hora',
    label: 'A energia',
    texto: 'Se a festa fosse uma hora do dia, qual seria?',
    tipo: 'opcoes',
    opcoes: [
      { label: 'Amanhecer', emoji: '🌅' },
      { label: 'Meio-dia', emoji: '☀️' },
      { label: 'Fim de tarde', emoji: '🌇' },
      { label: 'Meia-noite', emoji: '🌙' },
    ],
  },
  {
    id: 'sentir',
    label: 'A energia',
    texto: 'O que vocês querem que os convidados sintam ao ir embora?',
    tipo: 'opcoes',
    opcoes: [
      { label: 'Leveza', emoji: '🕊️' },
      { label: 'Euforia', emoji: '⚡' },
      { label: 'Intimidade', emoji: '🔥' },
      { label: 'Nostalgia', emoji: '🌊' },
    ],
  },
  {
    id: 'sabor',
    label: 'O detalhe',
    texto: 'Tem um sabor, cheiro ou textura que define vocês dois?',
    detalhe: 'Uma fruta, uma memória, um lugar.',
    tipo: 'texto',
  },
  {
    id: 'palavra',
    label: 'O detalhe',
    texto: 'Uma palavra para a noite que vocês imaginam.',
    detalhe: 'Só uma.',
    tipo: 'texto',
    max: 25,
  },
]

export default function CardapioForm() {
  const [etapa, setEtapa] = useState<'nome' | 'perguntas' | 'loading' | 'assessora' | 'resultado'>('nome')
  const [passo, setPasso] = useState(0)
  const [respostas, setRespostas] = useState<Respostas>({})
  const [cardapio, setCardapio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [nomeNoiva, setNomeNoiva] = useState('')
  const [emailNoiva, setEmailNoiva] = useState('')
  const [dataCasamento, setDataCasamento] = useState('')
  const [nomeSegundoParceiro, setNomeSegundoParceiro] = useState('')
  const [temAssessora, setTemAssessora] = useState<boolean | null>(null)
  const [nomeAssessora, setNomeAssessora] = useState('')
  const [telefoneDDD, setTelefoneDDD] = useState('')
  const [telefoneFone, setTelefoneFone] = useState('')
  const [noivadId, setNoivadId] = useState<number | null>(null)

  const perguntaAtual = PERGUNTAS[passo]
  const progresso = ((passo + 1) / PERGUNTAS.length) * 100

  const handleRespostaTexto = (valor: string) => {
    if (perguntaAtual.max && valor.length > perguntaAtual.max) return
    setRespostas((prev) => ({
      ...prev,
      [perguntaAtual.id]: valor,
    }))
  }

  const handleRespostaOpcao = (valor: string) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaAtual.id]: valor,
    }))
  }

  const podeAvancar = () => {
    const resposta = respostas[perguntaAtual.id]
    if (perguntaAtual.tipo === 'opcoes') {
      return !!resposta
    }
    return resposta && resposta.trim().length >= 2
  }

  const proximoStep = () => {
    if (passo < PERGUNTAS.length - 1) {
      setPasso((p) => p + 1)
    } else {
      gerarCardapio()
    }
  }

  const passoAnterior = () => {
    if (passo > 0) setPasso((p) => p - 1)
  }

  const gerarCardapio = async () => {
    setEtapa('loading')
    setError(null)

    try {
      // Preparar respostas com contexto dos nomes
      const respostasComContexto = {
        ...respostas,
        nomes: `${nomeNoiva}${nomeSegundoParceiro ? ` & ${nomeSegundoParceiro}` : ''}`,
      }

      // Chamar API para gerar cardápio
      const response = await fetch('/api/cardapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respostas: respostasComContexto,
        }),
      })

      if (!response.ok) throw new Error('Falha ao gerar cardápio')

      const data = await response.json()
      if (data.success) {
        setCardapio(data.cardapio)

        // Salvar dados no Supabase
        try {
          const { data: insertData, error: insertError } = await supabase
            .from('noivas')
            .insert({
              nome: nomeNoiva,
              nome_segundo_parceiro: nomeSegundoParceiro || null,
              email: emailNoiva || null,
              data_casamento: dataCasamento || null,
              respostas: respostasComContexto,
              cardapio: data.cardapio,
              status: 'cardapio_gerado',
            })
            .select('id')

          if (insertError) {
            console.warn('Aviso: Dados não foram salvos no banco:', insertError.message)
          } else if (insertData && insertData.length > 0) {
            setNoivadId(insertData[0].id)
          }
        } catch (err) {
          console.warn('Aviso: Erro ao salvar no Supabase:', err)
        }

        // Ir para tela de assessora
        setEtapa('assessora')
      } else {
        setError(data.error || 'Erro ao gerar cardápio')
        setEtapa('perguntas')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar')
      setEtapa('perguntas')
    }
  }

  const salvarAssessoraEIrParaResultado = async () => {
    try {
      if (noivadId && temAssessora === true) {
        // Atualizar registro com info de assessora
        const { error: updateError } = await supabase
          .from('noivas')
          .update({
            assessora_nome: nomeAssessora || null,
            assessora_ddd: telefoneDDD || null,
            assessora_telefone: telefoneFone || null,
          })
          .eq('id', noivadId)

        if (updateError) {
          console.warn('Aviso: Info de assessora não foi salva:', updateError.message)
        }
      }
      setEtapa('resultado')
    } catch (err) {
      console.warn('Aviso: Erro ao salvar assessora:', err)
      setEtapa('resultado')
    }
  }

  // Tela de Nome
  if (etapa === 'nome') {
    const podeComecra = nomeNoiva.trim().length > 0
    return (
      <div className="min-h-screen bg-[#0d2424] text-[#f5f0e8] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-[#c9a84c] text-sm tracking-widest mb-6 uppercase">by Cozinha Líquida</div>
          <h1 className="font-serif text-6xl font-bold mb-2">Liquid</h1>
          <h2 className="font-serif text-5xl italic text-[#c9a84c] mb-12">Mood</h2>
          <p className="text-[#f5f0e8] opacity-75 mb-8">Crie o cardápio de drinks perfeito para seu casamento</p>

          {/* Nome Primeiro Parceiro */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Seu nome"
              value={nomeNoiva}
              onChange={(e) => setNomeNoiva(e.target.value)}
              autoFocus
              className="w-full bg-transparent border-b-2 border-[#c9a84c] py-3 px-2 text-center text-lg font-serif italic text-[#f5f0e8] placeholder-[#c9a84c] placeholder-opacity-30 outline-none"
            />
          </div>

          {/* Nome Segundo Parceiro */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Nome do seu parceiro ou parceira (opcional)"
              value={nomeSegundoParceiro}
              onChange={(e) => setNomeSegundoParceiro(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#c9a84c] py-3 px-2 text-center text-lg font-serif italic text-[#f5f0e8] placeholder-[#c9a84c] placeholder-opacity-30 outline-none"
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <input
              type="email"
              placeholder="Seu email (opcional)"
              value={emailNoiva}
              onChange={(e) => setEmailNoiva(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#c9a84c] py-3 px-2 text-center text-sm font-serif italic text-[#f5f0e8] placeholder-[#c9a84c] placeholder-opacity-30 outline-none"
            />
          </div>

          {/* Data da Festa */}
          <div className="mb-8">
            <label className="text-[#c9a84c] text-xs uppercase tracking-widest mb-2 block opacity-70">Data da festa</label>
            <input
              type="date"
              value={dataCasamento}
              onChange={(e) => setDataCasamento(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#c9a84c] py-3 px-2 text-center text-sm font-serif italic text-[#f5f0e8] placeholder-[#c9a84c] placeholder-opacity-30 outline-none"
            />
          </div>

          <button
            onClick={() => podeComecra && setEtapa('perguntas')}
            disabled={!podeComecra}
            className="px-12 py-3 bg-[#c9a84c] text-[#0d2424] uppercase tracking-widest text-sm font-medium hover:bg-[#f0c855] transition disabled:opacity-50"
          >
            Começar
          </button>
        </div>
      </div>
    )
  }

  // Tela de Loading
  if (etapa === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d2424] text-[#f5f0e8] flex flex-col items-center justify-center p-4">
        <style>{`
          @keyframes bartenderPour {
            0%, 100% { transform: rotateZ(0deg); }
            25% { transform: rotateZ(-15deg); }
            75% { transform: rotateZ(15deg); }
          }
          @keyframes dropFall {
            0% { transform: translateY(-20px); opacity: 1; }
            100% { transform: translateY(40px); opacity: 0; }
          }
          .bartender-pour { animation: bartenderPour 2s infinite; transform-origin: top center; }
          .drop { animation: dropFall 1s infinite; position: absolute; }
        `}</style>
        
        <div className="relative mb-12 h-32 w-32 flex items-center justify-center">
          <div className="text-8xl bartender-pour">🍸</div>
          <div className="drop" style={{ left: '30%', animationDelay: '0s' }}>💧</div>
          <div className="drop" style={{ left: '50%', animationDelay: '0.3s' }}>💧</div>
          <div className="drop" style={{ left: '70%', animationDelay: '0.6s' }}>💧</div>
        </div>
        
        <h2 className="font-serif text-3xl mb-3 text-[#f5f0e8] text-center">Criando seu cardápio</h2>
        <p className="text-[#c9a84c] opacity-50 text-sm">🍸 Conversando com o Bartender...</p>
        
        <div className="mt-8 w-32 h-1 bg-[#152e2e] rounded-full overflow-hidden">
          <div className="h-full bg-[#c9a84c] rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    )
  }

  // Tela de Resultado
  if (etapa === 'resultado' && cardapio) {
    return (
      <div className="min-h-screen bg-[#0d2424] text-[#f5f0e8] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <DrinksList
            cardapio={cardapio}
            noivaNome={nomeNoiva}
            nomeSegundoParceiro={nomeSegundoParceiro}
            emailNoiva={emailNoiva}
            dataCasamento={dataCasamento}
            nomeAssessora={nomeAssessora}
            telefoneDDD={telefoneDDD}
            telefoneFone={telefoneFone}
          />
        </div>
      </div>
    )
  }

  // Tela de Assessora
  if (etapa === 'assessora' && cardapio) {
    return (
      <div className="min-h-screen bg-[#0d2424] text-[#f5f0e8] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-[#c9a84c] text-xs tracking-widest mb-6 uppercase">Informações Adicionais</div>
          <h1 className="font-serif text-5xl font-bold mb-12 text-[#f5f0e8]">
            Você tem uma assessora?
          </h1>

          {temAssessora === null ? (
            <div className="space-y-4 mb-12">
              <button
                onClick={() => {
                  setTemAssessora(true)
                }}
                className="w-full p-6 text-center border-2 border-[#c9a84c] border-opacity-30 hover:border-opacity-60 transition hover:bg-[#c9a84c] hover:bg-opacity-10"
              >
                <div className="text-4xl mb-3">👰</div>
                <div className="font-serif text-lg">Sim, deixa os dados!</div>
              </button>

              <button
                onClick={() => {
                  setTemAssessora(false)
                  salvarAssessoraEIrParaResultado()
                }}
                className="w-full p-6 text-center border-2 border-[#c9a84c] border-opacity-30 hover:border-opacity-60 transition hover:bg-[#c9a84c] hover:bg-opacity-10"
              >
                <div className="text-4xl mb-3">✨</div>
                <div className="font-serif text-lg">Nah, segue o jogo!</div>
              </button>
            </div>
          ) : temAssessora === true ? (
            <div className="space-y-6 mb-12">
              <div>
                <label className="text-[#c9a84c] text-xs uppercase tracking-widest mb-2 block opacity-70">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="Nome da assessora"
                  value={nomeAssessora}
                  onChange={(e) => setNomeAssessora(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-b-2 border-[#c9a84c] py-3 px-2 text-center text-lg font-serif italic text-[#f5f0e8] placeholder-[#c9a84c] placeholder-opacity-30 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[#c9a84c] text-xs uppercase tracking-widest mb-2 block opacity-70">
                    DDD
                  </label>
                  <input
                    type="text"
                    placeholder="11"
                    value={telefoneDDD}
                    onChange={(e) => setTelefoneDDD(e.target.value.slice(0, 2))}
                    maxLength={2}
                    className="w-full bg-transparent border-b-2 border-[#c9a84c] py-3 px-2 text-center text-lg font-serif italic text-[#f5f0e8] placeholder-[#c9a84c] placeholder-opacity-30 outline-none"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-[#c9a84c] text-xs uppercase tracking-widest mb-2 block opacity-70">
                    Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="98765-4321"
                    value={telefoneFone}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '')
                      setTelefoneFone(valor)
                    }}
                    maxLength={9}
                    className="w-full bg-transparent border-b-2 border-[#c9a84c] py-3 px-2 text-center text-lg font-serif italic text-[#f5f0e8] placeholder-[#c9a84c] placeholder-opacity-30 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setTemAssessora(null)}
                  className="flex-1 px-6 py-3 border-2 border-[#c9a84c] text-[#c9a84c] uppercase tracking-widest text-sm font-medium hover:bg-[#c9a84c] hover:text-[#0d2424] transition"
                >
                  Voltar
                </button>

                <button
                  onClick={salvarAssessoraEIrParaResultado}
                  disabled={!nomeAssessora.trim()}
                  className="flex-1 px-6 py-3 bg-[#c9a84c] text-[#0d2424] uppercase tracking-widest text-sm font-medium hover:bg-[#d4b86a] transition disabled:opacity-50"
                >
                  Continuar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  // Tela de Perguntas
  return (
    <div className="min-h-screen bg-[#0d2424] text-[#f5f0e8] flex flex-col items-center justify-center p-4">
      {/* Barra de progresso */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#152e2e]">
        <div
          className="h-full bg-[#c9a84c] transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      {/* Botão voltar */}
      {passo > 0 && (
        <button
          onClick={passoAnterior}
          className="fixed top-6 left-6 text-[#c9a84c] opacity-50 hover:opacity-100 transition text-2xl"
        >
          ←
        </button>
      )}

      <div className="max-w-2xl w-full">
        {/* Label */}
        <div className="text-[#c9a84c] text-xs tracking-widest uppercase mb-6 opacity-60">
          {perguntaAtual.label} · Passo {passo + 1} de {PERGUNTAS.length}
        </div>

        {/* Pergunta */}
        <h2 className="font-serif text-5xl md:text-6xl font-bold mb-4 leading-tight">
          {perguntaAtual.texto}
        </h2>

        {perguntaAtual.detalhe && (
          <p className="text-[#f5f0e8] opacity-70 mb-12 text-lg">{perguntaAtual.detalhe}</p>
        )}

        {/* Respostas */}
        {perguntaAtual.tipo === 'opcoes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {perguntaAtual.opcoes?.map((opcao) => (
              <button
                key={opcao.label}
                onClick={() => handleRespostaOpcao(opcao.label)}
                className={`p-6 text-left border-2 transition-all ${
                  respostas[perguntaAtual.id] === opcao.label
                    ? 'border-[#c9a84c] bg-[#c9a84c] bg-opacity-10'
                    : 'border-[#c9a84c] border-opacity-20 hover:border-opacity-50'
                }`}
              >
                <div className="text-4xl mb-3">{opcao.emoji}</div>
                <div className="font-serif text-xl">{opcao.label}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-12">
            <input
              type="text"
              value={respostas[perguntaAtual.id] || ''}
              onChange={(e) => handleRespostaTexto(e.target.value)}
              placeholder="Sua resposta..."
              maxLength={perguntaAtual.max || 180}
              autoFocus
              className="w-full bg-transparent border-b-2 border-[#c9a84c] py-3 text-2xl font-serif italic text-[#f5f0e8] placeholder-[#c9a84c] placeholder-opacity-30 outline-none focus:border-opacity-100 transition"
            />
            {perguntaAtual.max && (
              <div className="text-xs text-[#c9a84c] opacity-50 mt-2">
                {(respostas[perguntaAtual.id] || '').length} / {perguntaAtual.max}
              </div>
            )}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-[#c0392b] bg-opacity-10 border border-[#c0392b] p-4 mb-8 rounded">
            <p className="text-[#ff6b6b]">{error}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <button
            onClick={proximoStep}
            disabled={!podeAvancar()}
            className="flex-1 px-6 py-3 bg-[#c9a84c] text-[#0d2424] uppercase tracking-widest text-sm font-medium hover:bg-[#f0c855] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passo === PERGUNTAS.length - 1 ? 'Criar Cardápio' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}
