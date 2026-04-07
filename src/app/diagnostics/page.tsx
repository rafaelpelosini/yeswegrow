export default function Diagnostics() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const claudeKey = process.env.ANTHROPIC_API_KEY

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#0d2424', color: '#f5f0e8', minHeight: '100vh' }}>
      <h1>🔍 Diagnóstico - Liquid Mood</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Variáveis de Ambiente:</h2>
        
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a3a3a', borderRadius: '4px' }}>
          <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong></p>
          <p style={{ color: supabaseUrl ? '#00ff00' : '#ff6b6b' }}>
            {supabaseUrl ? '✅ Definida' : '❌ NÃO DEFINIDA'}
          </p>
          {supabaseUrl && <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{supabaseUrl.substring(0, 50)}...</p>}
        </div>

        <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a3a3a', borderRadius: '4px' }}>
          <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong></p>
          <p style={{ color: supabaseKey ? '#00ff00' : '#ff6b6b' }}>
            {supabaseKey ? '✅ Definida' : '❌ NÃO DEFINIDA'}
          </p>
          {supabaseKey && <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{supabaseKey.substring(0, 50)}...</p>}
        </div>

        <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a3a3a', borderRadius: '4px' }}>
          <p><strong>ANTHROPIC_API_KEY:</strong></p>
          <p style={{ color: claudeKey ? '#00ff00' : '#ff6b6b' }}>
            {claudeKey ? '✅ Definida' : '❌ NÃO DEFINIDA'}
          </p>
          {claudeKey && <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{claudeKey.substring(0, 50)}...</p>}
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#2a5a5a', borderRadius: '4px' }}>
        <h3>📝 Instruções:</h3>
        <p>Se alguma variável estiver ❌, acesse:</p>
        <p><strong>Vercel Dashboard → Settings → Environment Variables</strong></p>
        <p>E adicione/atualize as variáveis faltantes</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{
          padding: '0.75rem 1.5rem',
          background: '#c9a84c',
          color: '#0d2424',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          ← Voltar
        </a>
      </div>
    </div>
  )
}
