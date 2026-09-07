import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Cake,
  Calendar,
  Clock,
  Mail,
  MapPinned,
  Shield,
  User,
  UserCog,
  VenetianMask,
  Phone,
} from "lucide-react"

import { PageCard } from "@/components/PageCard"
import { PegawaiDetailHeader } from "@/components/pegawai/PegawaiDetailHeader"
import { PegawaiInfoCard } from "@/components/pegawai/PegawaiInfoCard"
import { PegawaiFormDrawer } from "@/components/pegawai/PegawaiFormDrawer"
import {
  AlertModal,
  type AlertModalType,
} from "@/components/feedback/AlertModal"
import { Button } from "@/components/ui/button"

import type { PegawaiRow } from "@/types/pegawai/pegawai.types"
import { PegawaiMutasiModal } from "@/components/pegawai/PegawaiMutasiModal"

interface PageAlert {
  type: AlertModalType
  message: string
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function getWorkScheduleLabel(workSchedule: PegawaiRow["work_schedule"]) {
  if (!workSchedule) return "-"

  return workSchedule.source === "shift"
    ? (workSchedule.shift_name ?? "Jadwal Shift")
    : "Mengikuti jadwal branch"
}

export function PegawaiDetailPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const initialPegawai =
    (location.state as { pegawai?: PegawaiRow } | null)?.pegawai ?? null

  const pegawai = initialPegawai
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [mutasiModalOpen, setMutasiModalOpen] = useState(false)
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null)

  if (!pegawai) {
    return (
      <PageCard>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-red-500">Data pegawai tidak ditemukan.</p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/karyawan")}
          >
            Kembali ke Data Pegawai
          </Button>
        </div>
      </PageCard>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PegawaiDetailHeader
        pegawai={pegawai}
        onEdit={() => setFormDrawerOpen(true)}
        onMutasi={() => setMutasiModalOpen(true)}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <PegawaiInfoCard
            title="Informasi Pribadi"
            items={[
              {
                icon: VenetianMask,
                label: "Jenis Kelamin",
                value: pegawai.gender === "L" ? "Laki-laki" : "Perempuan",
              },
              {
                icon: Cake,
                label: "Tempat, Tanggal Lahir",
                value: `${pegawai.birth_place || "-"}, ${formatDate(
                  pegawai.birth_date
                )}`,
              },
              { icon: Phone, label: "No. Telepon", value: pegawai.phone },
              { icon: MapPinned, label: "Alamat", value: pegawai.address },
            ]}
          />

          <PegawaiInfoCard
            title="Informasi Pekerjaan"
            items={[
              { icon: User, label: "Jabatan", value: pegawai.position.name },
              {
                icon: Shield,
                label: "Departemen",
                value: pegawai.department.name,
              },
              {
                icon: MapPinned,
                label: "Lokasi Kerja",
                value: pegawai.branch.name,
              },
              {
                icon: Calendar,
                label: "Tanggal Bergabung",
                value: formatDate(pegawai.join_date),
              },
            ]}
          />

          {pegawai.work_schedule && (
            <PegawaiInfoCard
              title="Jadwal Kerja"
              description={getWorkScheduleLabel(pegawai.work_schedule)}
              items={[
                {
                  icon: Clock,
                  label: "Jam Kerja",
                  value: `${formatTime(
                    pegawai.work_schedule.start_time
                  )} - ${formatTime(pegawai.work_schedule.end_time)}`,
                },
                {
                  icon: Clock,
                  label: "Waktu Check-in",
                  value: `${formatTime(
                    pegawai.work_schedule.check_in_start
                  )} - ${formatTime(pegawai.work_schedule.check_in_end)}`,
                },
                {
                  icon: Clock,
                  label: "Waktu Check-out",
                  value: `${formatTime(
                    pegawai.work_schedule.check_out_start
                  )} - ${formatTime(pegawai.work_schedule.check_out_end)}`,
                },
                {
                  icon: Clock,
                  label: "Toleransi Terlambat",
                  value: `${pegawai.work_schedule.late_tolerance_minutes} menit`,
                },
              ]}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <PegawaiInfoCard
            title="Akun & Akses"
            items={[
              {
                icon: UserCog,
                label: "Username",
                value: pegawai.user?.username,
              },
              { icon: Mail, label: "Email", value: pegawai.user?.email },
              {
                icon: Shield,
                label: "Role",
                value: pegawai.role?.nama_role,
              },
            ]}
          />
        </div>
      </div>

      <PegawaiFormDrawer
        open={formDrawerOpen}
        onOpenChange={setFormDrawerOpen}
        mode="edit"
        pegawai={pegawai}
        onCreated={(message) => {
          setFormDrawerOpen(false)
          setPageAlert({ type: "success", message })
        }}
        onError={(message) => setPageAlert({ type: "error", message })}
      />

      <PegawaiMutasiModal
        open={mutasiModalOpen}
        onOpenChange={setMutasiModalOpen}
        pegawai={pegawai}
        onSuccess={(message) => {
          setMutasiModalOpen(false)
          setPageAlert({ type: "success", message })
        }}
        onError={(message) => setPageAlert({ type: "error", message })}
      />

      {pageAlert && (
        <AlertModal
          open
          type={pageAlert.type}
          message={pageAlert.message}
          onOpenChange={(next) => {
            if (!next) setPageAlert(null)
          }}
        />
      )}
    </div>
  )
}

export default PegawaiDetailPage
