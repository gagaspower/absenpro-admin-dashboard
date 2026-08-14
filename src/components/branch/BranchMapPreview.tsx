import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const DEFAULT_ICON = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
      fill="#30CCD5" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4.5" fill="#fff"/>
  </svg>`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
})

const JAKARTA: L.LatLngExpression = [-6.2088, 106.8456]

interface BranchMapPreviewProps {
  latitude: string
  longitude: string
  radiusMeter: string
}

function toCoordinate(value: string, minimum: number, maximum: number) {
  const n = Number(value)

  return Number.isFinite(n) && n >= minimum && n <= maximum ? n : null
}

export function BranchMapPreview({
  latitude,
  longitude,
  radiusMeter,
}: BranchMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)

  const lastPositionRef = useRef<L.LatLngExpression | null>(null)

  const rafRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  /**
   * Refresh ukuran map dan center ke posisi marker.
   */
  const refreshMap = (position?: L.LatLngExpression) => {
    const map = mapRef.current

    if (!map) return
    if (!map.getContainer()) return
    if (!map.getContainer().isConnected) return

    const target = position ?? lastPositionRef.current

    map.invalidateSize({
      animate: false,
    })

    if (!target) return

    /**
     * Batalkan request sebelumnya.
     */
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null

      const currentMap = mapRef.current

      if (!currentMap) return
      if (!currentMap.getContainer()) return
      if (!currentMap.getContainer().isConnected) return

      currentMap.invalidateSize({
        animate: false,
      })

      /**
       * Pastikan map sudah loaded.
       */
      if (currentMap._loaded) {
        currentMap.setView(target, 15, {
          animate: false,
        })
      }

      /**
       * Backup kecil untuk drawer/modal.
       */
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null

        const latestMap = mapRef.current

        if (!latestMap) return
        if (!latestMap.getContainer()) return
        if (!latestMap.getContainer().isConnected) return

        latestMap.invalidateSize({
          animate: false,
        })

        if (latestMap._loaded) {
          latestMap.setView(target, 15, {
            animate: false,
          })
        }
      }, 100)
    })
  }

  /**
   * Initialize Leaflet.
   */
  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: true,
    }).setView(JAKARTA, 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)

    mapRef.current = map

    /**
     * Ketika map sudah siap.
     */
    map.whenReady(() => {
      refreshMap()
    })

    /**
     * Drawer/modal berubah ukuran.
     */
    const resizeObserver = new ResizeObserver(() => {
      const currentMap = mapRef.current

      if (!currentMap) return

      currentMap.invalidateSize({
        animate: false,
      })

      if (lastPositionRef.current) {
        refreshMap(lastPositionRef.current)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      /**
       * Sangat penting:
       * batalkan callback async sebelum map.remove().
       */
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      resizeObserver.disconnect()

      markerRef.current?.remove()
      circleRef.current?.remove()

      markerRef.current = null
      circleRef.current = null
      lastPositionRef.current = null

      map.remove()

      mapRef.current = null
    }
  }, [])

  /**
   * Sync latitude, longitude dan radius.
   */
  useEffect(() => {
    const map = mapRef.current

    if (!map) return

    const lat = toCoordinate(latitude, -90, 90)
    const lng = toCoordinate(longitude, -180, 180)

    const radius = Number(radiusMeter)

    /**
     * Koordinat belum valid.
     */
    if (lat === null || lng === null) {
      markerRef.current?.remove()
      circleRef.current?.remove()

      markerRef.current = null
      circleRef.current = null
      lastPositionRef.current = null

      return
    }

    const position: L.LatLngExpression = [lat, lng]

    /**
     * Simpan posisi terakhir.
     */
    lastPositionRef.current = position

    /**
     * Marker.
     */
    if (!markerRef.current) {
      markerRef.current = L.marker(position, {
        icon: DEFAULT_ICON,
      }).addTo(map)
    } else {
      markerRef.current.setLatLng(position)

      if (!map.hasLayer(markerRef.current)) {
        markerRef.current.addTo(map)
      }
    }

    /**
     * Radius.
     */
    if (Number.isFinite(radius) && radius >= 1) {
      if (!circleRef.current) {
        circleRef.current = L.circle(position, {
          radius,
          color: "#30CCD5",
          fillColor: "#30CCD5",
          fillOpacity: 0.14,
          weight: 2,
        }).addTo(map)
      } else {
        circleRef.current.setLatLng(position).setRadius(radius)

        if (!map.hasLayer(circleRef.current)) {
          circleRef.current.addTo(map)
        }
      }
    } else {
      circleRef.current?.remove()
      circleRef.current = null
    }

    /**
     * Center map ke koordinat.
     */
    refreshMap(position)
  }, [latitude, longitude, radiusMeter])

  return (
    <div className="overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-[#F7FCFA]">
      <div ref={containerRef} className="h-56 w-full sm:h-64" />

      <p className="border-t border-[#EAEAEA] px-3 py-2 text-xs text-[#71808B]">
        Marker dan radius akan diperbarui saat koordinat valid diisi.
      </p>
    </div>
  )
}
