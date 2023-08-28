
import type { APIRoute } from 'astro'
import { getSession } from '@solid-auth/base';
import { authOptions } from '@/server/auth';
import { fetchRedis } from '@/server/redis'
import { db } from '@/server/db'
import { pusherServer } from '@/server/pusher'
import { toPusherKey } from '@/utils'


export const post: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { email } = body
    console.log('[ email ] >', email)
    const idToAdd = (await fetchRedis(
      'get',
      `user:email:${email}`
    )) as string

    if (!idToAdd) {
      return new Response(JSON.stringify({
        message: 'This person does not exist.'
      }), { status: 400 })
    }

    const session: Session = (await getSession(context.request, authOptions)) as any

    if (!session) {
      return new Response(JSON.stringify({
        message: 'Unauthorized'
      }), { status: 401 })
    }
    console.log('[  idToAdd] >', idToAdd === session.user.id)
    if (idToAdd === session.user.id) {

      return new Response(JSON.stringify({
        message: 'You cannot add yourself as a friend'
      }), {
        status: 400,
      })
    }
    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      'sismember',
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1

    if (isAlreadyAdded) {
      return new Response(JSON.stringify({
        message: 'Already added this user'
      }), { status: 400 })
    }

    // check if user is already added
    const isAlreadyFriends = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1

    if (isAlreadyFriends) {
      return new Response(JSON.stringify({
        message: 'Already friends with this user'
      }), { status: 400 })
    }

    // valid request, send friend request
    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      'incoming_friend_requests',
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      }
    )

    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)
    return new Response('OK')
  }
  catch (error) {
    return new Response(JSON.stringify({
      message: 'Invalid request'
    }), { status: 400 })
  }
}
