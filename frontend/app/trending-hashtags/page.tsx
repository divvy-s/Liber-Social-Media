"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { WalletConnect } from "@/components/wallet-connect";
import Link from "next/link";

export default function TrendingHashtagsPage() {
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      setLoading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${apiBaseUrl}/api/explore/trending/hashtags`);
        if (res.ok) setHashtags(await res.json());
      } catch (error) {}
      setLoading(false);
    };
    fetchTrendingHashtags();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <MainNav />
          <div className="flex items-center gap-4">
            <WalletConnect />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold neon-text mb-6">Trending Hashtags</h1>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Most Used Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : hashtags.length === 0 ? (
                <div className="text-center text-muted-foreground">No trending hashtags found.</div>
              ) : (
                <div className="grid gap-4">
                  {hashtags.map((hashtag) => (
                    <Link
                      key={hashtag.name}
                      href={`/topic/${hashtag.name.replace('#', '')}`}
                      className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{hashtag.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{hashtag.count} posts</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 