import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArtifactFrame, parseResponse } from './ArtifactFrame.jsx'

export function MessageBubble({ message, isStreaming }) {
  const isUser = message.role === 'user'
  const content = message.content || ''

  if (isUser) {
    return (
      <div style={styles.row}>
        <div style={styles.spacer} />
        <div style={styles.userBubble}>{content}</div>
        <div style={styles.avatarUser}>U</div>
      </div>
    )
  }

  // While streaming: strip partial artifact tags from visible text, show spinner
  if (isStreaming) {
    const visibleText = content.replace(/<ARTIFACT[\s\S]*$/, '').trim()
    const hasArtifactInProgress = content.includes('<ARTIFACT')

    return (
      <div style={styles.row}>
        <div style={styles.avatarAgent}>V</div>
        <div style={styles.agentContent}>
          {visibleText && (
            <div style={{ ...styles.agentBubble, ...styles.streaming }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {visibleText}
              </ReactMarkdown>
              {!hasArtifactInProgress && <span style={styles.cursor}>▋</span>}
            </div>
          )}
          {hasArtifactInProgress && (
            <div style={styles.artifactLoading}>
              <div style={styles.artifactLoadingInner}>
                <div style={styles.spinner} />
                <span style={styles.loadingText}>Generating visual…</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Fully received — parse and render artifacts
  const segments = parseResponse(content)

  return (
    <div style={styles.row}>
      <div style={styles.avatarAgent}>V</div>
      <div style={styles.agentContent}>
        {segments.map((seg, i) =>
          seg.type === 'artifact'
            ? <ArtifactFrame key={i} html={seg.html} title={seg.title} />
            : (
              <div key={i} style={styles.agentBubble}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {seg.content}
                </ReactMarkdown>
              </div>
            )
        )}
      </div>
    </div>
  )
}

const markdownComponents = {
  p: ({ children }) => <p style={{ margin: '0 0 10px', lineHeight: 1.65 }}>{children}</p>,
  strong: ({ children }) => <strong style={{ color: '#f0ede8', fontWeight: 600 }}>{children}</strong>,
  code: ({ inline, children }) => inline
    ? <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', background: 'rgba(249,115,22,0.12)', color: '#f97316', padding: '1px 5px', borderRadius: '4px' }}>{children}</code>
    : <pre style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '12px 16px', overflowX: 'auto', margin: '10px 0' }}><code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color: '#f0ede8' }}>{children}</code></pre>,
  ul: ({ children }) => <ul style={{ paddingLeft: '18px', margin: '6px 0 10px' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: '18px', margin: '6px 0 10px' }}>{children}</ol>,
  li: ({ children }) => <li style={{ margin: '3px 0', lineHeight: 1.6 }}>{children}</li>,
  h1: ({ children }) => <h1 style={{ fontSize: '17px', fontWeight: 600, color: '#f0ede8', margin: '14px 0 8px' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#f0ede8', margin: '12px 0 6px' }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f97316', margin: '10px 0 5px' }}>{children}</h3>,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #f97316', paddingLeft: '12px', margin: '8px 0', color: '#8a8780' }}>{children}</blockquote>,
  table: ({ children }) => <div style={{ overflowX: 'auto', margin: '10px 0' }}><table style={{ borderCollapse: 'collapse', fontSize: '13px', width: '100%' }}>{children}</table></div>,
  th: ({ children }) => <th style={{ padding: '6px 12px', borderBottom: '1px solid rgba(249,115,22,0.3)', color: '#f97316', fontWeight: 500, textAlign: 'left', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px' }}>{children}</th>,
  td: ({ children }) => <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f0ede8' }}>{children}</td>,
}

const styles = {
  row: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    padding: '2px 0',
  },
  spacer: { flex: 1 },
  avatarAgent: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#f97316',
    color: '#0f0f0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
    marginTop: '2px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  avatarUser: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#2a2a2a',
    color: '#8a8780',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    flexShrink: 0,
    marginTop: '2px',
  },
  agentContent: {
    flex: 1,
    minWidth: 0,
  },
  agentBubble: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '4px 12px 12px 12px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#c8c5c0',
    lineHeight: 1.65,
  },
  userBubble: {
    background: '#242424',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px 4px 12px 12px',
    padding: '10px 16px',
    fontSize: '14px',
    color: '#f0ede8',
    maxWidth: '75%',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  streaming: {
    borderColor: 'rgba(249,115,22,0.2)',
  },
  cursor: {
    color: '#f97316',
    marginLeft: '2px',
  },
  artifactLoading: {
    marginTop: '10px',
    border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#1a1a1a',
  },
  artifactLoadingInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 20px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(249,115,22,0.2)',
    borderTop: '2px solid #f97316',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
  loadingText: {
    fontSize: '13px',
    color: '#f97316',
    fontFamily: "'IBM Plex Mono', monospace",
  },
}