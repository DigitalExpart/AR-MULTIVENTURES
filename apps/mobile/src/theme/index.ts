export const Colors = {
  // AR Multiventures Brand Colors
  primary: '#0B6B3A',         // Rich Forest Green
  primaryLight: '#E8F5E9',    // Light Mint Green
  primaryDark: '#074826',     // Deep Pine Green
  secondary: '#6D6E71',       // Industrial Gray
  secondaryLight: '#F3F4F6',  // Light Neutral Gray
  secondaryDark: '#374151',   // Dark Charcoal Gray
  accent: '#FFC107',          // Quarry Equipment Gold / Amber
  accentLight: '#FFF9C4',     // Pale Amber
  accentDark: '#FFA000',      // Deep Amber

  // UI Foundations
  background: '#F8F9FA',      // Screen Background
  surface: '#FFFFFF',         // Card / Sheet Surface
  textPrimary: '#111827',     // Main Body / Heading Text
  textSecondary: '#6B7280',   // Secondary / Caption Text
  textMuted: '#9CA3AF',       // Muted / Placeholder Text
  border: '#E5E7EB',          // Default Borders
  borderLight: '#F3F4F6',     // Subtle Borders
  borderFocus: '#0B6B3A',     // Active Input Border

  // Semantic Status Colors
  success: '#10B981',         // Completed / Paid / Operational
  successLight: '#D1FAE5',
  warning: '#F59E0B',         // Pending / In Transit / Maintenance Due
  warningLight: '#FEF3C7',
  danger: '#EF4444',          // Cancelled / Overdue / Grounded
  dangerLight: '#FEE2E2',
  info: '#3B82F6',            // Scheduled / Loading / Dispatched
  infoLight: '#DBEAFE',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Typography = {
  sizes: {
    caption: 12,
    bodySm: 13,
    body: 15,
    bodyLg: 16,
    subheading: 18,
    headingSm: 20,
    heading: 24,
    display: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};
