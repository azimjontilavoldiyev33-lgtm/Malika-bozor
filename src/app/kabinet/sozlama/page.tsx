import { getCurrentUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import SozlamaForm, { type ShopBoshlangich } from '@/components/SozlamaForm'

export default async function SozlamaPage() {
  const user = await getCurrentUser()
  await dbConnect()
  const shopDoc = await Shop.findById(user!.shopId).lean()
  const shop = JSON.parse(JSON.stringify(shopDoc)) as ShopBoshlangich

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Do&apos;kon sozlamasi</h2>
      <SozlamaForm shop={shop} />
    </div>
  )
}
