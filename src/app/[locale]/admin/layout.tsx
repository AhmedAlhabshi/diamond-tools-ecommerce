import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'

import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Box, 
  FileText,
  LogOut,
  Building
} from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()

  // 🔒 حماية
  if (!user) {
    redirect(`/${locale}/login`)
  }

  // 🚨 (اختياري لاحقاً) تحقق admin role
  if (user.email !== "admin@diamondtools-est.com") redirect("/")

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-slate-900 hidden md:flex flex-col justify-between">

        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-8">
            Admin Panel
          </h2>

          <nav className="space-y-4">

            <Link href="/admin" className="flex items-center gap-3 text-slate-300 hover:text-white">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>

            <Link href="/admin/orders" className="flex items-center gap-3 text-slate-300 hover:text-white">
              <ShoppingCart size={20} />
              <span>Orders</span>
            </Link>

            <Link href="/admin/products" className="flex items-center gap-3 text-slate-300 hover:text-white">
              <Package size={20} />
              <span>Products</span>
            </Link>

            <Link href="/admin/categories" className="flex items-center gap-3 text-slate-300 hover:text-white">
              <Box size={20} />
              <span>Categories</span>
            </Link>

            <Link href="/admin/brands" className="flex items-center gap-3 text-slate-300 hover:text-white">
              <Building size={20} />
              <span>Brands</span>
            </Link>

            <Link href="/admin/quotes" className="flex items-center gap-3 text-slate-300 hover:text-white">
              <FileText size={20} />
              <span>Quotes</span>
            </Link>

          </nav>
        </div>

        {/* ================= LOGOUT ================= */}
        <div className="p-6 border-t border-slate-700">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 text-red-400 hover:text-red-500">
              <LogOut size={20} />
              Logout
            </button>
          </form>
        </div>

      </aside>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  )
}