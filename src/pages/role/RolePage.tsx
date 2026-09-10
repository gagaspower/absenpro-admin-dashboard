import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { RoleCombobox } from "@/components/role/RoleCombobox"
import { cn } from "@/lib/utils"
import { TableEmptyState } from "@/components/data-table/TableEmptyState"
import { PageCard, PageCardHeader } from "@/components/PageCard"
import { fetchRolePermissions, updateRolePermissions } from "@/services/role/role.service"
import type { RolePermissionDetail, RolePermissionItem } from "@/types/roles/roles.types"
import { buildPermissionMatrix, flattenPermissionIds, type PermissionMatrix } from "./permission-matrix"
import { storage } from "@/lib/storage"
import { notifyPermissionsChanged } from "@/lib/permissions"

const CHECKBOX_CLASS =
  "size-[18px] rounded-[4px] border-[1.5px] border-[#B7C1CA] shadow-sm " +
  "data-[state=checked]:border-[#0BC5EA] data-[state=checked]:bg-[#0BC5EA] " +
  "data-[state=checked]:text-white data-[indeterminate]:border-[#0BC5EA] data-[indeterminate]:bg-[#0BC5EA]"

const LABEL_COLUMN_CLASS = "w-56 min-w-[224px] max-w-[224px]"

export function RolePage() {
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [detail, setDetail] = useState<RolePermissionDetail | null>(null)
  const [permissionLoading, setPermissionLoading] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [validationError, setValidationError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const loadPermissions = useCallback(async (roleId: string) => {
    setPermissionLoading(true)
    setPermissionError(null)
    setSaveError(null)
    setSaveSuccess(false)
    setValidationError(null)

    try {
      const res = await fetchRolePermissions(roleId)
      setDetail(res.data)
      setCheckedIds(new Set(flattenPermissionIds(res.data.menus, (p) => p.is_checked)))
    } catch {
      setPermissionError("Gagal memuat data hak akses untuk role ini.")
      setDetail(null)
      setCheckedIds(new Set())
    } finally {
      setPermissionLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedRoleId) loadPermissions(selectedRoleId)
  }, [selectedRoleId, loadPermissions])

  const permissionMatrix = useMemo<PermissionMatrix | null>(
    () => (detail ? buildPermissionMatrix(detail.menus) : null),
    [detail]
  )

  function toggleCell(item: RolePermissionItem) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(item.id) ? next.delete(item.id) : next.add(item.id)
      return next
    })
    setValidationError(null)
    setSaveSuccess(false)
  }

  function toggleColumn(action: string) {
    if (!permissionMatrix) return

    const items = permissionMatrix.rows
      .map((row) => row.cells[action])
      .filter((item): item is RolePermissionItem => Boolean(item))
    const allChecked = items.length > 0 && items.every((item) => checkedIds.has(item.id))

    setCheckedIds((prev) => {
      const next = new Set(prev)
      items.forEach((item) => (allChecked ? next.delete(item.id) : next.add(item.id)))
      return next
    })
    setValidationError(null)
    setSaveSuccess(false)
  }

  async function handleSave() {
    if (!selectedRoleId) return
    if (checkedIds.size === 0) {
      setValidationError("Pilih minimal 1 permission sebelum menyimpan.")
      return
    }

    setValidationError(null)
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const response = await updateRolePermissions(selectedRoleId, {
        permission_ids: Array.from(checkedIds),
      })
      const auth = storage.getAuth()

      if (auth?.user?.roles?.some((role) => role.id === selectedRoleId)) {
        storage.saveAuth({ ...auth, permissions: response.data.permissions })
        notifyPermissionsChanged()
      }
      setSaveSuccess(true)
    } catch {
      setSaveError("Gagal menyimpan hak akses. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <PageCardHeader title="Hak Akses Role" />

        <div className="mt-4 flex max-w-sm flex-col gap-1.5">
          <label className="text-sm font-medium text-[#374957]">Role</label>
          <RoleCombobox value={selectedRoleId} onChange={setSelectedRoleId} />
        </div>

        {!selectedRoleId ? (
          <div className="mt-4">
            <TableEmptyState icon={ShieldCheck} title="Pilih role terlebih dahulu" description="Pilih role pada kolom di atas untuk melihat dan mengatur hak aksesnya." />
          </div>
        ) : permissionLoading ? (
          <div className="mt-6 animate-pulse rounded-[5px] border border-[#EAEAEA] bg-[#F7FCFA] py-10 text-center text-sm text-[#8A99A8]">
            Memuat data hak akses...
          </div>
        ) : permissionError ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-[5px] border border-[#EAEAEA] py-10 text-center text-sm text-red-500">
            <p>{permissionError}</p>
            <Button variant="outline" className="rounded-[5px]" onClick={() => selectedRoleId && loadPermissions(selectedRoleId)}>
              Coba lagi
            </Button>
          </div>
        ) : permissionMatrix ? (
          <div className="mt-6 flex flex-col gap-6">
            <PermissionMatrixTable matrix={permissionMatrix} checkedIds={checkedIds} onToggleCell={toggleCell} onToggleColumn={toggleColumn} />

            {validationError && (
              <div className="flex items-center gap-2 rounded-[5px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" /> {validationError}
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 rounded-[5px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-[5px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Hak akses berhasil diperbarui.
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="rounded-[5px] bg-[#0BC5EA] px-8 text-white hover:bg-[#0AB0D3]">
                {saving ? "Menyimpan..." : "Update"}
              </Button>
            </div>
          </div>
        ) : null}
      </PageCard>
    </div>
  )
}

interface PermissionMatrixTableProps {
  matrix: PermissionMatrix
  checkedIds: Set<string>
  onToggleCell: (item: RolePermissionItem) => void
  onToggleColumn: (action: string) => void
}

function PermissionMatrixTable({ matrix, checkedIds, onToggleCell, onToggleColumn }: PermissionMatrixTableProps) {
  const lastIndex = matrix.columns.length - 1

  return (
    <div className="overflow-x-auto rounded-[8px] border border-[#EAEAEA] bg-white">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="border-none hover:bg-transparent">
            <TableHead rowSpan={2} className={cn(LABEL_COLUMN_CLASS, "border-r border-[#EAEAEA] align-middle text-base font-normal text-[#374957]")}>Permission</TableHead>
            {matrix.columns.map((action, i) => (
              <TableHead key={action} className={cn("text-center text-base font-normal text-[#374957]", i !== lastIndex && "border-r border-[#EAEAEA]")}>{action}</TableHead>
            ))}
          </TableRow>

          <TableRow className="border-b border-[#EAEAEA] hover:bg-transparent">
            {matrix.columns.map((action, i) => {
              const items = matrix.rows.map((row) => row.cells[action]).filter((item): item is RolePermissionItem => Boolean(item))
              const checkedCount = items.filter((item) => checkedIds.has(item.id)).length
              const allChecked = items.length > 0 && checkedCount === items.length
              const someChecked = checkedCount > 0 && !allChecked

              return (
                <TableHead key={action} className={cn("py-3 text-center", i !== lastIndex && "border-r border-[#EAEAEA]")}>
                  <div className="flex justify-center">
                    <Checkbox checked={allChecked} indeterminate={someChecked} onCheckedChange={() => onToggleColumn(action)} aria-label={`Pilih semua ${action}`} className={CHECKBOX_CLASS} disabled={items.length === 0} />
                  </div>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {matrix.rows.map((row) => (
            <TableRow key={row.id} className="border-none hover:bg-[#F7FCFA]/60">
              <TableCell className={cn(LABEL_COLUMN_CLASS, "truncate border-r border-[#EAEAEA] py-4 text-[#374957]")}>{row.entityName}</TableCell>
              {matrix.columns.map((action, i) => {
                const item = row.cells[action]
                return (
                  <TableCell key={action} className={cn("py-4 text-center", i !== lastIndex && "border-r border-[#EAEAEA]")}>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={item ? checkedIds.has(item.id) : false}
                        onCheckedChange={() => item && onToggleCell(item)}
                        aria-label={item?.permission_name ?? `${action} ${row.entityName}`}
                        className={CHECKBOX_CLASS}
                        disabled={!item}
                      />
                    </div>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default RolePage
