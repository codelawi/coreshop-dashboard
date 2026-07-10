import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

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
  authEndpoint: `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:8000'}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
    },
  },
})

export function refreshEchoAuth(): void {
  const token = localStorage.getItem('token') ?? ''
  // @ts-expect-error private connector property
  if (echo.connector?.pusher?.config?.auth?.headers) {
    // @ts-expect-error private connector property
    echo.connector.pusher.config.auth.headers.Authorization = `Bearer ${token}`
  }
}

export default echo
