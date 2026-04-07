import CardapioForm from '@/components/CardapioForm'

export default function Home() {
  // Se estamos em produção e não tem env vars, mostre diagnóstico
  const hasEnvVars = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.ANTHROPIC_API_KEY

  if (!hasEnvVars && process.env.NODE_ENV === 'production') {
    return (
      <div style={{ 
        background: '#0d2424', 
        color: '#f5f0e8', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'serif',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>⚠️ Configuração Incompleta</h1>
          <p style={{fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.8}}>
            Variáveis de ambiente não foram configuradas no Vercel
          </p>
          <p style={{marginBottom: '2rem'}}>
            <a href="/diagnostics" style={{color: '#c9a84c', textDecoration: 'none', fontSize: '1.1rem'}}>
              → Verificar Status
            </a>
          </p>
        </div>
      </div>
    )
  }

  return <CardapioForm />
}
