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

export function CreatePostButton() {
  const { account } = useWeb3()
  const { toast } = useToast()
  const { addPost } = usePosts()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, we would upload the file to a storage service
      // For this demo, we'll use a placeholder image
      setImageUrl("/placeholder.svg?height=400&width=600")

      // Alternatively, we could use a FileReader to preview the image
      // const reader = new FileReader()
      // reader.onload = (event) => {
      //   setImageUrl(event.target?.result as string)
      // }
      // reader.readAsDataURL(file)
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
      // Generate a random token ID between 100-9999
      const tokenId = `${Math.floor(Math.random() * 9900) + 100}`

      // Create a new post and add it to the context
      const newPost = {
        id: `post-${Date.now()}`,
        title,
        content,
        author: {
          address: account, // Use the actual connected wallet address
          username: "crypto_enthusiast", // In a real app, this would be fetched from a profile
          avatar: "/placeholder.svg?height=50&width=50",
        },
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        shareCount: 0,
        tokenId,
        isMinted: false, // Initially not minted
        imageUrl: imageUrl || undefined, // Add the image URL if one was selected
      }

      addPost(newPost)

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

