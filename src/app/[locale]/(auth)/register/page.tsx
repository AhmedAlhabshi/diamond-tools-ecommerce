'use client'

import { useTranslations, useLocale } from 'next-intl'
import { signupIndividual } from '@/app/actions/auth'
import { useState, useTransition } from 'react'
import { Link } from '@/i18n/routing'

export default function RegisterPage() {

  const t = useTranslations('Auth')
  const locale = useLocale()

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleIndividual(formData: FormData) {

    startTransition(async () => {
      const res = await signupIndividual(formData)
      if (res?.error) setError(res.error)
    })
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4">

      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-10 border">

        <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
          {t('register')}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form action={handleIndividual} className="space-y-5">

          <input type="hidden" name="locale" value={locale} />

          <div className="grid md:grid-cols-2 gap-4">

            <Input label={t('name')} name="name" />
            <Input label={t('email')} name="email" type="email" />
            <Input label={t('phone')} name="phone" />
            <Input label={t('password')} name="password" type="password" />

          </div>

          <SubmitButton text={isPending ? "Creating..." : t('register')} />

        </form>

        <div className="text-center mt-6 text-slate-600">
          {t('already_have_account')}{" "}
          <Link
            href="/login"
            className="font-bold text-brand-blue"
          >
            {t('login')}
          </Link>
        </div>

      </div>

    </div>

  )
}

function Input({ label, name, type = "text" }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2">
        {label}
      </label>

      <input
        name={name}
        type={type}
        required
        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
      />
    </div>
  )
}

function SubmitButton({ text }: any) {
  return (
    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg"
    >
      {text}
    </button>
  )
}