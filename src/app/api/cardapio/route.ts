import { NextRequest, NextResponse } from 'next/server'
import { generateCardapio } from '@/utils/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { respostas } = body

    if (!respostas || typeof respostas !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Respostas não fornecidas' },
        { status: 400 }
      )
    }

    const response = await generateCardapio({ respostas })

    return NextResponse.json({ success: true, cardapio: response }, { status: 200 })
  } catch (error) {
    console.error('Error generating cardapio:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate cardapio' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST respostas to generate cardápio' })
}
