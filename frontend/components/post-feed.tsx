"use client"

import { Post } from "@/components/post"
import { Skeleton } from "@/components/ui/skeleton"
import { usePosts } from "@/components/post-context"
import { useWeb3 } from "@/components/web3-provider"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useCallback } from "react"
import { CommentList } from "@/components/comment-list"

export function PostFeed({ userOnly = false }: { userOnly?: boolean }) {
  const { posts, userPosts, isLoading, fetchNextPage, hasMore, isFetchingNextPage } = usePosts()
  const { account } = useWeb3()
  const loaderRef = useRef<HTMLDivElement | null>(null)

  // Display either all posts or only user posts
  const displayPosts = userOnly ? userPosts : posts

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if (target.isIntersecting && hasMore && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasMore, isFetchingNextPage])

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0
    }
    const observer = new window.IntersectionObserver(handleObserver, option)
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [handleObserver])

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

  return (
    <div className="space-y-6">
      {displayPosts.map((post) => (
        <div
          key={post._id || post.id}
          className="block"
        >
          <Post post={post} />
          <CommentList postId={post._id || post.id} autoExpand={false} />
        </div>
      ))}
      <div ref={loaderRef} />
      {isFetchingNextPage && (
        <div className="text-center py-4 text-muted-foreground">Loading more...</div>
      )}
      {!hasMore && (
        <div className="text-center py-4 text-muted-foreground">No more posts</div>
      )}
    </div>
  )
}

