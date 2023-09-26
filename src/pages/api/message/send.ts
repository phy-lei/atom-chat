import { nanoid } from 'nanoid'
import type { APIRoute } from 'astro'
import { fetchRedis } from '@/server/redis'
import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'
import { db } from '@/server/db'
import { pusherServer } from '@/server/pusherServer'
import { toPusherKey } from '@/utils'

export const post: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { text, chatId } = body
    const session: Session = (await getSession(context.request, authOptions)) as any

    if (!session) return new Response(JSON.stringify({
      message: 'Unauthorized',
    }), { status: 401 })

    const [userId1, userId2] = chatId.split('--')

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response(JSON.stringify({
        message: 'Unauthorized',
      }), { status: 401 })
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1

    const friendList = (await fetchRedis(
      'smembers',
      `user:${session.user.id}:friends`
    )) as string[]
    const isFriend = friendList.includes(friendId)

    if (!isFriend) {
      return new Response(JSON.stringify({
        message: 'Unauthorized',
      }), { status: 401 })
    }

    const rawSender = (await fetchRedis(
      'get',
      `user:${session.user.id}`
    )) as string
    const sender = JSON.parse(rawSender) as User

    const timestamp = Date.now()

    const message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    }

    // notify all connected chat room clients
    await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message)

    await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
      ...message,
      senderImg: sender.image,
      senderName: sender.name
    })

    // all valid, send the message
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    })

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
