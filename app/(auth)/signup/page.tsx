import { registerAction } from '../actions'
import { SignUpForm } from '@/components/signup-form'

export default function Page() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <SignUpForm action={registerAction} />
    </main>
  )
}
