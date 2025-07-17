"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { usePosts } from "@/components/post-context"

interface CommentListProps {
  postId: string
}

export function CommentList({ postId }: CommentListProps) {
  const { getPostComments } = usePosts()
  const comments = getPostComments(postId)

  if (comments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
            <AvatarFallback>{comment.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">@{comment.author.username}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

