import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, FileText, Mail, MessageSquareText, Phone, RefreshCcw, ShieldCheck, Truck } from 'lucide-react'
import Link from 'next/link'
import { getPolicies, getPolicy, POLICY_SLUGS } from '@/lib/policies'

type Props = { params: Promise<{ locale: string; slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const policy = getPolicy(locale, slug)
  return policy ? { title: `${policy.title} | Diamond Tools`, description: policy.summary } : {}
}
export const dynamicParams = false
export function generateStaticParams() {
  return ['ar', 'en'].flatMap((locale) => POLICY_SLUGS.map((slug) => ({ locale, slug })))
}
const icons = { rotate: RefreshCcw, truck: Truck, shield: ShieldCheck, file: FileText, message: MessageSquareText }

export default async function PolicyDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const isArabic = locale === 'ar'
  const policy = getPolicy(locale, slug)
  if (!policy) notFound()
  const policies = getPolicies(locale)
  const Icon = icons[policy.icon]
  const BackIcon = isArabic ? ArrowRight : ArrowLeft
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${policy.accent} opacity-15`} />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <Link href={`/${locale}/policies`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"><BackIcon className="h-4 w-4" />{isArabic ? 'العودة إلى مركز السياسات' : 'Back to policy centre'}</Link>
          <div className="mt-8 flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-center">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${policy.accent} shadow-2xl`}><Icon className="h-8 w-8" /></div>
            <div><h1 className="text-3xl font-bold leading-tight sm:text-5xl">{policy.title}</h1><p className="mt-3 max-w-3xl leading-7 text-slate-300">{policy.summary}</p></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">{policy.highlights.map((item) => <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-100 backdrop-blur"><Check className="h-3.5 w-3.5 text-emerald-400" />{item}</span>)}</div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:py-14">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
          <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">{isArabic ? 'كل السياسات' : 'All policies'}</p>
          <nav className="space-y-1">{POLICY_SLUGS.map((itemSlug) => {
            const item = policies[itemSlug]; const ItemIcon = icons[item.icon]; const active = itemSlug === policy.slug
            return <Link key={itemSlug} href={`/${locale}/policies/${itemSlug}`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><ItemIcon className="h-4 w-4 shrink-0" />{item.shortTitle}</Link>
          })}</nav>
        </aside>

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5 sm:px-10"><p className="text-sm text-slate-500">{isArabic ? 'آخر تحديث: أغسطس 2026' : 'Last updated: August 2026'}</p></div>
          <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-12">{policy.sections.map((section, index) => (
            <section key={section.title} className="border-b border-slate-100 pb-10 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${policy.accent} text-sm font-bold text-white shadow-md`}>{String(index + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1"><h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 leading-8 text-slate-600">{paragraph}</p>)}
                  {section.bullets && <ul className="mt-5 space-y-3">{section.bullets.map((bullet) => <li key={bullet} className="flex items-start gap-3 leading-7 text-slate-600"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" /><span>{bullet}</span></li>)}</ul>}
                </div>
              </div>
            </section>
          ))}</div>
        </article>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 rounded-3xl bg-slate-900 p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div><h2 className="text-2xl font-bold">{isArabic ? 'تحتاج مساعدة؟' : 'Need assistance?'}</h2><p className="mt-1 text-sm text-slate-400">{isArabic ? 'تواصل معنا قبل الطلب أو عند تقديم أي مطالبة.' : 'Contact us before ordering or raising a claim.'}</p></div>
          <a href="mailto:info@diamondtools-est.com" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm hover:bg-white/15"><Mail className="h-4 w-4" /> info@diamondtools-est.com</a>
          <a href="https://wa.me/966546010202" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold hover:bg-emerald-600"><Phone className="h-4 w-4" /> +966 54 601 0202</a>
        </div>
      </section>
    </main>
  )
}
