// app/home/chat/layout.tsx
import { ReactNode } from "react"

/**
 * Chat-spezifisches Layout
 * Entfernt Footer und BottomNav für vollbildigen WhatsApp-Style Chat
 */
export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}

