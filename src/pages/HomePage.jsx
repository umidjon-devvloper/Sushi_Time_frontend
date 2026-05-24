import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMenuStore } from '../store/menuStore';
import PromoCarousel from '../components/PromoCarousel';
import SushiCard from '../components/SushiCard';

const CATEGORY_KEYS = {
  All: 'cat_all', rolls: 'cat_rolls', nigiri: 'cat_nigiri', sashimi: 'cat_sashimi',
  sets: 'cat_sets', tempura: 'cat_tempura', soups: 'cat_soups', drinks: 'cat_drinks',
  desserts: 'cat_desserts', salads: 'cat_salads', maki: 'cat_maki', uramaki: 'cat_uramaki',
  gunkan: 'cat_gunkan', wok: 'cat_wok', appetizers: 'cat_appetizers',
};

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, categories, loading, selectedCategory, loadMenu, filterByCategory } = useMenuStore();
  const [search, setSearch] = useState('');

  useEffect(() => { loadMenu(); }, []);

  const categoryPriority = (cat) => {
    const c = (cat || '').toLowerCase();
    if (['rolls', 'maki', 'uramaki', 'hosomaki'].includes(c)) return 0;
    if (['nigiri', 'gunkan', 'onigiri', 'sashimi'].includes(c)) return 1;
    if (['sets'].includes(c)) return 2;
    if (['tempura', 'appetizers', 'salads', 'soups', 'wok', 'noodles'].includes(c)) return 3;
    if (['pizza', 'fast_food', 'desserts'].includes(c)) return 4;
    if (['drinks'].includes(c)) return 5;
    return 3;
  };

  const filteredItems = items.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase()),
  );
  const sorted = [...filteredItems].sort(
    (a, b) => categoryPriority(a.category) - categoryPriority(b.category),
  );
  // "All" tab (no category selected) shows the full sorted menu;
  // a specific category still gets the compact Popular Picks teaser.
  const displayed = selectedCategory ? sorted.slice(0, 10) : sorted;

  return (
    <div className="page-enter" style={styles.page}>
      <div style={styles.container}>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.heroText}>
            <div style={styles.heroTitle}>{t('fresh_sushi')}</div>
            <div style={styles.heroSub}>{t('delivered_in_30')}</div>
          </div>
          <div style={styles.heroEmoji}>🍣</div>
        </div>

        {/* Promo Carousel */}
        <PromoCarousel />

        {/* Info bar */}
        <div style={styles.infoBar}>
          <div style={styles.infoItem}>🚚 <span>{t('free_delivery')}</span></div>
          <div style={styles.infoDivider} />
          <div style={styles.infoItem}>⏱ <span>25–35 min</span></div>
          <div style={styles.infoDivider} />
          <div style={styles.infoItem}>⭐ <span>4.9</span></div>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder={t('search_hint')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => navigate('/menu')}
          />
        </div>

        {/* Category filters */}
        <div style={styles.catScroll}>
          {categories.map((cat) => (
            <button
              key={cat}
              style={{
                ...styles.catBtn,
                ...(selectedCategory === (cat === 'All' ? null : cat) ? styles.catBtnActive : {}),
              }}
              onClick={() => filterByCategory(cat)}
            >
              {t(CATEGORY_KEYS[cat] || cat)}
            </button>
          ))}
        </div>

        {/* Menu (full when "All" is selected, popular picks for a single category) */}
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>
            {selectedCategory ? t('popular_picks') : t('menu')}
          </span>
          {selectedCategory && (
            <button style={styles.seeAll} onClick={() => navigate('/menu')}>
              {t('see_all')}
            </button>
          )}
        </div>

        {loading ? (
          <div style={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 280, borderRadius: 20 }} />
            ))}
          </div>
        ) : (
          <div style={styles.grid}>
            {displayed.map((item) => (
              <SushiCard key={item._id} item={item} />
            ))}
          </div>
        )}

        {!loading && displayed.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 48 }}>🍣</div>
            <div style={styles.emptyText}>{t('no_items_found')}</div>
            <div style={styles.emptySubtext}>{t('try_different')}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { flex: 1, paddingBottom: 80 },
  container: { maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 },
  hero: {
    background: 'linear-gradient(135deg, var(--primary) 0%, #ff6b35 100%)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroText: { display: 'flex', flexDirection: 'column', gap: 6 },
  heroTitle: { fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 },
  heroEmoji: { fontSize: 64 },
  infoBar: {
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    boxShadow: 'var(--shadow-sm)',
  },
  infoItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' },
  infoDivider: { width: 1, height: 16, background: 'var(--divider)' },
  searchWrap: {
    background: '#fff',
    borderRadius: 'var(--radius-full)',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--divider)',
    cursor: 'text',
  },
  searchIcon: { fontSize: 16, color: 'var(--text-light)' },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 15,
    color: 'var(--text-primary)',
    background: 'transparent',
  },
  catScroll: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none',
  },
  catBtn: {
    flexShrink: 0,
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: 13,
    fontWeight: 600,
    border: '1.5px solid var(--divider)',
    background: '#fff',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  catBtnActive: {
    background: 'var(--primary)',
    color: '#fff',
    border: '1.5px solid var(--primary)',
  },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' },
  seeAll: { fontSize: 13, fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 0' },
  emptyText: { fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' },
  emptySubtext: { fontSize: 14, color: 'var(--text-secondary)' },
};
