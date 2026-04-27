import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShopifyProduct } from "@/lib/shopify";

export interface WishlistItem {
  id: string;          // product node id
  handle: string;
  title: string;
  image: string | null;
  price: { amount: string; currencyCode: string };
  addedAt: number;
}

interface WishlistStore {
  items: WishlistItem[];
  has: (id: string) => boolean;
  toggle: (product: ShopifyProduct) => boolean; // returns new state (true = added)
  add: (product: ShopifyProduct) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      has: (id) => get().items.some((i) => i.id === id),
      toggle: (product) => {
        const { node } = product;
        if (get().has(node.id)) {
          set({ items: get().items.filter((i) => i.id !== node.id) });
          return false;
        }
        get().add(product);
        return true;
      },
      add: (product) => {
        const { node } = product;
        if (get().has(node.id)) return;
        const image = node.images.edges[0]?.node?.url ?? null;
        const price = node.priceRange.minVariantPrice;
        set({
          items: [
            {
              id: node.id,
              handle: node.handle,
              title: node.title,
              image,
              price: { amount: price.amount, currencyCode: price.currencyCode },
              addedAt: Date.now(),
            },
            ...get().items,
          ],
        });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "wajose-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
