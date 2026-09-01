import { MONTH_OPTIONS } from "@/types/absensi/absensi.types"

interface MonthYearFilterProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

function getYearOptions(): number[] {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => current - 3 + i)
}

export function MonthYearFilter({
  month,
  year,
  onMonthChange,
  onYearChange,
}: MonthYearFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className="h-10 rounded-[5px] border border-[#DDE3E6] bg-white px-3 text-sm text-[#374957] outline-none focus:border-[#30CCD5]"
      >
        {MONTH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="h-10 rounded-[5px] border border-[#DDE3E6] bg-white px-3 text-sm text-[#374957] outline-none focus:border-[#30CCD5]"
      >
        {getYearOptions().map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
