import { SiteHeader } from "@/components/site-header"

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-12 md:py-16">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Allgemeine Geschäftsbedingungen</h1>
          <div className="mt-8">
            <p className="text-muted-foreground">Inhalt folgt in Kürze.</p>
          </div>
        </div>
      </main>
    </>
  )
}

