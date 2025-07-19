"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { WalletConnect } from "@/components/wallet-connect";
import { TrendingTopics } from "@/components/trending-topics";
import { Hash, ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Share2, Calendar, ArrowBigUp, ArrowBigDown, Loader2 } from "lucide-react";
import { PostProvider } from "@/components/post-context";
import { CommentList } from "@/components/comment-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useWeb3 } from "@/components/web3-provider";
import { useToast } from "@/components/ui/use-toast";

export default function TopicPage() {
  const params = useParams();
  const topic = params?.name as string;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { account } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    if (!topic) return;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${apiBaseUrl}/api/explore/hashtags/${encodeURIComponent(topic)}`);
        if (res.ok) {
          const backendPosts = await res.json();
          
          // Transform backend posts to match frontend Post interface
          const transformedPosts = backendPosts.map((post: any) => ({
            id: post._id || post.id,
            title: post.title || "Untitled Post",
            content: post.content,
            author: {
              address: post.user?.walletAddress || "Unknown",
              username: post.user?.username || "User",
              avatar: post.user?.avatar || "/placeholder.svg",
            },
            createdAt: post.createdAt,
            upvotes: post.upvotes || 0,
            downvotes: post.downvotes || 0,
            commentCount: post.commentCount || 0,
            shareCount: post.shares || 0,
            tokenId: post.nftTokenId || "",
            isMinted: !!post.nftTokenId,
            imageUrl: post.image,
            txHash: post.txHash,
            hasUpvoted: false,
            hasDownvoted: false,
          }));
          
          setPosts(transformedPosts);
        }
      } catch (error) {}
      setLoading(false);
    };
    fetchPosts();
  }, [topic]);

  const handleUpvote = async (postId: string) => {
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
      const res = await fetch(`${apiBaseUrl}/api/posts/${postId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to upvote post');
      const updatedPost = await res.json();

      // Update local state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const hasUpvoted = updatedPost.upvotedBy?.includes(userId);
          const hasDownvoted = updatedPost.downvotedBy?.includes(userId);
          return {
            ...post,
            upvotes: updatedPost.upvotes || 0,
            downvotes: updatedPost.downvotes || 0,
            hasUpvoted,
            hasDownvoted,
          };
        }
        return post;
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

  const handleDownvote = async (postId: string) => {
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
      const res = await fetch(`${apiBaseUrl}/api/posts/${postId}/downvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to downvote post');
      const updatedPost = await res.json();

      // Update local state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const hasUpvoted = updatedPost.upvotedBy?.includes(userId);
          const hasDownvoted = updatedPost.downvotedBy?.includes(userId);
          return {
            ...post,
            upvotes: updatedPost.upvotes || 0,
            downvotes: updatedPost.downvotes || 0,
            hasUpvoted,
            hasDownvoted,
          };
        }
        return post;
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

  const handleShare = async (postId: string) => {
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
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);

      // Call backend share route
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${apiBaseUrl}/api/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to share post');
      const updatedPost = await res.json();

      // Update local state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            shareCount: updatedPost.shares || 0,
          };
        }
        return post;
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
                  href="/explore" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Explore
                </Link>
              </div>

              {/* Topic Header */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Hash className="h-8 w-8 mr-3 text-primary" />
                  <h1 className="text-3xl font-bold neon-text">#{topic}</h1>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span>{posts.length} posts</span>
                </div>
              </div>

              {/* Posts */}
              {loading ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">Loading posts...</div>
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground mb-2">No posts found for #{topic}</div>
                    <div className="text-sm text-muted-foreground">Be the first to post about this topic!</div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        {/* Author Info */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={post.author.avatar} alt={post.author.username} />
                              <AvatarFallback>{post.author.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">@{post.author.username}</div>
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
                        <Link href={`/posts/${post.id}`}>
                          <h2 className="text-xl font-bold neon-text mb-2 hover:text-primary transition-colors cursor-pointer">
                            {post.title}
                          </h2>
                        </Link>

                        {/* Post Content */}
                        <div className="text-muted-foreground leading-relaxed">
                          {post.content}
                        </div>

                        {/* Post Image */}
                        {post.imageUrl && (
                          <div className="mt-4">
                            <img 
                              src={post.imageUrl} 
                              alt={post.title} 
                              className="rounded-lg w-full max-h-64 object-cover shadow-md" 
                            />
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Interactive Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpvote(post.id)}
                              className={post.hasUpvoted ? "text-primary neon-text" : ""}
                            >
                              <ArrowBigUp className="h-5 w-5 mr-1" />
                              {post.upvotes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownvote(post.id)}
                              className={post.hasDownvoted ? "text-destructive" : ""}
                            >
                              <ArrowBigDown className="h-5 w-5 mr-1" />
                              {post.downvotes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(post.id)}
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

                        {/* Comments Section */}
                        <div className="border-t border-border/50 pt-4">
                          <div className="flex items-center mb-4">
                            <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                            <h3 className="text-lg font-semibold">Comments</h3>
                          </div>
                          <CommentList postId={post.id} autoExpand={true} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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