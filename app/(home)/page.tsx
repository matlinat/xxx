// app/(home)/page.tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section - Mobile First */}
      <section className="w-full px-4 py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
            Willkommen bei SaucySilk
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg md:text-xl">
            Entdecke exklusive Inhalte von deinen Lieblings-Creatorn
          </p>
        </div>
      </section>

      {/* Content Sections - Platzhalter */}
      <section className="w-full px-4 py-8 border-t">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-semibold mb-4 sm:text-2xl">Beliebte Kategorien</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {/* Platzhalter für Kategorien */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted flex items-center justify-center"
              >
                <span className="text-sm text-muted-foreground">Kategorie {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-8 border-t">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-semibold mb-4 sm:text-2xl">Empfohlene Creator</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {/* Platzhalter für Creator */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted flex items-center justify-center"
              >
                <span className="text-sm text-muted-foreground">Creator {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-8 border-t">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-semibold mb-4 sm:text-2xl">Trending</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Platzhalter für Trending Content */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-video rounded-lg bg-muted flex items-center justify-center"
              >
                <span className="text-sm text-muted-foreground">Trending {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

