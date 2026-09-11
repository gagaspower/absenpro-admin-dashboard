import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowLeftRight,
  Briefcase,
  Building2,
  MapPin,
  Pencil,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PegawaiStatusBadge } from "@/components/pegawai/PegawaiStatusBadge"
import { StatusBadge } from "@/components/data-table/StatusBadge"
import type { PegawaiRow } from "@/types/pegawai/pegawai.types"
import { getPegawaiAvatarUrl } from "@/lib/config"

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

interface PegawaiDetailHeaderProps {
  pegawai: PegawaiRow
  onEdit?: () => void
  onMutasi?: () => void
}

export function PegawaiDetailHeader({
  pegawai,
  onEdit,
  onMutasi,
}: PegawaiDetailHeaderProps) {
  const navigate = useNavigate()
  const avatarUrl = getPegawaiAvatarUrl(
    pegawai.face_profile?.reference_photo_path
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white shadow-sm">
      <div className="h-20 bg-gradient-to-r from-[#F7FCFA] to-[#EAF6F1]" />

      <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <Avatar className="size-24 border-4 border-white shadow-md">
            <AvatarImage
              src={avatarUrl}
              alt={pegawai.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#0F9D6C]/10 text-xl font-semibold text-[#0F9D6C]">
              {getInitials(pegawai.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1.5 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-[#1C2A33]">
                {pegawai.name}
              </h1>
              <PegawaiStatusBadge status={pegawai.status} />
              <StatusBadge active={!pegawai.is_trashed} />
            </div>
            <p className="text-sm text-[#6B7A85]">Kode: {pegawai.code}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#374957]">
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-[#8B9AA5]" />
                {pegawai.position?.name ?? "-"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-3.5 text-[#8B9AA5]" />
                {pegawai.department?.name ?? "-"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[#8B9AA5]" />
                {pegawai.branch.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 pt-2 sm:pt-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-10 rounded-[5px] border-[#DDE3E6] text-sm font-normal text-[#374957]"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
          {!pegawai.is_trashed && (
            <>
              <Button
                type="button"
                onClick={onEdit}
                className="h-10 rounded-[5px] bg-[#0F9D6C] text-sm font-normal text-white hover:bg-[#0C8058]"
              >
                <Pencil className="size-4" />
                Edit Data
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onMutasi}
                className="h-10 rounded-[5px] border-[#30CCD5] text-sm font-normal text-[#1FA0A8] hover:bg-[#E7FAFB]"
              >
                <ArrowLeftRight className="size-4" />
                Mutasi Pegawai
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
