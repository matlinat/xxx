// app/creator/[username]/page.tsx
import { ProfileHero } from "@/components/creator-profile/profile-hero"
import { ProfileDetails } from "@/components/creator-profile/profile-details"
import { ProfileAbout } from "@/components/creator-profile/profile-about"
import { ProfileContentTabs } from "@/components/creator-profile/profile-content-tabs"
import { ProfileChatButton } from "@/components/creator-profile/profile-chat-button"
import { getCreatorProfileByUsername } from "@/lib/supabase/creator-profiles"
import { notFound } from "next/navigation"

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  
  // Daten aus Supabase laden
  const profileData = await getCreatorProfileByUsername(username)
  
  if (!profileData) {
    notFound()
  }

  // Transformiere Datenbank-Daten in das erwartete Format
  const creator = {
    username: profileData.username,
    nickname: profileData.nickname || username,
    avatarUrl: profileData.avatar_url || "https://placehold.co/200x200/purple/white?text=" + (profileData.nickname?.[0] || username[0]).toUpperCase(),
    coverUrl: profileData.cover_url || "https://placehold.co/1200x400/purple/white?text=Cover",
    isOnline: profileData.is_online,
    availableFor: profileData.available_for as "live-chat" | "live-video" | "offline",
    fansCount: profileData.fans_count,
    about: profileData.about || "",
    details: {
      gender: profileData.gender || "",
      age: profileData.age || 0,
      location: profileData.location || "",
      languages: profileData.languages || [],
      relationshipStatus: profileData.relationship_status || "",
      sexualOrientation: profileData.sexual_orientation || "",
      height: profileData.height || 0,
      weight: profileData.weight || 0,
      hairColor: profileData.hair_color || "",
      eyeColor: profileData.eye_color || "",
      zodiacSign: profileData.zodiac_sign || "",
      tattoos: profileData.tattoos || "",
      piercings: profileData.piercings || "",
      intimateShaving: profileData.intimate_shaving || "",
      bodyType: profileData.body_type || "",
      penisSize: profileData.penis_size || null,
      sexualPreferences: profileData.sexual_preferences || [],
    },
    // TODO: Photos und Videos aus separater Tabelle laden
    photos: [],
    videos: [],
  }

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
              creatorUsername={creator.username}
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

