import type { APIRoute } from 'astro'
import { db } from '@/server/db'
import { pusherServer } from '@/server/pusherServer'
import { toPusherKey } from '@/utils'
import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'

export const post: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { chatId, message, index } = body

    const session: Session = (await getSession(context.request, authOptions)) as any
    if (!session) return new Response(JSON.stringify({
      message: 'Unauthorized',
    }), { status: 401 })

    const res = await db.zrem(`chat:${chatId}:messages`, ...message)

    if (res === 0) return new Response(JSON.stringify({
      message: 'nothing to delete',
    }), {
      status: 400,
    });

    await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'delete-message', { messageNum: message.length, index })

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