import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'
import { fetchRedis } from '@/server/redis'
import { db } from '@/server/db'
import { pusherServer } from '@/server/pusherServer'
import { toPusherKey } from '@/utils'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { email } = body
    const idToAdd = (await fetchRedis(
      'get',
      `user:email:${email}`,
    )) as string

    if (!idToAdd) {
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
    if (idToAdd === session.user.id) {
      return new Response(JSON.stringify({
        message: 'You cannot add yourself as a friend',
      }), {
        status: 400,
      })
    }
    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      'sismember',
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id,
    )) as 0 | 1

    if (isAlreadyAdded) {
      return new Response(JSON.stringify({
        message: 'Already added this user',
      }), { status: 400 })
    }

    // check if user is already added
    const isAlreadyFriends = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd,
    )) as 0 | 1

    if (isAlreadyFriends) {
      return new Response(JSON.stringify({
        message: 'Already friends with this user',
      }), { status: 400 })
    }

    // valid request, send friend request
    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      'incoming_friend_requests',
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      },
    )

    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)
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
