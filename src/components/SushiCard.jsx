import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cartStore';

export default function SushiCard({ item }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);

  if (!item) return null;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (item.isAvailable !== false) addToCart(item);
  };

  return (
    <div style={styles.card} onClick={() => navigate(`/menu/${item._id}`)}>
      {/* Image */}
      <div style={styles.imgWrap}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} style={styles.img} loading="lazy" />
        ) : (
          <div style={{ ...styles.img, background: 'var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            🍣
          </div>
        )}
        {!item.isAvailable && (
          <div style={styles.unavailableOverlay}>{t('unavailable')}</div>
        )}
      </div>

      {/* Info */}
      <div style={styles.info}>
        <div style={styles.name}>{item.name}</div>
        {item.description && (
          <div style={styles.desc}>{item.description}</div>
        )}
        <div style={styles.meta}>
          {item.preparationTime && (
            <span style={styles.metaItem}>⏱ {item.preparationTime} {t('min_label')}</span>
          )}
          {item.calories > 0 && (
            <span style={styles.metaItem}>🔥 {item.calories} {t('cal_label')}</span>
          )}
        </div>
        <div style={styles.footer}>
          <div style={styles.priceWrap}>
            <span style={styles.price}>{item.price} ₺</span>
            {item.comparePrice && (
              <span style={styles.comparePrice}>{item.comparePrice} ₺</span>
            )}
          </div>
          <button
            style={{
              ...styles.addBtn,
              ...(item.isAvailable === false ? styles.addBtnDisabled : {}),
            }}
            onClick={handleAdd}
            disabled={item.isAvailable === false}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    display: 'flex',
    flexDirection: 'column',
  },
  imgWrap: { position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  unavailableOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 13,
    borderRadius: 0,
  },
  info: { padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  name: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 },
  desc: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  meta: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  metaItem: { fontSize: 11, color: 'var(--text-light)', fontWeight: 500 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8 },
  priceWrap: { display: 'flex', alignItems: 'center', gap: 6 },
  price: { fontSize: 17, fontWeight: 800, color: 'var(--primary)' },
  comparePrice: { fontSize: 12, color: 'var(--text-light)', textDecoration: 'line-through' },
  addBtn: {
    width: 32, height: 32,
    borderRadius: 'var(--radius-full)',
    background: 'var(--primary)',
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1,
    boxShadow: 'var(--shadow-glow)',
    flexShrink: 0,
  },
  addBtnDisabled: {
    background: 'var(--divider)',
    boxShadow: 'none',
    cursor: 'not-allowed',
    color: 'var(--text-light)',
  },
};
