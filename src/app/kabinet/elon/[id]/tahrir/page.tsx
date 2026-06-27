import { notFound, redirect } from 'next/navigation'
import mongoose from 'mongoose'
import { getCurrentUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Listing } from '@/models/Listing'
import ElonForm, { type ElonBoshlangich } from '@/components/ElonForm'

export default async function TahrirPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) notFound()

  const user = await getCurrentUser()
  if (!user) redirect('/kirish')

  await dbConnect()
  const listing = await Listing.findById(id).lean()
  if (!listing) notFound()

  // Faqat egasi (yoki admin) tahrirlay oladi
  if (
    user.rol !== 'admin' &&
    user.shopId?.toString() !== listing.shopId.toString()
  ) {
    redirect('/kabinet/elonlar')
  }

  const boshlangich = JSON.parse(JSON.stringify(listing)) as ElonBoshlangich

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">E&apos;lonni tahrirlash</h2>
      <ElonForm boshlangich={boshlangich} />
    </div>
  )
}
