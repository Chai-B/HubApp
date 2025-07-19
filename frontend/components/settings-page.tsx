"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Circle } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(
      settingsRef.current?.children || [],
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
    )
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto" ref={settingsRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <h1 className="text-xl font-medium">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="apple-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-medium">Appearance</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Theme</Label>
                  <p className="text-xs text-gray-500">Choose your preferred theme</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="apple-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-medium">Notifications</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-gray-500">Receive notifications</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Summaries</Label>
                  <p className="text-xs text-gray-500">Daily activity summaries</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Automation */}
          <div className="apple-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-medium">Automation</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto Sync</Label>
                  <p className="text-xs text-gray-500">Sync data automatically</p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Sync Frequency</Label>
                  <p className="text-xs text-gray-500">How often to sync</p>
                </div>
                <Select defaultValue="15min">
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5min">5 min</SelectItem>
                    <SelectItem value="15min">15 min</SelectItem>
                    <SelectItem value="30min">30 min</SelectItem>
                    <SelectItem value="1hour">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="apple-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-medium">Privacy & Security</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Two-Factor Auth</Label>
                  <p className="text-xs text-gray-500">Extra security layer</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Data Encryption</Label>
                  <p className="text-xs text-gray-500">Encrypt your data</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
