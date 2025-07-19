// === ROOT LAYOUT COMPONENT ===
// This is the main layout wrapper for the entire application
// It sets up the HTML structure, theme provider, and global styling

import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

// === METADATA CONFIGURATION ===
// This defines the app's metadata for SEO and browser display
export const metadata: Metadata = {
  title: "Hub",
  description: "All your services in one place",
    generator: 'v0.dev'
}

// === MAIN ROOT LAYOUT COMPONENT ===
// Wraps the entire application with theme support and global components
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="root-html">
      <body className="root-body font-sf">
        {/* === THEME PROVIDER WRAPPER === */}
        {/* Provides light/dark theme switching functionality throughout the app */}
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem 
          disableTransitionOnChange
          className="theme-provider-wrapper"
        >
          {/* === MAIN CONTENT CONTAINER === */}
          {/* This is where all page content will be rendered */}
          <div className="main-content-container">
            {children}
          </div>
          
          {/* === GLOBAL TOAST NOTIFICATIONS === */}
          {/* Provides toast notifications throughout the app */}
          <Toaster className="global-toaster" />
        </ThemeProvider>
      </body>
    </html>
  )
}
