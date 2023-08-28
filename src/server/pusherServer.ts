import PusherServer from 'pusher'

const appId = import.meta.env.PUSHER_APP_ID || ''
const key = import.meta.env.PUBLIC_NEXT_PUSHER_APP_KEY || ''
const secret = import.meta.env.PUSHER_APP_SECRET || ''
const cluster = import.meta.env.PUBLIC_NEXT_PUSHER_CLUSTER || ''

export const pusherServer = new PusherServer({
  appId,
  key,
  secret,
  cluster,
  useTLS: true,
})
