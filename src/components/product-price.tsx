export default function ProductPrice({
  product,
  variant,
  price: directPrice,
  size = "lg",
}: any) {

  const quoteOnly = product?.quote_only || variant?.quote_only

  if (quoteOnly) {
    return <span className="font-semibold text-blue-600">Request Quote</span>
  }

  // ✅ SAFE PRICE
  const price =
    directPrice ??
    variant?.price ??
    product?.individual_price ??
    0

  // size
  const textSize = size === "sm" ? "text-sm" : "text-[18px]"
  const iconSize = size === "sm" ? "w-5 h-5" : "w-8 h-8"

  // color
  const textColor = size === "sm" ? "text-slate-800" : "text-brand-blue"

  return (
    <span className="flex items-center justify-center">
      <span className={`flex items-center gap-1 ${textColor}`}>

        <img 
          src="/riyal.png" 
          alt="ريال" 
          className={iconSize}
        />

        <span className={`font-semibold tabular-nums tracking-tight ${textSize}`}>
          {Number(price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>

      </span>
    </span>
  )
}