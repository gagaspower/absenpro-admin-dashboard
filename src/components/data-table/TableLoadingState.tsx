import { TableCell, TableRow } from "@/components/ui/table"
import { LoadingSpinner } from "@/components/LoadingSpinner"

interface TableLoadingStateProps {
  /** Number of columns to span — pass the same colSpan used for empty/error rows. */
  colSpan: number
  label?: string
  className?: string
}

/**
 * Drop-in replacement for a plain "Memuat data..." text row inside a
 * <TableBody>. Renders the animated LoadingSpinner centered across the row.
 *
 * Usage:
 *   {isLoading ? (
 *     <TableLoadingState colSpan={6} />
 *   ) : ...}
 */
export function TableLoadingState({
  colSpan,
  label = "Sedang memuat data",
  className,
}: TableLoadingStateProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className={`py-14 ${className ?? ""}`}>
        <LoadingSpinner label={label} size="md" />
      </TableCell>
    </TableRow>
  )
}

export default TableLoadingState
