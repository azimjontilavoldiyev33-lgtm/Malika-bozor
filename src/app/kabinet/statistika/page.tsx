import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Statistika, type IStatistika } from '@/models/Statistika'
import { oxirgiKunlar, sanaKalit } from '@/lib/stat'

export const dynamic = 'force-dynamic' // har doim yangi raqamlar (keshlanmaydi)

type Yigindi = {
  dokonKorish: number
  elonKorish: number
  qongiroq: number
  telegram: number
  yolKorsatma: number
}

const BOSH: Yigindi = {
  dokonKorish: 0,
  elonKorish: 0,
  qongiroq: 0,
  telegram: 0,
  yolKorsatma: 0,
}

// Berilgan sanalar to'plami bo'yicha hisoblagichlarni qo'shadi
function yigindi(
  xarita: Map<string, IStatistika>,
  sanalar: string[],
): Yigindi {
  const y = { ...BOSH }
  for (const s of sanalar) {
    const d = xarita.get(s)
    if (!d) continue
    y.dokonKorish += d.dokonKorish
    y.elonKorish += d.elonKorish
    y.qongiroq += d.qongiroq
    y.telegram += d.telegram
    y.yolKorsatma += d.yolKorsatma
  }
  return y
}

const korishlar = (y: Yigindi) => y.dokonKorish + y.elonKorish
const aloqalar = (y: Yigindi) => y.qongiroq + y.telegram + y.yolKorsatma

