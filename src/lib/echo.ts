import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import api from '@/lib/axios'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authorizer: (channel: { name: string }) => ({
    authorize: (socketId: string, callback: (error: Error | null, data: unknown) => void) => {
      api
        .post('/broadcasting/auth', {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then((response) => callback(null, response.data))
        .catch((error) => callback(error, null))
    },
  }),
})

export default echo
