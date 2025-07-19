"use client"

import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostProvider } from "@/components/post-context"
import { Bell, Heart, MessageSquare, Repeat, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import { useWeb3 } from "@/components/web3-provider"

export default function NotificationsPage() {
  const { account } = useWeb3()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!account) return
      setLoading(true)
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const res = await fetch(`${apiBaseUrl}/api/notification`)
        if (res.ok) {
          let data = await res.json()
          // Filter notifications for the current user if needed
          data = data.filter((n: any) => n.user === account || n.user?._id === account)
          setNotifications(data)
        }
      } catch (error) {}
      setLoading(false)
    }
    fetchNotifications()
  }, [account])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-primary" />
      case "follow":
        return <User className="h-4 w-4 text-green-500" />
      case "repost":
        return <Repeat className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold neon-text">Notifications</h1>
            </div>

            <Tabs defaultValue="all" className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="mentions">Mentions</TabsTrigger>
                <TabsTrigger value="likes">Likes</TabsTrigger>
                <TabsTrigger value="reposts">Reposts</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-primary" />
                      Recent Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {loading ? (
                      <div className="text-center text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center text-muted-foreground">No notifications yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`flex items-start p-3 rounded-md transition-colors ${
                              notification.read ? "bg-transparent" : "bg-muted"
                            }`}
                          >
                            <div className="flex-shrink-0 mr-4">
                              <Avatar>
                                <AvatarImage src={notification.fromUser?.avatar || "/placeholder.svg?height=50&width=50"} alt={notification.fromUser?.username || "User"} />
                                <AvatarFallback>{notification.fromUser?.username?.slice(0, 2).toUpperCase() || "US"}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <span className="font-medium">@{notification.fromUser?.username || "User"}</span>
                                <span className="mx-1">{notification.type === "like" ? "liked your post" : notification.type === "comment" ? "commented on your post" : notification.type === "follow" ? "started following you" : notification.type === "repost" ? "reposted your post" : notification.content}</span>
                                {notification.post?.title && (
                                  <span className="font-medium text-primary">"{notification.post.title}"</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2">{getNotificationIcon(notification.type)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="mentions" className="mt-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center">
                  <p className="text-muted-foreground">No mentions yet</p>
                </Card>
              </TabsContent>
              <TabsContent value="likes" className="mt-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    {loading ? (
                      <div className="text-center text-muted-foreground">Loading...</div>
                    ) : notifications.filter((n) => n.type === "like").length === 0 ? (
                      <div className="text-center text-muted-foreground">No likes yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {notifications
                          .filter((n) => n.type === "like")
                          .map((notification) => (
                            <div
                              key={notification._id}
                              className={`flex items-start p-3 rounded-md transition-colors ${
                                notification.read ? "bg-transparent" : "bg-muted"
                              }`}
                            >
                              <div className="flex-shrink-0 mr-4">
                                <Avatar>
                                  <AvatarImage src={notification.fromUser?.avatar || "/placeholder.svg?height=50&width=50"} alt={notification.fromUser?.username || "User"} />
                                  <AvatarFallback>{notification.fromUser?.username?.slice(0, 2).toUpperCase() || "US"}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium">@{notification.fromUser?.username || "User"}</span>
                                <span className="mx-1">liked your post</span>
                                {notification.post?.title && (
                                  <span className="font-medium text-primary">"{notification.post.title}"</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <Heart className="h-4 w-4 text-red-500" />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reposts" className="mt-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    {loading ? (
                      <div className="text-center text-muted-foreground">Loading...</div>
                    ) : notifications.filter((n) => n.type === "repost").length === 0 ? (
                      <div className="text-center text-muted-foreground">No reposts yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {notifications
                          .filter((n) => n.type === "repost")
                          .map((notification) => (
                            <div
                              key={notification._id}
                              className={`flex items-start p-3 rounded-md transition-colors ${
                                notification.read ? "bg-transparent" : "bg-muted"
                              }`}
                            >
                              <div className="flex-shrink-0 mr-4">
                                <Avatar>
                                  <AvatarImage src={notification.fromUser?.avatar || "/placeholder.svg?height=50&width=50"} alt={notification.fromUser?.username || "User"} />
                                  <AvatarFallback>{notification.fromUser?.username?.slice(0, 2).toUpperCase() || "US"}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center">
                                  <span className="font-medium">@{notification.fromUser?.username || "User"}</span>
                                  <span className="mx-1">reposted your post</span>
                                  {notification.post?.title && (
                                    <span className="font-medium text-primary">"{notification.post.title}"</span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                              <Repeat className="h-4 w-4 text-blue-500" />
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PostProvider>
  )
}

