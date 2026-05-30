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
    <div className="sushi-card" onClick={() => navigate(`/menu/${item._id}`)}>
      {/* Image */}
      <div className="sushi-card__img-wrap">
        {item.imageUrl ? (
          <img
            className="sushi-card__img"
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
          />
        ) : (
          <div
            className="sushi-card__img"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              background: 'var(--background)',
            }}
          >
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
            className={
              'sushi-card__add' +
              (item.isAvailable === false ? ' sushi-card__add--disabled' : '')
            }
            onClick={handleAdd}
            disabled={item.isAvailable === false}
            aria-label={t('add_to_cart') || 'Add'}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  unavailableOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 13,
  },
  info: {
    padding: '14px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
  },
  desc: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  meta: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  metaItem: { fontSize: 11, color: 'var(--text-light)', fontWeight: 500 },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 10,
  },
  priceWrap: { display: 'flex', alignItems: 'center', gap: 6 },
  price: { fontSize: 20, fontWeight: 800, color: 'var(--primary)' },
  comparePrice: {
    fontSize: 12,
    color: 'var(--text-light)',
    textDecoration: 'line-through',
  },
};
