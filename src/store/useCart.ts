import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string

  product_id: string
  product_code?: string | null

  variant_id?: string
  variant_code?: string | null

  name: string
  image?: string

  price: number
  quantity: number

  diameter?: string
  thickness?: string
  width?: string
  hole_size?: string
  grit?: string
  length?: string
  machine?: string
  stand?: string

  material_name_en?: string
  material_name_ar?: string

  quality_name_en?: string
  quality_name_ar?: string
}

interface CartState {
  items: CartItem[]

  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {

          // ✅ Generate UNIQUE ID
          const itemId = item.variant_id
            ? `${item.product_id}-${item.variant_id}`
            : `${item.product_id}-default`

          const existing = state.items.find((i) => i.id === itemId)

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === itemId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                id: itemId, // ✅ assign ID
              },
            ],
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + item.price * item.quantity
        }, 0)
      },
    }),
    {
      name: 'diamond-tools-cart',
    }
  )
)