import { useRef, useState } from 'react';
import { Modal } from './Modal';
import { parseFileToProperties, propertiesToCsv } from '../lib/parseCsv';
import type { Property } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onLoad: (props: Property[], filename: string) => void;
  currentSampleCsv: string;
}

export function UploadModal({ open, onClose, onLoad, currentSampleCsv }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{
    props: Property[];
    filename: string;
    error?: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    try {
      const props = await parseFileToProperties(file);
      if (props.length === 0) {
        setPreview({
          props: [],
          filename: file.name,
          error:
            'No rows were parsed. Make sure the file has a header row with Property Name, City, Units, User Adoption (%), Conversion Rate (%), Notes.',
        });
        return;
      }
      setPreview({ props, filename: file.name });
    } catch (e) {
      setPreview({
        props: [],
        filename: file.name,
        error:
          e instanceof Error ? e.message : 'Could not parse the file.',
      });
    }
  }

  function downloadSample() {
    const blob = new Blob([currentSampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pulse-sample-portfolio.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function confirmLoad() {
    if (!preview || preview.props.length === 0) return;
    onLoad(preview.props, preview.filename);
    setPreview(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setPreview(null);
        onClose();
      }}
      title="Upload portfolio data"
      width="max-w-3xl"
    >
      {!preview && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className={
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors ' +
              (dragOver
                ? 'border-brand-500 bg-brand-50'
                : 'border-surface-200 bg-surface-50')
            }
          >
            <div className="text-13 text-ink-700 mb-2">
              Drop a CSV or Excel file here, or
            </div>
            <button
              className="btn-primary"
              onClick={() => inputRef.current?.click()}
            >
              Choose a file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="text-2xs text-ink-500 mt-3">
              Expected columns: <code>Property Name, City, Units, User Adoption (%), Conversion Rate (%), Notes</code>.
              Shorthand <code>UA</code> and <code>CR</code> also work.
            </div>
          </div>

          <div className="flex items-center justify-between text-13">
            <span className="text-ink-500">
              Need a starting point?
            </span>
            <button className="btn-outline" onClick={downloadSample}>
              Download sample CSV
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-13">
              <span className="font-medium">{preview.filename}</span>
              <span className="text-ink-500 ml-2">
                {preview.props.length} row{preview.props.length === 1 ? '' : 's'} parsed
              </span>
            </div>
            <button
              className="btn-ghost"
              onClick={() => setPreview(null)}
            >
              Pick a different file
            </button>
          </div>

          {preview.error && (
            <div className="bg-signal-churnBg text-signal-churnFg rounded-md p-3 text-13">
              {preview.error}
            </div>
          )}

          {preview.props.length > 0 && (
            <>
              <div className="border border-surface-200 rounded-md max-h-[320px] overflow-auto">
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
                    {preview.props.slice(0, 80).map((p) => (
                      <tr key={p.id} className="border-b border-surface-100">
                        <Td className="font-medium">{p.name}</Td>
                        <Td>{p.city}</Td>
                        <Td className="text-right tabular-nums">{p.units}</Td>
                        <Td className="text-right tabular-nums">{p.userAdoption}%</Td>
                        <Td className="text-right tabular-nums">{p.conversionRate}%</Td>
                        <Td className="text-ink-500 truncate max-w-[280px]">
                          {p.notes}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.props.length > 80 && (
                <div className="text-2xs text-ink-500">
                  Showing first 80 of {preview.props.length} rows.
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button className="btn-outline" onClick={() => setPreview(null)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={confirmLoad}>
                  Replace current dataset
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={'label-eyebrow font-medium py-2 px-2.5 text-left ' + (className ?? '')}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={'py-1.5 px-2.5 ' + (className ?? '')}>{children}</td>;
}

export function csvFromProperties(props: Property[]): string {
  return propertiesToCsv(props);
}
