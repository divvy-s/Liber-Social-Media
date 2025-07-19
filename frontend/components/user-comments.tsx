"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import { useWeb3 } from "@/components/web3-provider"
import { MessageSquare, ExternalLink } from "lucide-react"
import Link from "next/link"

interface UserCommentsProps {
  walletAddress: string | null
}

interface Comment {
  _id: string
  content: string
  createdAt: string
  post: {
    _id: string
    title: string
    content: string
  }
  user: {
    _id: string
    username: string
    avatar: string
    walletAddress: string
  }
}

export function UserComments({ walletAddress }: UserCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const { account } = useWeb3()

  useEffect(() => {
    const fetchUserComments = async () => {
      if (!walletAddress) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        
        // First get the user ID from wallet address
        const userRes = await fetch(`${apiBaseUrl}/api/users/${walletAddress}`)
        if (!userRes.ok) {
          throw new Error('Failed to fetch user')
        }
        const user = await userRes.json()
        
        // Then fetch user comments
        const commentsRes = await fetch(`${apiBaseUrl}/api/comment/user/${user._id}`)
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json()
          setComments(commentsData)
        } else {
          console.error('Failed to fetch comments:', commentsRes.status)
          setComments([])
        }
      } catch (error) {
        console.error('Error fetching user comments:', error)
        setComments([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserComments()
  }, [walletAddress])

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading comments...</div>
        </CardContent>
      </Card>
    )
  }

  if (comments.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No comments yet</p>
          <p className="text-sm text-muted-foreground mt-2">Start engaging with the community!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment._id} className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.user.avatar} alt={comment.user.username} />
                  <AvatarFallback>{comment.user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">@{comment.user.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <Link 
                href={`/posts/${comment.post._id}`}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted/30 p-3 rounded-lg border border-border/30">
              <div className="text-sm font-medium mb-1">On post: {comment.post.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {comment.post.content}
              </div>
            </div>
            <div className="bg-background/50 p-3 rounded-lg border border-border/30">
              <p className="text-sm">{comment.content}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 