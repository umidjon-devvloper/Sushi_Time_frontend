import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore, selectTotalItems } from '../../store/cartStore';

export default function BottomNav() {
  const { t } = useTranslation();
  const totalItems = useCartStore(selectTotalItems);

  const tabs = [
    { to: '/', icon: '🏠', label: t('home') },
    { to: '/menu', icon: '🍽️', label: t('menu') },
    { to: '/cart', icon: '🛒', label: t('cart'), badge: totalItems },
    { to: '/orders', icon: '📋', label: t('orders') },
    { to: '/profile', icon: '👤', label: t('profile') },
  ];

  return (
    <nav style={styles.nav}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          style={({ isActive }) => ({
            ...styles.tab,
            ...(isActive ? styles.tabActive : {}),
          })}
        >
          <span style={{ position: 'relative', fontSize: 22 }}>
            {tab.icon}
            {tab.badge > 0 && (
              <span style={styles.badge}>{tab.badge}</span>
            )}
          </span>
          <span style={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 'var(--bottom-nav-height)',
    background: '#fff',
    borderTop: '1px solid var(--divider)',
    display: 'flex',
    zIndex: 100,
    boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    textDecoration: 'none',
    color: 'var(--text-light)',
    fontSize: 10,
    fontWeight: 600,
    paddingBottom: 4,
  },
  tabActive: { color: 'var(--primary)' },
  label: { fontSize: 10, fontWeight: 600 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    background: 'var(--primary)',
    color: '#fff',
    fontSize: 9,
    fontWeight: 800,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
  },
};
