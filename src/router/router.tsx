import { Navigate, Route, Routes } from "react-router-dom"

import { LoginPage } from "@/pages/auth/login"
import { DashboardLayout } from "@/pages/layouts/DashboardLayout"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { PlaceholderPage } from "@/pages/dashboard/PlaceholderPage"
import { BranchPage } from "@/pages/branch/BranchPage"
import { GuestRoute, ProtectedRoute } from "./guard"
import { DepartemenPage } from "@/pages/departemen/DepartemenPage"
import JabatanPage from "@/pages/jabatan/JabatanPage"
import ShiftPage from "@/pages/shift/ShiftPage"
import JenisCutiPage from "@/pages/jenis_cuti/JenisCutiPage"
import PegawaiPage from "@/pages/pegawai/PegawaiPage"

export function AppRouter() {
  return (
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
          <Route path="absensi" element={<PlaceholderPage title="Absensi" />} />
          <Route
            path="cuti-izin"
            element={<PlaceholderPage title="Cuti & Izin" />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
