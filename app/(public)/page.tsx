import ProductTool from "@/components/product-tool"

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 text-center bg-gradient-to-b from-background to-muted px-4">
        <h1 className="text-4xl font-bold mb-4">ProductPhotoPop</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Entferne Hintergründe in Sekunden – KI-gestützt, schnell und einfach.
        </p>
      </section>

      {/* Tool */}
      <section className="py-12">
        <ProductTool />
      </section>

      {/* TODO: Features, Pricing, FAQ */}
    </div>
  )
}
