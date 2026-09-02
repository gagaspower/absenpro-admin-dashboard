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
          className="fixed inset-0 z-20 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#30CCD5] to-[#5B8DEF] shadow-[0_6px_16px_-6px_rgba(48,204,213,0.45)]">
              <Fingerprint className="size-5 text-white" strokeWidth={1.75} />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-[#1F9DA6]">Absen</span>
              <span className="font-bold text-slate-900">Pro</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {menuGroups.map((group, gi) => (
            <div key={gi}>
              {group.heading && (
                <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {group.heading}
                </p>
              )}
              <ul className="space-y-1">
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
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "bg-gradient-to-r from-[#30CCD5] to-[#5B8DEF] text-white shadow-[0_6px_16px_-6px_rgba(48,204,213,0.4)]"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-4 shrink-0",
                            isActive ? "text-white" : "text-slate-400"
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
