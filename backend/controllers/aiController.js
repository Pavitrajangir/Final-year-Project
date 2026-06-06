export const aiChat = async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.json({ success: false, message: 'Invalid messages format' })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      return res.json({
        success: false,
        message: 'GROQ_API_KEY not set. Get a FREE key at console.groq.com → API Keys'
      })
    }

    // Groq uses OpenAI-compatible API format
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',   // free, fast, very capable
        max_tokens:  1024,
        temperature: 0.7,
        messages: [
          {
            role:    'system',
            content: systemPrompt || 'You are MediMate AI, a helpful health assistant for Indian patients.'
          },
          ...messages   // [{role: 'user'|'assistant', content: string}]
        ]
      }),
    })

    const data = await response.json()

    // Groq error handling
    if (data.error) {
      console.error('Groq API error:', data.error)
      return res.json({ success: false, message: `AI error: ${data.error.message}` })
    }

    const reply = data.choices?.[0]?.message?.content
    if (!reply) {
      return res.json({ success: false, message: 'Empty response from AI' })
    }

    res.json({ success: true, reply })

  } catch (err) {
    console.error('AI controller error:', err.message)
    res.json({ success: false, message: 'AI service unavailable. Check server logs.' })
  }
}
