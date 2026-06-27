# Malika Bozor — Loyiha Holati (qayd)

> Oxirgi yangilanish: 2026-06-28

Telefon qidiruv / narx solishtirish platformasi. Mijoz Malika bozoridagi
telefonlarni qidiradi, do'kon narxlarini solishtiradi, joylashuvini ko'radi —
aldanmasdan, bozorni aylanmasdan eng qulay do'konga boradi.

---

## 🌐 Havolalar

- **Jonli sayt:** https://malika-bozor.vercel.app
- **GitHub:** https://github.com/azimjontilavoldiyev33-lgtm/Malika-bozor (branch `main`)
- **Joylashuv (kompyuter):** `C:\Users\user\Desktop\malika-bozor`

## 🔑 Test loginlar

| Rol | Telefon | Parol |
|-----|---------|-------|
| Admin | `900000000` | `admin123` |
| Do'kon | `901110000` (…0001/0002/0003) | `dokon123` |

> ⚠️ `npm run seed` ishlatilsa, foydalanuvchi ID'lari o'zgaradi → eski sessiyalar
> bekor bo'ladi (qayta login kerak).

---

## 🛠️ Texnologiyalar

Next.js 16 (App Router, PWA) · TypeScript · Tailwind CSS v4 · MongoDB/Mongoose ·
JWT (jose) · bcryptjs · Zod · Cloudinary (rasm) · OpenStreetMap/Google (xarita)

## 👥 Rollar

- **Mijoz** — ro'yxatsiz: qidiradi, solishtiradi, do'konga boradi
- **Do'kon egasi** — `/kabinet`: e'lon qo'shadi, rasm yuklaydi, sozlama
- **Admin** — `/admin`: do'kon tasdiqlaydi, obuna/tarif beradi, moderatsiya

## 💼 Biznes modeli: Vitrina + Obuna

Sotuv **do'konda** bo'ladi (ilovada onlayn sotuv yo'q). Daromad — do'konlar oylik
**obuna** to'laydi (hozircha to'lov qo'lda, admin tasdiqlaydi). Faqat tasdiqlangan +
obunasi faol do'kon e'lonlari mijozga ko'rinadi.

### Tariflar (`src/lib/tariflar.ts`)

| Tarif | E'lon limiti | Narx/oy |
|-------|--------------|---------|
| Boshlang'ich | 20 ta | 150 000 so'm |
| Standart | 50 ta | 300 000 so'm |
| Premium | Cheksiz | 600 000 so'm |

---

## ✅ Tayyor funksiyalar

- Qidiruv + filtr (brend, holat, narx, blok) + saralash
- Narx solishtirish (`/telefon/[id]`) — bitta model bo'yicha do'konlar arzondan qimmatga
- Do'kon sahifasi (`/dokon/[id]`) — joylashuv, xarita, navigator, qo'ng'iroq
- Do'kon kabineti — e'lon CRUD, rasm yuklash (Cloudinary), sozlama, limit ko'rsatkichi
- Admin panel — statistika, do'kon tasdiqlash/bloklash, obuna uzaytirish, tarif tanlash, e'lon moderatsiyasi
- Obuna + tarif/limit (biznes modeli)
- PWA (telefonga o'rnatiladi) + zamonaviy dizayn + mobil pastki navigatsiya
- Tezlik: ommaviy API edge keshlash + sahifalar ISR (`revalidate=60`)

---

## ▶️ Ishga tushirish (lokal)

```bash
cd C:\Users\user\Desktop\malika-bozor
npm run dev          # http://localhost:3000 (lokal MongoDB kerak, 27017)
npm run seed         # test ma'lumotlar (admin + do'konlar + e'lonlar)
```

`.env.local` — lokal dev lokal Mongo'ga ulanadi (Atlas manzili izohda saqlangan,
deploy Vercel env'da). Deploy: `git push` → Vercel avtomatik.

## ⚙️ Muhit o'zgaruvchilari (Vercel)

`MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`,
`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (ixtiyoriy).

---

## ⚠️ Muhim eslatmalar

- **Service worker** faqat production'da ishlaydi. Dev'da o'zgarish ko'rinmasa —
  brauzerda SW'ni unregister qilib, cache'ni tozalang.
- **Xarita:** Google kalit bo'lsa Google Embed API, bo'lmasa OpenStreetMap (kalitsiz).
- **MongoDB Atlas M0 (bepul)** sekin — keshlash buni yumshatadi.

## 📌 Keyingi mumkin ishlar

- Payme/Click to'lov (obunani avtomatlashtirish)
- Atlas regionini Vercel'ga yaqinlashtirish + M10+ tarif (haqiqiy tezlik)
- Do'konlarni jalb qilish strategiyasi
- Reyting/sharhlar, sevimlilar, Telegram bot, o'z domeni
