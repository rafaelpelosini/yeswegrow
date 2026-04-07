'use client'

import { useState } from 'react'

interface Drink {
  id: number
  nome: string
  drink_original: string
  momento: string
  tipo: string
  sensorial: string
  narrativa: string
  ingredientes: string
  copo: string
  modo_preparo: string
  alcool_grau?: number
}

interface CardapioResponse {
  set_name: string
  set_narrative: string
  drinks: Drink[]
}

interface DrinksListProps {
  cardapio: string
  noivaNome?: string
  nomeSegundoParceiro?: string
  emailNoiva?: string
  dataCasamento?: string
  nomeAssessora?: string
  telefoneDDD?: string
  telefoneFone?: string
}

export default function DrinksList({
  cardapio,
  noivaNome,
  nomeSegundoParceiro,
  emailNoiva,
  dataCasamento,
  nomeAssessora,
  telefoneDDD,
  telefoneFone,
}: DrinksListProps) {
  const [expandedDrink, setExpandedDrink] = useState<number | null>(null)
  const [selectedDrinks, setSelectedDrinks] = useState<number[]>([])
  const [showSelectionMode, setShowSelectionMode] = useState(true)

  let cardapioData: CardapioResponse | null = null

  try {
    const jsonMatch = cardapio.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cardapioData = JSON.parse(jsonMatch[0])
    }
  } catch (err) {
    console.error('Erro ao parsear cardápio:', err)
  }

  if (!cardapioData) {
    return (
      <div className="bg-[#152e2e] border border-[#c9a84c] rounded-lg p-6">
        <p className="text-[#f5f0e8]">Não conseguimos processar o cardápio gerado.</p>
      </div>
    )
  }

  const drinks = cardapioData.drinks || []

  const handleSelectDrink = (drinkId: number) => {
    setSelectedDrinks((prev) => {
      if (prev.includes(drinkId)) {
        return prev.filter((id) => id !== drinkId)
      } else {
        if (prev.length < 5) {
          return [...prev, drinkId]
        }
        return prev
      }
    })
  }

  const nivelAlcool = (grau: number = 0) => {
    if (grau <= 15) return '🍃 Suave'
    if (grau <= 20) return '🍋 Leve'
    if (grau <= 25) return '🔥 Médio'
    if (grau <= 30) return '⚡ Forte'
    return '💥 Muito Forte'
  }

  const formatarParaWhatsapp = () => {
    let mensagem = `💜 *${cardapioData.set_name}*\n\n`

    // Informações das noivas
    if (noivaNome) {
      mensagem += `👰 *Noivos:* ${noivaNome}${nomeSegundoParceiro ? ` & ${nomeSegundoParceiro}` : ''}\n`
    }
    if (dataCasamento) {
      mensagem += `📅 *Data:* ${new Date(dataCasamento).toLocaleDateString('pt-BR')}\n`
    }
    if (nomeAssessora && telefoneDDD && telefoneFone) {
      mensagem += `📞 *Assessora:* ${nomeAssessora} - (${telefoneDDD}) ${telefoneFone}\n`
    }
    if (emailNoiva) {
      mensagem += `📧 *Email:* ${emailNoiva}\n`
    }

    mensagem += `\n_${cardapioData.set_narrative}_\n\n`

    const drinksFormatados = showSelectionMode
      ? drinks.filter((d) => selectedDrinks.includes(d.id))
      : drinks

    drinksFormatados.forEach((drink) => {
      mensagem += `🥃 *${drink.nome}*\n`
      mensagem += `${drink.drink_original} (${drink.momento})\n`
      mensagem += `Sensorial: ${drink.sensorial}\n`
      mensagem += `Álcool: ${drink.alcool_grau}° | ${nivelAlcool(drink.alcool_grau)}\n`
      mensagem += `Copo: ${drink.copo}\n`
      mensagem += `Modo: ${drink.modo_preparo}\n`
      mensagem += `Ingredientes: ${drink.ingredientes}\n\n`
    })

    return encodeURIComponent(mensagem)
  }

  // Modo Seleção
  if (showSelectionMode && selectedDrinks.length < 5) {
    return (
      <div className="min-h-screen bg-[#0d2424] text-[#f5f0e8] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <div className="text-[#c9a84c] text-xs tracking-widest uppercase mb-4">
              Seu Cardápio Personalizado
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#f5f0e8] mb-4">
              {cardapioData.set_name}
            </h1>
            <p className="text-[#c9a84c] text-lg italic mb-8">{cardapioData.set_narrative}</p>
            <div className="text-[#f5f0e8] text-sm opacity-75">
              Selecione seus 5 drinks favoritos • {selectedDrinks.length} de 5 escolhidos
            </div>
          </div>

          <div className="space-y-4 mb-12">
            {drinks.map((drink) => {
              const isSelected = selectedDrinks.includes(drink.id)
              const canSelect = selectedDrinks.length < 5 || isSelected
              const isExpanded = expandedDrink === drink.id

              return (
                <div
                  key={drink.id}
                  className={`border transition ${
                    isSelected
                      ? 'border-[#c9a84c] border-opacity-60'
                      : canSelect
                      ? 'border-[#c9a84c] border-opacity-30 hover:border-opacity-50'
                      : 'border-[#c9a84c] border-opacity-10 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between p-6">
                    <button
                      onClick={() => canSelect && setExpandedDrink(isExpanded ? null : drink.id)}
                      disabled={!canSelect}
                      className="flex-1 text-left disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-[#c9a84c] text-xs tracking-widest uppercase opacity-70 mb-2">
                            {drink.momento} • {nivelAlcool(drink.alcool_grau)} ({drink.alcool_grau}°)
                          </div>
                          <h3 className="font-serif text-2xl font-bold text-[#f5f0e8] mb-2">
                            {drink.nome}
                          </h3>
                          <p className="text-[#c9a84c] text-sm italic">{drink.drink_original}</p>
                          <p className="text-[#f5f0e8] text-sm opacity-75 mt-2">{drink.sensorial}</p>
                        </div>
                        <div className="text-[#c9a84c] text-xl flex-shrink-0">
                          {isExpanded ? '−' : '+'}
                        </div>
                      </div>
                    </button>

                    {/* Checkbox de Seleção */}
                    <button
                      onClick={() => canSelect && handleSelectDrink(drink.id)}
                      disabled={!canSelect}
                      className={`ml-4 flex-shrink-0 w-8 h-8 border-2 flex items-center justify-center transition disabled:opacity-50 ${
                        isSelected
                          ? 'border-[#c9a84c] bg-[#c9a84c]'
                          : 'border-[#c9a84c] border-opacity-50'
                      }`}
                    >
                      {isSelected && <span className="text-[#0d2424] font-bold text-lg">✓</span>}
                    </button>
                  </div>

                  {/* Detalhes Expandidos */}
                  {isExpanded && canSelect && (
                    <div className="border-t border-[#c9a84c] border-opacity-30 p-6 bg-[#1a3a3a]">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[#c9a84c] font-semibold text-xs uppercase tracking-widest mb-2">
                            A história
                          </h4>
                          <p className="text-[#f5f0e8]">{drink.narrativa}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-[#c9a84c] font-semibold text-xs uppercase tracking-widest mb-2">
                              Copo
                            </h4>
                            <p className="text-[#f5f0e8]">{drink.copo}</p>
                          </div>
                          <div>
                            <h4 className="text-[#c9a84c] font-semibold text-xs uppercase tracking-widest mb-2">
                              Modo de preparo
                            </h4>
                            <p className="text-[#f5f0e8] text-sm">{drink.modo_preparo}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[#c9a84c] font-semibold text-xs uppercase tracking-widest mb-2">
                            Ingredientes
                          </h4>
                          <p className="text-[#f5f0e8] text-sm">{drink.ingredientes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {selectedDrinks.length === 5 && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowSelectionMode(false)}
                className="px-12 py-4 bg-[#c9a84c] text-[#0d2424] uppercase tracking-widest text-sm font-semibold hover:bg-[#d4b86a] transition"
              >
                Ver Cardápio Completo
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Modo Visualização
  const selectedDrinksData = drinks.filter((d) => selectedDrinks.includes(d.id))

  return (
    <div className="min-h-screen bg-[#0d2424] text-[#f5f0e8] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="text-[#c9a84c] text-xs tracking-widest uppercase mb-4">
            Seu Cardápio Personalizado
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#f5f0e8] mb-4">
            {cardapioData.set_name}
          </h1>
          <p className="text-[#c9a84c] text-lg italic">{cardapioData.set_narrative}</p>
        </div>

        {/* Drinks Selecionados */}
        <div className="space-y-4 mb-12">
          {selectedDrinksData.map((drink) => (
            <div
              key={drink.id}
              className="border border-[#c9a84c] border-opacity-30 hover:border-opacity-60 transition"
            >
              <button
                onClick={() => setExpandedDrink(expandedDrink === drink.id ? null : drink.id)}
                className="w-full p-6 text-left hover:bg-[#1a3a3a] transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-[#c9a84c] text-xs tracking-widest uppercase opacity-70 mb-2">
                      {drink.momento} • {nivelAlcool(drink.alcool_grau)} ({drink.alcool_grau}°)
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#f5f0e8] mb-2">
                      {drink.nome}
                    </h3>
                    <p className="text-[#c9a84c] text-sm italic">{drink.drink_original}</p>
                    <p className="text-[#f5f0e8] text-sm opacity-75 mt-2">{drink.sensorial}</p>
                  </div>
                  <div className="text-[#c9a84c] text-xl ml-4 flex-shrink-0">
                    {expandedDrink === drink.id ? '−' : '+'}
                  </div>
                </div>
              </button>

              {expandedDrink === drink.id && (
                <div className="border-t border-[#c9a84c] border-opacity-30 p-6 bg-[#1a3a3a]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[#c9a84c] font-semibold text-xs uppercase tracking-widest mb-2">
                        A história
                      </h4>
                      <p className="text-[#f5f0e8]">{drink.narrativa}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[#c9a84c] font-semibold text-xs uppercase tracking-widest mb-2">
                          Copo
                        </h4>
                        <p className="text-[#f5f0e8]">{drink.copo}</p>
                      </div>
                      <div>
                        <h4 className="text-[#c9a84c] font-semibold text-xs uppercase tracking-widest mb-2">
                          Modo de preparo
                        </h4>
                        <p className="text-[#f5f0e8] text-sm">{drink.modo_preparo}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[#c9a84c] font-semibold text-xs uppercase tracking-widest mb-2">
                        Ingredientes
                      </h4>
                      <p className="text-[#f5f0e8] text-sm">{drink.ingredientes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://wa.me/5511985481386?text=${formatarParaWhatsapp()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-8 py-4 bg-[#c9a84c] text-[#0d2424] uppercase tracking-widest text-sm font-semibold hover:bg-[#d4b86a] transition text-center"
          >
            💬 Continuar no WhatsApp
          </a>
          <a
            href="https://wa.me/5511985481386?text=Gostaria%20de%20agendar%20uma%20degustação%20com%20meu%20cardápio%20personalizado."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-8 py-4 border-2 border-[#c9a84c] text-[#c9a84c] uppercase tracking-widest text-sm font-semibold hover:bg-[#c9a84c] hover:text-[#0d2424] transition text-center"
          >
            📅 Agendar Degustação
          </a>
        </div>

        {selectedDrinks.length === 5 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowSelectionMode(true)}
              className="text-[#c9a84c] text-sm opacity-50 hover:opacity-100 transition"
            >
              ← Voltar à seleção
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
