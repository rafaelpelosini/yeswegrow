export interface Drink {
  id: string
  name: string
  description: string
  ingredients: string[]
  preparation: string
  createdAt: string
  updatedAt: string
}

export interface CardapioRequest {
  noivaNome: string
  noivoNome?: string
  tema?: string
  preferenciasAlcoolicas?: string
  preferenciasNaoAlcoolicas?: string
}

export interface CardapioResponse {
  drinks: Drink[]
  resumo?: string
}
