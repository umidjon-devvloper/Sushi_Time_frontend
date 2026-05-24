import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chatStore';
import { useProfileStore } from '../store/profileStore';
import { requestNotificationPermission, unlockAudio } from '../utils/notify';

export default function ChatWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn } = useProfileStore();
  const {
    isOpen, openChat, closeChat,
    messages, loading, sending, connected, unread, error,
    sendMessage, ensureSocket,
  } = useChatStore();

  const [text, setText] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-connect socket when user is logged in (to receive admin messages in background)
  useEffect(() => {
    if (isLoggedIn) ensureSocket();
  }, [isLoggedIn]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleOpen = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    // First user gesture — unlock audio context for future dings + ask permission
    unlockAudio();
    requestNotificationPermission();
    openChat();
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    sendMessage(text);
    setText('');
  };

  return (
    <>
      <button
        style={{
          ...styles.fab,
          ...(isOpen ? styles.fabActive : {}),
        }}
        onClick={isOpen ? closeChat : handleOpen}
        aria-label={t('chat_support')}
        title={t('chat_support')}
      >
        <span style={{ fontSize: 26 }}>{isOpen ? '✕' : '💬'}</span>
        {!isOpen && unread > 0 && (
          <span style={styles.fabBadge}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {isOpen && (
        <div style={styles.window}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>🍣</div>
              <div>
                <div style={styles.headerTitle}>{t('chat_support')}</div>
                <div style={styles.headerSub}>
                  <span
                    style={{
                      ...styles.statusDot,
                      background: connected ? '#22c55e' : '#9ca3af',
                    }}
                  />
                  {connected ? t('chat_online') : t('chat_offline')}
                </div>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={closeChat} aria-label="close">✕</button>
          </div>

          <div ref={listRef} style={styles.messages}>
            {loading && messages.length === 0 ? (
              <div style={styles.loading}>{t('loading') || 'Loading...'}</div>
            ) : messages.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
                <div style={styles.emptyTitle}>{t('chat_empty_title')}</div>
                <div style={styles.emptySub}>{t('chat_empty_sub')}</div>
              </div>
            ) : (
              messages.map((m, i) => {
                const isMine = m.sender === 'customer';
                return (
                  <div
                    key={m._id || m.clientTempId || i}
                    style={{
                      ...styles.bubbleRow,
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        ...styles.bubble,
                        ...(isMine ? styles.bubbleMine : styles.bubbleTheirs),
                        opacity: m.pending ? 0.6 : 1,
                      }}
                    >
                      <div style={styles.bubbleText}>{m.text}</div>
                      <div style={styles.bubbleTime}>
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {error && <div style={styles.errorBar}>{error}</div>}

          <form onSubmit={handleSend} style={styles.inputBar}>
            <input
              ref={inputRef}
              style={styles.input}
              placeholder={t('chat_placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
            />
            <button
              type="submit"
              style={{
                ...styles.sendBtn,
                opacity: !text.trim() || sending ? 0.5 : 1,
                cursor: !text.trim() || sending ? 'not-allowed' : 'pointer',
              }}
              disabled={!text.trim() || sending}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: 'calc(var(--bottom-nav-height, 0px) + 20px)',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s, background 0.15s',
  },
  fabActive: { background: '#374151' },
  fabBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    padding: '0 5px',
    borderRadius: 999,
    background: '#fff',
    color: 'var(--primary)',
    fontSize: 11,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--primary)',
  },
  window: {
    position: 'fixed',
    bottom: 'calc(var(--bottom-nav-height, 0px) + 90px)',
    right: 20,
    width: 360,
    maxWidth: 'calc(100vw - 32px)',
    height: 520,
    maxHeight: 'calc(100vh - 140px)',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 199,
    border: '1px solid var(--divider)',
  },
  header: {
    padding: '12px 14px',
    background: 'linear-gradient(135deg, var(--primary) 0%, #ff6b35 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
  },
  headerTitle: { fontSize: 15, fontWeight: 800 },
  headerSub: {
    fontSize: 11, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 5,
    marginTop: 2,
  },
  statusDot: { width: 7, height: 7, borderRadius: '50%' },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none', color: '#fff',
    width: 28, height: 28, borderRadius: '50%',
    cursor: 'pointer', fontSize: 12, fontWeight: 700,
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: 14,
    display: 'flex', flexDirection: 'column', gap: 8,
    background: 'var(--background, #f7f7f7)',
  },
  loading: { textAlign: 'center', padding: 20, color: 'var(--text-secondary)' },
  empty: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20,
  },
  emptyTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  emptySub: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 },
  bubbleRow: { display: 'flex' },
  bubble: {
    maxWidth: '78%',
    padding: '8px 12px',
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
  bubbleMine: {
    background: 'var(--primary)',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    background: '#fff',
    color: 'var(--text-primary)',
    border: '1px solid var(--divider)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { whiteSpace: 'pre-wrap' },
  bubbleTime: {
    fontSize: 10, opacity: 0.7, marginTop: 3, textAlign: 'right',
  },
  errorBar: {
    background: '#fee2e2', color: '#b91c1c',
    fontSize: 12, padding: '6px 12px', textAlign: 'center',
  },
  inputBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: 10, borderTop: '1px solid var(--divider)', background: '#fff',
  },
  input: {
    flex: 1, border: '1px solid var(--divider)', borderRadius: 999,
    padding: '10px 14px', fontSize: 14, outline: 'none',
    color: 'var(--text-primary)', background: '#f7f7f7',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'var(--primary)', color: '#fff',
    border: 'none', fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};
