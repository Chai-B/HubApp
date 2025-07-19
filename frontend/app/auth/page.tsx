// === AUTHENTICATION PAGE ROUTE ===
// This page handles the /auth route and renders the authentication component
// Users come here to sign in or create new accounts

import AuthPage from "@/components/auth-page"

// === AUTHENTICATION PAGE COMPONENT ===
// Route component that renders the authentication interface
export default function Auth() {
  return (
    <div className="auth-page-route">
      {/* === AUTHENTICATION COMPONENT === */}
      {/* Renders the main authentication form and promotional content */}
      <AuthPage />
    </div>
  )
}
