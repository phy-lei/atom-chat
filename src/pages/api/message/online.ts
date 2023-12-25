import { nanoid } from 'nanoid'
import type { APIRoute } from 'astro'
import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'
import { pusherServer } from '@/server/pusherServer'
import { toPusherKey } from '@/utils'

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { chatId, online } = body
    const session: Session = (await getSession(context.request, authOptions)) as any

    if (!session) return new Response(JSON.stringify({
      message: 'Unauthorized',
    }), { status: 401 })

    const message = {
      id: nanoid(),
      senderId: session.user.id,
      online
    }

    // notify all connected chat room clients
    await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'check-online', message)

    return new Response(JSON.stringify({
      message: 'Ok',
    }), {
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({
      message: 'Internal Server Error',
    }), { status: 500 })
  }
}
