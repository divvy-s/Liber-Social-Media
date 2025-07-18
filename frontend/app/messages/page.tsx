import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PostProvider } from "@/components/post-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Send, Search } from "lucide-react"
import { useSocket } from "@/components/socket-context";
import { useEffect, useState, useRef } from "react";
import { useWeb3 } from "@/components/web3-provider";

export default function MessagesPage() {
  // Replace mock data with state for real-time messages
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const socket = useSocket();
  const { user } = useWeb3();
  const userId = user?._id;
  const [recipientId, setRecipientId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  let typingTimeout: NodeJS.Timeout | null = null;

  // Fetch conversation list
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/message/conversations/${userId}`)
      .then((res) => res.json())
      .then((data) => setConversations(data));
  }, [userId]);

  // Fetch conversation history
  useEffect(() => {
    if (!userId || !recipientId) return;
    fetch(`/api/message/conversation/${userId}/${recipientId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [userId, recipientId]);

  useEffect(() => {
    if (socket && userId) {
      socket.emit("join", userId);
      socket.on("receiveMessage", (data) => {
        setMessages((prev) => [...prev, data]);
      });
      return () => {
        socket.off("receiveMessage");
      };
    }
  }, [socket, userId]);

  useEffect(() => {
    // Fetch initial online users
    fetch("/api/online-users")
      .then((res) => res.json())
      .then((data) => setOnlineUsers(data));
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("userOnline", (userId) => {
        setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
      });
      socket.on("userOffline", (userId) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });
      return () => {
        socket.off("userOnline");
        socket.off("userOffline");
      };
    }
  }, [socket]);

  // Listen for typing events
  useEffect(() => {
    if (socket && recipientId) {
      socket.on("typing", ({ sender }) => {
        if (sender === recipientId) setIsRecipientTyping(true);
      });
      socket.on("stopTyping", ({ sender }) => {
        if (sender === recipientId) setIsRecipientTyping(false);
      });
      return () => {
        socket.off("typing");
        socket.off("stopTyping");
      };
    }
  }, [socket, recipientId]);

  // Emit typing events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socket && userId && recipientId) {
      socket.emit("typing", { sender: userId, recipient: recipientId });
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("stopTyping", { sender: userId, recipient: recipientId });
      }, 1200);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (socket && input.trim() && userId && recipientId) {
      const msg = { sender: userId, recipient: recipientId, content: input };
      socket.emit("sendMessage", msg);
      setMessages((prev) => [...prev, { ...msg, self: true }]);
      setInput("");
      // Save to backend
      await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
    }
  };

  // Mark message as read (call when opening a conversation or receiving a message)
  const markAsRead = async (messageId: string) => {
    await fetch(`/api/message/${messageId}/read`, { method: "POST" });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
                    key={conversation._id}
                    className={`flex items-center p-3 hover:bg-muted cursor-pointer transition-colors ${
                      activeConversation && conversation._id === activeConversation._id ? "bg-muted" : ""
                    }`}
                    onClick={() => {
                      setRecipientId(conversation._id || conversation.user?._id);
                      setActiveConversation(conversation);
                    }}
                  >
                    <div className="relative mr-3">
                      <Avatar>
                        <AvatarImage src={conversation.user.avatar} alt={conversation.user.username} />
                        <AvatarFallback>{conversation.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {/* Online status dot */}
                      <span
                        className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background ${
                          onlineUsers.includes(conversation.user.id || conversation.user.username) ? "bg-green-500" : "bg-gray-400"
                        }`}
                        title={onlineUsers.includes(conversation.user.id || conversation.user.username) ? "Online" : "Offline"}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{conversation.user.username}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {conversation.lastMessage}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Conversation */}
            <div className="md:col-span-2 border border-border/50 rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border/50 flex items-center">
                <Avatar>
                  <AvatarImage src={activeConversation?.user.avatar} alt={activeConversation?.user.username} />
                  <AvatarFallback>{activeConversation?.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="font-medium">@{activeConversation?.user.username}</div>
                  <div className="text-xs flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 flex ${msg.sender === userId || msg.self ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`rounded-lg px-4 py-2 ${msg.sender === userId || msg.self ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isRecipientTyping && (
                  <div className="text-xs text-muted-foreground mb-2">Typing...</div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 border-t border-border/50">
                <div className="flex items-center">
                  <input
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                    placeholder="Type a message..."
                    className="flex-1 bg-muted border-primary/20 focus:border-primary/50 rounded px-3 py-2"
                  />
                  <button
                    onClick={sendMessage}
                    className="ml-2 bg-primary hover:bg-primary/80 neon-glow rounded px-4 py-2 text-white"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PostProvider>
  )
}

