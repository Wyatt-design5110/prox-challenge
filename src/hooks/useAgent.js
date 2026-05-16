import { useState, useCallback } from 'react'
import { MANUAL_PDF_B64 } from '../pdfData.js'

const API_URL = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PROMPT = `You are an expert technical assistant for the Vulcan OmniPro 220 multiprocess welding system. You have been given the complete 48-page owner's manual as a PDF document.

Answer every question accurately and completely from the manual. Never say you don't have access to something — the full manual is right there.

Imagine the user just bought this welder and is standing in their garage. They're not a professional welder. Be helpful, clear, and practical.

## Tone
- Direct and friendly — like a knowledgeable friend, not a manual
- Lead with the answer, then explain
- Always include safety warnings when relevant
- Suggest practicing on scrap first for any welding technique questions

## Manual Images
You can show actual pages from the manual by including this tag:
<MANUAL_IMAGE key="keyname" />

Available image keys and when to use them:
- key="symbology" — symbols, warning icons, control icons
- key="frontPanel" — control panel, knobs, LCD, front of machine
- key="interiorControls" — wire feed mechanism, spool, tensioner, feed roller
- key="dutyCycle" — duty cycle questions
- key="weldingTechnique" — gun angles, stringer/weave bead, CTWD, push/drag angle
- key="weldDiagnosis1" — weld quality, penetration, burn-through
- key="weldDiagnosis2" — diagnosing bad welds, example weld diagrams
- key="tigSetup" — TIG setup specifically
- key="stickSetup" — stick setup, stick cable connections
- key="migPolarity" — MIG or flux-cored polarity/cable setup
- key="spoolSetup1" — loading 1-2 lb wire spool
- key="spoolSetup2" — loading 10-12 lb wire spool
- key="strikeTest" — strike test, testing weld quality

ALWAYS include the relevant manual image when answering visual questions.

## Visual Artifacts
When a diagram, calculator, or interactive visual would help, wrap HTML in <ARTIFACT title="description"> tags.

Artifact style: background #0f0f0f, accent #f97316 orange, text #f0ede8.
ALWAYS start artifacts with: <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
Use HTML entities for special chars: &rarr; &mdash; &deg; &times; — never raw Unicode arrows or emoji in artifacts.

Generate artifacts for:
- Duty cycle questions → interactive calculator
- Troubleshooting questions → interactive flowchart
- Polarity questions → clean schematic diagram, no hover tooltips, labels always visible
- Settings questions → configurator tool

NEVER generate an artifact for wire setup questions — show the <MANUAL_IMAGE> and text steps only.
NEVER combine a <MANUAL_IMAGE> tag and an <ARTIFACT> in the same response — pick one or the other.`

export function useAgent() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')

  const sendMessage = useCallback(async (userText) => {
    if (isLoading || !userText.trim()) return

    const userMsg = { role: 'user', content: userText.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setIsLoading(true)
    setStreamingText('')

    try {
      // Build messages with PDF attached to first user message only
      const apiMessages = newMessages.map((m, i) => {
        // Attach PDF to the first user message
        if (m.role === 'user' && i === 0) {
          return {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: MANUAL_PDF_B64,
                },
                title: 'Vulcan OmniPro 220 Owner\'s Manual',
                cache_control: { type: 'ephemeral' },
              },
              {
                type: 'text',
                text: m.content,
              },
            ],
          }
        }
        return { role: m.role, content: m.content }
      })

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'pdfs-2024-09-25',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 8192,
          system: SYSTEM_PROMPT,
          stream: true,
          messages: apiMessages,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || `API error ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const event = JSON.parse(data)
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              fullText += event.delta.text
              setStreamingText(fullText)
            }
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullText }])
      setStreamingText('')
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** ${err.message}`,
        isError: true,
      }])
      setStreamingText('')
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, isLoading, streamingText, sendMessage, clearMessages }
}
