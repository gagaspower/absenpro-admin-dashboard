import { ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PER_PAGE_OPTIONS = [10, 25, 50, 100]

interface PerPageSelectProps {
  value: number
  onChange: (value: number) => void
}

/** Select jumlah baris per halaman (bawah tabel, sisi kiri). */
export function PerPageSelect({ value, onChange }: PerPageSelectProps) {
  return (
    <Select
      value={String(value)}
      onValueChange={(nextValue) => onChange(Number(nextValue))}
    >
      <SelectTrigger className="h-10 w-20 rounded-[5px] border-[#D9D9D9] text-sm text-[#374957] focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PER_PAGE_OPTIONS.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface TablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/** Bangun daftar nomor halaman dgn ellipsis, mis. [1,2,'...',9,10] */
function buildPageList(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, 2, totalPages - 1, totalPages, page])
  if (page > 1) pages.add(page - 1)
  if (page < totalPages) pages.add(page + 1)

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const result: (number | "...")[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push("...")
    result.push(p)
  })
  return result
}

/** Paginasi (bawah tabel, sisi kanan). */
export function TablePagination({
  page,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  if (totalPages <= 0) return null
  const pageList = buildPageList(page, totalPages)

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(1)}
        className="h-9 w-9 rounded-[5px] border-[#EAEAEA] text-[#374957] disabled:opacity-40"
        aria-label="Halaman pertama"
      >
        <ChevronsLeft className="size-4" />
      </Button>

      {pageList.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 text-center text-sm text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "h-9 w-9 rounded-[5px] border text-sm font-medium transition-colors",
              p === page
                ? "border-[#EAEAEA] bg-[#F5F5F5] text-[#374957]"
                : "border-[#EAEAEA] bg-white text-[#374957] hover:bg-gray-50"
            )}
          >
            {p}
          </button>
        )
      )}

      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(totalPages)}
        className="h-9 w-9 rounded-[5px] border-[#EAEAEA] text-[#374957] disabled:opacity-40"
        aria-label="Halaman terakhir"
      >
        <ChevronsRight className="size-4" />
      </Button>
    </div>
  )
}
