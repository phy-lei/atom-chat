const upstashRedisRestUrl = import.meta.env.UPSTASH_REDIS_REST_URL
const authToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN

type Command = 'zrange' | 'sismember' | 'get' | 'smembers'

export async function fetchRedis(

  command: Command,
  ...args: (string | number)[]
) {
  const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join('/')}`

  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok)
    throw new Error(`Error executing Redis command: ${response.statusText}`)

  const data = await response.json()
  return data.result
}

export async function getFriendsByUserId(userId: string) {
  // retrieve friends for current user
  const friendIds = (await fetchRedis(
    'smembers',
    `user:${userId}:friends`,
  )) as string[]

  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = await fetchRedis('get', `user:${friendId}`) as string
      const parsedFriend = JSON.parse(friend) as User
      return parsedFriend
    }),
  )

  return friends
}

export async function isAlreadyFriendByOwnerEmail(currentId: string) {
  const ownerEmail = import.meta.env.OWNER_EMAIL
  if (!ownerEmail) return 0

  const targetId = (await fetchRedis(
    'get',
    `user:email:${ownerEmail}`,
  )) as string

  if (currentId === targetId) return 1

  const isAlreadyFriends = (await fetchRedis(
    'sismember',
    `user:${currentId}:friends`,
    targetId,
  )) as 0 | 1

  return isAlreadyFriends
}
