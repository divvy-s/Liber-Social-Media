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
  username: "",
  bio: "",
  avatar: "/placeholder.svg?height=150&width=150",
  banner: "/placeholder.svg?height=300&width=1200",
  followers: 0,
  following: 0,
  tokenId: "",
  links: [],
};

export default function ProfilePage() {
  const { user } = useWeb3();
  const userId = user?._id;
  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [userNFTs, setUserNFTs] = useState<any[]>([]);

  // Fetch profile from backend
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setProfile({
        ...DEFAULT_PROFILE,
        ...data,
        followers: data.followers?.length || 0,
        following: data.following?.length || 0,
      }))
      .finally(() => setLoading(false));
  }, [userId]);

  // Fetch user NFTs
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/nft/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setUserNFTs(data));
  }, [userId]);

  // Update profile in backend
  const handleProfileUpdate = async (updatedProfile: {
    username: string;
    bio: string;
    avatar: string;
    banner: string;
  }) => {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProfile),
    });
    const data = await res.json();
    setProfile({
      ...profile,
      ...data,
      followers: data.followers?.length || 0,
      following: data.following?.length || 0,
    });
    setLoading(false);
  };

  const linkIcons = {
    website: Globe,
    twitter: Twitter,
  }

  return (
    <PostProvider>
      <ProfileContent
        profile={profile}
        account={userId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        linkIcons={linkIcons}
        onProfileUpdate={handleProfileUpdate}
        loading={loading}
        userNFTs={userNFTs}
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
  loading,
  userNFTs,
}: {
  profile: any
  account: string | null
  activeTab: string
  setActiveTab: (tab: string) => void
  linkIcons: any
  onProfileUpdate: (profile: any) => void
  loading: boolean;
  userNFTs: any[];
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
                  {userNFTs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userNFTs.map((nft) => (
                        <Card key={nft._id} className="border-primary/50">
                          <CardHeader>
                            <CardTitle>NFT Token ID: {nft.nftTokenId}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-2">
                              <img src={nft.image || "/placeholder.svg"} alt="NFT" className="w-full h-40 object-cover rounded" />
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">{nft.content}</div>
                            <a
                              href={`https://opensea.io/assets/ethereum/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${nft.nftTokenId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline"
                            >
                              View on OpenSea
                            </a>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center">
                      <p className="text-muted-foreground">No NFTs minted yet</p>
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

