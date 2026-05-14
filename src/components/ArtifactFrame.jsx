import { useEffect, useRef, useState } from 'react'

export function ArtifactFrame({ html, title }) {
  const iframeRef = useRef(null)
  const [height, setHeight] = useState(300)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    iframe.src = url

    const handleLoad = () => {
      try {
        const h = iframe.contentDocument?.body?.scrollHeight
        if (h) setHeight(Math.max(h + 24, 120))
      } catch {}
    }

    iframe.addEventListener('load', handleLoad)
    return () => {
      iframe.removeEventListener('load', handleLoad)
      URL.revokeObjectURL(url)
    }
  }, [html])

  return (
    <div style={styles.artifactWrapper}>
      <div style={styles.artifactHeader}>
        <span style={styles.artifactIcon}>⬡</span>
        <span style={styles.artifactTitle}>{title || 'Visual'}</span>
      </div>
      <iframe
        ref={iframeRef}
        style={{ ...styles.iframe, height }}
        sandbox="allow-scripts"
        title={title || 'Agent visual'}
      />
    </div>
  )
}

// Parse agent response text into segments: text blocks and artifact blocks
export function parseResponse(text) {
  const segments = []
  const regex = /<ARTIFACT(?:\s+title="([^"]*)")?>([\s\S]*?)<\/ARTIFACT>/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index).trim()
      if (textBefore) segments.push({ type: 'text', content: textBefore })
    }
    segments.push({ type: 'artifact', title: match[1] || 'Visual', html: match[2].trim() })
    lastIndex = regex.lastIndex
  }

  const remaining = text.slice(lastIndex).trim()
  if (remaining) segments.push({ type: 'text', content: remaining })

  return segments.length > 0 ? segments : [{ type: 'text', content: text }]
}

const styles = {
  artifactWrapper: {
    marginTop: '10px',
    border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#0f0f0f',
  },
  artifactHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    background: 'rgba(249,115,22,0.08)',
    borderBottom: '1px solid rgba(249,115,22,0.15)',
  },
  artifactIcon: {
    color: '#f97316',
    fontSize: '14px',
  },
  artifactTitle: {
    fontSize: '12px',
    color: '#f97316',
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: '0.03em',
  },
  iframe: {
    width: '100%',
    border: 'none',
    display: 'block',
    background: 'transparent',
  },
}
