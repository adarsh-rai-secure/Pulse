import { useRef, useState } from 'react';
import { Modal } from './Modal';
import {
  parseCsvToProperties,
  parseFileToProperties,
  propertiesToCsv,
} from '../lib/parseCsv';
import type { Property } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onLoad: (props: Property[], filename: string) => void;
  currentSampleCsv: string;
  initialView?: 'pick' | 'sample-preview';
}

type View =
  | { kind: 'pick' }
  | { kind: 'preview'; props: Property[]; filename: string; error?: string };

export function UploadModal({
  open,
  onClose,
  onLoad,
  currentSampleCsv,
  initialView = 'pick',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<View>(() =>
    initialView === 'sample-preview'
      ? {
          kind: 'preview',
          props: parseCsvToProperties(currentSampleCsv),
          filename: 'pulse-sample-portfolio.csv (bundled)',
        }
      : { kind: 'pick' }
  );
  const [dragOver, setDragOver] = useState(false);

  function reset() {
    setView({ kind: 'pick' });
  }

  async function handleFile(file: File) {
    try {
      const props = await parseFileToProperties(file);
      if (props.length === 0) {
        setView({
          kind: 'preview',
          props: [],
          filename: file.name,
          error:
            'No rows parsed. Make sure the file has a header row with Property Name, City, Units, User Adoption (%), Conversion Rate (%), Notes.',
        });
        return;
      }
      setView({ kind: 'preview', props, filename: file.name });
    } catch (e) {
      setView({
        kind: 'preview',
        props: [],
        filename: file.name,
        error: e instanceof Error ? e.message : 'Could not parse the file.',
      });
    }
  }

  function previewSample() {
    setView({
      kind: 'preview',
      props: parseCsvToProperties(currentSampleCsv),
      filename: 'pulse-sample-portfolio.csv (bundled)',
    });
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
    if (view.kind !== 'preview' || view.props.length === 0) return;
    onLoad(view.props, view.filename);
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Load portfolio data"
      width="max-w-3xl"
    >
      {view.kind === 'pick' && (
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
              Drag a CSV or Excel file here, or
            </div>
            <button
              className="btn-primary"
              onClick={() => inputRef.current?.click()}
            >
              Browse for a file
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
              Expected columns:{' '}
              <code>
                Property Name, City, Units, User Adoption (%), Conversion Rate (%), Notes
              </code>
              . Shorthand <code>UA</code> and <code>CR</code> also work.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              className="panel-flat p-4 text-left hover:border-brand-200 transition-colors"
              onClick={previewSample}
            >
              <div className="text-13 font-medium text-ink-900">
                Preview the bundled sample
              </div>
              <p className="text-2xs text-ink-500 mt-1">
                Show the 52-account demo portfolio before loading it. You can
                inspect every row first.
              </p>
            </button>
            <button
              className="panel-flat p-4 text-left hover:border-brand-200 transition-colors"
              onClick={downloadSample}
            >
              <div className="text-13 font-medium text-ink-900">
                Download the sample as a CSV
              </div>
              <p className="text-2xs text-ink-500 mt-1">
                Useful as a starting template for your own portfolio data.
              </p>
            </button>
          </div>
        </div>
      )}

      {view.kind === 'preview' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-13">
              <span className="font-medium">{view.filename}</span>
              <span className="text-ink-500 ml-2">
                {view.props.length} row{view.props.length === 1 ? '' : 's'} parsed
              </span>
            </div>
            <button className="btn-ghost" onClick={reset}>
              Pick a different source
            </button>
          </div>

          {view.error && (
            <div className="bg-signal-churnBg text-signal-churnFg rounded-md p-3 text-13">
              {view.error}
            </div>
          )}

          {view.props.length > 0 && (
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
                    {view.props.slice(0, 80).map((p) => (
                      <tr key={p.id} className="border-b border-surface-100">
                        <Td className="font-medium">{p.name}</Td>
                        <Td>{p.city}</Td>
                        <Td className="text-right tabular-nums">{p.units}</Td>
                        <Td className="text-right tabular-nums">
                          {p.userAdoption}%
                        </Td>
                        <Td className="text-right tabular-nums">
                          {p.conversionRate}%
                        </Td>
                        <Td className="text-ink-500 truncate max-w-[280px]">
                          {p.notes}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {view.props.length > 80 && (
                <div className="text-2xs text-ink-500">
                  Showing first 80 of {view.props.length} rows.
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button className="btn-outline" onClick={reset}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={confirmLoad}>
                  Load this data
                </button>
              </div>
            </>
          )}
        </div>
      )}
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

export function csvFromProperties(props: Property[]): string {
  return propertiesToCsv(props);
}
