export const BACKEND_URL = import.meta.env.VITE_API_URL as string

export function getPegawaiAvatarUrl(
  referencePhotoPath?: string | null
): string | undefined {
  return referencePhotoPath
    ? `${BACKEND_URL}/storage/${referencePhotoPath}`
    : undefined
}
