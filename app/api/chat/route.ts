import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI WITHOUT hardcoded fallback
// Fail fast if key missing (reduces accidental leakage and forces proper env setup)
if (!process.env.GEMINI_API_KEY) {
  // Log once on module load; requests will also validate
  console.error('[Startup] GEMINI_API_KEY is missing. Set it in .env.local or deployment secrets.')
}
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

// System prompt for the support chatbot
const SYSTEM_PROMPT = `You are Converso Support, a helpful AI assistant for the Converso learning platform.

ABOUT CONVERSO:
Converso is an AI-powered learning platform where users can:
- Chat with specialized AI companions (tutors) for different subjects
- Have learning sessions with real-time feedback
- Get auto-generated session recaps with key takeaways
- Track their progress with advanced analytics
- Bookmark favorite companions for quick access
- Review complete transcript history of all sessions
- Submit feedback and learning logs
- Access their learning journey anytime, anywhere

YOUR ROLE:
You help users with:
1. **Feature Explanations**: How to use companions, sessions, recaps, bookmarks, analytics, etc.
2. **Learning Strategies**: Study tips, retention techniques, spaced repetition
3. **Account Management**: Profile settings, preferences, subscription
4. **Progress Tracking**: Understanding analytics, viewing history
5. **Troubleshooting**: Common issues and how to resolve them
6. **Bug Reporting**: How to report issues via the feedback center
7. **Feature Requests**: How to suggest improvements

GUIDELINES:
- Be friendly, concise, and encouraging
- Use emojis occasionally to be engaging (but don't overdo it)
- Provide step-by-step instructions when needed
- If you don't know something specific, admit it and suggest contacting support@converso.ai
- Keep responses under 200 words unless a detailed explanation is needed
- Focus on being helpful and actionable

EXAMPLE RESPONSES:
User: "How do I bookmark a companion?"
You: "Great question! 🌟 To bookmark a companion:
1. Go to the Companions page
2. Find the companion you want to bookmark
3. Click the star icon ⭐ on their card
4. They'll appear in your 'Bookmarked Companions' section for quick access!

You can bookmark up to 10 companions to keep your favorites organized."

User: "What are session recaps?"
You: "Session recaps are auto-generated summaries of your learning sessions! 📚

After each conversation with a companion, Converso creates a recap that includes:
✅ Key takeaways and concepts you learned
✅ Important points to remember
✅ Spaced repetition exercises
✅ Downloadable notes (Markdown/PDF)

You can find all your recaps in the 'My Journey' section. They help you review and retain what you've learned!"

Now, please respond to the user's question below.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('\n🚀 ============ CHAT API REQUEST ============')
  console.log('⏰ Timestamp:', new Date().toISOString())

  try {
    // Parse request body
    const body = await request.json()
    const { message, history } = body

    console.log('📥 Request body:', {
      message: message?.substring(0, 100) + (message?.length > 100 ? '...' : ''),
      historyLength: history?.length || 0
    })

    // Validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      console.error('❌ Validation Error: Empty or invalid message')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Message is required and must be a non-empty string' 
        },
        { status: 400 }
      )
    }

    // Check API key strictly (no fallback)
    if (!process.env.GEMINI_API_KEY || !genAI) {
      console.error('❌ CRITICAL: GEMINI_API_KEY is not set (POST handler). Refusing to call model.')
      return NextResponse.json(
        {
          success: false,
          error: 'Server misconfiguration: GEMINI_API_KEY missing'
        },
        { status: 500 }
      )
    }

    console.log('🔑 API Key present: Yes (length=' + process.env.GEMINI_API_KEY.length + ')')

    // Prepare chat history for context
    const chatHistory: ChatMessage[] = Array.isArray(history) ? history : []
    console.log('📜 Chat history:', chatHistory.length, 'messages')

    // Build conversation context
    const conversationContext = chatHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n')

    const fullPrompt = conversationContext 
      ? `${SYSTEM_PROMPT}\n\nPREVIOUS CONVERSATION:\n${conversationContext}\n\nCURRENT USER QUESTION:\n${message}`
      : `${SYSTEM_PROMPT}\n\nUSER QUESTION:\n${message}`

    console.log('📝 Full prompt length:', fullPrompt.length, 'characters')
    console.log('💬 User message:', message)

    // Call Gemini API
    console.log('🤖 Calling Gemini API...')
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const result = await model.generateContent(fullPrompt)
    const response = await result.response

    console.log('📡 Gemini API raw response:', {
      candidates: response.candidates?.length,
      hasText: !!response.text
    })

    const aiMessage = response.text()

    if (!aiMessage || aiMessage.trim().length === 0) {
      console.error('❌ Gemini returned empty response:', {
        response,
        candidates: response.candidates,
        promptFeedback: (response as any).promptFeedback
      })
      throw new Error('AI returned empty response')
    }

    console.log('✅ AI Response received:', aiMessage.substring(0, 100) + (aiMessage.length > 100 ? '...' : ''))
    console.log('📊 Response length:', aiMessage.length, 'characters')

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log('⏱️ Request duration:', duration, 'ms')
    console.log('🎉 ============ REQUEST SUCCESSFUL ============\n')

    return NextResponse.json({
      success: true,
      message: aiMessage,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        duration,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    const endTime = Date.now()
    const duration = endTime - startTime

    console.error('\n💥 ============ CHAT API ERROR ============')
    console.error('❌ Error Type:', error?.constructor?.name || typeof error)
    console.error('❌ Error Message:', error?.message || 'Unknown error')
    console.error('❌ Error Stack:', error?.stack)
    console.error('❌ Full Error Object:', JSON.stringify(error, null, 2))
    console.error('⏱️ Failed after:', duration, 'ms')
    console.error('⏰ Error Timestamp:', new Date().toISOString())

    // Check for specific Gemini API errors
    if (error?.message?.includes('API key')) {
      console.error('🔑 API KEY ERROR detected')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid API key configuration' 
        },
        { status: 500 }
      )
    }

    if (error?.message?.includes('quota')) {
      console.error('💰 QUOTA ERROR detected')
      return NextResponse.json(
        { 
          success: false, 
          error: 'API quota exceeded' 
        },
        { status: 429 }
      )
    }

    if (error?.message?.includes('network') || error?.code === 'ECONNREFUSED') {
      console.error('🌐 NETWORK ERROR detected')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Network connection error' 
        },
        { status: 503 }
      )
    }

    console.error('🔥 ============ ERROR LOG END ============\n')

    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'An unexpected error occurred',
        errorType: error?.constructor?.name,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET endpoint for health check
export async function GET() {
  console.log('🏥 Health check requested')

  const configured = !!process.env.GEMINI_API_KEY

  return NextResponse.json({
    status: configured ? 'ok' : 'misconfigured',
    service: 'Converso Support Chat API',
    timestamp: new Date().toISOString(),
    apiConfigured: configured,
    model: 'gemini-2.0-flash-exp'
  })
}
