"use client"

import { useEffect, useRef } from "react"
import Plyr from "plyr"
import "plyr/dist/plyr.css"

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  title?: string
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Plyr | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    // Initialize Plyr
    const player = new Plyr(videoRef.current, {
      controls: [
        "play-large",
        "restart",
        "rewind",
        "play",
        "fast-forward",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
      settings: ["quality", "speed"],
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      },
      keyboard: {
        focused: true,
        global: false,
      },
      tooltips: {
        controls: true,
        seek: true,
      },
    })

    playerRef.current = player

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [])

  // Security measures: Prevent screenshots and screen recording
  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent keyboard shortcuts for screenshots and screen recording
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Print Screen
      if (e.key === "PrintScreen") {
        e.preventDefault()
        return false
      }

      // Block Cmd+Shift+3/4/5 (macOS screenshots)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (e.key === "3" || e.key === "4" || e.key === "5") {
          e.preventDefault()
          return false
        }
      }

      // Block F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault()
        return false
      }

      // Block Ctrl+Shift+I/C/J (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key === "I" || e.key === "C" || e.key === "J") {
          e.preventDefault()
          return false
        }
      }

      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault()
        return false
      }

      // Block Ctrl+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        return false
      }
    }

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Prevent drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    container.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    container.addEventListener("selectstart", handleSelectStart)
    container.addEventListener("dragstart", handleDragStart)
    container.addEventListener("copy", handleCopy)
    container.addEventListener("cut", handleCut)
    video.addEventListener("contextmenu", handleContextMenu)
    video.addEventListener("selectstart", handleSelectStart)
    video.addEventListener("dragstart", handleDragStart)

    // Detect screen recording attempts (limited effectiveness)
    const handleVisibilityChange = () => {
      if (document.hidden && video && !video.paused) {
        // Video might be recorded, pause it
        video.pause()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      container.removeEventListener("selectstart", handleSelectStart)
      container.removeEventListener("dragstart", handleDragStart)
      container.removeEventListener("copy", handleCopy)
      container.removeEventListener("cut", handleCut)
      video.removeEventListener("contextmenu", handleContextMenu)
      video.removeEventListener("selectstart", handleSelectStart)
      video.removeEventListener("dragstart", handleDragStart)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full bg-black rounded-lg overflow-hidden relative select-none"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserDrag: "none",
      }}
    >
      {/* Invisible overlay to prevent interactions */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ pointerEvents: "none" }}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        className="plyr__video-embed w-full select-none"
        playsInline
        poster={thumbnailUrl}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          WebkitTouchCallout: "none",
          WebkitUserDrag: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={videoUrl} type="video/mp4" />
        <track kind="captions" />
      </video>
    </div>
  )
}

