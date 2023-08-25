import { Redis } from '@upstash/redis'

const url = import.meta.env.UPSTASH_REDIS_REST_URL || ''
const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN || ''

export const db = new Redis({
  url,
  token,
})
