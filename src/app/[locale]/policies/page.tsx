import type { Metadata } from 'next'
import { ArrowUpRight, FileText, MessageSquareText, RefreshCcw, ShieldCheck, Truck } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { getPolicies, POLICY_SLUGS } from '@/lib/policies'

type Props = { params: Promise<{ locale: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'ar' ? 'سياسات المتجر | Diamond Tools' : 'Store Policies | Diamond Tools',
    description: locale === 'ar' ? 'سياسات الاسترجاع والشحن والخصوصية والشروط والشكاوى لمتجر Diamond Tools.' : 'Returns, shipping, privacy, terms and complaints policies for Diamond Tools.',
  }
}
const icons = { rotate: RefreshCcw, truck: Truck, shield: ShieldCheck, file: FileText, message: MessageSquareText }

export default async function PoliciesPage({ params }: Props) {
  const { locale } = await params
  const isArabic = locale === 'ar'
  const policies = getPolicies(locale)
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />{isArabic ? 'وضوح يحفظ حقك' : 'Clarity that protects you'}
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              {isArabic ? 'سياسات واضحة. تجربة شراء مطمئنة.' : 'Clear policies. Confident purchasing.'}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {isArabic ? 'جمعنا هنا كل ما تحتاج معرفته عن الطلب والشحن والاسترجاع والخصوصية، بلغة مباشرة وسهلة.' : 'Everything you need to know about orders, delivery, returns and privacy—in plain, practical language.'}
            </p>
            <p className="mt-6 text-sm text-slate-400">{isArabic ? 'آخر تحديث: أغسطس 2026' : 'Last updated: August 2026'}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {POLICY_SLUGS.map((slug, index) => {
            const policy = policies[slug]
            const Icon = icons[policy.icon]
            return (
              <Link key={slug} href={`/policies/${slug}`} className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${index === 0 ? 'md:col-span-2 xl:col-span-1' : ''}`}>
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${policy.accent}`} />
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${policy.accent} text-white shadow-lg`}><Icon className="h-6 w-6" /></div>
                  <ArrowUpRight className={`h-5 w-5 text-slate-300 transition group-hover:text-blue-600 ${isArabic ? '-rotate-90' : ''}`} />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-slate-950">{policy.shortTitle}</h2>
                <p className="mt-3 min-h-14 text-sm leading-7 text-slate-600">{policy.summary}</p>
                <div className="mt-6 flex flex-wrap gap-2">{policy.highlights.slice(0, 2).map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">{item}</span>)}</div>
              </Link>
            )
          })}
        </div>
        <div className="mt-10 overflow-hidden rounded-3xl bg-blue-600 px-6 py-8 text-white shadow-xl md:flex md:items-center md:justify-between md:px-10">
          <div><h2 className="text-3xl font-bold">{isArabic ? 'ما زال عندك سؤال؟' : 'Still have a question?'}</h2><p className="mt-2 text-blue-100">{isArabic ? 'فريقنا يساعدك في فهم أي بند قبل إتمام الطلب.' : 'Our team can clarify any policy before you place an order.'}</p></div>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 md:mt-0">{isArabic ? 'تواصل معنا' : 'Contact us'}<ArrowUpRight className={`h-4 w-4 ${isArabic ? '-rotate-90' : ''}`} /></Link>
        </div>
      </section>
    </main>
  )
}
