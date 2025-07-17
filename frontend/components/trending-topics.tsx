"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Hash } from "lucide-react"

// Mock data for demonstration
const TRENDING_TOPICS = [
  {
    id: "1",
    name: "Web3",
  },
  {
    id: "2",
    name: "NFTs",
  },
  {
    id: "3",
    name: "Ethereum",
  },
  {
    id: "4",
    name: "Blockchain",
  },
  {
    id: "5",
    name: "DeFi",
  },
]

export function TrendingTopics() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {TRENDING_TOPICS.map((topic) => (
            <Link
              key={topic.id}
              href={`/topic/${topic.name.toLowerCase()}`}
              className="flex items-center hover:bg-muted p-2 rounded-md transition-colors"
            >
              <Hash className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">{topic.name}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

