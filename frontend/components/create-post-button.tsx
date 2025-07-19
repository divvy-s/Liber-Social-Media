"use client"

import type React from "react"

// Add imports for image handling
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/components/web3-provider"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Loader2, ImageIcon, X } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePosts } from "@/components/post-context"
import { RadioGroup } from "@/components/ui/radio-group"

export function CreatePostButton() {
  const { account } = useWeb3()
  const { toast } = useToast()
  const { addPost } = usePosts()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'cloudinary' | 'ipfs'>('cloudinary')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const formData = new FormData()
        formData.append('image', file)
        let endpoint = '/api/upload'
        let urlKey = 'url'
        if (uploadMethod === 'ipfs') {
          formData.delete('image')
          formData.append('file', file)
          endpoint = '/api/ipfs'
          urlKey = 'url' // backend returns { url: ... } for IPFS as well
        }
        const res = await fetch(`${apiBaseUrl}${endpoint}`, {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('Failed to upload image')
        const data = await res.json()
        setImageUrl(data[urlKey])
      } catch (error) {
        toast({
          title: 'Image upload failed',
          description: (error as any).message || 'Could not upload image',
          variant: 'destructive',
        })
      }
    }
  }

  const removeImage = () => {
    setImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a post",
        variant: "destructive",
      })
      return
    }

    if (!title || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Fetch the user's ObjectId from the backend
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const userRes = await fetch(`${apiBaseUrl}/api/users/${account}`);
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      const userData = await userRes.json();
      const userId = userData._id;

      // Prepare the post data to send to the backend
      const postPayload = {
        user: userId,
        title,
        content,
        image: imageUrl || undefined,
      };

      // Send POST request to backend
      const res = await fetch(`${apiBaseUrl}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload),
      });

      if (!res.ok) {
        throw new Error('Failed to create post on backend');
      }

      const createdPost = await res.json();
      // Fetch the full post with populated user
      const postId = createdPost._id || createdPost.id;
      let fullPost = createdPost;
      if (postId) {
        const fullRes = await fetch(`${apiBaseUrl}/api/posts/${postId}`);
        if (fullRes.ok) {
          fullPost = await fullRes.json();
        }
      }
      
      // Transform the backend post data to match frontend Post interface
      const transformedPost = {
        id: fullPost._id || fullPost.id,
        title: title, // Use the title from the form
        content: fullPost.content,
        author: {
          address: fullPost.user?.walletAddress || account,
          username: fullPost.user?.username || "User",
          avatar: fullPost.user?.avatar || "/placeholder.svg",
        },
        createdAt: fullPost.createdAt,
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        shareCount: 0,
        tokenId: fullPost.nftTokenId || "",
        isMinted: !!fullPost.nftTokenId,
        imageUrl: fullPost.image,
        txHash: fullPost.txHash,
      };
      
      addPost(transformedPost);

      toast({
        title: "Post created",
        description: "Your post has been created. You can mint it as an NFT anytime.",
      })

      setIsOpen(false)
      setTitle("")
      setContent("")
      setImageUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      toast({
        title: "Failed to create post",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          if (!account) {
            toast({
              title: "Wallet not connected",
              description: "Please connect your wallet to create a post",
              variant: "destructive",
            })
            return
          }
          setIsOpen(true)
        }}
        className="bg-primary hover:bg-primary/80 neon-glow"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Post
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl neon-text">Create New Post</DialogTitle>
            <DialogDescription>Create a post that can be minted as an NFT on the blockchain</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your post"
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="min-h-[120px] bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image (optional)</Label>
                <RadioGroup
                  value={uploadMethod}
                  onValueChange={val => setUploadMethod(val as 'cloudinary' | 'ipfs')}
                  className="flex gap-4 mb-2"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="cloudinary" checked={uploadMethod === 'cloudinary'} onChange={() => setUploadMethod('cloudinary')} />
                    Cloudinary
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="ipfs" checked={uploadMethod === 'ipfs'} onChange={() => setUploadMethod('ipfs')} />
                    IPFS
                  </label>
                </RadioGroup>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                {imageUrl && (
                  <div className="relative mt-2">
                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                      <Image src={imageUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/80 neon-glow">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>Create Post</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

