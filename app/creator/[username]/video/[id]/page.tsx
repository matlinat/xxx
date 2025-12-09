// app/creator/[username]/video/[id]/page.tsx
import { VideoPlayer } from "@/components/video/video-player"
import { VideoInfo } from "@/components/video/video-info"
import { VideoCreatorCard } from "@/components/video/video-creator-card"
import { VideoActions } from "@/components/video/video-actions"
import { CreatorVideosSection } from "@/components/video/creator-videos-section"
import { VideoSecurity } from "@/components/video/video-security"

// Extended Video interface with all required fields
interface Video {
  id: string
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl: string
  duration: string
  category: string
  views: number
  likes: number
  uploadDate: Date | string
  isSponsored?: boolean
  isFavorite?: boolean
  isLiked?: boolean
  creator: {
    username: string
    nickname: string
    avatarUrl: string
    fansCount?: number
  }
}

// Mock data - später aus Supabase laden
const getMockVideo = (username: string, id: string): Video => {
  return {
    id,
    title: "Amazing Video Title",
    description: "Dies ist eine ausführliche Beschreibung des Videos. Hier können weitere Details, Tags oder Informationen stehen.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://placehold.co/1280x720/pink/white?text=Video+Thumbnail",
    duration: "12:34",
    category: "Anal",
    views: 12345,
    likes: 567,
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isLiked: false,
    isFavorite: false,
    creator: {
      username,
      nickname: "Sexy Lisa",
      avatarUrl: "https://placehold.co/200x200/pink/white?text=SL",
      fansCount: 1234,
    },
  }
}

const getMockCreatorVideos = (username: string, currentVideoId: string): Video[] => {
  const categories = ["Anal", "Teens", "Lesben", "MILF", "Blowjob"]
  return Array.from({ length: 10 }, (_, i) => ({
    id: `video-${i + 1}`,
    title: `Video ${i + 1} von ${username}`,
    videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
    thumbnailUrl: `https://placehold.co/400x225/${['pink', 'purple', 'rose', 'fuchsia', 'violet'][i % 5]}/white?text=V${i + 1}`,
    duration: `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    category: categories[i % categories.length],
    views: Math.floor(Math.random() * 50000) + 1000,
    likes: Math.floor(Math.random() * 1000) + 50,
    uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    creator: {
      username,
      nickname: "Sexy Lisa",
      avatarUrl: "https://placehold.co/200x200/pink/white?text=SL",
      fansCount: 1234,
    },
  })).filter((video) => video.id !== currentVideoId) // Exclude current video
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>
}) {
  const { username, id } = await params

  // Später: Daten aus Supabase laden
  // const video = await getVideoById(id)
  // const creatorVideos = await getCreatorVideos(username, id)
  const video = getMockVideo(username, id)
  const creatorVideos = getMockCreatorVideos(username, id)

  return (
    <div className="min-h-screen bg-background">
      <VideoSecurity />
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Video Player Section */}
        <div className="w-full">
          <VideoPlayer
            videoUrl={video.videoUrl}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
          />
        </div>

        {/* Video Info and Creator Card Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video Info and Actions */}
          <div className="lg:col-span-2 space-y-6">
            <VideoInfo
              title={video.title}
              description={video.description}
              views={video.views}
              uploadDate={video.uploadDate}
              category={video.category}
            />

            <VideoActions
              likes={video.likes}
              isLiked={video.isLiked}
              isFavorite={video.isFavorite}
            />
          </div>

          {/* Right Column: Creator Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <VideoCreatorCard
                creator={video.creator}
                fansCount={video.creator.fansCount}
              />
            </div>
          </div>
        </div>

        {/* Creator Videos Section */}
        <CreatorVideosSection
          videos={creatorVideos.map((v) => ({
            id: v.id,
            thumbnailUrl: v.thumbnailUrl,
            duration: v.duration,
            title: v.title,
          }))}
          creatorUsername={username}
          title={`Weitere Videos von ${video.creator.nickname}`}
        />
      </div>
    </div>
  )
}

