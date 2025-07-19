"use client"

import React, { useEffect, useState } from 'react';
import { CommentList } from "@/components/comment-list"
import { PostProvider } from "@/components/post-context"
import { MainNav } from "@/components/main-nav"
import { WalletConnect } from "@/components/wallet-connect"
import { TrendingTopics } from "@/components/trending-topics"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Hash, MessageSquare, ArrowBigUp, ArrowBigDown, Share2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useParams } from "next/navigation"
import { useWeb3 } from "@/components/web3-provider"
import { useToast } from "@/components/ui/use-toast"

export default function PostDetailPage() {
  const params = useParams();
  const { account } = useWeb3();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${apiBaseUrl}/api/posts/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch post');
        const postData = await res.json();
        
        // Transform backend post data to match frontend Post interface
        const transformedPost = {
          id: postData._id || postData.id,
          title: postData.title || "Untitled Post",
          content: postData.content,
          author: {
            address: postData.user?.walletAddress || "Unknown",
            username: postData.user?.username || "User",
            avatar: postData.user?.avatar || "/placeholder.svg",
          },
          createdAt: postData.createdAt,
          upvotes: postData.upvotes || 0,
          downvotes: postData.downvotes || 0,
          commentCount: postData.commentCount || 0,
          shareCount: postData.shares || 0,
          tokenId: postData.nftTokenId || "",
          isMinted: !!postData.nftTokenId,
          imageUrl: postData.image,
          txHash: postData.txHash,
          hasUpvoted: false,
          hasDownvoted: false,
        };
        
        setPost(transformedPost);
      } catch (err: any) {
        setError(err.message || 'Error loading post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const handleUpvote = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to upvote posts",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fetch the user's ObjectId from the backend
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const userRes = await fetch(`${apiBaseUrl}/api/users/${account}`);
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      const userData = await userRes.json();
      const userId = userData._id;

      // Call backend upvote route
      const res = await fetch(`${apiBaseUrl}/api/posts/${post.id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to upvote post');
      const updatedPost = await res.json();

      // Update local state
      const hasUpvoted = updatedPost.upvotedBy?.includes(userId);
      const hasDownvoted = updatedPost.downvotedBy?.includes(userId);
      
      setPost(prev => ({
        ...prev,
        upvotes: updatedPost.upvotes || 0,
        downvotes: updatedPost.downvotes || 0,
        hasUpvoted,
        hasDownvoted,
      }));

      toast({
        title: "Post upvoted",
        description: "Your upvote has been recorded",
      });
    } catch (error: any) {
      toast({
        title: "Upvote failed",
        description: error.message || "Failed to upvote post",
        variant: "destructive",
      });
    }
  };

  const handleDownvote = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to downvote posts",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fetch the user's ObjectId from the backend
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const userRes = await fetch(`${apiBaseUrl}/api/users/${account}`);
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      const userData = await userRes.json();
      const userId = userData._id;

      // Call backend downvote route
      const res = await fetch(`${apiBaseUrl}/api/posts/${post.id}/downvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to downvote post');
      const updatedPost = await res.json();

      // Update local state
      const hasUpvoted = updatedPost.upvotedBy?.includes(userId);
      const hasDownvoted = updatedPost.downvotedBy?.includes(userId);
      
      setPost(prev => ({
        ...prev,
        upvotes: updatedPost.upvotes || 0,
        downvotes: updatedPost.downvotes || 0,
        hasUpvoted,
        hasDownvoted,
      }));

      toast({
        title: "Post downvoted",
        description: "Your downvote has been recorded",
      });
    } catch (error: any) {
      toast({
        title: "Downvote failed",
        description: error.message || "Failed to downvote post",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to share posts",
        variant: "destructive",
      });
      return;
    }

    try {
      // Copy the URL to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);

      // Call backend share route
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${apiBaseUrl}/api/posts/${post.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to share post');
      const updatedPost = await res.json();

      // Update local state
      setPost(prev => ({
        ...prev,
        shareCount: updatedPost.shares || 0,
      }));

      toast({
        title: "Post shared",
        description: "Link has been copied to your clipboard",
      });
    } catch (error: any) {
      toast({
        title: "Share failed",
        description: error.message || "Failed to share post",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">Loading...</div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
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
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-red-500 text-lg mb-2">Error Loading Post</div>
                <div className="text-muted-foreground">{error || 'Post not found'}</div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Extract hashtags from content
  const hashtags = post.content.match(/#\w+/g) || [];

  return (
    <PostProvider>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {/* Back Button */}
              <div className="mb-6">
                <Link 
                  href="/app" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Feed
                </Link>
              </div>

              {/* Main Post Card */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-6">
                <CardHeader className="pb-4">
                  {/* Author Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={post.author.avatar} alt={post.author.username} />
                        <AvatarFallback>{post.author.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-lg">@{post.author.username}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    {post.isMinted && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        NFT Minted
                      </Badge>
                    )}
                  </div>

                  {/* Post Title */}
                  <h1 className="text-3xl font-bold neon-text mb-4">{post.title}</h1>

                  {/* Hashtags */}
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hashtags.map((hashtag: string, index: number) => (
                        <Link
                          key={index}
                          href={`/topic/${hashtag.replace('#', '')}`}
                          className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {hashtag}
                        </Link>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="relative">
                      <img 
                        src={post.imageUrl} 
                        alt="Post image" 
                        className="rounded-lg w-full max-h-96 object-cover shadow-lg" 
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="text-lg leading-relaxed whitespace-pre-line">
                    {post.content}
                  </div>

                  {/* Interactive Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUpvote}
                        className={post.hasUpvoted ? "text-primary neon-text" : ""}
                      >
                        <ArrowBigUp className="h-5 w-5 mr-1" />
                        {post.upvotes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownvote}
                        className={post.hasDownvoted ? "text-destructive" : ""}
                      >
                        <ArrowBigDown className="h-5 w-5 mr-1" />
                        {post.downvotes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                      >
                        <Share2 className="h-5 w-5 mr-1" />
                        {post.shareCount}
                      </Button>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.commentCount} comments
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                    <h2 className="text-xl font-semibold">Comments</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <CommentList postId={post.id} autoExpand={true} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="hidden md:block">
              <TrendingTopics />
            </div>
          </div>
        </main>
      </div>
    </PostProvider>
  );
} 