'use client'

import { useState, useRef } from 'react'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
const SOZLANGAN = Boolean(CLOUD && PRESET)
const MAKS = 5 // ko'pi bilan 5 ta rasm

export default function RasmYuklash({
  value,
  onChange,
}: {
  value: string[]
  onChange: (rasmlar: string[]) => void
}) {
  const [yuklanmoqda, setYuklanmoqda] = useState(false)
  const [xato, setXato] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function fayllarniYukla(files: FileList) {
    setXato('')
    const bosh = MAKS - value.length
    if (bosh <= 0) {
      setXato(`Ko'pi bilan ${MAKS} ta rasm`)
      return
    }
    const tanlangan = Array.from(files).slice(0, bosh)
    setYuklanmoqda(true)
    try {
      const yangiUrllar: string[] = []
      for (const file of tanlangan) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('upload_preset', PRESET as string)
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
          { method: 'POST', body: fd },
        )
        const json = await res.json()
        if (!res.ok || !json.secure_url) {
          throw new Error(json?.error?.message ?? 'Yuklashda xatolik')
        }
        yangiUrllar.push(json.secure_url)
      }
      onChange([...value, ...yangiUrllar])
    } catch (e) {
      setXato(e instanceof Error ? e.message : 'Yuklashda xatolik')
    } finally {
      setYuklanmoqda(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function ochir(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  // Cloudinary sozlanmagan — URL kiritishga qaytamiz
  if (!SOZLANGAN) {
    return (
      <div>
        <input
          value={value.join(', ')}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder="Rasm havolalari (vergul bilan)"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400"
        />
        <p className="mt-1 text-xs text-amber-600">
          ⚠️ Rasm yuklash sozlanmagan (.env.local da Cloudinary kalitlarini
          to&apos;ldiring). Hozircha havola kiriting.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Oldindan ko'rsatish */}
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((url) => (
            <div
              key={url}
              className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="rasm" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => ochir(url)}
                className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Yuklash tugmasi */}
      {value.length < MAKS && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-4 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={yuklanmoqda}
            onChange={(e) => e.target.files && fayllarniYukla(e.target.files)}
          />
          {yuklanmoqda ? '⏳ Yuklanmoqda...' : `📷 Rasm tanlang (${value.length}/${MAKS})`}
        </label>
      )}

      {xato && <p className="mt-1 text-xs text-red-600">{xato}</p>}
    </div>
  )
}
