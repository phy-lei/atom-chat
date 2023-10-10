import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'
import { db } from '@/server/db'
import { chatHrefConstructor } from '@/utils';
import type { APIRoute } from 'astro'

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { targetId } = body

    if (!targetId) {
      return new Response(JSON.stringify({
        message: 'This person does not exist.',
      }), { status: 400 })
    }

    const session: Session = (await getSession(context.request, authOptions)) as any

    if (!session) {
      return new Response(JSON.stringify({
        message: 'Unauthorized',
      }), { status: 401 })
    }

    // delete each other
    await db.srem(`user:${session.user.id}:friends`, targetId)
    await db.srem(`user:${targetId}:friends`, session.user.id)

    const chatId = chatHrefConstructor(
      session.user.id,
      targetId
    )
    // delete message all
    await db.del(`chat:${chatId}:messages`)

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
