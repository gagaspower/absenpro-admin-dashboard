import { Navigate, Route, Routes } from "react-router-dom"

import { LoginPage } from "@/pages/auth/login"
import { DashboardLayout } from "@/pages/layouts/DashboardLayout"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { PlaceholderPage } from "@/pages/dashboard/PlaceholderPage"

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route
          path="departemen"
          element={<PlaceholderPage title="Departemen" />}
        />
        <Route
          path="wilayah-kerja"
          element={<PlaceholderPage title="Wilayah Kerja / Branch" />}
        />
        <Route path="jabatan" element={<PlaceholderPage title="Jabatan" />} />
        <Route
          path="jam-kerja"
          element={<PlaceholderPage title="Jam Kerja" />}
        />
        <Route
          path="jenis-izin"
          element={<PlaceholderPage title="Jenis Izin / Cuti" />}
        />
        <Route path="karyawan" element={<PlaceholderPage title="Karyawan" />} />
        <Route path="absensi" element={<PlaceholderPage title="Absensi" />} />
        <Route
          path="cuti-izin"
          element={<PlaceholderPage title="Cuti & Izin" />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
