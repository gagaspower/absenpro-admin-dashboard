// src/pages/absensi/AbsensiPage.tsx
import { useCallback, useEffect, useState } from "react"
import { RefreshCw, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { PageCard, PageCardHeader } from "@/components/PageCard"
import { LoadingSpinner } from "@/components/LoadingSpinner"
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
  key: "hadir" | "telat" | "izin" | "cuti" | "alpha"
  color: string
}[] = [
  { key: "hadir", color: "bg-[#1E9E5E]" },
  { key: "telat", color: "bg-[#C2410C]" },
  { key: "izin", color: "bg-[#1D6FC2]" },
  { key: "cuti", color: "bg-[#7C3AED]" },
  { key: "alpha", color: "bg-[#D4453B]" },
]

const DAY_LEGEND_ITEMS = [
  {
    label: "Cuti bersama / Hari Libur",
    className: "bg-[oklch(64.5%_0.246_16.439)]",
  },
  {
    label: "Hari Minggu",
    className: "bg-[oklch(44.6%_0.03_256.802)]",
  },
]

export function AbsensiPage() {
  const [periode, setPeriode] = useState("")
  const [search, setSearch] = useState("")

  const [rows, setRows] = useState<AbsensiRow[]>([])
  const [daysInMonth, setDaysInMonth] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  const loadAbsensi = useCallback(
    async (signal?: { cancelled: boolean }) => {
      if (!periode) return

      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAbsensi({
          periode,
          search: debouncedSearch || undefined,
        })
        if (signal?.cancelled) return
        setRows(res.rows)
        setDaysInMonth(res.days_in_month)
      } catch {
        if (signal?.cancelled) return
        setError("Gagal memuat data absensi. Coba lagi.")
        setRows([])
      } finally {
        if (!signal?.cancelled) setIsLoading(false)
      }
    },
    [periode, debouncedSearch]
  )

  useEffect(() => {
    // Tunggu periode terisi dulu (menunggu fetchPeriode selesai di PeriodeFilter)
    if (!periode) return

    const signal = { cancelled: false }
    loadAbsensi(signal)
    return () => {
      signal.cancelled = true
    }
  }, [loadAbsensi, periode])

  function handleRefresh() {
    if (!periode || isLoading) return
    loadAbsensi()
  }

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <PageCardHeader title="Absensi Pegawai" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={!periode || isLoading}
            aria-label="Refresh data absensi"
            title="Refresh"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[#EAEAEA] text-[#71808B] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${isLoading ? "hidden" : ""}`} />
            {isLoading && (
              <LoadingSpinner size="sm" showLabel={false} className="gap-0" />
            )}
          </button>

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

          <div className="mt-3 flex flex-wrap items-center gap-4">
            {DAY_LEGEND_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className={`size-3 rounded-[3px] border border-[#EAEAEA] ${item.className}`}
                />
                <span className="text-xs text-[#71808B]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </PageCard>
    </div>
  )
}

export default AbsensiPage
