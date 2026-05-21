import { useMemo } from 'react';
import { Modal } from './Modal';
import type { Property } from '../types';
import { propertiesToCsv } from '../lib/parseCsv';

interface Props {
  open: boolean;
  onClose: () => void;
  properties: Property[];
  sourceLabel: string;
}

export function DataPreviewModal({
  open,
  onClose,
  properties,
  sourceLabel,
}: Props) {
  const csv = useMemo(() => propertiesToCsv(properties), [properties]);

  function copyCsv() {
    navigator.clipboard.writeText(csv);
  }
  function downloadCsv() {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sourceLabel
      .replace(/\s*\(.*$/, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/gi, '')
      .toLowerCase() + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Current data source · ${sourceLabel}`}
      width="max-w-3xl"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-13 text-ink-700">
            This is the dataset currently powering Pulse. Everything you see
            (scatter, table, AI drafts) derives from these rows.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="btn-outline" onClick={copyCsv}>
              Copy as CSV
            </button>
            <button className="btn-outline" onClick={downloadCsv}>
              Download CSV
            </button>
          </div>
        </div>

        <div className="border border-surface-200 rounded-md max-h-[420px] overflow-auto">
          <table className="w-full text-13">
            <thead className="bg-surface-50 sticky top-0">
              <tr className="border-b border-surface-200">
                <Th>Property</Th>
                <Th>City</Th>
                <Th className="text-right">Units</Th>
                <Th className="text-right">UA</Th>
                <Th className="text-right">CR</Th>
                <Th>Notes</Th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-surface-100">
                  <Td className="font-medium">{p.name}</Td>
                  <Td>{p.city}</Td>
                  <Td className="text-right tabular-nums">{p.units}</Td>
                  <Td className="text-right tabular-nums">{p.userAdoption}%</Td>
                  <Td className="text-right tabular-nums">{p.conversionRate}%</Td>
                  <Td className="text-ink-500 max-w-[300px]">
                    {p.notes || (
                      <span className="text-ink-400 italic">(none)</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-2xs text-ink-500">
          {properties.length} row{properties.length === 1 ? '' : 's'}. To
          replace this data, use Upload CSV in the header.
        </div>
      </div>
    </Modal>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={
        'label-eyebrow font-medium py-2 px-2.5 text-left ' + (className ?? '')
      }
    >
      {children}
    </th>
  );
}
function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={'py-1.5 px-2.5 ' + (className ?? '')}>{children}</td>;
}
