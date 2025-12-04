import { VideosTabs } from "@/components/videos/videos-tabs"
import { VideoCategorySlider } from "@/components/videos/video-category-slider"
import { VideoCategoriesGrid } from "@/components/videos/video-categories-grid"

// Mock-Daten für die Entwicklung
const mockVideos = {
  unsereAuswahl: [
    { id: "1", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Video+1", duration: "5:32", title: "Video 1" },
    { id: "2", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Video+2", duration: "12:45", title: "Video 2" },
    { id: "3", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Video+3", duration: "3:18", title: "Video 3" },
    { id: "4", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Video+4", duration: "8:55", title: "Video 4" },
    { id: "5", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Video+5", duration: "6:20", title: "Video 5" },
  ],
  topVideos: [
    { id: "6", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Top+1", duration: "10:15", title: "Top Video 1" },
    { id: "7", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Top+2", duration: "7:30", title: "Top Video 2" },
    { id: "8", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Top+3", duration: "9:45", title: "Top Video 3" },
    { id: "9", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Top+4", duration: "11:20", title: "Top Video 4" },
    { id: "10", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Top+5", duration: "8:10", title: "Top Video 5" },
  ],
  neuesteVideos: [
    { id: "11", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Neu+1", duration: "4:25", title: "Neues Video 1" },
    { id: "12", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Neu+2", duration: "6:50", title: "Neues Video 2" },
    { id: "13", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Neu+3", duration: "5:15", title: "Neues Video 3" },
    { id: "14", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Neu+4", duration: "7:40", title: "Neues Video 4" },
    { id: "15", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Neu+5", duration: "9:05", title: "Neues Video 5" },
  ],
  videosMitRabatt: [
    { id: "16", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Rabatt+1", duration: "12:30", title: "Rabatt Video 1", discount: 30 },
    { id: "17", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Rabatt+2", duration: "8:20", title: "Rabatt Video 2", discount: 50 },
    { id: "18", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Rabatt+3", duration: "10:45", title: "Rabatt Video 3", discount: 25 },
    { id: "19", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Rabatt+4", duration: "6:15", title: "Rabatt Video 4", discount: 40 },
    { id: "20", thumbnailUrl: "https://placehold.co/400x225/808080/white?text=Rabatt+5", duration: "9:55", title: "Rabatt Video 5", discount: 35 },
  ],
}

const popularCategories = {
  teens: [
    { id: "t1", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Teens+1", duration: "5:32", title: "Teens Video 1" },
    { id: "t2", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Teens+2", duration: "8:15", title: "Teens Video 2" },
    { id: "t3", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Teens+3", duration: "6:45", title: "Teens Video 3" },
    { id: "t4", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Teens+4", duration: "7:20", title: "Teens Video 4" },
    { id: "t5", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Teens+5", duration: "9:10", title: "Teens Video 5" },
  ],
  anal: [
    { id: "a1", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Anal+1", duration: "10:25", title: "Anal Video 1" },
    { id: "a2", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Anal+2", duration: "12:40", title: "Anal Video 2" },
    { id: "a3", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Anal+3", duration: "8:55", title: "Anal Video 3" },
    { id: "a4", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Anal+4", duration: "11:15", title: "Anal Video 4" },
    { id: "a5", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Anal+5", duration: "9:30", title: "Anal Video 5" },
  ],
  rimming: [
    { id: "r1", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Rimming+1", duration: "7:45", title: "Rimming Video 1" },
    { id: "r2", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Rimming+2", duration: "6:20", title: "Rimming Video 2" },
    { id: "r3", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Rimming+3", duration: "8:50", title: "Rimming Video 3" },
    { id: "r4", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Rimming+4", duration: "5:35", title: "Rimming Video 4" },
    { id: "r5", thumbnailUrl: "https://placehold.co/300x169/808080/white?text=Rimming+5", duration: "9:25", title: "Rimming Video 5" },
  ],
}

const allCategories = [
  "Analsex",
  "Asia",
  "Auto",
  "Blondinen",
  "Blowjob",
  "Blümchensex",
  "Bondage (fesseln)",
  "Creampie",
  "Deepthroat",
  "Devot",
  "BBW",
  "Dirty-Talk",
  "Doktorspiele",
  "Domina",
  "Doppelpenetration",
  "Dreier",
  "Ebony",
  "Extrem Hardcore",
  "Extreme Penetrationen",
  "Fetisch",
  "Fisting",
  "Fotzen lecken",
  "Fussball",
  "Fußfetisch",
  "Gangbang",
  "Gay",
  "Gegenstände einführen",
  "Geiler Arsch",
  "Gesichtsbesamung",
  "Gothic",
  "Große Titten",
  "Großer Schwanz",
  "Gruppensex",
  "Handjobs",
  "High Heels",
  "Kitzeln",
  "Kleine Titten",
  "Lack/Latex/Leder",
  "Latinas",
  "Lesben",
  "MILF/Reife Frauen",
  "Muschi",
  "MyDirtyPornParties",
  "Nahaufnahmen",
  "Natursekt",
  "Nylons",
  "Outdoor Sex",
  "Piercings",
  "POV",
  "Sex im Freien",
  "Reizwäsche",
  "Rimming",
  "Rollenspiele",
  "Rothaarige",
  "S&M",
  "Sextoys",
  "Solo",
  "Spanking",
  "Squirting",
  "Stark behaart",
  "Strippen",
  "Tattoos",
  "Teens (18+)",
  "Transsexuell",
  "User Fick",
]

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Video Tabs Navigation */}
        <VideosTabs
          unsereAuswahl={mockVideos.unsereAuswahl}
          topVideos={mockVideos.topVideos}
          neuesteVideos={mockVideos.neuesteVideos}
          videosMitRabatt={mockVideos.videosMitRabatt}
        />

        {/* Popular Categories with Sliders */}
        <div className="mt-12 space-y-8">
          <VideoCategorySlider
            title="Teens"
            videos={popularCategories.teens}
          />
          <VideoCategorySlider
            title="Anal"
            videos={popularCategories.anal}
          />
          <VideoCategorySlider
            title="Rimming"
            videos={popularCategories.rimming}
          />
        </div>

        {/* All Categories Grid */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Alle Kategorien</h2>
          <VideoCategoriesGrid categories={allCategories} />
        </div>
      </div>
    </div>
  )
}

