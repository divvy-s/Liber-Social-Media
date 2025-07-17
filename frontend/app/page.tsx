import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Lock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl font-bold neon-text">Liber</span>
        </div>
        <div>
          <Link href="/app">
            <Button variant="outline" className="border-primary/50 neon-border">
              Launch App
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none neon-text">
                    Own Your Social Experience
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Liber is the first truly decentralized social media platform where every post is an NFT. Take
                    control of your content and connect with others in a censorship-resistant environment.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/app">
                    <Button className="bg-primary hover:bg-primary/80 neon-glow">
                      Enter App <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-square md:aspect-video lg:aspect-square overflow-hidden rounded-xl border border-primary/50 neon-border">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4 p-4">
                        <div className="text-4xl font-bold neon-text">Liber</div>
                        <p className="text-lg">The Future of Social Media</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/20 px-3 py-1 text-sm neon-text">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight neon-text">Why Choose Liber?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Liber combines the best of social media with blockchain technology to create a truly user-owned
                  platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <div className="rounded-full bg-primary/20 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">True Ownership</h3>
                <p className="text-center text-muted-foreground">
                  Every post you create can be minted as an NFT, giving you true ownership of your content on the
                  blockchain.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <div className="rounded-full bg-primary/20 p-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Censorship Resistant</h3>
                <p className="text-center text-muted-foreground">
                  Your content lives on the blockchain, making it impossible for any central authority to censor or
                  remove.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <div className="rounded-full bg-primary/20 p-3">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Web3 Native</h3>
                <p className="text-center text-muted-foreground">
                  Connect with your wallet and interact directly with the blockchain. No middlemen, no data harvesting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-border/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight neon-text">
                  Ready to Take Control?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Join Liber today and experience the future of social media. Connect your wallet and start creating.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/app">
                  <Button size="lg" className="bg-primary hover:bg-primary/80 neon-glow">
                    Launch App <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border/40">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Liber. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

