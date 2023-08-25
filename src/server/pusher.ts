import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

const appId = import.meta.PUSHER_APP_ID || ''
const key = import.meta.NEXT_PUBLIC_PUSHER_APP_KEY || ''
const secret = import.meta.PUSHER_APP_SECRET || ''
const cluster = import.meta.NEXT_PUBLIC_PUSHER_CLUSTER || ''

export const pusherServer = new PusherServer({
  appId,
  key,
  secret,
  cluster,
  useTLS: true,
})

export const pusherClient = new PusherClient(
  key,
  {
    cluster,
  }
)
