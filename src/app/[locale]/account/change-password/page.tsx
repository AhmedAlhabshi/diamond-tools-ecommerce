'use client'

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useTranslations } from "next-intl"
import { isStrongEnoughPassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy"

export default function ChangePasswordPage() {

  const t = useTranslations("ChangePassword")

  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const supabase = createClient()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user?.email) {
      setError(t("errors.userNotFound"))
      setLoading(false)
      return
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (signInError) {
      setError(t("errors.wrongPassword"))
      setLoading(false)
      return
    }

    // Check new password match
    if (newPassword !== confirmPassword) {
      setError(t("errors.passwordMismatch"))
      setLoading(false)
      return
    }

    if (!isStrongEnoughPassword(newPassword)) {
      setError(t("errors.passwordRequirements"))
      setLoading(false)
      return
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    // Redirect
    router.push(`/${locale}/dashboard?passwordChanged=true`)
  }

  return (

    <div className="max-w-xl mx-auto py-12 px-4">

      <h1 className="text-2xl font-bold mb-6">
        {t("title")}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >

        {/* Current */}
        <div>
          <label className="block font-semibold mb-1">
            {t("current")}
          </label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
            required
          />
        </div>

        {/* New */}
        <div>
          <label className="block font-semibold mb-1">
            {t("new")}
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
            minLength={PASSWORD_MIN_LENGTH}
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
            title={t("passwordRequirements")}
            required
          />
          <p className="mt-1 text-sm text-slate-600">{t("passwordRequirements")}</p>
        </div>

        {/* Confirm */}
        <div>
          <label className="block font-semibold mb-1">
            {t("confirm")}
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
            required
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition shadow-md"
        >
          {loading ? t("updating") : t("submit")}
        </button>

      </form>

    </div>
  )
}
