'use client'

import { useTranslations, useLocale } from 'next-intl'
import { login } from '@/app/actions/auth'
import { useState, useTransition } from 'react'
import { Link } from '@/i18n/routing'
import { useRouter } from '@/i18n/routing'

export default function LoginPage() {

  const t = useTranslations('Auth')
  const locale = useLocale()
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

function handleSubmit(formData: FormData) {
  setError(null)

  startTransition(async () => {
    const res = await login(formData)

    if (res?.error) {
      setError(res.error)
      return
    }

    router.refresh()
    router.push('/')
  })
}



  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 py-12 px-4">

      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg border">

        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          {t('login')}
        </h2>

        <form className="space-y-5" action={handleSubmit}>

          <input type="hidden" name="locale" value={locale} />

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              {t('email')}
            </label>

            <input
              name="email"
              type="email"
              required
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              {t('password')}
            </label>

            <input
              name="password"
              type="password"
              required
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50"
          >
            {isPending ? "Logging in..." : t('login')}
          </button>

        </form>

        <p className="text-center text-sm text-slate-600 font-medium">
          {t('forgot_password')}{' '}
          <Link href="/forgot-password" className="font-bold text-brand-blue">
            {t('reset_here')}
          </Link>
        </p>

        <p className="text-center text-sm text-slate-600 font-medium">
          {t('dont_have_account')}{' '}
          <Link href="/register" className="font-bold text-brand-blue">
            {t('register')}
          </Link>
        </p>

      </div>

    </div>
  )
}