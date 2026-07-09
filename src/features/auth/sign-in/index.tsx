import { useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <div className='space-y-6'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-bold tracking-tight'>Welcome back</h2>
          <p className='text-sm text-muted-foreground'>
            Sign in to your admin account to continue.
          </p>
        </div>
        <UserAuthForm redirectTo={redirect} />
      </div>
    </AuthLayout>
  )
}
