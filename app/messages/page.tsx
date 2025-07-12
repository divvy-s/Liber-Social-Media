import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PostProvider } from "@/components/post-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Send, Search } from "lucide-react"

export default function MessagesPage() {
  // Mock data for demonstration
  const conversations = [
    {
      id: "1",
      user: {
        username: "web3_dev",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      lastMessage: "Hey, what do you think about the new Ethereum update?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      unread: true,
    },
    {
      id: "2",
      user: {
        username: "crypto_queen",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      lastMessage: "I just minted a new NFT collection, check it out!",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      unread: false,
    },
    {
      id: "3",
      user: {
        username: "nft_collector",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      lastMessage: "Are you going to the blockchain conference next week?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      unread: false,
    },
    {
      id: "4",
      user: {
        username: "blockchain_guru",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      lastMessage: "Thanks for sharing your post about Web3 development!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      unread: false,
    },
  ]

  const activeConversation = {
    id: "1",
    user: {
      username: "web3_dev",
      avatar: "/placeholder.svg?height=50&width=50",
      status: "online",
    },
    messages: [
      {
        id: "1",
        sender: "web3_dev",
        content: "Hey, how's it going?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: "2",
        sender: "me",
        content: "Not bad! Working on some new blockchain projects.",
        timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(), // 29 minutes ago
      },
      {
        id: "3",
        sender: "web3_dev",
        content: "That's awesome! What are you building?",
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
      },
      {
        id: "4",
        sender: "me",
        content: "I'm working on a decentralized social media platform where every post is an NFT.",
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
      },
      {
        id: "5",
        sender: "web3_dev",
        content: "That sounds really interesting! I'd love to hear more about it.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      },
      {
        id: "6",
        sender: "me",
        content:
          "The idea is to give users true ownership of their content while creating a censorship-resistant platform.",
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
      },
      {
        id: "7",
        sender: "web3_dev",
        content: "Hey, what do you think about the new Ethereum update?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      },
    ],
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold neon-text">Messages</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <div className="md:col-span-1 border border-border/50 rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10 bg-muted border-primary/20 focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center p-3 hover:bg-muted cursor-pointer transition-colors ${
                      conversation.id === activeConversation.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.user.avatar} alt={conversation.user.username} />
                        <AvatarFallback>{conversation.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {conversation.unread && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">@{conversation.user.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: false })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Conversation */}
            <div className="md:col-span-2 border border-border/50 rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border/50 flex items-center">
                <Avatar>
                  <AvatarImage src={activeConversation.user.avatar} alt={activeConversation.user.username} />
                  <AvatarFallback>{activeConversation.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="font-medium">@{activeConversation.user.username}</div>
                  <div className="text-xs flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{message.content}</p>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-border/50">
                <div className="flex items-center">
                  <Input
                    placeholder="Type a message..."
                    className="bg-muted border-primary/20 focus:border-primary/50"
                  />
                  <Button className="ml-2 bg-primary hover:bg-primary/80 neon-glow">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PostProvider>
  )
}

