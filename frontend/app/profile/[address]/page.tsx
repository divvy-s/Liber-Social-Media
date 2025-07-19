"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { useWeb3 } from "@/components/web3-provider"
import { PostProvider } from "@/components/post-context"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"
import { PostFeed } from "@/components/post-feed"
import { UserComments } from "@/components/user-comments"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit, ExternalLink, Twitter, Globe, Github, MessageCircle, Send } from "lucide-react"

const DEFAULT_PROFILE = {
  username: "crypto_enthusiast",
  bio: "Web3 developer and blockchain enthusiast. Building the decentralized future one block at a time.",
  avatar: "/placeholder.svg?height=150&width=150",
  banner: "/placeholder.svg?height=300&width=1200",
  tokenId: "42",
  followers: [],
  following: [],
  links: [],
  totalPosts: 0,
  totalComments: 0,
  totalUpvotes: 0,
  totalDownvotes: 0,
  totalShares: 0,
}

export default function PublicProfilePage() {
  const params = useParams()
  const address = params?.address as string
  const { account } = useWeb3()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("posts")
  const [loading, setLoading] = useState(true)
  const [bannerCacheBust, setBannerCacheBust] = useState(0)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const res = await fetch(`${apiBaseUrl}/api/users/${address}`)
        if (res.ok) {
          const user = await res.json()
          const completeProfile = {
            ...DEFAULT_PROFILE,
            ...user,
            followers: user.followers || [],
            following: user.following || [],
            links: user.links || [],
          }
          setProfile(completeProfile)
        } else {
          setProfile(DEFAULT_PROFILE)
        }
      } catch (error) {
        setProfile(DEFAULT_PROFILE)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [address])

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const res = await fetch(`${apiBaseUrl}/api/nft/user/${address}`)
        if (res.ok) {
          const nfts = await res.json()
          setUserNFTs(nfts)
        }
      } catch (error) {}
    }
    fetchNFTs()
  }, [address])

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile({
      ...profile,
      ...updatedProfile,
    })
    setBannerCacheBust(Date.now())
  }

  const linkIcons = {
    website: Globe,
    twitter: Twitter,
    github: Github,
    discord: MessageCircle,
    telegram: Send,
  }

  if (loading) {
    return (
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
          <div className="text-center text-muted-foreground">Loading profile...</div>
        </main>
      </div>
    )
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
          <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
            <img src={profile.banner ? `${profile.banner}${bannerCacheBust ? `?cb=${bannerCacheBust}` : ''}` : "/placeholder.svg"} alt="Profile banner" className="w-full h-full object-cover" />
            <div className="absolute -bottom-16 left-8 border-4 border-background rounded-full">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar} alt={profile.username} />
                <AvatarFallback>{profile.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              {account && account.toLowerCase() === address?.toLowerCase() && (
                <ProfileEditDialog
                  profile={profile}
                  onSave={handleProfileUpdate}
                  trigger={
                    <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  }
                />
              )}
              <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm" asChild>
                <a
                  href={`https://opensea.io/assets/ethereum/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${profile.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View NFT
                </a>
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8 mt-20">
            <div className="md:w-1/3">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl neon-text">@{profile.username}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        <span className="font-mono">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary neon-text">
                      NFT #{profile.tokenId}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div>
                      <span className="font-bold">{profile.followers?.length || 0}</span>
                      <span className="text-sm text-muted-foreground ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold">{profile.following?.length || 0}</span>
                      <span className="text-sm text-muted-foreground ml-1">Following</span>
                    </div>
                    <div>
                      <span className="font-bold">{userNFTs.length}</span>
                      <span className="text-sm text-muted-foreground ml-1">NFTs</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold mb-2 mt-4">Activity Stats</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posts:</span>
                      <span>{profile.totalPosts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Comments:</span>
                      <span>{profile.totalComments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Upvotes:</span>
                      <span>{profile.totalUpvotes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shares:</span>
                      <span>{profile.totalShares || 0}</span>
                    </div>
                  </div>
                  {/* Links */}
                  {profile.links && profile.links.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-semibold">Links</h4>
                      {profile.links.map((link: any, index: number) => {
                        const Icon = linkIcons[link.type as keyof typeof linkIcons] || Globe
                        return (
                          <div key={index} className="flex items-center text-sm">
                            <Icon className="h-4 w-4 mr-2 text-primary" />
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {link.label}
                            </a>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {/* Social links */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-semibold">Social</h4>
                    {profile.website && (
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 mr-2 text-primary" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    {profile.twitter && (
                      <div className="flex items-center text-sm">
                        <Twitter className="h-4 w-4 mr-2 text-primary" />
                        <a
                          href={profile.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {profile.twitter.includes('@') ? profile.twitter : `@${profile.twitter}`}
                        </a>
                      </div>
                    )}
                    {profile.github && (
                      <div className="flex items-center text-sm">
                        <Github className="h-4 w-4 mr-2 text-primary" />
                        <a
                          href={profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {profile.github.replace(/^https?:\/\//, '').replace('github.com/', '')}
                        </a>
                      </div>
                    )}
                    {profile.discord && (
                      <div className="flex items-center text-sm">
                        <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-muted-foreground">{profile.discord}</span>
                      </div>
                    )}
                    {profile.telegram && (
                      <div className="flex items-center text-sm">
                        <Send className="h-4 w-4 mr-2 text-primary" />
                        <a
                          href={profile.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {profile.telegram.replace(/^https?:\/\//, '').replace('t.me/', '@')}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="nfts">NFTs ({userNFTs.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                  <PostFeed userOnly={false} walletAddress={address} />
                </TabsContent>
                <TabsContent value="comments">
                  <UserComments walletAddress={address} />
                </TabsContent>
                <TabsContent value="nfts">
                  {userNFTs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userNFTs.map((post: any) => (
                        <Card key={post._id || post.id} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                          <CardHeader className="p-4 pb-0">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-md">{post.title}</CardTitle>
                              <Badge variant="outline" className="border-primary/50 text-primary neon-text">
                                NFT #{post.nftTokenId || post.tokenId}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Minted: {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center">
                      <p className="text-muted-foreground">No NFTs yet</p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </PostProvider>
  )
} 