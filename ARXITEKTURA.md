# Malika Bozor — Loyiha Arxitekturasi

## 1. G'oya (Muammo → Yechim)

**Muammo:** Odam telefon olmoqchi bo'lsa Malika bozoriga boradi → mashshoqlarga (firibgarlarga)
uchraydi, butun bozorni aylanib chiqadi, ko'p vaqt yo'qotadi.

**Yechim:** Mijoz ilovaga kiradi → kerakli telefonni qidiradi → har bir do'konning **narxi va
joylashuvini** ko'radi → eng qulay do'konga to'g'ridan-to'g'ri boradi.
Natija: aldanmaydi, vaqt tejaydi.

---

## 2. Texnologiyalar

| Qatlam        | Texnologiya                          |
|---------------|--------------------------------------|
| Framework     | Next.js 16 (App Router) — PWA        |
| Til           | TypeScript                           |
| UI            | Tailwind CSS v4                      |
| Ma'lumotlar   | MongoDB + Mongoose                   |
| Auth          | JWT (jose) + cookie sessiya          |
| Parol         | bcryptjs (hash)                      |
| Validatsiya   | Zod                                  |
| Joylashuv     | Blok+qator yozuvi + xarita + navigator (Yandex/Google Maps link) |

---

## 3. Foydalanuvchi rollari (3 ta)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   MIJOZ     │     │  DO'KON EGASI │     │    ADMIN    │
│ (ro'yxatsiz)│     │  (kabinet)    │     │  (panel)    │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ qidiradi    │     │ telefon qo'sh.│     │ do'kon tasdiq│
│ narx ko'rad.│     │ narx yangilash│     │ moderatsiya  │
│ solishtirad.│     │ o'z e'lonlari │     │ statistika   │
│ aloqa qiladi│     │ rasm yuklash  │     │ hammasi      │
└─────────────┘     └──────────────┘     └─────────────┘
```

---

## 4. Ma'lumotlar modeli (MongoDB)

### User (foydalanuvchi)
```
_id, ism, telefon (login), parolHash,
rol: 'admin' | 'shop',
shopId (do'kon egasi uchun),
createdAt
```

### Shop (do'kon)
```
_id, nomi, egasiId,
joylashuv: { blok, qator, dokonRaqami },
geo: { lat, lng },          ← xarita + navigator uchun
telefon, telegram,
ish_vaqti,
holati: 'kutilmoqda' | 'tasdiqlangan' | 'bloklangan',
reyting, createdAt
```

### Listing (e'lon / telefon)
```
_id, shopId,
brend: 'Apple' | 'Samsung' | 'Xiaomi' ...,
model: 'iPhone 15 Pro',
xotira: '256GB', rang,
holati: 'yangi' | 'ishlatilgan',
narx (so'm), valyuta,
rasmlar: [url],
tavsif, bor_yoqligi (inStock),
createdAt, updatedAt
```

**Bog'lanish:** `Listing.shopId → Shop`, `Shop.egasiId → User`

---

## 5. Sahifalar tuzilishi (Routes)

```
/                       Bosh sahifa: qidiruv + filtr + natijalar
/qidiruv?q=...          Qidiruv natijalari (filtrlar bilan)
/telefon/[id]           Bitta model → barcha do'kon narxlari (SOLISHTIRISH)
/dokon/[id]             Do'kon sahifasi: joylashuv, xarita, aloqa, e'lonlari

  --- Auth ---
/kirish                 Login (do'kon egasi / admin)
/royxat                 Do'kon ro'yxatdan o'tishi

  --- Do'kon kabineti ---
/kabinet                Dashboard
/kabinet/elonlar        E'lonlarim (CRUD)
/kabinet/elon/yangi     Yangi telefon qo'shish
/kabinet/sozlama        Do'kon ma'lumotlari, joylashuv

  --- Admin panel ---
/admin                  Statistika
/admin/dokonlar         Do'konlarni tasdiqlash/bloklash
/admin/elonlar          Barcha e'lonlar moderatsiyasi
/admin/foydalanuvchilar Foydalanuvchilar
```

---

## 6. API (Route Handlers)

```
POST  /api/auth/royxat        Do'kon ro'yxatdan o'tishi
POST  /api/auth/kirish        Login → JWT cookie
POST  /api/auth/chiqish       Logout

GET   /api/listings           Qidiruv + filtr (brend, narx, holat, blok)
POST  /api/listings           Yangi e'lon (do'kon)
GET   /api/listings/[id]      Bitta e'lon
PATCH /api/listings/[id]      Tahrirlash (egasi/admin)
DELETE/api/listings/[id]      O'chirish

GET   /api/shops              Do'konlar ro'yxati
GET   /api/shops/[id]         Bitta do'kon + e'lonlari
PATCH /api/shops/[id]         Tasdiqlash/bloklash (admin)

GET   /api/models?q=...       Model bo'yicha narx solishtirish
```

---

## 7. Asosiy oqimlar (User Flows)

### Mijoz oqimi (eng muhim)
```
Bosh sahifa
   │ "iPhone 15" deb qidiradi
   ▼
Natijalar ro'yxati (eng arzon → qimmat)
   │ modelni tanlaydi
   ▼
Telefon sahifasi → 5 ta do'kon, narxlari yonma-yon
   │ eng qulayini tanlaydi
   ▼
Do'kon sahifasi → blok+qator, XARITA, "Yo'l ko'rsat" tugmasi, qo'ng'iroq
```

### Do'kon egasi oqimi
```
Ro'yxatdan o'tadi → admin tasdiqlaydi → kabinetga kiradi
   → telefon qo'shadi (rasm, narx) → e'lon jonli ko'rinadi
```

---

## 8. PWA (telefonga o'rnatish)

- `app/manifest.ts` — ilova nomi, ikonka, ranglar
- Service worker — offline keshlash
- "Bosh ekranga qo'shish" — brauzerdan o'rnatiladi

---

## 9. Papka tuzilishi

```
malika-bozor/
├── src/
│   ├── lib/
│   │   ├── db.ts            MongoDB ulanish (keshlangan)
│   │   ├── auth.ts          JWT sessiya, getCurrentUser()
│   │   └── validators.ts    Zod sxemalar
│   ├── models/
│   │   ├── User.ts
│   │   ├── Shop.ts
│   │   └── Listing.ts
│   ├── components/          Qayta ishlatiluvchi UI
│   │   ├── SearchBar.tsx
│   │   ├── PhoneCard.tsx
│   │   ├── Filters.tsx
│   │   └── ShopMap.tsx
│   └── app/
│       ├── api/             Route Handlers
│       ├── (mijoz)/         Ommaviy sahifalar
│       ├── kabinet/         Do'kon kabineti
│       ├── admin/           Admin panel
│       ├── manifest.ts      PWA
│       ├── layout.tsx
│       └── page.tsx
├── .env.local              MONGODB_URI, JWT_SECRET
└── ARXITEKTURA.md          (shu fayl)
```

---

## 10. Bosqichlar (qurilish tartibi)

1. ✅ Skelet + kutubxonalar (Next.js 16, mongoose, jose, zod)
2. ⏳ DB ulanish + modellar (User, Shop, Listing)
3. ⏳ Auth (ro'yxat, kirish, JWT)
4. ⏳ API (listings, shops qidiruv + CRUD)
5. ⏳ Mijoz sahifalari (qidiruv, solishtirish, do'kon)
6. ⏳ Do'kon kabineti
7. ⏳ Admin panel
8. ⏳ PWA + dizayn sayqal
9. ⏳ Test ma'lumotlar (seed) + sinov
```
