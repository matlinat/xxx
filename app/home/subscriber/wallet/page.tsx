import { Wallet } from "lucide-react"
import { WalletView } from "@/components/wallet/wallet-view"
import { createClient } from "@/lib/supabase/server"
import { getCachedUserRole } from "@/lib/supabase/user-cache"
import { redirect } from "next/navigation"

export default async function SubscriberWalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/home')
  }

  // Prüfe Subscriber-Rolle (gecacht innerhalb des Request-Zyklus)
  const userRole = await getCachedUserRole(user.id)

  if (userRole !== 'subscriber') {
    redirect('/home')
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="size-8 text-green-500" />
        <h1 className="text-2xl font-bold">Wallet</h1>
      </div>

      <WalletView userId={user.id} />
    </div>
  )
}

