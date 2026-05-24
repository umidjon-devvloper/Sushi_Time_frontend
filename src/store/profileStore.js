import { create } from 'zustand';
import { disconnectSocket } from '../api/socket';

const STORAGE_KEY = 'sushi_time_profile';

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {}; } catch { return {}; }
};
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const defaults = { name: '', phone: '', address: '', notes: '', email: '', token: null, refreshToken: null, userId: null, isLoggedIn: false };

export const useProfileStore = create((set, get) => ({
  ...defaults,
  ...load(),
  loaded: true,

  updateProfile: (fields) => {
    const s = get();
    const patch = { name: fields.name ?? s.name, phone: fields.phone ?? s.phone, address: fields.address ?? s.address, notes: fields.notes ?? s.notes };
    set(patch);
    save({ ...get() });
  },

  setAuth: (user, token, refreshToken) => {
    const s = get();
    const patch = { name: user.name || s.name, phone: user.phone || s.phone, email: user.email || '', token, refreshToken, userId: user._id, isLoggedIn: true };
    set(patch);
    save({ ...get() });
  },

  logout: () => {
    disconnectSocket();
    set({ ...defaults, loaded: true });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
