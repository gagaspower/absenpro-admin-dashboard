// src/components/absensi/PeriodeFilter.tsx
import { useEffect, useState } from "react"

import { fetchPeriode } from "@/services/periode/periode.service"
import type { PeriodeRow } from "@/types/periode/periode.types"

interface PeriodeFilterProps {
  value: string
  onChange: (value: string) => void
}

export function PeriodeFilter({ value, onChange }: PeriodeFilterProps) {
  const [options, setOptions] = useState<PeriodeRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const data = await fetchPeriode()
        if (cancelled) return
        setOptions(data)

        // Set default periode ke bulan berjalan kalau belum ada value terpilih
        if (!value) {
          const now = new Date()
          const currentValue = `${now.getMonth() + 1} - ${now.getFullYear()}`
          const matched = data.find((item) => item.value === currentValue)
          onChange(matched ? matched.value : (data[0]?.value ?? ""))
        }
      } catch {
        if (!cancelled) setOptions([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // hanya perlu fetch sekali saat mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading || options.length === 0}
      className="h-10 rounded-[5px] border border-[#DDE3E6] bg-white px-3 text-sm text-[#374957] outline-none focus:border-[#30CCD5] disabled:opacity-60"
    >
      {isLoading ? (
        <option value="">Memuat periode...</option>
      ) : (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      )}
    </select>
  )
}
