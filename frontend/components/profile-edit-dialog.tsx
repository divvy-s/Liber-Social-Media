"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ImageIcon, X } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup } from "@/components/ui/radio-group"
import { useWeb3 } from "@/components/web3-provider"

interface ProfileEditDialogProps {
  profile: {
    username: string
    bio: string
    avatar: string
    banner: string
  }
  onSave: (profile: {
    username: string
    bio: string
    avatar: string
    banner: string
  }) => void
  trigger?: React.ReactNode
}

export function ProfileEditDialog({ profile, onSave, trigger }: ProfileEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar)
  const [bannerUrl, setBannerUrl] = useState(profile.banner)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { account, setUserProfile } = useWeb3()
  const [avatarUploadMethod, setAvatarUploadMethod] = useState<'cloudinary' | 'ipfs'>('cloudinary')
  const [bannerUploadMethod, setBannerUploadMethod] = useState<'cloudinary' | 'ipfs'>('cloudinary')

  // Sync local state with profile prop when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setUsername(profile.username)
      setBio(profile.bio)
      setAvatarUrl(profile.avatar)
      setBannerUrl(profile.banner)
    }
  }, [isOpen, profile])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const formData = new FormData()
        formData.append('image', file)
        let endpoint = '/api/upload'
        let urlKey = 'url'
        if (avatarUploadMethod === 'ipfs') {
          formData.delete('image')
          formData.append('file', file)
          endpoint = '/api/ipfs'
          urlKey = 'url'
        }
        const res = await fetch(`${apiBaseUrl}${endpoint}`, {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('Failed to upload image')
        const data = await res.json()
        setAvatarUrl(data[urlKey])
      } catch (error) {
        toast({
          title: 'Avatar upload failed',
          description: (error as any).message || 'Could not upload avatar',
          variant: 'destructive',
        })
      }
    }
  }

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const formData = new FormData()
        formData.append('image', file)
        let endpoint = '/api/upload'
        let urlKey = 'url'
        if (bannerUploadMethod === 'ipfs') {
          formData.delete('image')
          formData.append('file', file)
          endpoint = '/api/ipfs'
          urlKey = 'url'
        }
        const res = await fetch(`${apiBaseUrl}${endpoint}`, {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('Failed to upload image')
        const data = await res.json()
        console.log('Banner upload response:', data)
        setBannerUrl(data[urlKey])
      } catch (error) {
        toast({
          title: 'Banner upload failed',
          description: (error as any).message || 'Could not upload banner',
          variant: 'destructive',
        })
      }
    }
  }

  const removeAvatar = () => {
    setAvatarUrl("/placeholder.svg?height=150&width=150")
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ""
    }
  }

  const removeBanner = () => {
    setBannerUrl("/placeholder.svg?height=300&width=1200")
    if (bannerInputRef.current) {
      bannerInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Send profile update to backend
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
      const res = await fetch(`${apiBaseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account,
          username,
          bio,
          avatar: avatarUrl,
          banner: bannerUrl,
        })
      })
      if (!res.ok) throw new Error('Failed to update profile on backend')
      const updatedProfile = await res.json()
      console.log('Profile update response:', updatedProfile)
      onSave(updatedProfile)
      if (setUserProfile) setUserProfile(updatedProfile)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
      setIsOpen(false)
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl neon-text">Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information and images</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="min-h-[100px] bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <RadioGroup
                value={avatarUploadMethod}
                onValueChange={val => setAvatarUploadMethod(val as 'cloudinary' | 'ipfs')}
                className="flex gap-4 mb-2"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="cloudinary" checked={avatarUploadMethod === 'cloudinary'} onChange={() => setAvatarUploadMethod('cloudinary')} />
                  Cloudinary
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="ipfs" checked={avatarUploadMethod === 'ipfs'} onChange={() => setAvatarUploadMethod('ipfs')} />
                  IPFS
                </label>
              </RadioGroup>
              <div className="flex items-center gap-2">
                <Input
                  ref={avatarInputRef}
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => avatarInputRef.current?.click()}
                  className="shrink-0"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              {avatarUrl && (
                <div className="relative mt-2 w-24 h-24">
                  <div className="relative w-full h-full overflow-hidden rounded-full">
                    <Image src={avatarUrl || "/placeholder.svg"} alt="Profile Picture" fill className="object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6 rounded-full"
                    onClick={removeAvatar}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banner">Profile Banner</Label>
              <RadioGroup
                value={bannerUploadMethod}
                onValueChange={val => setBannerUploadMethod(val as 'cloudinary' | 'ipfs')}
                className="flex gap-4 mb-2"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="cloudinary" checked={bannerUploadMethod === 'cloudinary'} onChange={() => setBannerUploadMethod('cloudinary')} />
                  Cloudinary
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="ipfs" checked={bannerUploadMethod === 'ipfs'} onChange={() => setBannerUploadMethod('ipfs')} />
                  IPFS
                </label>
              </RadioGroup>
              <div className="flex items-center gap-2">
                <Input
                  ref={bannerInputRef}
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => bannerInputRef.current?.click()}
                  className="shrink-0"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              {bannerUrl && (
                <div className="relative mt-2">
                  <div className="relative aspect-[4/1] w-full overflow-hidden rounded-md">
                    <Image src={bannerUrl || "/placeholder.svg"} alt="Profile Banner" fill className="object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={removeBanner}
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
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

