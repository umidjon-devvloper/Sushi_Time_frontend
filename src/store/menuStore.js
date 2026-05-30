import { create } from 'zustand';
import httpClient from '../api/httpClient';

export const useMenuStore = create((set, get) => ({
  items: [],
  categories: ['All'],
  selectedCategory: null,
  loading: false,
  error: null,

  loadMenu: async (category) => {
    set({ loading: true, error: null });
    try {
      const params = { limit: 1000, ...(category ? { category } : {}) };
      const [itemsRes, catsRes] = await Promise.all([
        httpClient.get('/menu', { params }),
        get().categories.length <= 1
          ? httpClient.get('/menu/categories')
          : Promise.resolve(null),
      ]);
      const items = itemsRes.data?.data?.items || [];
      const cats = catsRes?.data?.data?.categories;
      set({
        items,
        loading: false,
        selectedCategory: category || null,
        ...(cats ? { categories: ['All', ...cats] } : {}),
      });
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message || 'Failed to load menu' });
    }
  },

  filterByCategory: async (category) => {
    const cat = category === 'All' ? null : category;
    set({ loading: true, error: null });
    try {
      const params = { limit: 1000, ...(cat ? { category: cat } : {}) };
      const res = await httpClient.get('/menu', { params });
      set({ items: res.data?.data?.items || [], selectedCategory: cat, loading: false });
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message || 'Failed to filter menu' });
    }
  },
}));
