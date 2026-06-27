# Malika Bozor — Deploy yo'riqnomasi

Ilovani internetga chiqarish: **MongoDB Atlas** (baza) + **Vercel** (hosting).
Ikkalasi ham bepul tarif bilan ishlaydi.

---

## 1-qadam: MongoDB Atlas (bulutli baza)

1. [cloud.mongodb.com](https://cloud.mongodb.com) da bepul ro'yxatdan o'ting
2. **Create → Cluster** → **M0 (Free)** tanlang → yarating
3. **Database Access** → **Add New Database User**:
   - foydalanuvchi nomi va parol kiriting (eslab qoling)
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
   - (Vercel server IP'lari o'zgaruvchan bo'lgani uchun)
5. **Database → Connect → Drivers** → ulanish manzilini nusxa oling:
   ```
   mongodb+srv://USER:PAROL@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
   Oxiriga baza nomini qo'shing: `.../malika-bozor?retryWrites=...`

---

## 2-qadam: Kodni GitHub'ga yuklash

```bash
cd C:\Users\user\Desktop\malika-bozor
git add -A
git commit -m "Malika Bozor — deploy uchun tayyor"
```

So'ng [github.com](https://github.com) da yangi (bo'sh) repozitoriy oching va:

```bash
git remote add origin https://github.com/FOYDALANUVCHI/malika-bozor.git
git branch -M main
git push -u origin main
```

---

## 3-qadam: Vercel (hosting)

1. [vercel.com](https://vercel.com) ga GitHub akkaunti bilan kiring
2. **Add New → Project** → malika-bozor repozitoriyni **Import** qiling
3. **Environment Variables** bo'limiga quyidagilarni qo'shing:

   | Nomi | Qiymati |
   |------|---------|
   | `MONGODB_URI` | Atlas ulanish manzili (1-qadam) |
   | `JWT_SECRET` | uzun tasodifiy maxfiy kalit |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | (rasm uchun, ixtiyoriy) |
   | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | (rasm uchun, ixtiyoriy) |
   | `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | (xarita uchun, ixtiyoriy) |

4. **Deploy** ni bosing → 1-2 daqiqada tayyor!

---

## 4-qadam: Admin va test ma'lumotlar (bir marta)

Atlas bazasi bo'sh bo'ladi. Admin va boshlang'ich ma'lumotlarni yaratish uchun
lokal kompyuterda `.env.local` dagi `MONGODB_URI` ni **Atlas manziliga** o'zgartiring va:

```bash
npm run seed
```

> ⚠️ `seed` eski ma'lumotlarni o'chiradi. Faqat boshlang'ich to'ldirish uchun ishlating.
> Keyin `.env.local` ni lokal MongoDB'ga qaytarib qo'ysangiz bo'ladi.

Admin login: `900000000` / `admin123` (keyin parolni o'zgartiring).

---

## Yangilanish

Har safar `git push` qilganingizda Vercel avtomatik qayta deploy qiladi.
