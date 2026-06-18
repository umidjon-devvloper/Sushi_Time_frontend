import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      // Transient signal consumed by the floating cart prompt. Not persisted.
      justAdded: null,

      addToCart: (menuItem) => {
        set((state) => {
          const idx = state.items.findIndex((i) => i.menuItem._id === menuItem._id);
          const justAdded = { item: menuItem, at: Date.now() };
          if (idx >= 0) {
            const updated = [...state.items];
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
            return { items: updated, justAdded };
          }
          return { items: [...state.items, { menuItem, quantity: 1 }], justAdded };
        });
      },

      clearJustAdded: () => set({ justAdded: null }),

      removeFromCart: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.menuItem._id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItem._id === itemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'sushi_time_cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const selectTotalPrice = (state) =>
  state.items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);

export const selectTotalItems = (state) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);
