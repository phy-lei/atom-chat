import type { APIRoute } from 'astro'
import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'
import { pusherServer } from '@/server/pusherServer'
import { db } from '@/server/db'
import { fetchRedis } from '@/server/redis';

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { friendId, isOnline } = body
    const session: Session = (await getSession(context.request, authOptions)) as any
    if (!session) return new Response(JSON.stringify({
      message: 'Unauthorized',
    }), { status: 401 })
    // notify all connected chat room clients
    await pusherServer.trigger('check__online', 'new_online', { friendId, isOnline })

    await db.hset('online:map', {
      [friendId]: isOnline
    })

    const res = await db.hgetall('online:map')

    return new Response(JSON.stringify({
      message: 'Ok',
      data: res
    }), {
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({
      message: 'Internal Server Error',
    }), { status: 500 })
  }
}
