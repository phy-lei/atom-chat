// #vercel-disable-blocks
import { fetch } from 'undici'
// #vercel-end
import { generatePayload, parseOpenAIStream } from '@/utils/openAI'
import { verifySignature } from '@/utils/ai'
import type { APIRoute } from 'astro'
import { isAlreadyFriendByOwnerEmail } from '@/server/redis';
import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'

const apiKey = import.meta.env.OPENAI_API_KEY
const baseUrl = ((import.meta.env.OPENAI_API_BASE_URL) || 'https://api.openai.com').trim().replace(/\/$/, '')

export const POST: APIRoute = async (context) => {
  const body = await context.request.json()
  const { sign, time, messages, prompt } = body
  const session: Session = (await getSession(context.request, authOptions)) as any

  if (!session) return new Response(JSON.stringify({
    message: 'Unauthorized',
  }), { status: 401 })

  const authFriend = await isAlreadyFriendByOwnerEmail(session.user.id);

  if (!authFriend) {
    return new Response(JSON.stringify({
      error: {
        message: 'Unauthorized',
      },
    }), { status: 401 })
  }


  if (!messages) {
    return new Response(JSON.stringify({
      error: {
        message: 'No input text.',
      },
    }), { status: 400 })
  }

  if (import.meta.env.PROD && !await verifySignature({ t: time, m: messages?.[messages.length - 1]?.content || '' }, sign)) {
    return new Response(JSON.stringify({
      error: {
        message: 'Invalid signature.',
      },
    }), { status: 401 })
  }
  const initOptions = generatePayload(apiKey, messages, prompt)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const response = await fetch(`${baseUrl}/v1/chat/completions`, initOptions).catch((err: Error) => {
    console.error(err)
    return new Response(JSON.stringify({
      error: {
        code: err.name,
        message: err.message,
      },
    }), { status: 500 })
  }) as Response

  return parseOpenAIStream(response) as Response
}

