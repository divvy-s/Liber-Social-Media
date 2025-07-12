import { MainNav } from "@/components/main-nav"
import { PostFeed } from "@/components/post-feed"
import { WalletConnect } from "@/components/wallet-connect"
import { TrendingTopics } from "@/components/trending-topics"
import { CreatePostButton } from "@/components/create-post-button"
import { PostProvider } from "@/components/post-context"

export default function HomePage() {
  return (
    <PostProvider>
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between">
            <MainNav />
            <div className="flex items-center gap-4">
              <WalletConnect />
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold neon-text">Feed</h1>
                <CreatePostButton />
              </div>
              <PostFeed />
            </div>
            <div className="hidden md:block">
              <TrendingTopics />
            </div>
          </div>
        </main>
      </div>
    </PostProvider>
  )
}

