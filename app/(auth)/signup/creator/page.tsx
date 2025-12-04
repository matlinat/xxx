import { registerCreatorAction } from '../../actions'
import { SignUpCreatorForm } from '@/components/(auth)/signup-creator-form'

export default function CreatorSignUpPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <SignUpCreatorForm action={registerCreatorAction} />
    </main>
  )
}
