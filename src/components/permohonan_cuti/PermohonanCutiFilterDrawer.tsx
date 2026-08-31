import { useEffect, useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMobile } from "@/hooks/use-mobile"
import { fetchPeriode } from "@/services/periode/periode.service"
import { fetchDepartemenAllData } from "@/services/departemen/departemen.service"
import type { PeriodeRow } from "@/types/periode/periode.types"
import type { DepartemenOption } from "@/types/departemen/departemen.types"
import { LEAVE_REQUEST_STATUS_OPTIONS } from "@/types/permohonan_cuti/permohonan_cuti.types"

// ─────────────────────────────────────────────────────────────────────────
// Sentinel value
// Radix Select tidak mengizinkan value=""
// ─────────────────────────────────────────────────────────────────────────

export const FILTER_ALL_STATUS = "__all_status__"
export const FILTER_ALL_DEPARTEMEN = "__all_departemen__"

// ─────────────────────────────────────────────────────────────────────────
// Helper periode
// Format value harus sama persis dengan response backend:
// "1 - 2026", "2 - 2026", dst.
// ─────────────────────────────────────────────────────────────────────────

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

/**
 * Menghasilkan periode bulan/tahun saat ini.
 *
 * Contoh:
 * Agustus 2026 -> "8 - 2026"
 */
export function getCurrentPeriodeValue(date: Date = new Date()): string {
  return `${date.getMonth() + 1} - ${date.getFullYear()}`
}

/**
 * Mengubah value periode menjadi label.
 *
 * Contoh:
 * "8 - 2026" -> "Agustus 2026"
 */
function periodeValueToLabel(value: string): string {
  const [month, year] = value.split("-").map((part) => part.trim())

  const label = MONTH_NAMES_ID[Number(month) - 1]

  return label ? `${label} ${year}` : value
}

// ─────────────────────────────────────────────────────────────────────────
// Filter values
// ─────────────────────────────────────────────────────────────────────────

export interface PermohonanCutiFilterValues {
  /**
   * Default:
   * bulan/tahun berjalan.
   *
   * Contoh:
   * "8 - 2026"
   */
  periode: string

  /**
   * Default:
   * FILTER_ALL_STATUS
   */
  status: string

  /**
   * Default:
   * FILTER_ALL_DEPARTEMEN
   */
  departemenId: string
}

// ─────────────────────────────────────────────────────────────────────────
// Default filter
// ─────────────────────────────────────────────────────────────────────────

export const DEFAULT_PERMOHONAN_CUTI_FILTERS: PermohonanCutiFilterValues = {
  periode: getCurrentPeriodeValue(),
  status: FILTER_ALL_STATUS,
  departemenId: FILTER_ALL_DEPARTEMEN,
}

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

interface PermohonanCutiFilterDrawerProps {
  open: boolean
  value: PermohonanCutiFilterValues
  onOpenChange: (open: boolean) => void
  onApply: (filters: PermohonanCutiFilterValues) => void
}

// ─────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────

