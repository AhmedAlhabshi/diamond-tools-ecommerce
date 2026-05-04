import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Index');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-sans text-sm lg:flex text-slate-800">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-brand-blue">
          {t('title')}
        </h1>
        <p className="text-lg text-brand-gray">
          Professional E-Commerce Platform
        </p>
      </div>
    </main>
  );
}
