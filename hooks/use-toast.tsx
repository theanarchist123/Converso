'use client'

import * as React from 'react'

type ToastVariant = 'default' | 'destructive'

interface Toast {
  id: string
  title: string
  description?: string
  duration?: number
  variant?: ToastVariant
}

interface ToastContextType {
  toasts: Toast[]
  toast: (props: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const newToast: Toast = { ...props, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto-dismiss after duration
    if (props.duration) {
      setTimeout(() => {
        dismiss(id)
      }, props.duration)
    }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            backgroundColor: toast.variant === 'destructive' ? '#dc2626' : '#f97316',
            color: '#ffffff',
            borderColor: toast.variant === 'destructive' ? '#b91c1c' : '#ea580c',
          }}
          className="p-4 rounded-lg shadow-2xl border-2 animate-in slide-in-from-top-2"
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <div className="font-bold text-sm" style={{ color: '#ffffff' }}>
                {toast.title}
              </div>
              {toast.description && (
                <div className="text-xs mt-1" style={{ color: '#ffffff' }}>
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-sm font-bold rounded px-2 py-1 transition-all hover:opacity-80"
              style={{ color: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
