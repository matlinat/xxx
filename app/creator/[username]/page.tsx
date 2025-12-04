// app/creator/[username]/page.tsx
import { ProfileHero } from "@/components/creator-profile/profile-hero"
import { ProfileDetails } from "@/components/creator-profile/profile-details"
import { ProfileAbout } from "@/components/creator-profile/profile-about"
import { ProfileContentTabs } from "@/components/creator-profile/profile-content-tabs"
import { ProfileChatButton } from "@/components/creator-profile/profile-chat-button"

// Mock-Daten für die Entwicklung
const mockCreator = {
  username: "sexylisa",
  nickname: "Sexy Lisa",
  avatarUrl: "https://placehold.co/200x200/pink/white?text=SL",
  coverUrl: "https://placehold.co/1200x400/purple/white?text=Cover",
  isOnline: true,
  availableFor: "live-chat" as const, // "live-chat" | "live-video" | "offline"
  fansCount: 1234,
  about: `<p>Hey, ich bin Lisa! 💕</p>
<p>Ich liebe es, neue Leute kennenzulernen und gemeinsam Spaß zu haben. Bei mir findest du authentische Inhalte und echte Interaktion.</p>
<p>Schreib mir gerne eine Nachricht - ich freue mich auf dich! 😘</p>`,
  details: {
    gender: "Weiblich",
    age: 25,
    location: "10115 Berlin",
    languages: ["Deutsch", "Englisch"],
    relationshipStatus: "Single",
    sexualOrientation: "Bisexuell",
    height: 168,
    weight: 55,
    hairColor: "Blond",
    eyeColor: "Blau",
    zodiacSign: "Löwe",
    tattoos: "Ja",
    piercings: "Nein",
    intimateShaving: "Vollrasiert",
    bodyType: "Sportlich",
    penisSize: null,
    sexualPreferences: ["Anal", "Outdoor", "Rollenspiele", "Dessous", "Toys"],
  },
  photos: [
    { id: "1", url: "https://placehold.co/400x400/pink/white?text=1", isLocked: false },
    { id: "2", url: "https://placehold.co/400x400/purple/white?text=2", isLocked: true },
    { id: "3", url: "https://placehold.co/400x400/rose/white?text=3", isLocked: false },
    { id: "4", url: "https://placehold.co/400x400/fuchsia/white?text=4", isLocked: true },
    { id: "5", url: "https://placehold.co/400x400/violet/white?text=5", isLocked: false },
    { id: "6", url: "https://placehold.co/400x400/indigo/white?text=6", isLocked: true },
  ],
  videos: [
    { id: "1", thumbnailUrl: "https://placehold.co/400x225/red/white?text=Video+1", duration: "5:32", isLocked: false },
    { id: "2", thumbnailUrl: "https://placehold.co/400x225/orange/white?text=Video+2", duration: "12:45", isLocked: true },
    { id: "3", thumbnailUrl: "https://placehold.co/400x225/amber/white?text=Video+3", duration: "3:18", isLocked: false },
    { id: "4", thumbnailUrl: "https://placehold.co/400x225/yellow/white?text=Video+4", duration: "8:55", isLocked: true },
  ],
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  
  // Später: Daten aus Supabase laden
  // const creator = await getCreatorByUsername(username)
  const creator = { ...mockCreator, username }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <ProfileHero
        nickname={creator.nickname}
        avatarUrl={creator.avatarUrl}
        coverUrl={creator.coverUrl}
        isOnline={creator.isOnline}
        availableFor={creator.availableFor}
        fansCount={creator.fansCount}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: About + Content */}
          <div className="flex-1 space-y-6">
            {/* Über mich */}
            <ProfileAbout html={creator.about} />

            {/* Mobile: Details Card (collapsible) */}
            <div className="lg:hidden">
              <ProfileDetails details={creator.details} collapsible />
            </div>

            {/* Content Tabs (Fotos & Videos) */}
            <ProfileContentTabs
              photos={creator.photos}
              videos={creator.videos}
            />
          </div>

          {/* Right Column: Details Sidebar (Desktop only) */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-20">
              <ProfileDetails details={creator.details} />
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Chat Button */}
      <ProfileChatButton isOnline={creator.isOnline} username={creator.username} />
    </div>
  )
}

