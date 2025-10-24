// Install: npm install pusher pusher-js

// Server-side (API route)
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
})

// Ban user and send real-time notification
export async function banUser(userId: string, reason: string) {
  // Ban in database first...
  
  // Then notify all admins instantly
  await pusher.trigger('admin-channel', 'user-banned', {
    userId,
    reason,
    timestamp: Date.now()
  })
  
  // Notify the banned user
  await pusher.trigger(`user-${userId}`, 'account-banned', {
    reason,
    timestamp: Date.now()
  })
}

// Client-side React hook
import Pusher from 'pusher-js'

export function useRealtimeAdmin() {
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
    })

    const adminChannel = pusher.subscribe('admin-channel')
    
    adminChannel.bind('user-banned', (data) => {
      console.log('User banned:', data)
      // Update UI instantly
    })

    return () => pusher.disconnect()
  }, [])
}