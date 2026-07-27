'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { isStrongEnoughPassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy"

export default function ResetPasswordPage() {

  const t = useTranslations("ResetPassword")

  const [supabase] = useState(createClient)
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return

      if (!data.user) {
        router.replace(`/${locale}/forgot-password`)
        return
      }

      setSessionChecked(true)
    })

    return () => {
      active = false
    }
  }, [locale, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      setError(t("errors.mismatch"))
      return
    }

    if (!isStrongEnoughPassword(password)) {
      setError(t("errors.passwordRequirements"))
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push(`/${locale}/login`)
    }
  }

  if (!sessionChecked) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        {t("checking")}
      </div>
    )
  }

  return (

    <div className="max-w-md mx-auto py-12 px-4">

      <h1 className="text-2xl font-bold mb-6">
        {t("title")}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >

        <input
          type="password"
          placeholder={t("new")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-4 py-3 rounded-lg"
          minLength={PASSWORD_MIN_LENGTH}
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
          title={t("passwordRequirements")}
          required
        />

        <p className="text-sm text-slate-600">{t("passwordRequirements")}</p>

        <input
          type="password"
          placeholder={t("confirm")}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border px-4 py-3 rounded-lg"
          required
        />

        {error && (
          <div className="text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? t("updating") : t("submit")}
        </button>

      </form>

    </div>
  )
}
