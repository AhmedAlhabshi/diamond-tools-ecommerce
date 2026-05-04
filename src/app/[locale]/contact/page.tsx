'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Phone, Mail } from 'lucide-react'
import Branches from "@/components/Branches"

export default function ContactPage() {

  const t = useTranslations('contact')

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        setSuccess(true)
        setForm({
          name: '',
          email: '',
          message: ''
        })
      }

    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-500">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-16">

        {/* Contact Form */}
        <form 
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-2xl shadow"
        >

          <div>
            <label className="block mb-2 font-medium">
              {t("name")}
            </label>
            <input
              type="text"
              value={form.name}
              className="w-full border rounded-lg p-3"
              placeholder={t("namePlaceholder")}
              onChange={(e)=>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              {t("email")}
            </label>
            <input
              type="email"
              value={form.email}
              className="w-full border rounded-lg p-3"
              placeholder={t("emailPlaceholder")}
              onChange={(e)=>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              {t("message")}
            </label>
            <textarea
              rows={5}
              value={form.message}
              className="w-full border rounded-lg p-3"
              placeholder={t("messagePlaceholder")}
              onChange={(e)=>
                setForm({ ...form, message: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? t("sending") : t("send")}
          </button>

          {success && (
            <p className="text-green-600 text-center">
              {t("success")}
            </p>
          )}

        </form>

        {/* Contact Info */}
        <div className="space-y-6">

          <div className="flex items-center gap-4">
            <Phone className="text-blue-600" />
            <div>
              <p className="font-semibold">{t("phone")}</p>
<p className="text-gray-500">
  <span dir="ltr" className="inline-block">
    +966 546010202
  </span>
</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Mail className="text-blue-600" />
            <div>
              <p className="font-semibold">{t("emailLabel")}</p>
              <p className="text-gray-500">
                info@diamondtools-est.com
              </p>
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href="https://wa.me/966546010202"
            target="_blank"
            className="block bg-green-500 text-white text-center py-3 rounded-lg hover:bg-green-600"
          >
            {t("whatsapp")}
          </a>

        </div>

      </div>

      {/* Branches */}
      <div className="mt-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          {t("branches")}
        </h2>

        <Branches/>
      </div>

    </div>
  )
}