export default function Test() {
  return (
    <html>
      <head>
        <title>Liquid Mood - Teste</title>
        <style>
          {`
            body {
              background: #0d2424;
              color: #f5f0e8;
              font-family: serif;
              padding: 2rem;
              text-align: center;
            }
            h1 { font-size: 3rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; opacity: 0.8; }
          `}
        </style>
      </head>
      <body>
        <h1>✨ Liquid Mood</h1>
        <p>Servidor funcionando!</p>
        <p><a href="/diagnostics" style={{color: '#c9a84c', textDecoration: 'none'}}>→ Ir para diagnóstico</a></p>
      </body>
    </html>
  )
}
