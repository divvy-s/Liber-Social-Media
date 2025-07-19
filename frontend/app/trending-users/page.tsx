"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainNav } from "@/components/main-nav";
import { WalletConnect } from "@/components/wallet-connect";

export default function TrendingUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrendingUsers = async () => {
      setLoading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${apiBaseUrl}/api/explore/trending/users`);
        if (res.ok) setUsers(await res.json());
      } catch (error) {}
      setLoading(false);
    };
    fetchTrendingUsers();
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
          <h1 className="text-2xl font-bold neon-text mb-6">Trending Users</h1>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Most Followed Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : users.length === 0 ? (
                <div className="text-center text-muted-foreground">No trending users found.</div>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <div
                      key={user._id || user.walletAddress}
                      className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <Avatar className="w-10 h-10 mr-3">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                          <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || "US"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">@{user.username || user.walletAddress}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {user.followers?.length || 0} followers
                      </span>
                    </div>
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