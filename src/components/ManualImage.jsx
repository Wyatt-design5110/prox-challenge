import { MANUAL_IMAGES, IMAGE_DESCRIPTIONS } from '../manualImages.js'
import { useState } from 'react'

export function ManualImage({ imageKey }) {
  const [expanded, setExpanded] = useState(false)
  const src = MANUAL_IMAGES[imageKey]
  const desc = IMAGE_DESCRIPTIONS[imageKey]
  if (!src) return null

  return (
    <div style={styles.wrapper}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <span style={styles.icon}>📄</span>
        <span style={styles.label}>{desc}</span>
        <span style={styles.toggle}>{expanded ? '▲ hide' : '▼ show'}</span>
      </div>
      {expanded && (
        <div style={styles.imageWrapper}>
          <img
            src={src}
            alt={desc}
            style={styles.image}
          />
        </div>
      )}
    </div>
  )
}

// Parse <MANUAL_IMAGE key="xxx" /> tags from agent response
export function parseManualImageTags(text) {
  const segments = []
  const regex = /<MANUAL_IMAGE\s+key="([^"]+)"\s*\/>/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'manualImage', key: match[1] })
    lastIndex = regex.lastIndex
  }

  const remaining = text.slice(lastIndex)
  if (remaining) segments.push({ type: 'text', content: remaining })
  return segments.length > 0 ? segments : [{ type: 'text', content: text }]
}

const styles = {
  wrapper: {
    marginTop: '10px',
    border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#1a1a1a',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  icon: { fontSize: '14px' },
  label: {
    flex: 1,
    fontSize: '12px',
    color: '#f97316',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  toggle: {
    fontSize: '11px',
    color: '#555250',
  },
  imageWrapper: {
    padding: '0 12px 12px',
  },
  image: {
    width: '100%',
    borderRadius: '6px',
    display: 'block',
  },
}
