// Quick usage examples for admin commands
// Import in your admin components:
// import { useAdminWS } from '@/hooks/useAdminWS'

const { 
  isConnected,
  announce,
  forceReload,
  setReadOnly,
  broadcast,
  refreshAnalytics 
} = useAdminWS()

// ========================================
// 1. GLOBAL ANNOUNCEMENT
// ========================================
// Show banner/toast to all users
await announce(
  'Maintenance Notice',           // Title
  'System restart in 5 minutes',  // Body
  120                              // Duration in seconds (optional, default: 60)
)

// Short announcement
await announce('Update', 'New features live!')

// ========================================
// 2. FORCE CLIENT RELOAD
// ========================================
// Reload all connected clients immediately
await forceReload('Deploy security patch')

// Simple reload
await forceReload()

// ========================================
// 3. READ-ONLY MODE
// ========================================
// Disable all forms/actions globally
await setReadOnly(
  true,                    // Enable read-only
  'Database migration'     // Reason (optional)
)

// Later, re-enable
await setReadOnly(false, 'Maintenance complete')

// ========================================
// 4. ADMIN BROADCAST (Legacy)
// ========================================
// Send message to other admin dashboards
await broadcast('User spike detected in region US-EAST')

// ========================================
// 5. REFRESH ANALYTICS
// ========================================
// Trigger analytics refresh across dashboards
await refreshAnalytics()

// ========================================
// CLIENT-SIDE HANDLING
// ========================================
// Already implemented in AdminCommandListener.tsx
// - announce → Shows toast
// - forceReload → Warns, then reloads after 3s
// - setReadOnly → Shows banner + sets localStorage flag
// - broadcast → Shows admin message toast

// Check if app is in read-only mode:
const isReadOnly = localStorage.getItem('app.readOnly') === '1'

// Listen for analytics refresh:
window.addEventListener('admin:refresh_analytics', () => {
  // Refetch your analytics data
})

// ========================================
// TYPICAL WORKFLOWS
// ========================================

// Maintenance window:
async function startMaintenance() {
  await announce('Maintenance', 'Going offline in 2 minutes', 120)
  await new Promise(r => setTimeout(r, 120000)) // Wait 2 min
  await setReadOnly(true, 'Maintenance in progress')
  // Do maintenance...
  await setReadOnly(false, 'Back online!')
}

// Deploy hotfix:
async function deployHotfix() {
  await announce('Update', 'Deploying fix, please save work', 30)
  await new Promise(r => setTimeout(r, 30000)) // Wait 30s
  await forceReload('Critical security patch deployed')
}

// Scheduled announcement:
async function scheduleAnnouncement(title: string, body: string, delayMs: number) {
  setTimeout(async () => {
    await announce(title, body, 60)
  }, delayMs)
}

// ========================================
// ERROR HANDLING
// ========================================
if (!isConnected) {
  console.error('Admin commands unavailable - not connected')
  return
}

const success = await announce('Test', 'Hello world')
if (!success) {
  console.error('Failed to send announcement')
}

// ========================================
// MONITORING
// ========================================
const { messages } = useAdminWS()

// Recent command history
const recentCommands = messages.slice(-10)

// Filter by type
const announcements = messages.filter(m => m.type === 'admin:announce')
const reloads = messages.filter(m => m.type === 'admin:force_reload')

// ========================================
// CONNECTION STATUS
// ========================================
const { isConnected, isConnecting, connectionError } = useAdminWS()

if (isConnecting) {
  console.log('Connecting to Supabase...')
}

if (connectionError) {
  console.error('Connection error:', connectionError)
}

if (isConnected) {
  console.log('✅ Ready to send commands')
}
