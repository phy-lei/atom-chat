import PusherClient from 'pusher-js'

const key = import.meta.env.PUBLIC_NEXT_PUSHER_APP_KEY || ''
const cluster = import.meta.env.PUBLIC_NEXT_PUSHER_CLUSTER || ''

export const pusherClient = new PusherClient(
  key,
  {
    cluster,
    disableStats: true,
    forceTLS: false,
  },
)
