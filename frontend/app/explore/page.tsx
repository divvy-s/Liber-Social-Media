import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostProvider } from "@/components/post-context"
import { TrendingTopics } from "@/components/trending-topics"
import { Search, TrendingUp, Users, Hash } from "lucide-react"
import { useState, useEffect } from "react";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [searchTab, setSearchTab] = useState("trending");
  const [trendingUsers, setTrendingUsers] = useState<any[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [postResults, setPostResults] = useState<any[]>([]);
  const [hashtagResults, setHashtagResults] = useState<any[]>([]);

  // Fetch trending users and hashtags
  useEffect(() => {
    fetch("/api/explore/trending/users").then(res => res.json()).then(setTrendingUsers);
    fetch("/api/explore/trending/hashtags").then(res => res.json()).then(setTrendingHashtags);
  }, []);

  // Search logic
  const handleSearch = async (query: string) => {
    if (!query) return;
    setSearch(query);
    setSearchTab("posts");
    const [users, posts, hashtags] = await Promise.all([
      fetch(`/api/explore/users/${query}`).then(res => res.json()),
      fetch(`/api/explore/posts/${query}`).then(res => res.json()),
      fetch(`/api/explore/hashtags/${query}`).then(res => res.json()),
    ]);
    setUserResults(users);
    setPostResults(posts);
    setHashtagResults(hashtags);
  };

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
                    onKeyDown={e => {
                      if (e.key === "Enter") handleSearch((e.target as HTMLInputElement).value);
                    }}
                  />
                </div>
              </div>

              <Tabs value={searchTab} onValueChange={setSearchTab} className="mb-6">
                <TabsList>
                  <TabsTrigger value="trending">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                </TabsList>
                <TabsContent value="trending" className="mt-4">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Trending Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {trendingUsers.map((user) => (
                          <div key={user._id} className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                <img src={user.avatar || "/placeholder.svg"} alt={user.username} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-medium">@{user.username}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{user.followers?.length || 0} followers</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6">
                        <CardTitle className="text-lg">Trending Hashtags</CardTitle>
                        <div className="grid gap-4 mt-2">
                          {trendingHashtags.map((hashtag) => (
                            <div key={hashtag.name} className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors">
                              <div className="flex items-center">
                                <Hash className="h-4 w-4 mr-2 text-primary" />
                                <span className="font-medium">{hashtag.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">{hashtag.count} posts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="posts" className="mt-4">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Search Results: Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {postResults.map((post) => (
                          <div key={post._id} className="p-2 border-b border-border/30">
                            <div className="font-medium">{post.content}</div>
                            <div className="text-xs text-muted-foreground">By @{post.user?.username || "Unknown"}</div>
                          </div>
                        ))}
                        {postResults.length === 0 && <div className="text-muted-foreground">No posts found.</div>}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="users" className="mt-4">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Search Results: Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {userResults.map((user) => (
                          <div key={user._id} className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                <img src={user.avatar || "/placeholder.svg"} alt={user.username} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-medium">@{user.username}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{user.followers?.length || 0} followers</span>
                          </div>
                        ))}
                        {userResults.length === 0 && <div className="text-muted-foreground">No users found.</div>}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="hashtags" className="mt-4">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Search Results: Hashtags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {hashtagResults.map((post) => (
                          <div key={post._id} className="p-2 border-b border-border/30">
                            <div className="font-medium">{post.content}</div>
                            <div className="text-xs text-muted-foreground">By @{post.user?.username || "Unknown"}</div>
                          </div>
                        ))}
                        {hashtagResults.length === 0 && <div className="text-muted-foreground">No hashtags found.</div>}
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
  );
}

