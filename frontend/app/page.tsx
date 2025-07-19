// === HOME PAGE COMPONENT ===
// This is the main entry point for the application
// It renders the landing page for new visitors

import LandingPage from "@/components/landing-page"

// === MAIN HOME PAGE COMPONENT ===
// Displays the landing page with marketing content and sign-up options
export default function Home() {
  return (
    <div className="home-page-wrapper">
      {/* === LANDING PAGE COMPONENT === */}
      {/* Contains hero section, features, and call-to-action buttons */}
      <LandingPage />
    </div>
  )
}
