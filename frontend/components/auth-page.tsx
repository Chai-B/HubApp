// === AUTHENTICATION PAGE COMPONENT ===
// This page handles user authentication (login/signup)
// It features a split-screen design with form on left and promotional content on right

"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Github, Mail, Apple, Circle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// === MAIN AUTHENTICATION PAGE COMPONENT ===
// Handles user sign-in and sign-up with social authentication options
export default function AuthPage() {
  // === STATE MANAGEMENT ===
  // Controls whether showing login or signup form
  const [isLogin, setIsLogin] = useState(true)
  
  // === ANIMATION REFERENCES ===
  // Used for GSAP animations on page load
  const formRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  
  // === ROUTER INSTANCE ===
  // For navigation after successful authentication
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // === ERROR HANDLING ===
  // Check for error parameters from Auth0 callback
  useEffect(() => {
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (error || errorDescription) {
      let message = 'Authentication failed'
      
      if (errorDescription === 'the connection is not enabled') {
        message = 'This login method is not enabled. Please contact your administrator or try a different login method.'
      } else if (errorDescription) {
        message = errorDescription.replace(/%20/g, ' ')
      }
      
      toast({
        title: 'Authentication Error',
        description: message,
        variant: 'destructive',
      })
    }
  }, [searchParams, toast])

  // === ANIMATION SETUP ===
  // Initializes split-screen entrance animations
  useEffect(() => {
    const tl = gsap.timeline()

    // Animate form section from left, then art section from right
    tl.fromTo(formRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 1, ease: "power3.out" })
      .fromTo(
        artRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
        "-=0.7",
      )
  }, [])

  // === AUTHENTICATION HANDLER ===
  // Redirect to backend OAuth login
  const handleAuth = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="auth-page-container min-h-screen flex bg-white dark:bg-gray-900">
      {/* === FORM SECTION === */}
      {/* Left side containing the authentication form - 40% width */}
      <div className="auth-form-section w-full md:w-[35%] flex flex-col justify-center p-8" ref={formRef}>
        <div className="auth-form-wrapper max-w-sm mx-auto w-full">
          {/* === BACK NAVIGATION === */}
          {/* Link to return to the landing page */}
          <Link
            href="/"
            className="auth-back-link inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-16 transition-colors"
          >
            <ArrowLeft className="back-arrow-icon h-4 w-4 mr-2" />
            Back
          </Link>

          {/* === AUTHENTICATION HEADER === */}
          {/* Welcome message and description */}
          <div className="auth-header-section mb-12">
            <h1 className="auth-main-title text-3xl font-semibold mb-3 tracking-tight">Welcome to Hub</h1>
            <p className="auth-subtitle text-gray-500 text-lg">Sign in to access your workspace</p>
          </div>

          {/* === AUTHENTICATION BUTTONS === */}
          {/* Social authentication options */}
          <div className="auth-buttons-container space-y-4">
            {/* === GITHUB AUTHENTICATION === */}
            <Button
              variant="outline"
              className="auth-github-button w-full justify-center h-14 bg-transparent border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 rounded-2xl text-base"
              onClick={() => handleAuth('github')}
            >
              <Github className="github-icon h-5 w-5 mr-3" />
              Continue with GitHub
            </Button>

            {/* === GOOGLE AUTHENTICATION === */}
            <Button
              variant="outline"
              className="auth-google-button w-full justify-center h-14 bg-transparent border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 rounded-2xl text-base"
              onClick={() => handleAuth('google')}
            >
              <Mail className="google-icon h-5 w-5 mr-3" />
              Continue with Google
            </Button>

            {/* === APPLE AUTHENTICATION === */}
            <Button
              variant="outline"
              className="auth-apple-button w-full justify-center h-14 bg-transparent border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 rounded-2xl text-base"
              onClick={() => handleAuth('apple')}
            >
              <Apple className="apple-icon h-5 w-5 mr-3" />
              Continue with Apple
            </Button>
          </div>

          {/* === LEGAL DISCLAIMER === */}
          {/* Terms of service and privacy policy agreement */}
          <div className="auth-legal-section mt-8 text-center">
            <p className="legal-text text-sm text-gray-500">
              By continuing, you agree to our{" "}
              <Link href="#" className="legal-link terms-link text-black dark:text-white hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="legal-link privacy-link text-black dark:text-white hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* === ART SECTION === */}
      {/* Right side containing promotional content and branding - 60% width */}
      <div className="auth-art-section hidden md:block w-[65%] relative overflow-hidden rounded-2xl bg-white/80 dark:bg-[#181818]/80 shadow-lg flex items-center justify-center max-w-5xl max-h-[180vh] mx-5 my-5" ref={artRef}>
        <div className="p-12 w-full flex flex-col items-center justify-center text-center">
          {/* === LOGO SHOWCASE === */}
          <div className="art-logo-showcase w-32 h-32 mx-auto mb-12 bg-white dark:bg-neutral-900 rounded-3xl flex items-center justify-center shadow-sm">
            <div className="art-logo-inner w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
              <Circle className="art-logo-icon w-8 h-8 fill-white dark:fill-black text-white dark:text-black" />
            </div>
          </div>
          {/* === PROMOTIONAL HEADLINE === */}
          <h2 className="art-main-headline text-4xl font-semibold mb-6 text-gray-900 dark:text-white tracking-tight leading-tight">
            Your productivity,<br />reimagined.
          </h2>
          {/* === PROMOTIONAL DESCRIPTION === */}
          <p className="art-description text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Connect all your favorite services and automate your workflow with intelligent assistance.
          </p>
        </div>
      </div>

      {/* === FLOATING DECORATIVE ELEMENTS === */}
      {/* Animated background elements for visual interest */}
      <div className="floating-element-1 absolute top-20 left-20 w-3 h-3 bg-gray-300 dark:bg-neutral-800 rounded-full animate-pulse" />
      <div className="floating-element-2 absolute top-40 right-32 w-2 h-2 bg-gray-400 dark:bg-neutral-800 rounded-full animate-pulse delay-1000" />
      <div className="floating-element-3 absolute bottom-32 left-40 w-4 h-4 bg-gray-200 dark:bg-neutral-900 rounded-full animate-pulse delay-500" />
      <div className="floating-element-4 absolute bottom-20 right-20 w-2 h-2 bg-gray-300 dark:bg-neutral-800 rounded-full animate-pulse delay-1500" />
    </div>
  )
}
