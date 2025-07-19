// === PROFILE PAGE ROUTE ===
// This page handles the /profile route and renders the user profile management
// Users can view and edit their account information here

import ProfilePage from "@/components/profile-page"

// === PROFILE PAGE COMPONENT ===
// Route component that renders the user profile interface
export default function Profile() {
  return (
    <div className="profile-page-route">
      {/* === PROFILE COMPONENT === */}
      {/* Renders the user profile with editable information and activity stats */}
      <ProfilePage />
    </div>
  )
}
