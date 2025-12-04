// components/creator-profile/profile-about.tsx
"use client"

import { User } from "lucide-react"

interface ProfileAboutProps {
  html: string
}

export function ProfileAbout({ html }: ProfileAboutProps) {
  if (!html) return null

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="size-5 text-muted-foreground" />
        <h3 className="font-semibold">Über mich</h3>
      </div>
      <div
        className="prose prose-sm prose-invert max-w-none
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground
          prose-em:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

