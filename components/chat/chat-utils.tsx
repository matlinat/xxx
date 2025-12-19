import { formatDistanceToNow, format } from "date-fns"
import { de } from "date-fns/locale"

export interface Chat {
  id: string
  participant: {
    id: string
    name: string
    avatar?: string
    initials: string
    online: boolean
  }
  lastMessage: {
    text: string
    timestamp: Date
    read: boolean
  }
  unreadCount: number
}

export interface Message {
  id: string
  type: "text" | "video" | "image_gallery"
  content: string
  timestamp: Date
  read: boolean
  senderId: string
  videoUrl?: string
  videoDuration?: string
  images?: string[]
}

export function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    // Heute: relative Zeit oder Uhrzeit
    if (diffInHours < 1) {
      return formatDistanceToNow(date, { addSuffix: true, locale: de })
        .replace("vor ", "")
    }
    return format(date, "HH:mm")
  } else if (diffInHours < 48) {
    return "Gestern"
  } else if (diffInHours < 168) {
    // Diese Woche: Wochentag
    return format(date, "EEEE", { locale: de })
  } else {
    // Älter: Datum
    return format(date, "dd.MM.yyyy")
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Dummy-Daten Generator
export function generateDummyChats(): Chat[] {
  return [
    {
      id: "1",
      participant: {
        id: "user1",
        name: "Jacquenetta Slowgrave",
        avatar: undefined,
        initials: "JS",
        online: true,
      },
      lastMessage: {
        text: "Das sieht super aus! Vielen Dank für das Video.",
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 Minuten
        read: true,
      },
      unreadCount: 8,
    },
    {
      id: "2",
      participant: {
        id: "user2",
        name: "Nickola Peever",
        avatar: undefined,
        initials: "NP",
        online: true,
      },
      lastMessage: {
        text: "Kannst du mir bitte mehr Details senden?",
        timestamp: new Date(Date.now() - 40 * 60 * 1000), // 40 Minuten
        read: true,
      },
      unreadCount: 2,
    },
    {
      id: "3",
      participant: {
        id: "user3",
        name: "Farand Hume",
        avatar: undefined,
        initials: "FH",
        online: false,
      },
      lastMessage: {
        text: "Ich werde mich später melden.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Gestern
        read: true,
      },
      unreadCount: 0,
    },
    {
      id: "4",
      participant: {
        id: "user4",
        name: "Maria Schmidt",
        avatar: undefined,
        initials: "MS",
        online: false,
      },
      lastMessage: {
        text: "Vielen Dank für deine Nachricht!",
        timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 Tage
        read: true,
      },
      unreadCount: 0,
    },
    {
      id: "5",
      participant: {
        id: "user5",
        name: "Sophie Weber",
        avatar: undefined,
        initials: "SW",
        online: true,
      },
      lastMessage: {
        text: "Perfekt, das passt mir gut!",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 Tage
        read: true,
      },
      unreadCount: 0,
    },
  ]
}

export function generateDummyMessages(chatId: string): Message[] {
  if (chatId === "1") {
    return [
      {
        id: "msg1",
        type: "video",
        content: "",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        senderId: "dummy-sender-1",
        videoUrl: "/placeholder-video.jpg",
        videoDuration: "5:42",
      },
      {
        id: "msg2",
        type: "image_gallery",
        content: "",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        senderId: "dummy-sender-1",
        images: [
          "/placeholder-image-1.jpg",
          "/placeholder-image-2.jpg",
          "/placeholder-image-3.jpg",
          "/placeholder-image-4.jpg",
        ],
      },
    ]
  }

  return [
    {
      id: "msg1",
      type: "text",
      content: "Hallo! Wie geht es dir?",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      senderId: "dummy-sender-1",
    },
    {
      id: "msg2",
      type: "text",
      content: "Ich hoffe, dir geht es gut!",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      senderId: "dummy-sender-1",
    },
  ]
}
