import { useParams, useLocation, useNavigate } from "react-router-dom"
import { AlertTriangle } from "lucide-react"

import { PageCard } from "@/components/PageCard"
import { Button } from "@/components/ui/button"
import { BranchScheduleForm } from "@/pages/branch_schedule/BranchScheduleForm"
import type { BranchSchedule } from "@/types/branch_schedule/branch_schedule.types"

export function EditBranchSchedulePage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const row = (location.state as { row?: BranchSchedule } | null)?.row ?? null

  if (!row || !id) {
    return (
      <PageCard>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <AlertTriangle className="size-8 text-amber-500" />
          <p className="text-sm text-[#374957]">
            Data jadwal tidak ditemukan. Buka halaman edit melalui daftar jadwal
            cabang.
          </p>
          <Button
            className="h-10 rounded-[5px] bg-[#30CCD5] text-white hover:bg-[#28B8C0]"
            onClick={() => navigate("/dashboard/jadwal-cabang")}
          >
            Kembali ke Daftar
          </Button>
        </div>
      </PageCard>
    )
  }

  return <BranchScheduleForm mode="edit" initialRow={row} scheduleId={id} />
}

export default EditBranchSchedulePage
