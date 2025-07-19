"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Camera, Circle, Mail, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  name?: string
  email?: string
  picture?: string
  nickname?: string
  given_name?: string
  family_name?: string
  sub?: string
  updated_at?: string
  created_at?: string
  location?: string
}

interface ProfileData {
  name?: string
  location?: string
  about?: string
  title?: string
  [key: string]: string | undefined
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({})
  const [profileData, setProfileData] = useState<ProfileData>({})
  const profileRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Decode JWT token to get user info
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }

  // Fetch user profile from token
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch user profile from backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        const response = await fetch(`${backendUrl}/user/profile`, {
          credentials: 'include'
        })
        if (response.ok) {
          const userData = await response.json()
          setUserProfile({
            name: userData.name,
            email: userData.email,
            picture: userData.picture,
            sub: userData.id,
            updated_at: userData.updated_at
          })
          setProfileData(prev => ({
            ...prev,
            name: userData.name || prev.name,
            title: userData.title || prev.title,
            location: userData.location || prev.location,
            about: userData.about || prev.about
          }))
        }

        // Also fetch session data
        const sessionResponse = await fetch(`${backendUrl}/session/data`, {
          credentials: 'include'
        })
        if (sessionResponse.ok) {
          const data = await sessionResponse.json()
          if (data.profile) {
            setProfileData(prev => ({ ...prev, ...data.profile }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    fetchUserProfile()
  }, [])

  // Save profile data
  const handleSave = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      // Update user profile
      const profileResponse = await fetch(`${backendUrl}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      })
      
      // Also save to session data
      const sessionResponse = await fetch(`${backendUrl}/session/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ profile: profileData })
      })
      
      if (profileResponse.ok && sessionResponse.ok) {
        toast({ title: 'Success', description: 'Profile updated successfully' })
        setIsEditing(false)
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to save profile', 
        variant: 'destructive' 
      })
    }
  }

  useEffect(() => {
    gsap.fromTo(
      profileRef.current?.children || [],
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
    )
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#181818] p-4">
      <div className="max-w-4xl mx-auto" ref={profileRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? "Save" : "Edit"}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="apple-card p-8">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userProfile.picture} />
                  <AvatarFallback className="text-xl">
                    {(profileData.name || userProfile.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full p-2 bg-transparent"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Input 
                    value={profileData.name || ''} 
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                  <Input 
                    value={profileData.title || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Your title"
                  />
                </div>
              ) : (
                <>
                  {(profileData.name || userProfile.name) && (
                    <h2 className="text-lg font-medium mb-2">{profileData.name || userProfile.name}</h2>
                  )}
                  {profileData.title && (
                    <p className="text-gray-500 mb-4">{profileData.title}</p>
                  )}
                </>
              )}

              {/* Remove Pro badge - only show real data */}
            </div>

            <div className="space-y-4">
              {userProfile.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{userProfile.email}</span>
                </div>
              )}

              {(userProfile.created_at || userProfile.updated_at) && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    Joined {new Date(userProfile.created_at || userProfile.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}

              {(userProfile.location || profileData.location) && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{userProfile.location || profileData.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            {(isEditing || profileData.about) && (
              <div className="apple-card p-6">
                <h3 className="font-medium mb-4">About</h3>
                {isEditing ? (
                  <textarea
                    className="w-full p-4 border bg-gray-50 dark:bg-neutral-900 rounded-lg resize-none h-20"
                    value={profileData.about || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">{profileData.about}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
