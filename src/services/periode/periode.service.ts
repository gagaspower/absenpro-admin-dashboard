import { api } from "@/lib/axios"
import type { PeriodeRow } from "@/types/periode/periode.types"

export async function fetchPeriode(): Promise<PeriodeRow[]> {
  const { data } = await api.get<PeriodeRow[]>("api/reference/periode")
  return data
}
