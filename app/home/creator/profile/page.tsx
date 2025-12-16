import { UserCircle } from "lucide-react"
import { ProfileEditForm } from "@/components/creator-profile/profile-edit-form"
import { getCreatorProfileAction } from "@/app/(auth)/actions"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function CreatorProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/home')
  }

  // Prüfe Creator-Rolle
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (profile?.role !== 'creator') {
    redirect('/home')
  }

  // Lade vorhandenes Profil
  const result = await getCreatorProfileAction()
  const initialData = result.data || null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <UserCircle className="size-8 text-purple-500" />
        <h1 className="text-2xl font-bold">Profil bearbeiten</h1>
      </div>

      <ProfileEditForm initialData={initialData} />
    </div>
  )
}
