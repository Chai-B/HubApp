// === LANDING PAGE COMPONENT ===
// This is the main marketing page that users see when they first visit the app
// It includes navigation, hero section, features, and footer

"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowRight, Circle, Sun, Moon, Github } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

// === MAIN LANDING PAGE COMPONENT ===
// Contains the complete landing page with navigation, hero, and footer
export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  // === ANIMATION REFERENCES ===
  // Used for GSAP animations on page load
  const heroRef = useRef<HTMLDivElement>(null)

  // === ANIMATION SETUP ===
  // Initializes GSAP animations when component mounts
  useEffect(() => {
    const tl = gsap.timeline()

    // Animate hero section entrance
    tl.fromTo(heroRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" })
  }, [])

  return (
    <div className="landing-page-container min-h-screen flex flex-col apple-gradient dark:apple-gradient-dark">
      {/* === NAVIGATION BAR SECTION === */}
      {/* Fixed top navigation with logo, menu items, and sign-in button */}
      <nav className="landing-nav fixed top-0 w-full z-50 bg-white border-b border-gray-200 dark:bg-[#181818] dark:border-b dark:border-gray-800">
        <div className="nav-content-container max-w-6xl mx-auto px-6 py-3">
          <div className="nav-items-wrapper flex justify-between items-center">
            {/* === LEFT SIDE: LOGO AND MENU === */}
            <div className="nav-left-section flex items-center space-x-8">
              {/* === LOGO SECTION === */}
              {/* Company logo with icon and text */}
              <Link href="/" className="brand-logo-container flex items-center space-x-2 focus:outline-none" tabIndex={0} aria-label="Go to home">
                <div className="logo-icon-wrapper w-7 h-7 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <Circle className="logo-icon h-3 w-3 fill-white dark:fill-black text-white dark:text-black" />
                </div>
                <span className="brand-name text-lg font-bold">Hub</span>
              </Link>
            </div>

            {/* === RIGHT SIDE: SIGN IN, THEME, GITHUB BUTTONS === */}
            <div className="nav-right-section flex items-center space-x-2">
              <Button
                size="icon"
                variant="ghost"
                className="theme-toggle-button rounded-2xl"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <a
                href="https://github.com/your-repo-url" // <-- replace with your actual repo URL
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1"
                aria-label="GitHub Repository"
              >
                <Button size="icon" variant="ghost" className="rounded-2xl">
                  <Github className="h-5 w-5" />
                </Button>
              </a>
              <Link href="/auth" className="nav-signin-link">
                <Button
                  size="sm"
                  className="nav-signin-button apple-button bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* === HERO SECTION === */}
      {/* Main promotional content with title, description, and CTA buttons */}
      <section className="hero-section-container flex-1 flex flex-col justify-center items-center px-4 text-center w-full">
        <div className="hero-content-wrapper w-full max-w-4xl mx-auto flex flex-col items-center justify-center" ref={heroRef}>
          {/* === MAIN HEADLINE === */}
          <h1 className="apple-headline text-5xl md:text-7xl mb-8 tracking-tight leading-tight font-semibold" style={{textShadow: '0 2px 8px #007aff22'}}>
            All your services.<br />
            <span className="hero-subtitle-accent block text-gray-600 dark:text-gray-400">One hub.</span>
          </h1>

          {/* === PRIMARY DESCRIPTION === */}
          <p className="hero-primary-description text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect Gmail, Calendar, Notes, and more in a single,<br className="hero-description-break hidden md:block" />
            beautifully designed workspace.
          </p>

          {/* === SECONDARY DESCRIPTION === */}
          <p className="hero-secondary-description text-lg text-gray-500 dark:text-gray-500 mb-12 max-w-2xl mx-auto">
            Streamline your productivity with intelligent automation and seamless integrations. Everything you need, exactly where you need it.
          </p>

          {/* === CALL-TO-ACTION BUTTONS === */}
          <div className="hero-cta-container flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* === PRIMARY CTA BUTTON === */}
            <Link href="/auth" className="hero-primary-cta-link">
              <button className="apple-button text-lg px-8 py-4 flex items-center gap-2">
                Get Started
                <ArrowRight className="cta-arrow-icon ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* === FOOTER SECTION === */}
      {/* Page footer with logo, legal links, and copyright */}
      <footer className="landing-footer glass-footer py-3 border-t border-gray-200 dark:border-[#232323]">
        <div className="footer-content-container max-w-xl mx-auto px-6">
          {/* === FOOTER MAIN CONTENT === */}
          <div className="footer-main-content flex flex-col  items-center">
            {/* === FOOTER NAVIGATION === */}
            <div className="footer-nav-links flex text-sm text-gray-500">
              <Link href="#" className="footer-link contact-link hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="footer-copyright text-center text-xs text-gray-400 mt-2">
            © 2025 Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
