import { useState, useCallback } from 'react'
import { SYSTEM_PROMPT } from '../systemPrompt.js'

const API_URL = 'https://api.anthropic.com/v1/messages'

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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 8192,
          system: SYSTEM_PROMPT,
          stream: true,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
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

      const assistantMsg = { role: 'assistant', content: fullText }
      setMessages(prev => [...prev, assistantMsg])
      setStreamingText('')
    } catch (err) {
      const errMsg = {
        role: 'assistant',
        content: `**Error:** ${err.message}\n\nMake sure your API key is correct and has access to Claude.`,
        isError: true,
      }
      setMessages(prev => [...prev, errMsg])
      setStreamingText('')
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, isLoading, streamingText, sendMessage, clearMessages }
}
