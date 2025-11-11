'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface UseChatReturn {
  messages: ChatMessage[]
  input: string
  setInput: (input: string) => void
  sendMessage: (message: string) => Promise<void>
  isLoading: boolean
  error: string | null
  clearChat: () => void
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      console.warn('🚫 [useChat] Empty message attempted to send')
      return
    }

    console.log('📤 [useChat] Sending message:', message)

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 [useChat] Calling /api/chat endpoint...')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: messages.slice(-10) // Send last 10 messages for context
        }),
      })

      console.log('📡 [useChat] Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [useChat] API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.error || `API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ [useChat] API Response data:', data)

      if (!data.success) {
        console.error('❌ [useChat] API returned success=false:', data)
        throw new Error(data.error || 'Failed to get response from AI')
      }

      if (!data.message) {
        console.error('❌ [useChat] No message in response:', data)
        throw new Error('No message received from AI')
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      }

      console.log('💬 [useChat] Adding assistant message:', assistantMessage.content.substring(0, 100) + '...')
      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      console.error('💥 [useChat] Critical error in sendMessage:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      })

      setError(err instanceof Error ? err.message : 'Failed to send message')

      // Add error message to chat (user-facing)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment. If the issue persists, contact support@converso.ai",
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      console.log('🏁 [useChat] sendMessage completed')
    }
  }, [messages])

  const clearChat = useCallback(() => {
    console.log('🗑️ [useChat] Clearing chat history')
    setMessages([])
    setInput('')
    setError(null)
  }, [])

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    clearChat
  }
}
