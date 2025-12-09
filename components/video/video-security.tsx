"use client"

import { useEffect } from "react"

/**
 * Video Security Component
 * Adds additional security measures to prevent screenshots and screen recording
 */
export function VideoSecurity() {
  useEffect(() => {
    // Block common screenshot and screen recording detection methods
    
    // Detect if DevTools is opened
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        // DevTools might be open, pause video if playing
        const videos = document.querySelectorAll("video")
        videos.forEach((video) => {
          if (!video.paused) {
            video.pause()
          }
        })
      }
    }

    // Check periodically for DevTools
    const devToolsInterval = setInterval(detectDevTools, 500)

    // Block common screenshot tools by detecting window focus/blur
    const handleBlur = () => {
      // Window lost focus - might be screenshot tool
      const videos = document.querySelectorAll("video")
      videos.forEach((video) => {
        if (!video.paused) {
          video.pause()
        }
      })
    }

    // Prevent iframe embedding (additional security)
    if (window.self !== window.top && window.top) {
      window.top.location.href = window.self.location.href
    }

    window.addEventListener("blur", handleBlur)

    // Block browser extensions that might capture screenshots
    // This is limited but helps against some automated tools
    const originalConsoleLog = console.log
    console.log = function (...args) {
      // Detect if something is trying to log video elements
      const logString = args.join(" ")
      if (logString.includes("video") || logString.includes("canvas")) {
        return // Block suspicious logging
      }
      originalConsoleLog.apply(console, args)
    }

    return () => {
      clearInterval(devToolsInterval)
      window.removeEventListener("blur", handleBlur)
      console.log = originalConsoleLog
    }
  }, [])

  return null // This component doesn't render anything
}