export default async function StatistikaPage() {
  const user = await getCurrentUser()
  await dbConnect()

  const kun30 = oxirgiKunlar(30)
  const docs = await Statistika.find({
    shopId: user!.shopId,
    sana: { $gte: kun30[0] },
  }).lean<IStatistika[]>()

  const xarita = new Map(docs.map((d) => [d.sana, d]))

  const oy = yigindi(xarita, kun30)
  const hafta = yigindi(xarita, oxirgiKunlar(7))
  const bugun = yigindi(xarita, [sanaKalit()])

  // 14 kunlik ustun diagramma (ko'rish + aloqa)
  const kun14 = oxirgiKunlar(14)
  const ustunlar = kun14.map((s) => {
    const d = xarita.get(s)
    const k = d ? d.dokonKorish + d.elonKorish : 0
    const a = d ? d.qongiroq + d.telegram + d.yolKorsatma : 0
    return { sana: s, korish: k, aloqa: a }
  })
  const engKattaUstun = Math.max(1, ...ustunlar.map((u) => u.korish + u.aloqa))

  const oyKorish = korishlar(oy)
  const oyAloqa = aloqalar(oy)
  const aloqaDaraja =
    oyKorish > 0 ? Math.round((oyAloqa / oyKorish) * 100) : 0

  const malumotBormi = docs.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">📈 Statistika</h2>
        <span className="text-xs text-slate-500">oxirgi 30 kun</span>
      </div>

      {/* Strategiyaga mos motivatsion xulosa */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
        {malumotBormi ? (
          <p className="text-sm text-slate-700">
            Bu oy mijozlar do&apos;koningizni{' '}
            <b className="text-indigo-700">{oyKorish}</b> marta ko&apos;rdi va{' '}
            <b className="text-indigo-700">{oyAloqa}</b> marta bog&apos;lanmoqchi
            bo&apos;ldi (qo&apos;ng&apos;iroq, telegram yoki yo&apos;l
            ko&apos;rsatma). Aloqa darajasi —{' '}
            <b className="text-indigo-700">{aloqaDaraja}%</b>.
          </p>
        ) : (
          <p className="text-sm text-slate-700">
            Hozircha statistika yo&apos;q. Mijozlar do&apos;koningizni
            ko&apos;rib, qo&apos;ng&apos;iroq qila boshlagach, bu yerda real
            raqamlar paydo bo&apos;ladi. E&apos;lonlaringizni to&apos;ldiring va
            do&apos;koningizni faollashtiring.
          </p>
        )}
      </div>

      {/* Asosiy ko'rsatkichlar (30 kun) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KartaRaqam
          belgi="👁️"
          son={oyKorish}
          matn="Ko'rishlar"
          rang="text-slate-900"
        />
        <KartaRaqam
          belgi="📞"
          son={oy.qongiroq}
          matn="Qo'ng'iroq"
          rang="text-indigo-600"
        />
        <KartaRaqam
          belgi="✈️"
          son={oy.telegram}
          matn="Telegram"
          rang="text-sky-600"
        />
        <KartaRaqam
          belgi="🧭"
          son={oy.yolKorsatma}
          matn="Yo'l ko'rsatma"
          rang="text-amber-600"
        />
      </div>

      {/* 14 kunlik diagramma */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Oxirgi 14 kun</p>
          <div className="flex gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-300" />{' '}
              Ko&apos;rish
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500" />{' '}
              Aloqa
            </span>
          </div>
        </div>
        <div className="flex h-32 items-end gap-1">
          {ustunlar.map((u) => {
            const jami = u.korish + u.aloqa
            const balandlik = (jami / engKattaUstun) * 100
            return (
              <div
                key={u.sana}
                className="flex flex-1 flex-col items-center gap-1"
                title={`${u.sana.slice(5)}: ${u.korish} ko'rish, ${u.aloqa} aloqa`}
                aria-label={`${u.sana.slice(5)}: ${u.korish} ko'rish, ${u.aloqa} aloqa`}
              >
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="flex w-full flex-col justify-end overflow-hidden rounded-t-sm"
                    style={{ height: `${balandlik}%` }}
                  >
                    {u.aloqa > 0 && (
                      <div
                        className="w-full bg-indigo-500"
                        style={{
                          height: `${(u.aloqa / Math.max(1, jami)) * 100}%`,
                        }}
                      />
                    )}
                    {u.korish > 0 && (
                      <div
                        className="w-full bg-slate-300"
                        style={{
                          height: `${(u.korish / Math.max(1, jami)) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-slate-400">
                  {u.sana.slice(8)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Davr taqqoslash */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Davr</th>
              <th className="px-3 py-2 text-right font-medium">Ko&apos;rish</th>
              <th className="px-3 py-2 text-right font-medium">Aloqa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <DavrQator nom="Bugun" y={bugun} />
            <DavrQator nom="Oxirgi 7 kun" y={hafta} />
            <DavrQator nom="Oxirgi 30 kun" y={oy} />
          </tbody>
        </table>
      </div>

      <p className="px-1 text-xs text-slate-400">
        Ko&apos;rish — do&apos;kon sahifasi va e&apos;lonlaringiz necha marta
        ochilgani. Aloqa — qo&apos;ng&apos;iroq, telegram va yo&apos;l ko&apos;rsatma
        tugmalari bosilishi.
      </p>

      <Link
        href="/kabinet"
        className="inline-block text-sm text-indigo-600 hover:underline"
      >
        ← Bosh sahifa
      </Link>
    </div>
  )
}

function KartaRaqam({
  belgi,
  son,
  matn,
  rang,
}: {
  belgi: string
  son: number
  matn: string
  rang: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm">{belgi}</p>
      <p className={`mt-1 text-2xl font-bold ${rang}`}>{son}</p>
      <p className="text-xs text-slate-500">{matn}</p>
    </div>
  )
}

function DavrQator({ nom, y }: { nom: string; y: Yigindi }) {
  return (
    <tr>
      <td className="px-4 py-2.5 text-slate-700">{nom}</td>
      <td className="px-3 py-2.5 text-right font-medium">{korishlar(y)}</td>
      <td className="px-3 py-2.5 text-right font-medium text-indigo-600">
        {aloqalar(y)}
      </td>
    </tr>
  )
}
