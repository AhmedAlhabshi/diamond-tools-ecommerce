import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Factory } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getProducts, getCategories, getBrands } from '@/app/actions/products';
import CategorySlider from '@/components/CategorySlider';
import HeroSection from '@/components/HeroSection';
import AuthorizedBrands from "@/components/AuthorizedBrands";
import FeaturedProducts from "@/components/FeaturedProducts";
import BestSellers from "@/components/BestSellers"

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {

  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Home');

  const [products, categories] = await Promise.all([
    getProducts({}),
    getCategories()
  ]);

  const featuredProducts = products || [];
  const featuredCategories = categories || [];

  const bestSellerProducts = featuredProducts.filter(
  (product: any) => product.best_seller
)

  return (

    <div className="flex flex-col bg-white">



      {/* Hero */}
      <HeroSection />

      

      {/* Brands */}
      <section className="py-4 bg-gray-100">
        <div className="w-full">
          <AuthorizedBrands />
        </div>
      </section>

      {/* ================= Categories ================= */}
      <section 
  className="py-6 bg-cover bg-center bg-no-repeat relative"
  style={{ backgroundImage: "url('/category-bg.jpg')" }}
>

  {/* Title فقط داخل الكونتينر */}
  <div className="relative max-w-7xl mx-auto px-3 sm:px-4">

    <div className="text-center mb-5">
      <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-white">
        {t("categoriesTitle")}
      </h2>

      <p className="text-sm sm:text-base text-gray-200">
        {t("categoriesSubtitle")}
      </p>
    </div>

  </div>

  {/* 🔥 السلايدر Full Width */}
  <div className="relative w-full">

    <CategorySlider id="catScroll" locale={locale}>

      {featuredCategories.map((cat) => (

        <Link
          key={cat.id}
          href={`/products?category=${cat.id}`}
          className="
            min-w-[170px] sm:min-w-[250px]
            bg-white 
            rounded-2xl 
            p-4 sm:p-5
            shadow-sm
            hover:shadow-md 
            transition 
            text-center
          "
        >

          {/* Image */}
          <div className="h-24 sm:h-28 flex items-center justify-center mb-2">

            {cat.image ? (
              <img
                src={cat.image}
                alt={locale === 'ar' ? cat.name_ar : cat.name_en}
                className="h-full object-contain"
              />
            ) : (
              <Factory className="w-6 h-6 text-blue-600" />
            )}

          </div>

          {/* Title */}
          <h3
            className="
              text-xs sm:text-sm md:text-base lg:text-xl
              font-normal text-slate-800
              leading-tight
              whitespace-nowrap
              overflow-hidden
              text-ellipsis
            "
            style={{ letterSpacing: "1px" }}
          >
            {locale === 'ar' ? cat.name_ar : cat.name_en}
          </h3>

        </Link>

      ))}

    </CategorySlider>

  </div>

</section>

{/* ================= Featured Products ================= */}
<section className="py-10 bg-white">

  {/* Title container */}
  <div className="max-w-7xl mx-auto px-4">

    <div className="flex w-full items-center mb-4">

      <h2 className="text-3xl font-bold">
        {t("featured")}
      </h2>

      <Link
        href="/products"
        className={`text-blue-700 font-semibold hover:underline flex items-center gap-1 ${
          locale === "ar" ? "mr-auto" : "ml-auto"
        }`}
      >
        {t("viewAll")}
      </Link>

    </div>

  </div>

  {/* Full width products */}
  <div className="w-full">
    <FeaturedProducts products={featuredProducts} />
  </div>

</section>

{/* ================= Best Seller ================= */}
{bestSellerProducts.length > 0 && (
  <section className="py-12">

    {/* Title full width */}
  {/* Title container */}
  <div className="max-w-7xl mx-auto px-4">

    <div className="flex w-full items-center mb-4">

      <h2 className="text-3xl font-bold">
        {t("bestSellers")}
      </h2>

      <Link
        href="/products"
        className={`text-blue-700 font-semibold hover:underline flex items-center gap-1 ${
          locale === "ar" ? "mr-auto" : "ml-auto"
        }`}
      >
        {t("viewAll")}
      </Link>

    </div>

  </div>

    {/* Slider */}
    <div className="w-full">
      <BestSellers products={bestSellerProducts} />
    </div>

  </section>
)}
{/* ================= Contact Banner ================= */}
<section className="bg-yellow-500 py-4 md:py-4">

  <div className="max-w-7xl mx-auto px-4 md:px-6 
  flex flex-col md:flex-row 
  items-center 
  gap-4 md:gap-6 text-center md:text-left">

  {/* TEXT */}
  <div className={`space-y-2 ${
    locale === "ar" ? "md:text-right md:ml-auto" : "md:text-left"
  }`}>

    <h2 className="text-white text-lg md:text-3xl px-2 md:px-8 py-2 md:py-3 font-semibold tracking-tight">
      {t("contactText")}
    </h2>

  </div>

  {/* BUTTON */}
  <Link
    href="/contact"
    className={`bg-black text-white 
      px-5 md:px-8 
      py-2 md:py-3 
      rounded-md 
      text-sm md:text-base
      font-semibold 
      flex items-center gap-2 
      hover:bg-gray-800 transition 
      shrink-0 ${
        locale === "ar" ? "md:mr-auto" : ""
      }`}
  >
    {t("contactBtn")}
  </Link>

</div>

</section>

    </div>
  );
}