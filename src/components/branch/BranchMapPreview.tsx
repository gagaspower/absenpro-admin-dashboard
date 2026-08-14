import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const JAKARTA: L.LatLngExpression = [-6.2088, 106.8456]

interface BranchMapPreviewProps {
  latitude: string
  longitude: string
  radiusMeter: string
}

function toCoordinate(value: string, minimum: number, maximum: number) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) &&
    numberValue >= minimum &&
    numberValue <= maximum
    ? numberValue
    : null
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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: true }).setView(
      JAKARTA,
      12
    )
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const lat = toCoordinate(latitude, -90, 90)
    const lng = toCoordinate(longitude, -180, 180)
    const radius = Number(radiusMeter)
    if (lat === null || lng === null) {
      markerRef.current?.remove()
      circleRef.current?.remove()
      markerRef.current = null
      circleRef.current = null
      return
    }

    const position: L.LatLngExpression = [lat, lng]
    if (markerRef.current) markerRef.current.setLatLng(position)
    else markerRef.current = L.marker(position).addTo(map)

    if (Number.isFinite(radius) && radius >= 1) {
      if (circleRef.current) {
        circleRef.current.setLatLng(position).setRadius(radius)
      } else {
        circleRef.current = L.circle(position, {
          radius,
          color: "#30CCD5",
          fillColor: "#30CCD5",
          fillOpacity: 0.14,
          weight: 2,
        }).addTo(map)
      }
    } else {
      circleRef.current?.remove()
      circleRef.current = null
    }

    map.setView(position, 15)
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
