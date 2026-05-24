import { create } from 'zustand';
import httpClient from '../api/httpClient';
import { connectSocket, disconnectSocket, getSocket } from '../api/socket';
import { useProfileStore } from './profileStore';
import { notifyIncomingMessage } from '../utils/notify';

const dedupe = (messages) => {
  const seen = new Set();
  const out = [];
  for (const m of messages) {
    const key = m._id || m.clientTempId;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
};

export const useChatStore = create((set, get) => ({
  thread: null,
  messages: [],
  loading: false,
  sending: false,
  error: null,
  connected: false,
  unread: 0,
  isOpen: false,

  openChat: () => {
    set({ isOpen: true, unread: 0 });
    get().loadThread();
    get().ensureSocket();
  },
  closeChat: () => set({ isOpen: false }),

  ensureSocket: () => {
    const token = useProfileStore.getState().token;
    if (!token) return;
    const existing = getSocket();
    // Already attached — don't recreate or duplicate listeners
    if (existing) {
      set({ connected: existing.connected });
      return;
    }
    const socket = connectSocket(token);
    if (!socket) return;

    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));
    socket.on('connect_error', (err) => set({ error: err?.message || 'Connection error' }));

    socket.on('chat:message', (payload) => {
      const incoming = payload?.message;
      if (!incoming) return;
      const { isOpen, messages } = get();
      const next = dedupe([
        ...messages.map((m) =>
          m.clientTempId && m.clientTempId === payload.clientTempId
            ? { ...incoming, clientTempId: m.clientTempId }
            : m
        ),
        incoming,
      ]);
      const isAdminMessage = incoming.sender === 'admin';
      set({
        messages: next,
        thread: payload.thread || get().thread,
        unread: !isOpen && isAdminMessage ? (get().unread || 0) + 1 : get().unread,
      });

      // Ring/vibrate/notify when support replies. Skip our own echoes.
      if (isAdminMessage) {
        notifyIncomingMessage({
          title: 'Sushi Time Support',
          body: incoming.text,
          onClick: () => get().openChat(),
        });
      }
    });
  },

  loadThread: async () => {
    const token = useProfileStore.getState().token;
    if (!token) return;
    set({ loading: true, error: null });
    try {
      const res = await httpClient.get('/chat/my');
      const data = res.data?.data || {};
      set({
        thread: data.thread || null,
        messages: dedupe(data.messages || []),
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message || 'Failed to load chat' });
    }
  },

  sendMessage: async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    const token = useProfileStore.getState().token;
    if (!token) {
      set({ error: 'Please sign in to chat' });
      return;
    }

    const clientTempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const optimistic = {
      clientTempId,
      sender: 'customer',
      text: trimmed,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    set({ messages: [...get().messages, optimistic], sending: true, error: null });

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('chat:message', { text: trimmed, clientTempId }, (ack) => {
        if (!ack?.success) {
          set({
            sending: false,
            error: ack?.message || 'Failed to send',
            messages: get().messages.filter((m) => m.clientTempId !== clientTempId),
          });
        } else {
          set({ sending: false });
        }
      });
      return;
    }

    try {
      const res = await httpClient.post('/chat/my/messages', { text: trimmed, clientTempId });
      const data = res.data?.data || {};
      const serverMessage = { ...data.message, clientTempId };
      set({
        messages: dedupe([
          ...get().messages.filter((m) => m.clientTempId !== clientTempId),
          serverMessage,
        ]),
        thread: data.thread || get().thread,
        sending: false,
      });
    } catch (e) {
      set({
        sending: false,
        error: e.response?.data?.message || 'Failed to send',
        messages: get().messages.filter((m) => m.clientTempId !== clientTempId),
      });
    }
  },

  reset: () => {
    disconnectSocket();
    set({
      thread: null,
      messages: [],
      loading: false,
      sending: false,
      error: null,
      connected: false,
      unread: 0,
      isOpen: false,
    });
  },
}));
