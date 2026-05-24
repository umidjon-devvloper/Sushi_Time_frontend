import React from 'react';
import { useTranslation } from 'react-i18next';
import { STATUS_COLORS } from '../theme';

const STATUS_LABELS = {
  pending:   'order_placed',
  confirmed: 'confirmed',
  preparing: 'preparing',
  en_route:  'on_the_way',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#6B7280' };
  const label = STATUS_LABELS[status] || status;

  return (
    <span style={{ ...styles.badge, background: colors.bg, color: colors.text }}>
      {t(label)}
    </span>
  );
}

const styles = {
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
};
