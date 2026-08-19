import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { GuestRoute, ProtectedRoute } from "./guard"

const LoginPage = lazy(() =>
  import("@/pages/auth/login").then((m) => ({ default: m.LoginPage }))
)
const DashboardLayout = lazy(() =>
  import("@/pages/layouts/DashboardLayout").then((m) => ({
    default: m.DashboardLayout,
  }))
)
const DashboardPage = lazy(() =>
  import("@/pages/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
)
const PlaceholderPage = lazy(() =>
  import("@/pages/dashboard/PlaceholderPage").then((m) => ({
    default: m.PlaceholderPage,
  }))
)
const BranchPage = lazy(() =>
  import("@/pages/branch/BranchPage").then((m) => ({ default: m.BranchPage }))
)
const DepartemenPage = lazy(() =>
  import("@/pages/departemen/DepartemenPage").then((m) => ({
    default: m.DepartemenPage,
  }))
)
const JabatanPage = lazy(() => import("@/pages/jabatan/JabatanPage"))
const ShiftPage = lazy(() => import("@/pages/shift/ShiftPage"))
const JenisCutiPage = lazy(() => import("@/pages/jenis_cuti/JenisCutiPage"))
const PegawaiPage = lazy(() => import("@/pages/pegawai/PegawaiPage"))

function PageFallback() {
  return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Guest only: jika sudah login → redirect dashboard */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected: harus login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="departemen" element={<DepartemenPage />} />
            <Route path="wilayah-kerja" element={<BranchPage />} />
            <Route path="jabatan" element={<JabatanPage />} />
            <Route path="jam-kerja" element={<ShiftPage />} />
            <Route path="jenis-izin" element={<JenisCutiPage />} />
            <Route path="karyawan" element={<PegawaiPage />} />
            <Route
              path="absensi"
              element={<PlaceholderPage title="Absensi" />}
            />
            <Route
              path="cuti-izin"
              element={<PlaceholderPage title="Cuti & Izin" />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}
