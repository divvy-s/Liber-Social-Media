"use client"

import { Post } from "@/components/post"
import { Skeleton } from "@/components/ui/skeleton"
import { usePosts } from "@/components/post-context"
import { useWeb3 } from "@/components/web3-provider"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export function PostFeed({ userOnly = false }: { userOnly?: boolean }) {
  const { posts, userPosts, isLoading } = usePosts()
  const { account } = useWeb3()

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

  return (
    <div className="space-y-6">
      {displayPosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}

