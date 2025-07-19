"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWeb3 } from "@/components/web3-provider"
import { useToast } from "@/components/ui/use-toast"
import { usePosts } from "@/components/post-context"
import { Loader2 } from "lucide-react"

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { account } = useWeb3()
  const { toast } = useToast()
  const { addComment } = usePosts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to comment",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Fetch the user's ObjectId from the backend
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const userRes = await fetch(`${apiBaseUrl}/api/users/${account}`);
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      const userData = await userRes.json();
      const userId = userData._id;

      // Prepare the comment data to send to the backend
      const commentPayload = {
        post: postId,
        user: userId,
        content,
      }

      // Send POST request to backend
      const res = await fetch(`${apiBaseUrl}/api/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentPayload),
      });

      if (!res.ok) {
        throw new Error('Failed to add comment on backend');
      }

      const createdComment = await res.json();
      
      // Transform the backend comment to match frontend Comment interface
      const transformedComment = {
        id: createdComment._id || createdComment.id,
        postId: createdComment.post,
        content: createdComment.content,
        author: {
          address: userData.walletAddress || account,
          username: userData.username || "User",
          avatar: userData.avatar || "/placeholder.svg",
        },
        createdAt: createdComment.createdAt,
      };
      
      addComment(transformedComment);

      // Clear the form
      setContent("")

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      })
    } catch (error: any) {
      toast({
        title: "Failed to add comment",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder.svg?height=50&width=50" alt="Your avatar" />
          <AvatarFallback>YA</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] bg-muted resize-none mb-2"
            disabled={isSubmitting || !account}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !account || !content.trim()}
              className="bg-primary hover:bg-primary/80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

