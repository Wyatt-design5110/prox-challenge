import { useState } from 'react'

export function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!key.startsWith('sk-ant-')) {
      setError('API key should start with sk-ant-')
      return
    }
    onSave(key.trim())
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#f97316">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <h1 style={styles.title}>OmniPro 220 Assistant</h1>
        <p style={styles.subtitle}>
          Enter your Anthropic API key to start. It's stored only in your browser session — never sent anywhere except directly to Anthropic.
        </p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setError('') }}
            placeholder="sk-ant-api03-..."
            style={styles.input}
            autoFocus
            spellCheck={false}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={!key.trim()}>
            Start →
          </button>
        </form>
        <p style={styles.hint}>
          Get a key at{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={styles.link}>
            console.anthropic.com
          </a>
        </p>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '20px',
  },
  card: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '40px 36px',
    maxWidth: '420px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
  },
  logo: {
    width: '56px',
    height: '56px',
    background: '#0f0f0f',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(249,115,22,0.2)',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#f0ede8',
  },
  subtitle: {
    fontSize: '13px',
    color: '#8a8780',
    lineHeight: 1.6,
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    width: '100%',
    background: '#0f0f0f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    fontFamily: "'IBM Plex Mono', monospace",
    color: '#f0ede8',
    outline: 'none',
  },
  error: {
    fontSize: '12px',
    color: '#f97316',
    margin: '0',
  },
  button: {
    background: '#f97316',
    color: '#0f0f0f',
    border: 'none',
    borderRadius: '8px',
    padding: '11px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  hint: {
    fontSize: '12px',
    color: '#555250',
  },
  link: {
    color: '#f97316',
    textDecoration: 'none',
  },
}
