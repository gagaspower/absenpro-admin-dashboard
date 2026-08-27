import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Workflow,
  AlertCircle,
} from "lucide-react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PageCard } from "@/components/PageCard"
import {
  AlertModal,
  type AlertModalType,
} from "@/components/feedback/AlertModal"

import { fetchJenisCuti } from "@/services/jenis_cuti/jenis_cuti.service"
import { fetchDepartemenAllData } from "@/services/departemen/departemen.service"
import { fetchRole } from "@/services/role/role.service"
import { createLevelApproval } from "@/services/level_approval/level_approval.service"

import type { JenisCutiRow } from "@/types/jenis_cuti/jenis_cuti.types"
import type { DepartemenOption } from "@/types/departemen/departemen.types"
import type { RoleOption } from "@/types/roles/roles.types"
import { SortableLevelRow } from "@/components/level_approval/SortableLevelRow"

interface LevelDraft {
  key: string
  roleId: string
}

interface PageAlert {
  type: AlertModalType
  message: string
}

let levelKey = 0

function createEmptyLevel(): LevelDraft {
  levelKey += 1

  return {
    key: `level-${levelKey}`,
    roleId: "",
  }
}

export function AddLevelApprovalPage() {
  const navigate = useNavigate()

  const [jenisCutiOptions, setJenisCutiOptions] = useState<JenisCutiRow[]>([])
  const [departemenOptions, setDepartemenOptions] = useState<
    DepartemenOption[]
  >([])
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [levels, setLevels] = useState<LevelDraft[]>([createEmptyLevel()])

  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadOptions() {
      setIsLoadingOptions(true)

      try {
        const [jenisCutiRes, departemenRes, roleRes] = await Promise.all([
          fetchJenisCuti({
            limit: 100,
            is_trash: "active",
          }),
          fetchDepartemenAllData(),
          fetchRole(),
        ])

        if (ignore) return

        setJenisCutiOptions(jenisCutiRes.rows)
        setDepartemenOptions(
          departemenRes.rows.filter((d: DepartemenOption) => !d.deleted_at)
        )
        setRoleOptions(roleRes.rows)
      } catch {
        if (!ignore) {
          setPageAlert({
            type: "error",
            message:
              "Gagal memuat data referensi (jenis cuti / departemen / role). Muat ulang halaman.",
          })
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
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    setLevels((prev) => {
      const oldIndex = prev.findIndex((level) => level.key === active.id)
      const newIndex = prev.findIndex((level) => level.key === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        return prev
      }

      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function addLevel() {
    setLevels((prev) => [...prev, createEmptyLevel()])
  }

  function removeLevel(key: string) {
    setLevels((prev) =>
      prev.length > 1 ? prev.filter((level) => level.key !== key) : prev
    )
  }

  function updateLevelRole(key: string, roleId: string) {
    setLevels((prev) =>
      prev.map((level) =>
        level.key === key
          ? {
              ...level,
              roleId,
            }
          : level
      )
    )
  }

  const roleUsageCount = useMemo(() => {
    return levels.reduce<Record<string, number>>((acc, level) => {
      if (level.roleId) {
        acc[level.roleId] = (acc[level.roleId] ?? 0) + 1
      }

      return acc
    }, {})
  }, [levels])

  const hasDuplicateRole = Object.values(roleUsageCount).some(
    (count) => count > 1
  )

  const selectedJenisCuti = jenisCutiOptions.find(
    (item) => item.id === leaveTypeId
  )

  const selectedDepartemen = departemenOptions.find(
    (item) => item.id === departmentId
  )

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!leaveTypeId) {
      setFormError("Jenis cuti wajib dipilih.")
      return
    }

    if (!departmentId) {
      setFormError("Departemen wajib dipilih.")
      return
    }

    if (levels.some((level) => !level.roleId)) {
      setFormError("Semua level approval wajib memiliki role approver.")
      return
    }

    if (hasDuplicateRole) {
      setFormError("Role approver tidak boleh sama pada level yang berbeda.")
      return
    }

    setIsSubmitting(true)

    try {
      await createLevelApproval({
        leave_type_id: leaveTypeId,
        department_id: departmentId,
        levels: levels.map((level) => ({
          role_id: level.roleId,
        })),
      })

      setPageAlert({
        type: "success",
        message: "Level approval berhasil ditambahkan.",
      })
    } catch {
      setPageAlert({
        type: "error",
        message: "Gagal menyimpan level approval. Silakan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10 shrink-0 rounded-[5px] border-[#EAEAEA] bg-white text-[#374957] hover:bg-gray-50"
          aria-label="Kembali"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div>
          <h1 className="text-lg font-semibold text-[#1F2937]">
            Tambah Level Approval
          </h1>

          <p className="text-sm text-gray-500">
            Atur alur persetujuan cuti/izin berdasarkan jenis cuti dan
            departemen.
          </p>
        </div>
      </div>

      {formError && (
        <div className="flex items-start gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* LEFT - INFORMASI DASAR */}
          <PageCard className="overflow-hidden">
            <div className="mb-5 flex items-center gap-3 rounded-[8px] bg-gradient-to-r from-[#30CCD5]/10 to-transparent p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#30CCD5]/15 text-[#12A7B0]">
                <Workflow className="size-5" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#1F2937]">
                  Informasi Dasar
                </h2>

                <p className="text-xs text-gray-500">
                  Pilih jenis cuti dan departemen yang akan menggunakan alur
                  approval ini.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Jenis Cuti */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="jenis-cuti">Jenis Cuti</Label>

                <Select
                  value={leaveTypeId}
                  onValueChange={(value) => setLeaveTypeId(value ?? "")}
                >
                  <SelectTrigger
                    id="jenis-cuti"
                    className="!h-10 w-full rounded-[5px] border-[#D9D9D9] text-sm text-[#374957] focus:ring-0 focus:ring-offset-0"
                  >
                    <SelectValue
                      placeholder={
                        isLoadingOptions ? "Memuat..." : "Pilih jenis cuti"
                      }
                    >
                      {selectedJenisCuti?.name}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {jenisCutiOptions.map((jc) => (
                      <SelectItem key={jc.id} value={jc.id}>
                        {jc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Departemen */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="departemen">Departemen</Label>

                <Select
                  value={departmentId}
                  onValueChange={(value) => setDepartmentId(value ?? "")}
                >
                  <SelectTrigger
                    id="departemen"
                    className="!h-10 w-full rounded-[5px] border-[#D9D9D9] text-sm text-[#374957] focus:ring-0 focus:ring-offset-0"
                  >
                    <SelectValue
                      placeholder={
                        isLoadingOptions ? "Memuat..." : "Pilih departemen"
                      }
                    >
                      {selectedDepartemen?.name}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {departemenOptions.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PageCard>

          {/* RIGHT - URUTAN APPROVAL */}
          <PageCard>
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-semibold text-[#1F2937]">
                  Urutan Persetujuan
                </h2>

                <p className="text-xs text-gray-500">
                  Geser (drag) baris untuk mengubah urutan approval.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addLevel}
                className="h-10 shrink-0 gap-1.5 self-start rounded-[5px] border-[#30CCD5] text-sm font-normal text-[#12A7B0] hover:bg-[#30CCD5]/10 sm:self-auto"
              >
                <Plus className="size-4" />
                Tambah Level
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={levels.map((level) => level.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {levels.map((level, index) => (
                    <SortableLevelRow
                      key={level.key}
                      id={level.key}
                      order={index + 1}
                      roleId={level.roleId}
                      roleOptions={roleOptions}
                      onRoleChange={(roleId) =>
                        updateLevelRole(level.key, roleId)
                      }
                      onRemove={() => removeLevel(level.key)}
                      canRemove={levels.length > 1}
                      isDuplicate={
                        !!level.roleId && roleUsageCount[level.roleId] > 1
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </PageCard>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="h-10 rounded-[5px] border-[#EAEAEA] bg-white text-sm font-normal text-[#374957] hover:bg-gray-50"
          >
            Batal
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || isLoadingOptions}
            className="h-10 gap-1.5 rounded-[5px] bg-[#30CCD5] text-sm font-normal text-white hover:bg-[#2ab8c0] disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Simpan
          </Button>
        </div>
      </form>

      {pageAlert && (
        <AlertModal
          open
          type={pageAlert.type}
          message={pageAlert.message}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setPageAlert(null)

              if (pageAlert.type === "success") {
                navigate("/dashboard/level-approval", { replace: true })
              }
            }
          }}
        />
      )}
    </div>
  )
}

export default AddLevelApprovalPage
