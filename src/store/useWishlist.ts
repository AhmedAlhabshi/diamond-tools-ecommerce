import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistItem = {
  id: string;
  name: string;
  image: string;
};

type WishlistStore = {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
};

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (item) => {
        const exists = get().items.find((i) => i.id === item.id);

        if (exists) {
          set({
            items: get().items.filter((i) => i.id !== item.id),
          });
        } else {
          set({
            items: [...get().items, item],
          });
        }
      },

      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id);
      },
    }),
    {
      name: "wishlist-storage",
    }
  )
);