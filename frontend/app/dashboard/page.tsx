// === DASHBOARD PAGE ROUTE ===
// This page handles the /dashboard route and renders the main dashboard
// This is the primary workspace users see after authentication

import Dashboard from "@/components/dashboard"

// === DASHBOARD PAGE COMPONENT ===
// Route component that renders the main user dashboard
export default function DashboardPage() {
  return (
    <div className="dashboard-page-route">
      {/* === DASHBOARD COMPONENT === */}
      {/* Renders the main dashboard with services, notifications, and controls */}
      <Dashboard />
    </div>
  )
}
