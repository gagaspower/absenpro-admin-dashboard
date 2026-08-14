import { useEffect, useState } from "react"

/**
 * Menunda perubahan nilai sampai tidak ada pembaruan baru selama `delay` ms.
 * Berguna untuk membatasi request saat pengguna mengetik di kolom pencarian.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)

    return () => window.clearTimeout(timer)
  }, [delay, value])

  return debouncedValue
}
