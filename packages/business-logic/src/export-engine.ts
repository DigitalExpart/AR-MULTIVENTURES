export interface CsvColumn<T = any> {
  header: string;
  key: keyof T | ((row: T) => any);
  format?: 'text' | 'number' | 'date' | 'boolean';
}

/**
 * Pure CSV content builder. Ensures numbers remain numeric (no intrusive currency symbols),
 * escaping commas and quotes cleanly.
 */
export function buildCsvContent<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const headerLine = columns.map((col) => escapeCsvValue(col.header)).join(',');

  const dataLines = rows.map((row) => {
    return columns
      .map((col) => {
        let val: any;
        if (typeof col.key === 'function') {
          val = col.key(row);
        } else {
          val = row[col.key];
        }

        if (val === null || val === undefined) {
          return '';
        }

        if (col.format === 'number') {
          const num = Number(val);
          return isNaN(num) ? '0' : String(num);
        }

        if (col.format === 'boolean') {
          return val ? 'TRUE' : 'FALSE';
        }

        return escapeCsvValue(String(val));
      })
      .join(',');
  });

  return [headerLine, ...dataLines].join('\r\n');
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Triggers browser file download of CSV content.
 */
export function downloadCsvFile(filename: string, csvContent: string): void {
  if (typeof window === 'undefined' || !window.document) return;

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
