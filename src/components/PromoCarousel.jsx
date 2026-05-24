import React, { useEffect, useRef, useState } from 'react';
import httpClient from '../api/httpClient';

export default function PromoCarousel() {
  const [promos, setPromos] = useState([]);
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    httpClient.get('/promotions')
      .then((r) => setPromos(r.data?.data?.promotions || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (promos.length < 2) return;
    timerRef.current = setInterval(() => setActive((a) => (a + 1) % promos.length), 4000);
    return () => clearInterval(timerRef.current);
  }, [promos.length]);

  if (!promos.length) return null;

  const promo = promos[active];

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {promo.imageUrl && (
          <img src={promo.imageUrl} alt={promo.title} style={styles.img} />
        )}
        <div style={styles.overlay}>
          {promo.badge && <span style={styles.badge}>{promo.badge}</span>}
          <div style={styles.title}>{promo.title}</div>
          {promo.description && <div style={styles.desc}>{promo.description}</div>}
          {promo.promoCode && (
            <div style={styles.code}>Code: <strong>{promo.promoCode}</strong></div>
          )}
        </div>
      </div>

      {promos.length > 1 && (
        <div style={styles.dots}>
          {promos.map((_, i) => (
            <button
              key={i}
              style={{ ...styles.dot, ...(i === active ? styles.dotActive : {}) }}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { width: '100%' },
  card: {
    position: 'relative',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    height: 180,
    background: '#1a1a2e',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 },
  overlay: {
    position: 'absolute', inset: 0,
    padding: '20px 24px',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
  },
  badge: {
    display: 'inline-block',
    alignSelf: 'flex-start',
    background: 'var(--primary)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1,
    padding: '2px 8px',
    borderRadius: 999,
    marginBottom: 4,
  },
  title: { fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.3 },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  code: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  dots: { display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 999, background: 'var(--divider)', border: 'none', cursor: 'pointer', padding: 0 },
  dotActive: { width: 18, background: 'var(--primary)' },
};
