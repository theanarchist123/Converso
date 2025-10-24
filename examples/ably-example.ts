// Install: npm install ably

import Ably from 'ably'

// Client-side
const ably = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY!)

export function useAblyRealtime() {
  useEffect(() => {
    // Subscribe to admin channel
    const adminChannel = ably.channels.get('admin-commands')
    
    adminChannel.subscribe('user-banned', (message) => {
      console.log('User banned:', message.data)
      // Handle ban notification
    })

    // Subscribe to user-specific channel for ban detection
    const userChannel = ably.channels.get(`user-${userId}`)
    userChannel.subscribe('account-banned', (message) => {
      // Log out user immediately
      signOut()
      router.push('/banned')
    })

    return () => {
      adminChannel.unsubscribe()
      userChannel.unsubscribe()
    }
  }, [])

  // Send admin command
  const banUser = async (userId: string, reason: string) => {
    const adminChannel = ably.channels.get('admin-commands')
    
    // Ban in database first
    await fetch('/api/admin/ban-user', {
      method: 'POST',
      body: JSON.stringify({ userId, reason })
    })
    
    // Then broadcast to all admins
    await adminChannel.publish('user-banned', { userId, reason })
    
    // Notify the banned user
    const userChannel = ably.channels.get(`user-${userId}`)
    await userChannel.publish('account-banned', { reason })
  }
}