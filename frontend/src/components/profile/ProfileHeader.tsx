"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Upload, User } from "lucide-react"
import toast from "react-hot-toast"

interface ProfileData {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: string
  lastLoginAt: string
  lastLoginIp: string
  lastLoginDevice: string
  [key: string]: any
}

interface ProfileHeaderProps {
  profileData: ProfileData
  onUpdate: (data: ProfileData) => void
}

export function ProfileHeader({ profileData, onUpdate }: ProfileHeaderProps) {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [tempData, setTempData] = useState(profileData)

  const getBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'security admin':
        return 'destructive'
      case 'security':
        return 'default'
      case 'viewer':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatLastLogin = (dateStr: string, ip: string, device: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    let timeAgo = ""
    if (diffMins < 60) {
      timeAgo = `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hours ago`
    } else {
      timeAgo = `${diffDays} days ago`
    }

    return `Last login ${timeAgo} • ${ip} • ${device}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy')
    })
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setUploading(true)
    try {
      // Mock upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Avatar updated successfully')
      setAvatarDialogOpen(false)
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onUpdate(tempData)
      setIsDirty(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    const updated = { ...tempData, [field]: value }
    setTempData(updated)
    setIsDirty(JSON.stringify(updated) !== JSON.stringify(profileData))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-6">
          <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto">
                <Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src="" alt={`${profileData.firstName} ${profileData.lastName}`} />
                  <AvatarFallback className="text-lg">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Avatar</DialogTitle>
                <DialogDescription>
                  Upload a new profile picture. File must be less than 2MB.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-center">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src="" alt={`${profileData.firstName} ${profileData.lastName}`} />
                    <AvatarFallback className="text-2xl">
                      {profileData.firstName[0]}{profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="avatar">Choose file</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAvatarDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <div className="flex items-center space-x-2">
              <Badge variant={getBadgeVariant(profileData.role)}>
                {profileData.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{profileData.email}</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <code className="text-xs bg-muted px-2 py-1 rounded">{profileData.id}</code>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(profileData.id)}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy user ID</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy user ID</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {formatLastLogin(profileData.lastLoginAt, profileData.lastLoginIp, profileData.lastLoginDevice)}
          </p>
          <Button 
            onClick={handleSave} 
            disabled={!isDirty}
            className="min-w-[120px]"
          >
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}