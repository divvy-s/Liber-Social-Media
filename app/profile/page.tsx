"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { useWeb3 } from "@/components/web3-provider"
import { PostFeed } from "@/components/post-feed"
import { Badge } from "@/components/ui/badge"
import { Edit, ExternalLink, Twitter, Globe } from "lucide-react"
import { PostProvider } from "@/components/post-context"
import { usePosts } from "@/components/post-context"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"

// Local storage key for profile data
const PROFILE_STORAGE_KEY = "liber_profile"

// Default profile data
const DEFAULT_PROFILE = {
  username: "crypto_enthusiast",
  bio: "Web3 developer and blockchain enthusiast. Building the decentralized future one block at a time.",
  avatar: "/placeholder.svg?height=150&width=150",
  banner: "/placeholder.svg?height=300&width=1200",
  followers: 128,
  following: 87,
  tokenId: "42",
  links: [
    { type: "website", url: "https://example.com", label: "example.com" },
    { type: "twitter", url: "https://twitter.com/example", label: "@example" },
  ],
}

export default function ProfilePage() {
  const { account } = useWeb3()
  const [activeTab, setActiveTab] = useState("posts")
  const [profile, setProfile] = useState(DEFAULT_PROFILE)

  // Load profile data from localStorage on initial render
  useEffect(() => {
    const loadProfile = () => {
      try {
        const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY)
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile))
        }
      } catch (error) {
        console.error("Failed to load profile from localStorage:", error)
      }
    }

    // Use setTimeout to avoid hydration issues
    const timer = setTimeout(() => {
      loadProfile()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // Save profile data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    } catch (error) {
      console.error("Failed to save profile to localStorage:", error)
    }
  }, [profile])

  const handleProfileUpdate = (updatedProfile: {
    username: string
    bio: string
    avatar: string
    banner: string
  }) => {
    setProfile({
      ...profile,
      ...updatedProfile,
    })
  }

  const linkIcons = {
    website: Globe,
    twitter: Twitter,
  }

  return (
    <PostProvider>
      <ProfileContent
        profile={profile}
        account={account}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        linkIcons={linkIcons}
        onProfileUpdate={handleProfileUpdate}
      />
    </PostProvider>
  )
}

function ProfileContent({
  profile,
  account,
  activeTab,
  setActiveTab,
  linkIcons,
  onProfileUpdate,
}: {
  profile: any
  account: string | null
  activeTab: string
  setActiveTab: (tab: string) => void
  linkIcons: any
  onProfileUpdate: (profile: any) => void
}) {
  const { userPosts } = usePosts()

  // Count user NFTs (posts)
  const nftCount = userPosts.length

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

      <main className="flex-1">
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
          <img src={profile.banner || "/placeholder.svg"} alt="Profile banner" className="w-full h-full object-cover" />

          <div className="absolute -bottom-16 left-8 border-4 border-background rounded-full">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.avatar} alt={profile.username} />
              <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2">
            <ProfileEditDialog
              profile={profile}
              onSave={onProfileUpdate}
              trigger={
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              }
            />
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

        <div className="container pt-20 pb-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl neon-text">@{profile.username}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {account ? (
                          <span className="font-mono">
                            {account.slice(0, 6)}...{account.slice(-4)}
                          </span>
                        ) : (
                          "Wallet not connected"
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary neon-text">
                      NFT #{profile.tokenId}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <span className="font-bold">{profile.followers}</span>
                      <span className="text-sm text-muted-foreground ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold">{profile.following}</span>
                      <span className="text-sm text-muted-foreground ml-1">Following</span>
                    </div>
                    <div>
                      <span className="font-bold">{nftCount}</span>
                      <span className="text-sm text-muted-foreground ml-1">NFTs</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {profile.links.map((link: any, index: number) => {
                      const Icon = linkIcons[link.type as keyof typeof linkIcons]
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
                </CardContent>
              </Card>
            </div>

            <div className="md:w-2/3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="nfts">NFTs ({nftCount})</TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                  <PostFeed userOnly={true} />
                </TabsContent>
                <TabsContent value="comments">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center">
                    <p className="text-muted-foreground">No comments yet</p>
                  </Card>
                </TabsContent>
                <TabsContent value="nfts">
                  {nftCount > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userPosts.map((post) => (
                        <Card key={post.id} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                          <CardHeader className="p-4 pb-0">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-md">{post.title}</CardTitle>
                              <Badge variant="outline" className="border-primary/50 text-primary neon-text">
                                NFT #{post.tokenId}
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
        </div>
      </main>
    </div>
  )
}

