'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Toshkent markazi (Malika bozor atrofi) — geo yo'q bo'lsa boshlang'ich ko'rinish
const DEFAULT = { lat: 41.3111, lng: 69.2797 }

// Rasm fayliga bog'liq bo'lmaslik uchun emoji "pin" (bundler icon muammosi yo'q)
const PIN = L.divIcon({
  className: 'mb-pin',
  html: '<div style="font-size:30px;line-height:1">📍</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 28], // pin uchi pastki-markazda
})

export default function JoylashuvXarita({
  lat,
  lng,
  onChange,
}: {
  lat?: number
  lng?: number
  onChange: (lat: number, lng: number) => void
}) {
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [gps, setGps] = useState<'idle' | 'aniqlanmoqda' | 'xato'>('idle')

  // Markerni qo'yish/ko'chirish + ota-formaga xabar berish
  function belgila(la: number, ln: number) {
    const map = mapRef.current
    if (!map) return
    if (markerRef.current) {
      markerRef.current.setLatLng([la, ln])
    } else {
      const m = L.marker([la, ln], { icon: PIN, draggable: true }).addTo(map)
      m.on('dragend', () => {
        const p = m.getLatLng()
        onChangeRef.current(p.lat, p.lng)
      })
      markerRef.current = m
    }
    onChangeRef.current(la, ln)
  }

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const boshLat = lat ?? DEFAULT.lat
    const boshLng = lng ?? DEFAULT.lng
    const map = L.map(elRef.current).setView([boshLat, boshLng], lat ? 17 : 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map

    // Mavjud geo bo'lsa — markerni qo'yamiz
    if (lat != null && lng != null) {
      const m = L.marker([lat, lng], { icon: PIN, draggable: true }).addTo(map)
      m.on('dragend', () => {
        const p = m.getLatLng()
        onChangeRef.current(p.lat, p.lng)
      })
      markerRef.current = m
    }

    // Xaritani bosganda nuqta belgilanadi
    map.on('click', (e: L.LeafletMouseEvent) => {
      belgila(e.latlng.lat, e.latlng.lng)
    })

    // Konteyner o'lchami to'g'ri hisoblanishi uchun
    const t = setTimeout(() => map.invalidateSize(), 120)

    return () => {
      clearTimeout(t)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // faqat mount'da bir marta — boshlang'ich lat/lng seed sifatida
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function joriyJoylashuv() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGps('xato')
      return
    }
    setGps('aniqlanmoqda')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        mapRef.current?.setView([latitude, longitude], 17)
        belgila(latitude, longitude)
        setGps('idle')
      },
      () => setGps('xato'),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={joriyJoylashuv}
        disabled={gps === 'aniqlanmoqda'}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {gps === 'aniqlanmoqda'
          ? '📍 Aniqlanmoqda…'
          : '📍 Joriy joylashuvim (do\'konda turib bosing)'}
      </button>

      <div
        ref={elRef}
        className="h-64 w-full overflow-hidden rounded-xl border border-slate-200"
      />

      {gps === 'xato' ? (
        <p className="text-xs text-red-500">
          GPS aniqlanmadi. Brauzerga joylashuv ruxsatini bering yoki xaritada
          qo&apos;lda bosib belgilang.
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Xaritani bosing yoki pinni surib aniq joyni belgilang.
        </p>
      )}
    </div>
  )
}
