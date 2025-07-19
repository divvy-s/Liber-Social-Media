"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Hash } from "lucide-react"
import { useState, useEffect } from "react"

export function TrendingTopics() {
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      setLoading(true)
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const res = await fetch(`${apiBaseUrl}/api/explore/trending/hashtags`)
        if (res.ok) {
          const hashtags = await res.json()
          setTrendingHashtags(hashtags.slice(0, 5)) // Show top 5
        }
      } catch (error) {}
      setLoading(false)
    }
    fetchTrendingHashtags()
  }, [])

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : trendingHashtags.length === 0 ? (
          <div className="text-center text-muted-foreground">No trending topics</div>
        ) : (
          <div className="space-y-4">
            {trendingHashtags.map((hashtag) => (
              <Link
                key={hashtag.name}
                href={`/topic/${hashtag.name.replace('#', '')}`}
                className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{hashtag.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{hashtag.count}</span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

