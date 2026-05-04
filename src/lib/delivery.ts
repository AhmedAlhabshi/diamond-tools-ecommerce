export const FREE_DELIVERY_MINIMUM = 200
export const DELIVERY_FEE = 25

export function getDeliveryFee(subtotal: number) {
  return subtotal >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_FEE
}

export function getGrandTotal(subtotal: number) {
  return subtotal + getDeliveryFee(subtotal)
}