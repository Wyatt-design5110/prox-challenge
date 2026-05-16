import { useEffect, useRef, useState } from 'react'
import { useAgent } from '../hooks/useAgent.js'
import { MessageBubble } from './MessageBubble.jsx'

const SUGGESTIONS = [
  { label: 'TIG polarity setup', prompt: 'Show me the polarity setup for TIG welding — which cable goes in which socket?' },
  { label: 'Duty cycle at 200A', prompt: 'What is the duty cycle for MIG welding at 200A on 240V? Show me a calculator.' },
  { label: 'Fix porosity', prompt: 'I\'m getting porosity in my flux-cored welds. What should I check?' },
  { label: 'Wire setup steps', prompt: 'Walk me through loading a 10-12 lb wire spool and setting the feed tension.' },
  { label: 'All polarity diagrams', prompt: 'Show me polarity diagrams for all four welding processes: MIG, flux-cored, TIG, and stick.' },
  { label: 'Settings configurator', prompt: 'Build me an interactive settings configurator — I input process, material, and thickness and it outputs recommended wire speed and voltage.' },
]

export function ChatInterface({ apiKey, onChangeKey }) {
  const { messages, isLoading, streamingText, sendMessage, clearMessages } = useAgent()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input, apiKey)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
  }

  const sendSuggestion = (prompt) => {
    sendMessage(prompt, apiKey)
  }

  const isEmpty = messages.length === 0

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoMark}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#f97316">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <div style={styles.productName}>OmniPro 220</div>
            <div style={styles.productSub}>Welding Assistant</div>
          </div>
        </div>

        <div style={styles.sidebarSection}>
          <div style={styles.sectionLabel}>Quick questions</div>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              style={styles.suggestionBtn}
              onClick={() => sendSuggestion(s.prompt)}
              disabled={isLoading}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={styles.sidebarFooter}>
          <button style={styles.clearBtn} onClick={clearMessages} disabled={isEmpty}>
            Clear chat
          </button>
          <button style={styles.clearBtn} onClick={onChangeKey}>
            Change API key
          </button>
        </div>
      </div>

      {/* Main chat */}
      <div style={styles.main}>
        <div style={styles.messages}>
          {isEmpty && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#f97316">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h2 style={styles.emptyTitle}>Ask me anything about the OmniPro 220</h2>
              <p style={styles.emptySubtitle}>
                I'll answer from the full owner's manual and generate diagrams, calculators, and interactive guides when they'll help.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} isStreaming={false} />
          ))}

          {isLoading && streamingText && (
            <MessageBubble
              message={{ role: 'assistant', content: streamingText }}
              isStreaming={true}
            />
          )}

          {isLoading && !streamingText && (
            <div style={styles.typingRow}>
              <div style={styles.typingAvatar}>V</div>
              <div style={styles.typingBubble}>
                <span style={styles.dot1} />
                <span style={styles.dot2} />
                <span style={styles.dot3} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={styles.inputArea}>
          <div style={styles.inputRow}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about setup, settings, troubleshooting…"
              style={styles.textarea}
              rows={1}
              disabled={isLoading}
            />
            <button
              style={{ ...styles.sendBtn, opacity: (!input.trim() || isLoading) ? 0.4 : 1 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p style={styles.inputHint}>Shift+Enter for new line · Enter to send</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: '#0f0f0f',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    background: '#111',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '18px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoMark: {
    width: '32px',
    height: '32px',
    background: '#0f0f0f',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(249,115,22,0.2)',
    flexShrink: 0,
  },
  productName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#f0ede8',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  productSub: {
    fontSize: '11px',
    color: '#555250',
  },
  sidebarSection: {
    flex: 1,
    padding: '16px 12px',
    overflow: 'auto',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#555250',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8px',
    paddingLeft: '4px',
  },
  suggestionBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '7px 8px',
    borderRadius: '6px',
    fontSize: '12.5px',
    color: '#8a8780',
    cursor: 'pointer',
    transition: 'all 0.12s',
    marginBottom: '2px',
    lineHeight: 1.4,
  },
  sidebarFooter: {
    padding: '12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    padding: '7px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#555250',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'color 0.12s',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    pointerEvents: 'auto',  // add this
    scrollBehavior: 'smooth',  // add this
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '60px 20px 40px',
    gap: '12px',
  },
  emptyIcon: {
    width: '56px',
    height: '56px',
    background: '#1a1a1a',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(249,115,22,0.2)',
    marginBottom: '4px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#f0ede8',
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#8a8780',
    lineHeight: 1.6,
    maxWidth: '380px',
  },
  typingRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  typingAvatar: {
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
    fontFamily: "'IBM Plex Mono', monospace",
  },
  typingBubble: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '4px 12px 12px 12px',
    padding: '14px 18px',
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  dot1: { width: '6px', height: '6px', borderRadius: '50%', background: '#555250', display: 'inline-block', animation: 'bounce 1.2s 0s infinite' },
  dot2: { width: '6px', height: '6px', borderRadius: '50%', background: '#555250', display: 'inline-block', animation: 'bounce 1.2s 0.2s infinite' },
  dot3: { width: '6px', height: '6px', borderRadius: '50%', background: '#555250', display: 'inline-block', animation: 'bounce 1.2s 0.4s infinite' },
  inputArea: {
    padding: '14px 20px 10px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: '#0f0f0f',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    color: '#f0ede8',
    resize: 'none',
    outline: 'none',
    lineHeight: 1.5,
    minHeight: '40px',
    maxHeight: '140px',
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '9px',
    border: 'none',
    background: '#f97316',
    color: '#0f0f0f',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.15s',
  },
  inputHint: {
    fontSize: '11px',
    color: '#3a3836',
    marginTop: '6px',
    textAlign: 'center',
  },
}
