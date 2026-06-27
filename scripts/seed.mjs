// Test ma'lumotlarni yaratish skripti
// Ishga tushirish: npm run seed
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI topilmadi. .env.local ni tekshiring.')
  process.exit(1)
}

// --- Modellar (asosiy sxemalar bilan mos) ---
const User = mongoose.model(
  'User',
  new mongoose.Schema(
    {
      ism: String,
      telefon: { type: String, unique: true },
      parolHash: String,
      rol: { type: String, default: 'shop' },
      shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    },
    { timestamps: true },
  ),
)

const Shop = mongoose.model(
  'Shop',
  new mongoose.Schema(
    {
      nomi: String,
      egasiId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joylashuv: { blok: String, qator: String, dokonRaqami: String },
      geo: { lat: Number, lng: Number },
      telefon: String,
      telegram: String,
      ishVaqti: String,
      holati: { type: String, default: 'tasdiqlangan' },
      reyting: { type: Number, default: 0 },
    },
    { timestamps: true },
  ),
)

const Listing = mongoose.model(
  'Listing',
  new mongoose.Schema(
    {
      shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
      brend: String,
      model: String,
      xotira: String,
      rang: String,
      holati: { type: String, default: 'yangi' },
      narx: Number,
      valyuta: { type: String, default: 'UZS' },
      rasmlar: [String],
      tavsif: String,
      bor: { type: Boolean, default: true },
      faol: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
)

// Malika bozori atrofidagi taxminiy koordinatalar (Toshkent)
const dokonlar = [
  {
    nomi: 'Aziz Mobile',
    blok: 'A',
    qator: '1',
    dokon: '5',
    geo: { lat: 41.2745, lng: 69.2035 },
    telefon: '+998901112233',
  },
  {
    nomi: 'Tech Store',
    blok: 'B',
    qator: '3',
    dokon: '12',
    geo: { lat: 41.275, lng: 69.204 },
    telefon: '+998902223344',
  },
  {
    nomi: 'Smart Phone',
    blok: 'B',
    qator: '5',
    dokon: '8',
    geo: { lat: 41.2742, lng: 69.2048 },
    telefon: '+998903334455',
  },
  {
    nomi: 'Mobil Dunyo',
    blok: 'C',
    qator: '2',
    dokon: '20',
    geo: { lat: 41.2738, lng: 69.2052 },
    telefon: '+998904445566',
  },
]

// Har do'konga tarqatiladigan modellar (narxlar har xil)
const modellar = [
  { brend: 'Apple', model: 'iPhone 15 Pro', xotira: '256GB', asos: 14500000 },
  { brend: 'Apple', model: 'iPhone 14', xotira: '128GB', asos: 9500000 },
  { brend: 'Samsung', model: 'Galaxy S24 Ultra', xotira: '512GB', asos: 16000000 },
  { brend: 'Samsung', model: 'Galaxy A55', xotira: '256GB', asos: 5200000 },
  { brend: 'Xiaomi', model: 'Redmi Note 13 Pro', xotira: '256GB', asos: 3500000 },
  { brend: 'Xiaomi', model: '14T Pro', xotira: '512GB', asos: 7800000 },
]

const ranglar = ['Qora', 'Oq', 'Ko\'k', 'Kulrang']

async function main() {
  await mongoose.connect(MONGODB_URI)
  console.log('MongoDB ulandi')

  await Promise.all([
    User.deleteMany({}),
    Shop.deleteMany({}),
    Listing.deleteMany({}),
  ])
  console.log('Eski ma\'lumotlar tozalandi')

  // Admin
  const adminParol = await bcrypt.hash('admin123', 10)
  await User.create({
    ism: 'Admin',
    telefon: '+998900000000',
    parolHash: adminParol,
    rol: 'admin',
  })
  console.log('Admin yaratildi → telefon: 900000000 | parol: admin123')

  // Do'konlar + egalari
  const shopIds = []
  for (let i = 0; i < dokonlar.length; i++) {
    const d = dokonlar[i]
    const parolHash = await bcrypt.hash('dokon123', 10)
    const user = await User.create({
      ism: d.nomi + ' egasi',
      telefon: `+99890111000${i}`,
      parolHash,
      rol: 'shop',
    })
    const shop = await Shop.create({
      nomi: d.nomi,
      egasiId: user._id,
      joylashuv: { blok: d.blok, qator: d.qator, dokonRaqami: d.dokon },
      geo: d.geo,
      telefon: d.telefon,
      ishVaqti: '09:00 - 19:00',
      holati: 'tasdiqlangan',
      reyting: 4 + Math.random(),
    })
    user.shopId = shop._id
    await user.save()
    shopIds.push(shop._id)
  }
  console.log(`${shopIds.length} ta do'kon yaratildi (login: 901110000..3 | parol: dokon123)`)

  // E'lonlar — har do'kon har modelni biroz boshqa narxda sotadi
  let elonSoni = 0
  for (let s = 0; s < shopIds.length; s++) {
    for (const m of modellar) {
      // ba'zi do'konlar ba'zi modellarni sotmaydi
      if (Math.random() < 0.25) continue
      const ozgarish = Math.round((Math.random() - 0.4) * m.asos * 0.08)
      await Listing.create({
        shopId: shopIds[s],
        brend: m.brend,
        model: m.model,
        xotira: m.xotira,
        rang: ranglar[Math.floor(Math.random() * ranglar.length)],
        holati: Math.random() < 0.8 ? 'yangi' : 'ishlatilgan',
        narx: m.asos + ozgarish,
        valyuta: 'UZS',
        rasmlar: [],
        bor: true,
        faol: true,
      })
      elonSoni++
    }
  }
  console.log(`${elonSoni} ta e'lon yaratildi`)

  await mongoose.disconnect()
  console.log('Tayyor! ✅')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
