import type { MetadataRoute } from 'next'
import { getCatalogProducts, SITE_URL } from '@/lib/catalog-seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalogProducts()
  const locales = ['en', 'ar'] as const
  const staticPaths = ['', '/products', '/categories', '/brands', '/about', '/contact']

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : path === '/products' ? 0.9 : 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${path}`,
          ar: `${SITE_URL}/ar${path}`,
        },
      },
    })),
  )

  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/products/${product.id}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: (product.images || []).map((image) =>
        image.startsWith('http') ? image : `${SITE_URL}${image}`,
      ),
      alternates: {
        languages: {
          en: `${SITE_URL}/en/products/${product.id}`,
          ar: `${SITE_URL}/ar/products/${product.id}`,
        },
      },
    })),
  )

  return [...staticEntries, ...productEntries]
}
