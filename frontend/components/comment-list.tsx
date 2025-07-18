"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { useSocket } from "@/components/socket-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/components/web3-provider";

interface CommentListProps {
  postId: string
}

export function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<any[]>([]);
  const socket = useSocket();
  const [commentLikes, setCommentLikes] = useState<{ [key: string]: number }>({});
  const { user } = useWeb3();
  const userId = user?._id;

  // Fetch comments from backend
  useEffect(() => {
    fetch(`/api/comment/post/${postId}`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [postId]);

  useEffect(() => {
    if (!socket) return;
    const handleReaction = ({ commentId, userId, reaction }) => {
      if (reaction === "like" && commentId) {
        setCommentLikes((prev) => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
      }
    };
    socket.on("reaction", handleReaction);
    return () => {
      socket.off("reaction", handleReaction);
    };
  }, [socket]);

  const handleLike = (commentId: string) => {
    if (socket && userId) {
      socket.emit("react", { commentId, userId, reaction: "like" });
      setCommentLikes((prev) => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
    }
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    await fetch(`/api/comment/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

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
        <div key={comment._id} className="flex gap-3 items-start">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.user?.avatar || "/placeholder.svg"} alt={comment.user?.username} />
            <AvatarFallback>{comment.user?.username?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">@{comment.user?.username || "Unknown"}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              <Button size="sm" variant="ghost" onClick={() => handleLike(comment._id)} className="ml-auto">
                👍 {commentLikes[comment._id] || 0}
              </Button>
              {/* Show delete button if user is the author */}
              {comment.user?._id === userId && (
                <Button size="sm" variant="destructive" onClick={() => handleDelete(comment._id)} className="ml-2">
                  Delete
                </Button>
              )}
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

