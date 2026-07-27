'use client'

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function ForgotPasswordPage() {

  const t = useTranslations("ForgotPassword")

  const supabase = createClient()
  const params = useParams()
  const locale = params.locale as string

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setMessage("")
    setLoading(true)

    const redirectTo =
      `${window.location.origin}/${locale}/auth/callback?next=/${locale}/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage(t("success"))
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
          type="email"
          placeholder={t("placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-4 py-3 rounded-lg"
          required
        />

        {error && (
          <div className="text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="text-green-600">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? t("sending") : t("submit")}
        </button>

      </form>

    </div>
  )
}
