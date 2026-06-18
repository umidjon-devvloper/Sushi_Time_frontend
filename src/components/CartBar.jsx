import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useCartStore,
  selectTotalItems,
  selectTotalPrice,
} from '../store/cartStore';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

/**
 * Floating "go to cart" bar. The cart was removed from the navbar, so this is
 * the primary way to reach checkout: it stays docked at the bottom whenever the
 * cart has items, and pops with a confirmation each time something is added.
 */
export default function CartBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const totalItems = useCartStore(selectTotalItems);
  const totalPrice = useCartStore(selectTotalPrice);
  const justAdded = useCartStore((s) => s.justAdded);
  const clearJustAdded = useCartStore((s) => s.clearJustAdded);

  const [flash, setFlash] = useState(false);

  // Briefly switch to the "added ✓" confirmation each time a product is added.
  useEffect(() => {
    if (!justAdded) return;
    setFlash(true);
    const a = setTimeout(() => setFlash(false), 2200);
    const b = setTimeout(() => clearJustAdded(), 2300);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [justAdded]);

  // Hide on the cart/checkout pages themselves and when the cart is empty.
  const hiddenRoutes = ['/cart', '/checkout', '/order-success'];
  if (totalItems === 0 || hiddenRoutes.includes(location.pathname)) return null;

  const wrapStyle = {
    ...styles.wrap,
    ...(isMobile ? styles.wrapMobile : styles.wrapDesktop),
  };

  return (
    <div style={wrapStyle}>
      <button
        style={{ ...styles.bar, ...(flash ? styles.barFlash : {}) }}
        onClick={() => navigate('/cart')}
      >
        <span style={styles.left}>
          <span style={styles.badge}>{totalItems}</span>
          <span style={styles.label}>
            {flash && justAdded ? (
              <>✓ {t('added_to_cart')}</>
            ) : (
              t('go_to_cart')
            )}
          </span>
        </span>
        <span style={styles.right}>
          <span style={styles.total}>{totalPrice.toFixed(2)} ₺</span>
          <span style={styles.arrow}>→</span>
        </span>
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    position: 'fixed',
    zIndex: 198,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  // Desktop: centered floating pill near the bottom.
  wrapDesktop: {
    left: 0,
    right: 0,
    bottom: 24,
    padding: '0 16px',
  },
  // Mobile: sits above the bottom nav and clears the chat button on the right.
  wrapMobile: {
    left: 12,
    right: 88,
    bottom: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 14px)',
  },
  bar: {
    pointerEvents: 'auto',
    width: '100%',
    maxWidth: 460,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '14px 18px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(232,24,27,0.40)',
    fontSize: 16,
    fontWeight: 700,
    transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1), background 0.2s',
  },
  barFlash: {
    background: 'var(--success)',
    transform: 'scale(1.02)',
    boxShadow: '0 10px 30px rgba(16,185,129,0.45)',
  },
  left: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  badge: {
    minWidth: 26,
    height: 26,
    padding: '0 7px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 800,
    flexShrink: 0,
  },
  label: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  right: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  total: { fontSize: 16, fontWeight: 800 },
  arrow: { fontSize: 20, fontWeight: 800 },
};
