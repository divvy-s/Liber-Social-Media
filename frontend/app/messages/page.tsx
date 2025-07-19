"use client"

import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PostProvider } from "@/components/post-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Send, Search, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useWeb3 } from "@/components/web3-provider"

export default function MessagesPage() {
  const { account } = useWeb3()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [sending, setSending] = useState(false)

  // Fetch conversations from backend
  useEffect(() => {
    const fetchConversations = async () => {
      if (!account) return
      setLoading(true)
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const res = await fetch(`${apiBaseUrl}/api/message/conversations/${account}`)
        if (res.ok) {
          const users = await res.json()
          setConversations(users)
          if (users.length > 0) setActiveConversation(users[0])
        }
      } catch (error) {}
      setLoading(false)
    }
    fetchConversations()
  }, [account])

  // Fetch messages for the active conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!account || !activeConversation) return
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const res = await fetch(`${apiBaseUrl}/api/message/conversation/${account}/${activeConversation._id}`)
        if (res.ok) {
          const msgs = await res.json()
          setMessages(msgs)
        }
      } catch (error) {}
    }
    fetchMessages()
  }, [account, activeConversation])

  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || !activeConversation || !messageInput.trim()) return
    setSending(true)
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
      const res = await fetch(`${apiBaseUrl}/api/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: account,
          recipient: activeConversation._id,
          content: messageInput.trim(),
        })
      })
      if (res.ok) {
        const newMsg = await res.json()
        setMessages((prev) => [...prev, newMsg])
        setMessageInput("")
      }
    } catch (error) {}
    setSending(false)
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
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>
              ) : (
                conversations.map((user) => (
                  <div
                    key={user._id}
                    className={`flex items-center p-3 hover:bg-muted cursor-pointer transition-colors ${
                      activeConversation && user._id === activeConversation._id ? "bg-muted" : ""
                    }`}
                    onClick={() => setActiveConversation(user)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder.svg?height=50&width=50"} alt={user.username} />
                        <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">@{user.username}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Active Conversation */}
            <div className="md:col-span-2 border border-border/50 rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border/50 flex items-center">
                <Avatar>
                  <AvatarImage src={activeConversation?.avatar || "/placeholder.svg?height=50&width=50"} alt={activeConversation?.username} />
                  <AvatarFallback>{activeConversation?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="font-medium">@{activeConversation?.username}</div>
                  <div className="text-xs flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message: any) => (
                  <div key={message._id} className={`flex ${message.sender === account ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender === account ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{message.content}</p>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-border/50">
                <div className="flex items-center">
                  <form onSubmit={handleSendMessage} className="flex w-full">
                    <Input
                      placeholder="Type a message..."
                      className="bg-muted border-primary/20 focus:border-primary/50"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={sending}
                    />
                    <Button type="submit" className="ml-2 bg-primary hover:bg-primary/80 neon-glow" disabled={sending || !messageInput.trim()}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PostProvider>
  )
}

