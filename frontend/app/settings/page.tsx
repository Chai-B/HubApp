// === SETTINGS PAGE ROUTE ===
// This page handles the /settings route and renders the application settings
// Users can configure preferences, theme, notifications, and privacy settings

import SettingsPage from "@/components/settings-page"

// === SETTINGS PAGE COMPONENT ===
// Route component that renders the settings interface
export default function Settings() {
  return (
    <div className="settings-page-route">
      {/* === SETTINGS COMPONENT === */}
      {/* Renders the settings interface with theme, notifications, and privacy controls */}
      <SettingsPage />
    </div>
  )
}
