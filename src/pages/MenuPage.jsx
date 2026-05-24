import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMenuStore } from '../store/menuStore';
import SushiCard from '../components/SushiCard';

const CATEGORY_KEYS = {
  All: 'cat_all', rolls: 'cat_rolls', nigiri: 'cat_nigiri', sashimi: 'cat_sashimi',
  sets: 'cat_sets', tempura: 'cat_tempura', soups: 'cat_soups', drinks: 'cat_drinks',
  desserts: 'cat_desserts', salads: 'cat_salads', maki: 'cat_maki', uramaki: 'cat_uramaki',
  gunkan: 'cat_gunkan', wok: 'cat_wok', appetizers: 'cat_appetizers',
};

export default function MenuPage() {
  const { t } = useTranslation();
  const { items, categories, loading, selectedCategory, loadMenu, filterByCategory } = useMenuStore();
  const [search, setSearch] = useState('');

  useEffect(() => { if (!items.length) loadMenu(); }, []);

  const categoryPriority = (cat) => {
    const c = (cat || '').toLowerCase();
    if (['rolls', 'maki', 'uramaki', 'hosomaki'].includes(c)) return 0;
    if (['nigiri', 'gunkan', 'onigiri', 'sashimi'].includes(c)) return 1;
    if (['sets'].includes(c)) return 2;
    if (['tempura', 'appetizers', 'salads', 'soups', 'wok', 'noodles'].includes(c)) return 3;
    if (['pizza', 'fast_food', 'desserts'].includes(c)) return 4;
    if (c === 'drinks') return 5;
    return 3;
  };

  const filtered = items
    .filter((item) =>
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => categoryPriority(a.category) - categoryPriority(b.category));

  return (
    <div className="page-enter" style={styles.page}>
      <div style={styles.container}>

        <h1 style={styles.title}>🍽️ {t('menu')}</h1>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span>🔍</span>
          <input
            style={styles.searchInput}
            placeholder={t('search_menu')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
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

        {/* Results count */}
        {!loading && (
          <div style={styles.count}>
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={styles.grid}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 280, borderRadius: 20 }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div style={styles.grid}>
            {filtered.map((item) => (
              <SushiCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div style={styles.empty}>
            <div style={{ fontSize: 48 }}>🔍</div>
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
  container: { maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 },
  title: { fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -0.5 },
  searchWrap: {
    background: '#fff',
    borderRadius: 'var(--radius-full)',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--divider)',
    fontSize: 15,
    color: 'var(--text-light)',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 15, color: 'var(--text-primary)', background: 'transparent' },
  clearSearch: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 14, padding: 0 },
  catScroll: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' },
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
  },
  catBtnActive: { background: 'var(--primary)', color: '#fff', border: '1.5px solid var(--primary)' },
  count: { fontSize: 13, color: 'var(--text-light)', fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '60px 0' },
  emptyText: { fontSize: 18, fontWeight: 700 },
  emptySubtext: { fontSize: 14, color: 'var(--text-secondary)' },
};
