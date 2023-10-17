import { createParser } from 'eventsource-parser'
import prompts from './prompts'
import type { ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import type { ChatMessage } from '@/types/aiChat'

export const model = import.meta.env.OPENAI_API_MODEL || 'gpt-3.5-turbo'

export const generatePayload = (apiKey: string, messages: ChatMessage[], prompt: number): RequestInit & { dispatcher?: any } => {
  // 检查 messages 数组是否开始于一个 "system" 角色的消息
  if (messages.length === 0 || messages[0].role !== 'system') {
    // 如果没有，添加一个 "system" 角色的消息到数组开始
    messages.unshift({
      role: 'system',
      content: prompts[prompt].prompt,
    })
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Cache-Control': 'no-store',
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      stream: true,
    }),
  }
}

export const parseOpenAIStream = (rawResponse: Response) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  if (!rawResponse.ok) {
    return new Response(rawResponse.body, {
      status: rawResponse.status,
      statusText: rawResponse.statusText,
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content || ''
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(streamParser)

      for await (const chunk of rawResponse.body as any) {
        parser.feed(decoder.decode(chunk))
        setTimeout(() => {

          parser.feed(decoder.decode(chunk))
        }, 1000)
      }

    },
  })

  // to prevent browser prompt for credentials
  const newHeaders = new Headers(rawResponse.headers);
  newHeaders.delete("www-authenticate");
  // to disable nginx buffering
  newHeaders.set("X-Accel-Buffering", "no");
  newHeaders.set("Connection", "keep-alive");

  return new Response(stream, {
    status: rawResponse.status,
    statusText: rawResponse.statusText,
    headers: newHeaders,
  })
}
