/**
 * Formats a numeric value into Nigerian Naira (₦) with proper decimals and commas.
 */
export function formatNaira(amount: number): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `₦${formatted}`;
}

/**
 * Formats integers with comma separation.
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-NG').format(num);
}

/**
 * Formats tonnage with unit.
 */
export function formatTonnage(tonnes: number): string {
  return `${formatNumber(tonnes)} tonnes`;
}

/**
 * Formats ISO date string to readable format.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Formats date and time.
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns time-appropriate greeting.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Generates two-letter uppercase initials.
 */
export function getInitials(name: string): string {
  if (!name) return 'AR';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
}
