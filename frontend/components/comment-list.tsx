"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import { usePosts } from "@/components/post-context"
import { ChevronDown, ChevronUp } from "lucide-react"
import { CommentForm } from "@/components/comment-form"

interface CommentListProps {
  postId: string
  autoExpand?: boolean // If true, start expanded
}

export function CommentList({ postId, autoExpand = false }: CommentListProps) {
  const { getPostComments, fetchPostComments } = usePosts()
  const [expanded, setExpanded] = useState(autoExpand)
  const [loading, setLoading] = useState(false)
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false)
  const comments = getPostComments(postId)

  // Sort comments by upvotes if available, else by recency
  const sortedComments = [...comments].sort((a, b) => {
    if (typeof b.upvotes === 'number' && typeof a.upvotes === 'number') {
      return b.upvotes - a.upvotes
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Fetch comments when component mounts
  useEffect(() => {
    setLoading(true)
    fetchPostComments(postId).finally(() => setLoading(false))
  }, [postId, fetchPostComments])

  // Auto-expand only once when comments are first loaded
  useEffect(() => {
    if (comments.length > 0 && !expanded && !hasAutoExpanded) {
      setExpanded(true)
      setHasAutoExpanded(true)
    }
  }, [comments.length, expanded, hasAutoExpanded])

  const handleToggle = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="border-t border-border/40 bg-muted/20">
      {/* Header with arrow */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Comments</span>
          <span className="text-xs text-muted-foreground">({comments.length})</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Comments content */}
      {expanded && (
        <div className="px-3 pb-3">
          {/* Comment form */}
          <div className="mb-4">
            <CommentForm postId={postId} />
          </div>
          
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-3">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
                    <AvatarFallback>{comment.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-background/50 p-3 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">@{comment.author.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

