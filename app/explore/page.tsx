import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostProvider } from "@/components/post-context"
import { TrendingTopics } from "@/components/trending-topics"
import { Search, TrendingUp, Users, Hash } from "lucide-react"

export default function ExplorePage() {
  // Mock data for demonstration
  const trendingUsers = [
    { id: "1", username: "web3_dev", followers: 1243, avatar: "/placeholder.svg?height=50&width=50" },
    { id: "2", username: "crypto_queen", followers: 982, avatar: "/placeholder.svg?height=50&width=50" },
    { id: "3", username: "nft_collector", followers: 754, avatar: "/placeholder.svg?height=50&width=50" },
    { id: "4", username: "blockchain_guru", followers: 621, avatar: "/placeholder.svg?height=50&width=50" },
  ]

  const trendingHashtags = [
    { id: "1", name: "Web3", postCount: 1243 },
    { id: "2", name: "NFTs", postCount: 982 },
    { id: "3", name: "Ethereum", postCount: 754 },
    { id: "4", name: "Blockchain", postCount: 621 },
    { id: "5", name: "DeFi", postCount: 512 },
    { id: "6", name: "Metaverse", postCount: 423 },
    { id: "7", name: "DAOs", postCount: 387 },
    { id: "8", name: "Crypto", postCount: 356 },
  ]

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
              <div className="mb-6">
                <h1 className="text-2xl font-bold neon-text mb-4">Explore</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search posts, users, or hashtags..."
                    className="pl-10 bg-muted border-primary/20 focus:border-primary/50"
                  />
                </div>
              </div>

              <Tabs defaultValue="trending" className="mb-6">
                <TabsList>
                  <TabsTrigger value="trending">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="hashtags">
                    <Hash className="w-4 h-4 mr-2" />
                    Hashtags
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="trending" className="mt-4">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Trending Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {trendingHashtags.slice(0, 4).map((hashtag) => (
                          <div
                            key={hashtag.id}
                            className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
                          >
                            <div className="flex items-center">
                              <Hash className="h-4 w-4 mr-2 text-primary" />
                              <span className="font-medium">{hashtag.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{hashtag.postCount} posts</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="users" className="mt-4">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Popular Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {trendingUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                <img
                                  src={user.avatar || "/placeholder.svg"}
                                  alt={user.username}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium">@{user.username}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{user.followers} followers</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="hashtags" className="mt-4">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Popular Hashtags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trendingHashtags.map((hashtag) => (
                          <div
                            key={hashtag.id}
                            className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
                          >
                            <div className="flex items-center">
                              <Hash className="h-4 w-4 mr-2 text-primary" />
                              <span className="font-medium">{hashtag.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{hashtag.postCount} posts</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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

