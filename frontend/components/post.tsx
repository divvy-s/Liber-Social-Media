"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/components/web3-provider"
import { useToast } from "@/components/ui/use-toast"
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, ExternalLink, Loader2, Check } from "lucide-react"
import { usePosts, type Post as PostType } from "@/components/post-context"
import { CommentForm } from "@/components/comment-form"
import { CommentList } from "@/components/comment-list"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface PostProps {
  post: PostType
}

export function Post({ post }: PostProps) {
  const { account, isCorrectNetwork, switchNetwork } = useWeb3()
  const { toast } = useToast()
  const { incrementShareCount, mintPost, updatePost, posts } = usePosts()
  const [upvotes, setUpvotes] = useState(post.upvotes)
  const [downvotes, setDownvotes] = useState(post.downvotes)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [hasDownvoted, setHasDownvoted] = useState(false)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [isDownvoting, setIsDownvoting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showMintingDialog, setShowMintingDialog] = useState(false)
  const [mintingStatus, setMintingStatus] = useState<"pending" | "success" | "error">("pending")
  const [showImageModal, setShowImageModal] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(post.txHash || null)

  const handleUpvote = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to upvote posts",
        variant: "destructive",
      })
      return
    }

    setIsUpvoting(true)
    try {
      // In a real app, this would call a smart contract function
      // await contract.upvote(post.tokenId)

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (hasUpvoted) {
        setUpvotes(upvotes - 1)
        setHasUpvoted(false)
      } else {
        setUpvotes(upvotes + 1)
        setHasUpvoted(true)

        if (hasDownvoted) {
          setDownvotes(downvotes - 1)
          setHasDownvoted(false)
        }
      }

      toast({
        title: hasUpvoted ? "Upvote removed" : "Post upvoted",
        description: hasUpvoted
          ? "Your upvote has been removed from this post"
          : "Your upvote has been recorded on the blockchain",
      })
    } catch (error: any) {
      toast({
        title: "Upvote failed",
        description: error.message || "Failed to upvote post",
        variant: "destructive",
      })
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleDownvote = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to downvote posts",
        variant: "destructive",
      })
      return
    }

    setIsDownvoting(true)
    try {
      // In a real app, this would call a smart contract function
      // await contract.downvote(post.tokenId)

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (hasDownvoted) {
        setDownvotes(downvotes - 1)
        setHasDownvoted(false)
      } else {
        setDownvotes(downvotes + 1)
        setHasDownvoted(true)

        if (hasUpvoted) {
          setUpvotes(upvotes - 1)
          setHasUpvoted(false)
        }
      }

      toast({
        title: hasDownvoted ? "Downvote removed" : "Post downvoted",
        description: hasDownvoted
          ? "Your downvote has been removed from this post"
          : "Your downvote has been recorded on the blockchain",
      })
    } catch (error: any) {
      toast({
        title: "Downvote failed",
        description: error.message || "Failed to downvote post",
        variant: "destructive",
      })
    } finally {
      setIsDownvoting(false)
    }
  }

  const handleShare = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to share posts",
        variant: "destructive",
      })
      return
    }

    setIsSharing(true)
    try {
      // Copy the URL to clipboard
      await navigator.clipboard.writeText(`https://liber.com/post/${post.id}`)

      // Increment share count
      incrementShareCount(post.id)

      toast({
        title: "Post shared",
        description: "Link has been copied to your clipboard",
      })
    } catch (error: any) {
      toast({
        title: "Share failed",
        description: error.message || "Failed to share post",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleMintNFT = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      })
      return
    }

    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Sepolia testnet to mint NFTs",
        variant: "destructive",
      })
      try {
        await switchNetwork(11155111) // Sepolia chain ID
        return
      } catch (error) {
        return
      }
    }

    setIsMinting(true)
    setShowMintingDialog(true)
    setMintingStatus("pending")

    try {
      // Call the mintPost function from context
      await mintPost(post.id)
      setMintingStatus("success")

      // Get the transaction hash from the updated post
      const updatedPost = posts.find((p) => p.id === post.id)
      if (updatedPost?.txHash) {
        setTxHash(updatedPost.txHash)
      }

      toast({
        title: "NFT Minted Successfully",
        description: `Your post has been minted as NFT on the Sepolia network`,
      })
    } catch (error: any) {
      setMintingStatus("error")
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
      // Dialog will be closed by user clicking "View NFT" or "Close"
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  return (
    <>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={post.author.avatar} alt={post.author.username} />
                <AvatarFallback>{post.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">@{post.author.username}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
            {post.isMinted ? (
              <Badge variant="outline" className="border-primary/50 text-primary neon-text">
                NFT #{post.tokenId}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">
                Not Minted
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          <p className="text-muted-foreground mb-4">{post.content}</p>

          {/* Display image if present */}
          {post.imageUrl && (
            <div
              className="relative aspect-video w-full overflow-hidden rounded-md mb-4 cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <Image
                src={post.imageUrl || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={hasUpvoted ? "text-primary neon-text" : ""}
            >
              <ArrowBigUp className="h-5 w-5 mr-1" />
              {upvotes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownvote}
              disabled={isDownvoting}
              className={hasDownvoted ? "text-destructive" : ""}
            >
              <ArrowBigDown className="h-5 w-5 mr-1" />
              {downvotes}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleComments}>
            <MessageSquare className="h-5 w-5 mr-1" />
            {post.commentCount} Comments
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} disabled={isSharing}>
            {isSharing ? <Loader2 className="h-5 w-5 mr-1 animate-spin" /> : <Share2 className="h-5 w-5 mr-1" />}
            {post.shareCount} Shares
          </Button>

          {post.isMinted ? (
            <Button variant="ghost" size="sm" className="ml-auto" asChild>
              <a
                href={`https://sepolia.etherscan.io/tx/${post.txHash || txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Transaction
              </a>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto border-primary/50 text-primary hover:bg-primary/10"
              onClick={handleMintNFT}
              disabled={isMinting}
            >
              {isMinting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Minting...
                </>
              ) : (
                <>Mint as NFT</>
              )}
            </Button>
          )}
        </CardFooter>

        {showComments && (
          <div className="border-t border-border/40 p-4">
            <CommentForm postId={post.id} />
            <CommentList postId={post.id} />
          </div>
        )}
      </Card>

      {/* Minting Dialog */}
      <Dialog open={showMintingDialog} onOpenChange={setShowMintingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {mintingStatus === "pending" && "Minting NFT..."}
              {mintingStatus === "success" && "NFT Minted Successfully!"}
              {mintingStatus === "error" && "Minting Failed"}
            </DialogTitle>
            <DialogDescription>
              {mintingStatus === "pending" &&
                "Your post is being minted as an NFT on the Sepolia network. This may take a moment."}
              {mintingStatus === "success" &&
                `Your post has been successfully minted as an NFT on the Sepolia network.`}
              {mintingStatus === "error" && "There was an error minting your NFT. Please try again later."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-6">
            {mintingStatus === "pending" && (
              <div className="flex flex-col items-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Processing transaction...</p>
              </div>
            )}

            {mintingStatus === "success" && (
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-muted-foreground">Transaction complete!</p>
              </div>
            )}

            {mintingStatus === "error" && (
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <ExternalLink className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-muted-foreground">Please try again later</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowMintingDialog(false)}>
              Close
            </Button>
            {mintingStatus === "success" && txHash && (
              <Button asChild>
                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Transaction
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      {post.imageUrl && (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="sm:max-w-[80vw] max-h-[90vh] p-0 overflow-hidden bg-background/95 border-none">
            <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
              <Image
                src={post.imageUrl || "/placeholder.svg"}
                alt={post.title}
                width={1200}
                height={800}
                className="object-contain max-h-[80vh]"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-sm text-muted-foreground">
                Posted by @{post.author.username} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

