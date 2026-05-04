'use client'

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function ResetPasswordPage() {

  const t = useTranslations("ResetPassword")

  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      setError(t("errors.mismatch"))
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
          required
        />

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