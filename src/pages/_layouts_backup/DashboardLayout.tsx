import { useState } from "react"
import { Outlet } from "react-router-dom"

import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-svh overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 overflow-y-auto bg-[#F8F8F8] p-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
