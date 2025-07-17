import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostProvider } from "@/components/post-context"
import { Bell, Heart, MessageSquare, Repeat, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

export default function NotificationsPage() {
  // Mock data for demonstration
  const notifications = [
    {
      id: "1",
      type: "like",
      user: {
        username: "web3_dev",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      content: "liked your post",
      postTitle: "Introducing Liber: The Future of Social Media",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      read: false,
    },
    {
      id: "2",
      type: "comment",
      user: {
        username: "crypto_queen",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      content: "commented on your post",
      postTitle: "How NFTs are Changing Digital Ownership",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false,
    },
    {
      id: "3",
      type: "follow",
      user: {
        username: "nft_collector",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      content: "started following you",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: true,
    },
    {
      id: "4",
      type: "repost",
      user: {
        username: "blockchain_guru",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      content: "reposted your post",
      postTitle: "Web3 Development Tips and Tricks",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      read: true,
    },
  ]

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
                  <CardContent>
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start p-3 rounded-md transition-colors ${
                            notification.read ? "bg-transparent" : "bg-muted"
                          }`}
                        >
                          <div className="flex-shrink-0 mr-4">
                            <Avatar>
                              <AvatarImage src={notification.user.avatar} alt={notification.user.username} />
                              <AvatarFallback>{notification.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <span className="font-medium">@{notification.user.username}</span>
                              <span className="mx-1">{notification.content}</span>
                              {notification.postTitle && (
                                <span className="font-medium text-primary">"{notification.postTitle}"</span>
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
                    <div className="space-y-4">
                      {notifications
                        .filter((n) => n.type === "like")
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start p-3 rounded-md transition-colors ${
                              notification.read ? "bg-transparent" : "bg-muted"
                            }`}
                          >
                            <div className="flex-shrink-0 mr-4">
                              <Avatar>
                                <AvatarImage src={notification.user.avatar} alt={notification.user.username} />
                                <AvatarFallback>{notification.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <span className="font-medium">@{notification.user.username}</span>
                                <span className="mx-1">{notification.content}</span>
                                {notification.postTitle && (
                                  <span className="font-medium text-primary">"{notification.postTitle}"</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <Heart className="h-4 w-4 text-red-500" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reposts" className="mt-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {notifications
                        .filter((n) => n.type === "repost")
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start p-3 rounded-md transition-colors ${
                              notification.read ? "bg-transparent" : "bg-muted"
                            }`}
                          >
                            <div className="flex-shrink-0 mr-4">
                              <Avatar>
                                <AvatarImage src={notification.user.avatar} alt={notification.user.username} />
                                <AvatarFallback>{notification.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <span className="font-medium">@{notification.user.username}</span>
                                <span className="mx-1">{notification.content}</span>
                                {notification.postTitle && (
                                  <span className="font-medium text-primary">"{notification.postTitle}"</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <Repeat className="h-4 w-4 text-blue-500" />
                            </div>
                          </div>
                        ))}
                    </div>
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

