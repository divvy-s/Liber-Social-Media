"use client"

import { Post } from "@/components/post"
import { Skeleton } from "@/components/ui/skeleton"
import { useWeb3 } from "@/components/web3-provider"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useSocket } from "@/components/socket-context";
import { useEffect, useState } from "react";
import { CreatePostButton } from "./create-post-button";

export function PostFeed({ userOnly = false }: { userOnly?: boolean }) {
  const [posts, setPosts] = useState<any[]>([]);
  const socket = useSocket();
  const { user } = useWeb3();
  const userId = user?._id;

  // Fetch initial posts (existing logic)
  useEffect(() => {
    fetch(userOnly ? "/api/posts?userOnly=true" : "/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || data));
  }, [userOnly]);

  // Real-time feed updates
  useEffect(() => {
    if (!socket) return;
    // New post
    socket.on("newPost", (post) => {
      setPosts((prev) => [post, ...prev]);
      setHighlighted((prev) => [post._id, ...prev]);
      setTimeout(() => {
        setHighlighted((prev) => prev.filter((id) => id !== post._id));
      }, 4000); // Highlight for 4 seconds
    });
    // Post liked
    socket.on("postLiked", ({ postId, userId }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: p.likes ? [...p.likes, userId] : [userId] }
            : p
        )
      );
    });
    // New comment (optional: update comment count or fetch comments)
    socket.on("newComment", (comment) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === comment.post
            ? { ...p, commentCount: (p.commentCount || 0) + 1 }
            : p
        )
      );
    });
    return () => {
      socket.off("newPost");
      socket.off("postLiked");
      socket.off("newComment");
    };
  }, [socket]);

  // Display either all posts or only user posts
  const displayPosts = userOnly ? userPosts : posts

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border border-border/50 p-4 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (displayPosts.length === 0 && userOnly) {
    return (
      <div className="text-center p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm">
        <p className="text-muted-foreground mb-4">You haven't created any posts yet.</p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/80 neon-glow">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Post
          </Button>
        </Link>
      </div>
    )
  }

  // Track new post IDs for highlighting
  const [highlighted, setHighlighted] = useState<string[]>([]);

  // Use posts state for rendering feed
  return (
    <div>
      <CreatePostButton onPostCreated={(post) => setPosts((prev) => [post, ...prev])} />
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id} className={highlighted.includes(post._id) ? "ring-2 ring-primary transition-all duration-500" : ""}>
            <Post post={post} />
          </div>
        ))}
      </div>
    </div>
  )
}

