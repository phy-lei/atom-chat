import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'
import { fetchRedis } from '@/server/redis'
import { db } from '@/server/db'
import { pusherServer } from '@/server/pusherServer'
import { toPusherKey } from '@/utils'
import type { APIRoute } from 'astro'

export const post: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { id: idToAdd } = body
    const session: Session = (await getSession(context.request, authOptions)) as any

    if (!session) {
      return new Response(JSON.stringify({
        message: 'Unauthorized',
      }), { status: 401 })
    }

    // verify both users are not already friends
    const isAlreadyFriends = await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd,
    )

    if (isAlreadyFriends) {
      return new Response(JSON.stringify({
        message: 'Already friends',
      }), { status: 400 })
    }

    const hasFriendRequest = await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd,
    )

    if (!hasFriendRequest) {
      return new Response(JSON.stringify({
        message: 'No friend request',
      }), { status: 400 })
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis('get', `user:${session.user.id}`),
      fetchRedis('get', `user:${idToAdd}`),
    ])) as [string, string]

    const user = JSON.parse(userRaw) as User
    const friend = JSON.parse(friendRaw) as User

    // notify added user
    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:friends`),
        'new_friend',
        user,
      ),
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        'new_friend',
        friend,
      ),
      db.sadd(`user:${session.user.id}:friends`, idToAdd),
      db.sadd(`user:${idToAdd}:friends`, session.user.id),
      db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
    ])

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
