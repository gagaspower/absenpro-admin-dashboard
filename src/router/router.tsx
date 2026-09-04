import { lazy, Suspense } from "react"
import { Loader2 } from "lucide-react"
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
const PermohonanCutiPage = lazy(() =>
  import("@/pages/permohonan_cuti/PermohonanCutiPage").then((m) => ({
    default: m.PermohonanCutiPage,
  }))
)
const PegawaiPage = lazy(() => import("@/pages/pegawai/PegawaiPage"))
const LevelApprovalPage = lazy(
  () => import("@/pages/level_approval/LevelApprovalPage")
)
const AddLevelApprovalPage = lazy(
  () => import("@/pages/level_approval/AddLevelApprovalPage")
)

const EditLevelApprovalPage = lazy(
  () => import("@/pages/level_approval/EditLevelApprovalPage")
)

const AbsensiPage = lazy(() =>
  import("@/pages/absensi/AbsensiPage").then((m) => ({
    default: m.AbsensiPage,
  }))
)

const HolidayPage = lazy(() =>
  import("@/pages/holiday/HolidayPage").then((m) => ({
    default: m.HolidayPage,
  }))
)

const BranchSchedulePage = lazy(() =>
  import("@/pages/branch_schedule/BranchSchedulePage").then((m) => ({
    default: m.BranchSchedulePage,
  }))
)
const AddBranchSchedulePage = lazy(() =>
  import("@/pages/branch_schedule/AddBranchSchedulePage").then((m) => ({
    default: m.AddBranchSchedulePage,
  }))
)
const EditBranchSchedulePage = lazy(() =>
  import("@/pages/branch_schedule/EditBranchSchedulePage").then((m) => ({
    default: m.EditBranchSchedulePage,
  }))
)

const ResetPasswordPage = lazy(() =>
  import("@/pages/auth/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  }))
)
const NotFoundPage = lazy(() =>
  import("@/pages/errors/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  }))
)

function PageFallback() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
        <div className="absolute h-16 w-16 rounded-full border-2 border-primary/10" />
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-foreground">Memuat halaman</p>
        <p className="text-xs text-muted-foreground">
          Mohon tunggu sebentar...
        </p>
      </div>
    </div>
  )
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
            <Route path="level-approval" element={<LevelApprovalPage />} />
            <Route
              path="level-approval/create"
              element={<AddLevelApprovalPage />}
            />
            <Route
              path="level-approval/edit/:id"
              element={<EditLevelApprovalPage />}
            />
            <Route path="hari-libur" element={<HolidayPage />} />
            <Route path="jadwal-cabang" element={<BranchSchedulePage />} />
            <Route
              path="jadwal-cabang/create"
              element={<AddBranchSchedulePage />}
            />
            <Route
              path="jadwal-cabang/edit/:id"
              element={<EditBranchSchedulePage />}
            />
            <Route path="absensi" element={<AbsensiPage />} />

            <Route path="cuti-izin" element={<PermohonanCutiPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
