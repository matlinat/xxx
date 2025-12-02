import { registerSubscriberAction } from '../../actions'
import { SignUpSubscriberForm } from '@/components/(auth)/signup-subscriber-form'

export default function SubscriberSignUpPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <SignUpSubscriberForm action={registerSubscriberAction} />
    </main>
  )
}

