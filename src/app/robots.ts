import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/catalog-seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/ar/admin/',
        '/en/admin/',
        '/ar/account/',
        '/en/account/',
        '/ar/cart',
        '/en/cart',
        '/ar/checkout',
        '/en/checkout',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
