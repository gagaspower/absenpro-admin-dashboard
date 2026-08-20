import { Link } from "react-router-dom"
import { Home, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="group relative flex h-24 w-24 items-center justify-center rounded-full bg-muted transition-transform duration-300 hover:scale-105">
        <SearchX className="h-12 w-12 text-muted-foreground transition-transform duration-300 group-hover:-rotate-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-6xl font-bold tracking-tight text-primary">404</h1>

        <h2 className="text-xl font-semibold text-foreground">
          Halaman tidak ditemukan
        </h2>

        <p className="max-w-sm text-sm text-muted-foreground">
          URL yang Anda akses tidak tersedia atau sudah dipindahkan.
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
