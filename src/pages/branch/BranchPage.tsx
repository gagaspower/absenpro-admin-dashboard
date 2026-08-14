import { useMemo, useState } from "react"
import {
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  BulkActionBar,
  type BulkActionOption,
} from "@/components/data-table/BulkActionBar"
import {
  TableFilterPopover,
  type FilterCheckboxOption,
} from "@/components/data-table/TableFilterPopover"
import {
  RowActionsMenu,
  type RowAction,
} from "@/components/data-table/RowActionsMenu"
import {
  PerPageSelect,
  TablePagination,
} from "@/components/data-table/TableFooter"
import { StatusBadge } from "@/components/data-table/StatusBadge"

import type { BranchRow } from "@/types/branch/branch.types"

const BULK_OPTIONS: BulkActionOption[] = [
  { value: "restore", label: "Restore" },
  { value: "delete", label: "Hapus" },
  { value: "delete_permanent", label: "Hapus Permanen" },
]

const FILTER_OPTIONS: FilterCheckboxOption[] = [
  { id: "all", label: "Tampilkan semua" },
  { id: "deleted", label: "Sudah dihapus" },
]

// TODO: ganti mock data ini dgn fetch ke endpoint branch (masih tahap develop)
const MOCK_ROWS: BranchRow[] = Array.from({ length: 28 }, (_, i) => ({
  id: `branch-${i + 1}`,
  name: i === 0 ? "Rumah Laptop" : `Cabang ${i + 1}`,
  address:
    "Jl. Jend. Gatot Subroto No.16A, Purwokerto Tim., Kab. Banyumas, Jawa Tengah",
  latitude: "-7.4195060",
  longitude: "109.2289891",
  radius_meter: 100,
  is_trashed: i % 4 === 1,
}))

export function BranchPage() {
  const [bulkValue, setBulkValue] = useState("")
  const [filterSelected, setFilterSelected] = useState<string[]>(["all"])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredRows = useMemo(() => {
    const showDeletedOnly =
      filterSelected.includes("deleted") && !filterSelected.includes("all")
    return MOCK_ROWS.filter((row) => {
      if (showDeletedOnly && !row.is_trashed) return false
      if (search && !row.name.toLowerCase().includes(search.toLowerCase()))
        return false
      return true
    })
  }, [search, filterSelected])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage))
  const pagedRows = filteredRows.slice((page - 1) * perPage, page * perPage)

  const allChecked =
    pagedRows.length > 0 && pagedRows.every((r) => selectedIds.has(r.id))
  const someChecked = pagedRows.some((r) => selectedIds.has(r.id))

  function toggleAll(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      pagedRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)))
      return next
    })
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  function handleBulkSubmit() {
    // TODO: panggil endpoint bulk action dgn [...selectedIds] & bulkValue
    console.log("bulk action", bulkValue, [...selectedIds])
  }

  function handlePerPageChange(value: number) {
    setPerPage(value)
    setPage(1)
  }

  function rowActions(row: BranchRow): RowAction[] {
    return [
      {
        key: "detail",
        label: "View Detail",
        icon: Eye,
        onClick: () => console.log("detail", row.id),
      },
      {
        key: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: () => console.log("edit", row.id),
        hidden: row.is_trashed,
      },
      {
        key: "delete",
        label: "Hapus",
        icon: Trash2,
        destructive: true,
        onClick: () => console.log("delete", row.id),
        hidden: row.is_trashed,
      },
      {
        key: "restore",
        label: "Restore",
        icon: RotateCcw,
        onClick: () => console.log("restore", row.id),
        hidden: !row.is_trashed,
      },
      {
        key: "delete-permanent",
        label: "Hapus Permanen",
        icon: Trash,
        destructive: true,
        onClick: () => console.log("delete-permanent", row.id),
        hidden: !row.is_trashed,
      },
    ]
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#374957]">
          Wilayah Kerja / Branch
        </h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => console.log("tambah branch")}
          className="h-10 gap-2 rounded-[5px] border-[#EAEAEA] bg-white text-sm font-normal text-[#374957] hover:bg-gray-50"
        >
          <Plus className="size-4" />
          Tambah
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <BulkActionBar
          options={BULK_OPTIONS}
          value={bulkValue}
          onValueChange={(value) => setBulkValue(value)}
          onSubmit={handleBulkSubmit}
          disabled={selectedIds.size === 0}
        />

        <div className="flex items-center gap-2">
          <TableFilterPopover
            options={FILTER_OPTIONS}
            selected={filterSelected}
            onSubmit={(sel) => {
              setFilterSelected(sel)
              setPage(1)
            }}
          />
          <div className="relative w-full min-w-[220px] md:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Cari nama lokasi"
              className="h-10 rounded-[5px] border-[#EAEAEA] pl-9 text-sm text-[#374957] placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#EAEAEA] bg-[#F7FCFA] hover:bg-[#F7FCFA]">
                <TableHead className="w-12 px-5">
                  <Checkbox
                    checked={
                      allChecked ? true : someChecked ? "indeterminate" : false
                    }
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label="Pilih semua"
                  />
                </TableHead>
                <TableHead className="text-[#374957]">Nama Lokasi</TableHead>
                <TableHead className="text-[#374957]">Latitude</TableHead>
                <TableHead className="text-[#374957]">Longitude</TableHead>
                <TableHead className="text-[#374957]">Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-gray-400"
                  >
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => (
                  <TableRow key={row.id} className="border-[#EAEAEA]">
                    <TableCell className="px-5">
                      <Checkbox
                        checked={selectedIds.has(row.id)}
                        onCheckedChange={(checked) =>
                          toggleRow(row.id, checked === true)
                        }
                        aria-label={`Pilih ${row.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-[#374957]">{row.name}</TableCell>
                    <TableCell className="text-[#374957]">
                      {row.latitude}
                    </TableCell>
                    <TableCell className="text-[#374957]">
                      {row.longitude}
                    </TableCell>
                    <TableCell>
                      <StatusBadge active={!row.is_trashed} />
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu actions={rowActions(row)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse items-center justify-between gap-3 md:flex-row">
        <PerPageSelect value={perPage} onChange={handlePerPageChange} />
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}

export default BranchPage
