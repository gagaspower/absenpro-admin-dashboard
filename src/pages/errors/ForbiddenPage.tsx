import { Link } from "react-router-dom"
import { Home, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="group relative flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 transition-transform duration-300 hover:scale-105">
        <ShieldAlert className="h-12 w-12 text-destructive transition-transform duration-300 group-hover:-rotate-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-6xl font-bold tracking-tight text-destructive">
          403
        </h1>

        <h2 className="text-xl font-semibold text-foreground">Akses ditolak</h2>

        <p className="max-w-sm text-sm text-muted-foreground">
          Anda tidak memiliki hak akses untuk membuka halaman ini. Hubungi
          administrator jika Anda merasa ini adalah kesalahan.
        </p>
      </div>

      <Link to="/dashboard">
        <Button
          size="lg"
          className="group gap-2 rounded-full px-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
        >
          <Home className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Kembali ke Dashboard
        </Button>
      </Link>
    </div>
  )
}
