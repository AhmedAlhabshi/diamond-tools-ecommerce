import type { Metadata } from 'next';
import { Bebas_Neue, Noto_Sans_Arabic, Roboto_Condensed } from 'next/font/google';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartProvider from '@/components/CartProvider';
import { Toaster } from "sonner";
import { Cairo } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google';

/* ================= Fonts ================= */

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
})

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-roboto-condensed',
  display: 'swap',
});

/* ================= Metadata ================= */

export const metadata: Metadata = {
  title: 'Diamond Tools',
  description: 'Industrial tools and equipment',
};


export const viewport = {
  width: "device-width",
  initialScale: 1,
};

/* ================= Types ================= */

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};


/* ================= Layout ================= */

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const dir: 'rtl' | 'ltr' = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body
        data-locale={locale}
        className={`
          ${bebas.variable}
          ${robotoCondensed.variable}
          ${locale === 'ar' ? 'font-arabic' : 'font-roboto'}
          bg-white text-slate-900 antialiased
        `}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            

            <Header />

            <main className="min-h-screen">
              {children}
            </main>

            <Footer />

            <div id="modal-root" />

            <Toaster 
              position={locale === 'ar' ? 'top-left' : 'top-right'}
              richColors 
              duration={1000}
            />

          </CartProvider>
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId="G-NYX91YHEKG" />
    </html>
  );
}