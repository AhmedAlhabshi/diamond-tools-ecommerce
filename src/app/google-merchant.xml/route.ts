import {
  absoluteUrl,
  escapeXml,
  getCatalogProducts,
  getPurchasablePrice,
  isInStock,
  plainText,
  SITE_URL,
} from '@/lib/catalog-seo'

export const revalidate = 3600

export async function GET() {
  const products = await getCatalogProducts()

  const items = products.flatMap((product) => {
    const price = getPurchasablePrice(product)
    const image = product.images?.[0]

    if (price == null || !image) return []

    const description =
      plainText(product.description_en) ||
      plainText(product.description_ar) ||
      product.name_en
    const brand = product.brand?.name

    return [`
      <item>
        <g:id>${escapeXml(product.id)}</g:id>
        <title>${escapeXml(product.name_en)}</title>
        <description>${escapeXml(description.slice(0, 5000))}</description>
        <link>${escapeXml(`${SITE_URL}/en/products/${product.id}`)}</link>
        <g:image_link>${escapeXml(absoluteUrl(image))}</g:image_link>
        <g:availability>${isInStock(product) ? 'in_stock' : 'out_of_stock'}</g:availability>
        <g:condition>new</g:condition>
        <g:price>${price.toFixed(2)} SAR</g:price>
        ${brand ? `<g:brand>${escapeXml(brand)}</g:brand>` : ''}
        ${
          product.product_code
            ? `<g:mpn>${escapeXml(product.product_code)}</g:mpn>`
            : '<g:identifier_exists>false</g:identifier_exists>'
        }
      </item>`]
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Diamond Tools Store</title>
    <link>${SITE_URL}</link>
    <description>Industrial diamond tools and equipment</description>
    ${items.join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
