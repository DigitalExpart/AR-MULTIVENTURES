import { ReactNode } from 'react';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadCsvFile, buildCsvContent, CsvColumn } from '@ar-multiventures/business-logic';

interface ReportTableProps<T> {
  title: string;
  subtitle?: string;
  columns: CsvColumn<T>[];
  data: T[];
  renderRow: (row: T, index: number) => ReactNode;
  exportFilename: string;
  isLoading?: boolean;
  emptyMessage?: string;
  headerActions?: ReactNode;
}

export function ReportTable<T>({
  title,
  subtitle,
  columns,
  data,
  renderRow,
  exportFilename,
  isLoading = false,
  emptyMessage = 'No report records found for the selected period.',
  headerActions,
}: ReportTableProps<T>) {
  const handleExportCsv = () => {
    const csvContent = buildCsvContent(columns, data);
    downloadCsvFile(exportFilename, csvContent);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-white print:border-b-2 print:border-neutral-900">
        <div>
          <h3 className="text-body font-bold text-neutral-950 print:text-h3">{title}</h3>
          {subtitle && <p className="text-caption text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {headerActions}
          <Button
            variant="outline"
            size="xs"
            onClick={handleExportCsv}
            disabled={data.length === 0}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={handlePrint}
            leftIcon={<Printer className="h-3.5 w-3.5" />}
          >
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase text-[11px] font-mono font-bold tracking-wider">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="py-3 px-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-caption text-neutral-400 font-mono">
                  Loading report records...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-body-sm text-neutral-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => renderRow(row, idx))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      {data.length > 0 && (
        <div className="p-3.5 bg-neutral-50/40 border-t border-neutral-200 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>Total Records: {data.length}</span>
          <span className="print:hidden">AR Multiventures Business Intelligence Engine</span>
        </div>
      )}
    </Card>
  );
}
