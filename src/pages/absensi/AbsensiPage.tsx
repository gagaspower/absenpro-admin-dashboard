// src/pages/absensi/AbsensiPage.tsx
import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { PageCard, PageCardHeader } from "@/components/PageCard"
import { useDebounce } from "@/hooks/useDebounce"
import {
  ABSENSI_STATUS_META,
  type AbsensiRow,
} from "@/types/absensi/absensi.types"

import { AbsensiTable } from "@/components/absensi/AbsensiTable"
import { fetchAbsensi } from "@/services/absensi/absensi.service"
import { PeriodeFilter } from "@/components/absensi/PeriodeFilter"

const SEARCH_DEBOUNCE_MS = 400

const LEGEND_ITEMS: {
  key: "hadir" | "telat" | "izin" | "sakit" | "alpha"
  color: string
}[] = [
  { key: "hadir", color: "bg-[#1E9E5E]" },
  { key: "telat", color: "bg-[#C2410C]" },
  { key: "izin", color: "bg-[#1D6FC2]" },
  { key: "sakit", color: "bg-[#B7791F]" },
  { key: "alpha", color: "bg-[#D4453B]" },
]

export function AbsensiPage() {
  const [periode, setPeriode] = useState("")
  const [search, setSearch] = useState("")

  const [rows, setRows] = useState<AbsensiRow[]>([])
  const [daysInMonth, setDaysInMonth] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    // Tunggu periode terisi dulu (menunggu fetchPeriode selesai di PeriodeFilter)
    if (!periode) return

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAbsensi({
          periode,
          search: debouncedSearch || undefined,
        })
        if (cancelled) return
        setRows(res.rows)
        setDaysInMonth(res.days_in_month)
      } catch {
        if (cancelled) return
        setError("Gagal memuat data absensi. Coba lagi.")
        setRows([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [periode, debouncedSearch])

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <PageCardHeader title="Absensi Pegawai" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <PeriodeFilter value={periode} onChange={setPeriode} />

          <div className="relative w-full min-w-[220px] md:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pegawai"
              className="h-10 rounded-[5px] border-[#EAEAEA] pl-9 text-sm text-[#374957] placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${item.color}`} />
              <span className="text-xs text-[#71808B]">
                {ABSENSI_STATUS_META[item.key].label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <AbsensiTable
            rows={rows}
            daysInMonth={daysInMonth}
            periode={periode}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </PageCard>
    </div>
  )
}

export default AbsensiPage
