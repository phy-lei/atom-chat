import { getSession } from '@solid-auth/base'
import { authOptions } from '@/server/auth'
import { db } from '@/server/db'
import type { APIRoute } from 'astro'

export const post: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { id: idToDeny } = body
    const session: Session = (await getSession(context.request, authOptions)) as any

    if (!session) {
      return new Response(JSON.stringify({
        message: 'Unauthorized',
      }), { status: 401 })
    }

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny)

    return new Response(JSON.stringify({
      message: 'Ok',
    }), {
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({
      message: 'Invalid request',
    }), { status: 400 })
  }
}