export function PermohonanCutiFilterDrawer({
  open,
  value,
  onOpenChange,
  onApply,
}: PermohonanCutiFilterDrawerProps) {
  const isMobile = useMobile()

  const [local, setLocal] = useState<PermohonanCutiFilterValues>(value)

  const [periodeOptions, setPeriodeOptions] = useState<PeriodeRow[]>([])
  const [departemenOptions, setDepartemenOptions] = useState<
    DepartemenOption[]
  >([])

  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  // ───────────────────────────────────────────────────────────────────────
  // Load master filter
  // ───────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    setLocal(value)

    let ignore = false

    async function loadOptions() {
      setIsLoadingOptions(true)

      try {
        const [periodeRes, departemenRes] = await Promise.all([
          fetchPeriode(),
          fetchDepartemenAllData(),
        ])

        if (ignore) return

        setPeriodeOptions(periodeRes)

        setDepartemenOptions(
          departemenRes.rows.filter((row) => !row.deleted_at)
        )
      } catch {
        if (!ignore) {
          setPeriodeOptions([])
          setDepartemenOptions([])
        }
      } finally {
        if (!ignore) {
          setIsLoadingOptions(false)
        }
      }
    }

    loadOptions()

    return () => {
      ignore = true
    }

    // Drawer dibuka -> sinkronkan local dengan filter dari parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ───────────────────────────────────────────────────────────────────────
  // Periode
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Pastikan periode yang sedang dipilih selalu tersedia.
   *
   * Ini penting karena periode default berasal dari bulan/tahun sekarang,
   * sedangkan master periode dari backend bisa saja belum mengandung
   * periode tersebut.
   */
  const hasSelectedPeriode = periodeOptions.some(
    (option) => option.value === local.periode
  )

  const periodeSelectOptions = hasSelectedPeriode
    ? periodeOptions
    : [
        {
          value: local.periode,
          label: periodeValueToLabel(local.periode),
        },
        ...periodeOptions,
      ]

  const periodeLabel =
    periodeSelectOptions.find((option) => option.value === local.periode)
      ?.label ?? periodeValueToLabel(local.periode)

  // ───────────────────────────────────────────────────────────────────────
  // Status
  // ───────────────────────────────────────────────────────────────────────

  const statusLabel =
    local.status === FILTER_ALL_STATUS || !local.status
      ? "Semua Status"
      : (LEAVE_REQUEST_STATUS_OPTIONS.find(
          (option) => option.value === local.status
        )?.label ?? local.status)

  // ───────────────────────────────────────────────────────────────────────
  // Departemen
  // ───────────────────────────────────────────────────────────────────────

  const departemenLabel =
    local.departemenId === FILTER_ALL_DEPARTEMEN || !local.departemenId
      ? "Semua Departemen"
      : (departemenOptions.find((option) => option.id === local.departemenId)
          ?.name ?? local.departemenId)

  // ───────────────────────────────────────────────────────────────────────
  // Reset
  // ───────────────────────────────────────────────────────────────────────

  function handleReset() {
    setLocal({
      periode: getCurrentPeriodeValue(),
      status: FILTER_ALL_STATUS,
      departemenId: FILTER_ALL_DEPARTEMEN,
    })
  }

  // ───────────────────────────────────────────────────────────────────────
  // Apply
  // ───────────────────────────────────────────────────────────────────────

  function handleApply() {
    onApply({
      periode: local.periode || getCurrentPeriodeValue(),

      status: local.status || FILTER_ALL_STATUS,

      departemenId: local.departemenId || FILTER_ALL_DEPARTEMEN,
    })

    onOpenChange(false)
  }

  // ───────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="right"
      showSwipeHandle={isMobile}
    >
      <DrawerContent className="data-[swipe-axis=x]:[--drawer-content-width:100%] sm:data-[swipe-axis=x]:[--drawer-content-width:26rem]">
        <DrawerHeader className="border-b border-[#EAEAEA] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-lg font-semibold text-[#374957]">
                Filter Permohonan
              </DrawerTitle>

              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                Saring data permohonan cuti / izin.
              </DrawerDescription>
            </div>

            <DrawerClose
              render={
                <Button variant="ghost" size="icon" aria-label="Tutup drawer" />
              }
            >
              <X className="size-5" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* ─────────────────────────────────────────────────────────────
              Periode
          ───────────────────────────────────────────────────────────── */}

          <FilterField label="Periode">
            <Select
              value={local.periode}
              // Periode
              onValueChange={(val) =>
                setLocal((current) => ({
                  ...current,
                  periode: val ?? getCurrentPeriodeValue(),
                }))
              }
            >
              <SelectTrigger className="h-10 w-full rounded-[5px] border-[#DDE3E6]">
                <SelectValue placeholder="Pilih periode">
                  {periodeLabel}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {periodeSelectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          {/* ─────────────────────────────────────────────────────────────
              Status
          ───────────────────────────────────────────────────────────── */}

          <FilterField label="Status Permohonan">
            <Select
              value={local.status || FILTER_ALL_STATUS}
              // Status
              onValueChange={(val) =>
                setLocal((current) => ({
                  ...current,
                  status: val ?? FILTER_ALL_STATUS,
                }))
              }
            >
              <SelectTrigger className="h-10 w-full rounded-[5px] border-[#DDE3E6]">
                <SelectValue placeholder="Pilih status">
                  {statusLabel}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {/* Default */}
                <SelectItem value={FILTER_ALL_STATUS}>Semua Status</SelectItem>

                {/* Status dari master hardcode */}
                {LEAVE_REQUEST_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          {/* ─────────────────────────────────────────────────────────────
              Departemen
          ───────────────────────────────────────────────────────────── */}

          <FilterField label="Departemen">
            <Select
              value={local.departemenId || FILTER_ALL_DEPARTEMEN}
              onValueChange={(val) =>
                setLocal((current) => ({
                  ...current,
                  departemenId: val ?? FILTER_ALL_DEPARTEMEN,
                }))
              }
            >
              <SelectTrigger className="h-10 w-full rounded-[5px] border-[#DDE3E6]">
                <SelectValue placeholder="Pilih departemen">
                  {departemenLabel}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={FILTER_ALL_DEPARTEMEN}>
                  Semua Departemen
                </SelectItem>

                {departemenOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          {isLoadingOptions && (
            <p className="text-xs text-[#71808B]">Memuat pilihan filter...</p>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────────
            Footer
        ─────────────────────────────────────────────────────────────── */}

        <div className="flex shrink-0 gap-3 border-t border-[#EAEAEA] bg-white px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1 rounded-[5px] border-[#DDE3E6]"
            onClick={handleReset}
          >
            Reset
          </Button>

          <Button
            type="button"
            className="h-10 flex-1 rounded-[5px] bg-[#30CCD5] text-white hover:bg-[#28B8C0]"
            onClick={handleApply}
          >
            Terapkan
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Filter Field
// ─────────────────────────────────────────────────────────────────────────

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[#374957]">{label}</span>

      {children}
    </label>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Active filter counter
// ─────────────────────────────────────────────────────────────────────────

export function countActiveFilters(value: PermohonanCutiFilterValues) {
  let count = 0

  // Periode bulan/tahun sekarang = default, bukan filter aktif.
  if (value.periode && value.periode !== getCurrentPeriodeValue()) {
    count += 1
  }

  // Semua Status = default, bukan filter aktif.
  if (value.status && value.status !== FILTER_ALL_STATUS) {
    count += 1
  }

  // Semua Departemen = default, bukan filter aktif.
  if (value.departemenId && value.departemenId !== FILTER_ALL_DEPARTEMEN) {
    count += 1
  }

  return count
}
