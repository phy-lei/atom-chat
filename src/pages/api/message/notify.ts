import type { APIRoute } from 'astro'
import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'
import { pusherServer } from '@/server/pusherServer'
import { toPusherKey } from '@/utils'

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { userId, friend, } = body
    const session: Session = (await getSession(context.request, authOptions)) as any

    if (!session) return new Response(JSON.stringify({
      message: 'Unauthorized',
    }), { status: 401 })

    await pusherServer.trigger(toPusherKey(`user:${userId}:notify`), 'bell', friend)

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
