"use client"

import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostProvider } from "@/components/post-context"
import { TrendingTopics } from "@/components/trending-topics"
import { Search, TrendingUp, Users, Hash, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { Post } from "@/components/post"
import Link from "next/link"

export default function ExplorePage() {
  const [trendingUsers, setTrendingUsers] = useState<any[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([])
  const [trendingPosts, setTrendingPosts] = useState<any[]>([])
  const [trendingLoading, setTrendingLoading] = useState(false)

  // Fetch trending users, hashtags, and posts from backend
  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(true)
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        console.log('Fetching trending data from:', apiBaseUrl)
        
        const [usersRes, hashtagsRes, postsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/explore/trending/users`),
          fetch(`${apiBaseUrl}/api/explore/trending/hashtags`),
          fetch(`${apiBaseUrl}/api/posts/trending`),
        ])
        
        console.log('Trending responses:', {
          users: usersRes.status,
          hashtags: hashtagsRes.status,
          posts: postsRes.status
        })
        
        if (usersRes.ok) setTrendingUsers(await usersRes.json())
        if (hashtagsRes.ok) setTrendingHashtags(await hashtagsRes.json())
        if (postsRes.ok) {
          const backendPosts = await postsRes.json()
          console.log('Trending posts received:', backendPosts.length)
          
          // Transform backend posts to match frontend Post interface
          const transformedPosts = backendPosts.map((post: any) => ({
            id: post._id || post.id,
            title: post.title || "Untitled Post",
            content: post.content,
            author: {
              address: post.user?.walletAddress || "Unknown",
              username: post.user?.username || "User",
              avatar: post.user?.avatar || "/placeholder.svg",
            },
            createdAt: post.createdAt,
            upvotes: post.upvotes || 0,
            downvotes: post.downvotes || 0,
            commentCount: post.commentCount || 0,
            shareCount: post.shares || 0,
            tokenId: post.nftTokenId || "",
            isMinted: !!post.nftTokenId,
            imageUrl: post.image,
            txHash: post.txHash,
          }));
          setTrendingPosts(transformedPosts)
        } else {
          console.error('Failed to fetch trending posts:', postsRes.status, postsRes.statusText)
          // Try to get error details
          try {
            const errorText = await postsRes.text()
            console.error('Error response body:', errorText)
          } catch (e) {
            console.error('Could not read error response body')
          }
        }
      } catch (error) {
        console.error('Error fetching trending data:', error)
      }
      setTrendingLoading(false)
    }
    fetchTrending()
  }, [])

  const [search, setSearch] = useState("")
  const [userResults, setUserResults] = useState<any[]>([])
  const [postResults, setPostResults] = useState<any[]>([])
  const [hashtagResults, setHashtagResults] = useState<any[]>([])
  const [userLoading, setUserLoading] = useState(false)
  const [postLoading, setPostLoading] = useState(false)
  const [hashtagLoading, setHashtagLoading] = useState(false)

  // Search users, posts, and hashtags from backend
  const handleSearch = async (query: string) => {
    setSearch(query)
    if (!query.trim()) {
      setUserResults([])
      setPostResults([])
      setHashtagResults([])
      return
    }
    
    setUserLoading(true)
    setPostLoading(true)
    setHashtagLoading(true)
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
      
      // Search users
      const userRes = await fetch(`${apiBaseUrl}/api/explore/users/${encodeURIComponent(query)}`)
      if (userRes.ok) {
        const users = await userRes.json()
        setUserResults(users)
      }
      
      // Search posts
      const postRes = await fetch(`${apiBaseUrl}/api/explore/posts/${encodeURIComponent(query)}`)
      if (postRes.ok) {
        const backendPosts = await postRes.json()
        
        // Transform backend posts to match frontend Post interface
        const transformedPosts = backendPosts.map((post: any) => ({
          id: post._id || post.id,
          title: post.title || "Untitled Post",
          content: post.content,
          author: {
            address: post.user?.walletAddress || "Unknown",
            username: post.user?.username || "User",
            avatar: post.user?.avatar || "/placeholder.svg",
          },
          createdAt: post.createdAt,
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          commentCount: post.commentCount || 0,
          shareCount: post.shares || 0,
          tokenId: post.nftTokenId || "",
          isMinted: !!post.nftTokenId,
          imageUrl: post.image,
          txHash: post.txHash,
        }));
        
        setPostResults(transformedPosts)
      }
      
      // Search hashtags
      const hashtagRes = await fetch(`${apiBaseUrl}/api/explore/hashtags/${encodeURIComponent(query)}`)
      if (hashtagRes.ok) {
        const backendHashtagPosts = await hashtagRes.json()
        
        // Transform backend posts to match frontend Post interface
        const transformedHashtagPosts = backendHashtagPosts.map((post: any) => ({
          id: post._id || post.id,
          title: post.title || "Untitled Post",
          content: post.content,
          author: {
            address: post.user?.walletAddress || "Unknown",
            username: post.user?.username || "User",
            avatar: post.user?.avatar || "/placeholder.svg",
          },
          createdAt: post.createdAt,
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          commentCount: post.commentCount || 0,
          shareCount: post.shares || 0,
          tokenId: post.nftTokenId || "",
          isMinted: !!post.nftTokenId,
          imageUrl: post.image,
          txHash: post.txHash,
        }));
        
        setHashtagResults(transformedHashtagPosts)
      }
    } catch (error) {}
    
    setUserLoading(false)
    setPostLoading(false)
    setHashtagLoading(false)
  }

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
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {search.trim() ? (
                <Tabs defaultValue="posts" className="mb-6">
                  <TabsList>
                    <TabsTrigger value="posts">
                      <FileText className="w-4 h-4 mr-2" />
                      Posts ({postResults.length})
                    </TabsTrigger>
                    <TabsTrigger value="users">
                      <Users className="w-4 h-4 mr-2" />
                      Users ({userResults.length})
                    </TabsTrigger>
                    <TabsTrigger value="hashtags">
                      <Hash className="w-4 h-4 mr-2" />
                      Hashtags ({hashtagResults.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="posts" className="mt-4">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Post Search Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {postLoading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                        ) : postResults.length === 0 ? (
                          <div className="text-center text-muted-foreground">No posts found.</div>
                        ) : (
                          <div className="space-y-4">
                            {postResults.map((post) => (
                              <Post key={post._id || post.id} post={post} />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="users" className="mt-4">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">User Search Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userLoading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                        ) : userResults.length === 0 ? (
                          <div className="text-center text-muted-foreground">No users found.</div>
                        ) : (
                          <div className="grid gap-4">
                            {userResults.map((user) => (
                              <div
                                key={user._id || user.walletAddress}
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
                                  <span className="font-medium">@{user.username || user.walletAddress}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{user.bio || ''}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="hashtags" className="mt-4">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Hashtag Search Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {hashtagLoading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                        ) : hashtagResults.length === 0 ? (
                          <div className="text-center text-muted-foreground">No posts with this hashtag found.</div>
                        ) : (
                          <div className="space-y-4">
                            {hashtagResults.map((post) => (
                              <Post key={post._id || post.id} post={post} />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Tabs defaultValue="trending" className="mb-6">
                  <TabsList>
                    <TabsTrigger value="trending">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Trending
                    </TabsTrigger>
                    <TabsTrigger value="posts">
                      <FileText className="w-4 h-4 mr-2" />
                      Posts
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
                        {trendingLoading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                        ) : (
                          <div className="grid gap-4">
                            {trendingHashtags.slice(0, 4).map((hashtag) => (
                              <Link
                                key={hashtag.name}
                                href={`/topic/${hashtag.name.replace('#', '')}`}
                                className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
                              >
                                <div className="flex items-center">
                                  <Hash className="h-4 w-4 mr-2 text-primary" />
                                  <span className="font-medium">{hashtag.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{hashtag.count} posts</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="posts" className="mt-4">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Trending Posts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {trendingLoading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                        ) : trendingPosts.length === 0 ? (
                          <div className="text-center text-muted-foreground">
                            <p>No trending posts found.</p>
                            <p className="text-sm text-muted-foreground mt-2">Create some posts and get engagement to see trending content!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {trendingPosts.map((post) => (
                              <Post key={post._id || post.id} post={post} />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="users" className="mt-4">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Trending Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {trendingLoading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                        ) : (
                          <div className="grid gap-4">
                            {trendingUsers.map((user) => (
                              <div
                                key={user._id || user.walletAddress}
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
                                  <span className="font-medium">@{user.username || user.walletAddress}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{user.bio || ''}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="hashtags" className="mt-4">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Popular Hashtags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {trendingLoading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trendingHashtags.map((hashtag) => (
                              <Link
                                key={hashtag.name}
                                href={`/topic/${hashtag.name.replace('#', '')}`}
                                className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
                              >
                                <div className="flex items-center">
                                  <Hash className="h-4 w-4 mr-2 text-primary" />
                                  <span className="font-medium">{hashtag.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{hashtag.count} posts</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
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

