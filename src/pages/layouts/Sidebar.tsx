import { Fingerprint, X } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { menuGroups } from "@/router/menuItems"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#D9D9D9] bg-[#F9FBFC] transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <Fingerprint className="size-8 text-[#2B8CE5]" strokeWidth={1.5} />
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-[#30CCD5]">Absen</span>
              <span className="font-bold text-gray-900">Pro</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {menuGroups.map((group, gi) => (
            <div key={gi}>
              {group.heading && (
                <p className="mb-2 px-2 text-[10px] font-bold tracking-widest text-[#989898] uppercase">
                  {group.heading}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.path === "/dashboard"
                      ? location.pathname === "/dashboard"
                      : location.pathname.startsWith(item.path)

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-[5px] px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "bg-white/60 text-[#2B8CE5] shadow-sm"
                            : "text-gray-600 hover:bg-white/40 hover:text-gray-800"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-4 shrink-0",
                            isActive ? "text-[#2B8CE5]" : "text-gray-500"
                          )}
                          strokeWidth={1.75}
                        />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
