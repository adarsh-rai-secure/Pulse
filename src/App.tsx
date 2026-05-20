import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ProblemBanner } from './components/ProblemBanner';
import { PortfolioSummary } from './components/PortfolioSummary';
import { ThresholdControls } from './components/ThresholdControls';
import { ScatterPlot } from './components/ScatterPlot';
import { FilterBar } from './components/FilterBar';
import { CaseTable } from './components/CaseTable';
import { ActionPanel } from './components/ActionPanel';
import { SplashModal } from './components/SplashModal';
import { GuideModal } from './components/GuideModal';
import { UploadModal } from './components/UploadModal';
import { DevPanel } from './components/DevPanel';
import { Modal } from './components/Modal';
import { loadSampleProperties, SAMPLE_CSV_TEXT } from './data/sampleData';
import { CATEGORIES } from './data/categories';
import { classify, sortForCaseTable, summarize } from './lib/classify';
import { ragStore } from './lib/ragStore';
import { propertiesToCsv } from './lib/parseCsv';
import { DEFAULT_MODEL_ID } from './lib/models';
import { useLocalStorage } from './hooks/useLocalStorage';
import type {
  CaseStatus,
  CategoryKey,
  DraftRecord,
  Property,
  Thresholds,
} from './types';

interface CaseEntry {
  ownerId: string;
  status: CaseStatus;
  notes: string;
}

function defaultCase(catKey: CategoryKey): CaseEntry {
  return { ownerId: CATEGORIES[catKey].defaultOwner, status: 'new', notes: '' };
}

export default function App() {
  const [properties, setProperties] = useState<Property[]>(() =>
    loadSampleProperties()
  );
  const [dataSourceLabel, setDataSourceLabel] = useState('sample portfolio');
  const [thresholds, setThresholds] = useLocalStorage<Thresholds>(
    'pulse.thresholds',
    { ua: 30, cr: 20 }
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [cases, setCases] = useState<Record<string, CaseEntry>>(() => {
    const persisted = ragStore.loadCases();
    return persisted as Record<string, CaseEntry>;
  });

  const [drafts, setDrafts] = useState<Record<string, DraftRecord>>(() =>
    ragStore.loadDrafts()
  );

  const [modelId, setModelId] = useLocalStorage<string>(
    'pulse.model',
    DEFAULT_MODEL_ID
  );

  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryKey | 'all'>(
    'all'
  );
  const [hideCompleted, setHideCompleted] = useState(false);

  const [splashSeen, setSplashSeen] = useLocalStorage<boolean>(
    'pulse.splash.seen',
    false
  );
  const [splashOpen, setSplashOpen] = useState(!splashSeen);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const actionPanelRef = useRef<HTMLDivElement>(null);

  function getCaseFor(p: Property): CaseEntry {
    const cat = classify(p.userAdoption, p.conversionRate, thresholds);
    const stored = cases[p.id];
    if (stored) return { ...defaultCase(cat), ...stored };
    if (p.notes && p.notes.trim().length > 0) {
      return { ...defaultCase(cat), notes: p.notes };
    }
    return defaultCase(cat);
  }

  const stats = useMemo(
    () => summarize(properties, thresholds),
    [properties, thresholds]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      const cat = classify(p.userAdoption, p.conversionRate, thresholds);
      if (categoryFilter !== 'all' && cat !== categoryFilter) return false;
      const cs = getCaseFor(p);
      if (ownerFilter !== 'all' && cs.ownerId !== ownerFilter) return false;
      if (hideCompleted && cs.status === 'completed') return false;
      if (!q) return true;
      const haystack = (
        p.name + ' ' + p.city + ' ' + (p.notes ?? '') + ' ' + cs.notes
      ).toLowerCase();
      return haystack.includes(q);
    });
  }, [
    properties,
    thresholds,
    search,
    categoryFilter,
    ownerFilter,
    hideCompleted,
    cases,
  ]);

  const sorted = useMemo(
    () => sortForCaseTable(filtered, thresholds),
    [filtered, thresholds]
  );

  const selectedProperty = selectedId
    ? properties.find((p) => p.id === selectedId) ?? null
    : null;

  function handleSelect(id: string) {
    setSelectedId(id);
    setTimeout(() => {
      actionPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 40);
  }

  function updateCase(propertyId: string, patch: Partial<CaseEntry>) {
    setCases((prev) => {
      const p = properties.find((x) => x.id === propertyId);
      if (!p) return prev;
      const cat = classify(p.userAdoption, p.conversionRate, thresholds);
      const base = prev[propertyId] ?? {
        ...defaultCase(cat),
        notes: p.notes ?? '',
      };
      const next = { ...base, ...patch };
      const all = { ...prev, [propertyId]: next };
      ragStore.saveCase(propertyId, next);
      return all;
    });
  }

  function onLoadProperties(props: Property[], filename: string) {
    setProperties(props);
    setDataSourceLabel(filename);
    setCases({});
    setDrafts({});
    setSelectedId(null);
    ragStore.clearAll();
    setToast(`Loaded ${props.length} accounts from ${filename}`);
    setTimeout(() => setToast(null), 3000);
  }

  function onDraftChange(propertyId: string, record: DraftRecord) {
    setDrafts((prev) => ({ ...prev, [propertyId]: record }));
  }

  // Export currently filtered table as CSV
  function exportFiltered() {
    const csv = propertiesToCsv(sorted);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pulse-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Mark splash seen when closed
  useEffect(() => {
    if (!splashOpen && !splashSeen) setSplashSeen(true);
  }, [splashOpen, splashSeen, setSplashSeen]);

  const lastDraft = selectedId ? drafts[selectedId] : undefined;
  const pinnedCount = Object.keys(ragStore.loadGolden()).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onUploadClick={() => setUploadOpen(true)}
        onGuideClick={() => setGuideOpen(true)}
        onDevPanelClick={() => setDevOpen(true)}
        onWhyClick={() => setWhyOpen(true)}
      />
      <ProblemBanner />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-5 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-2xs text-ink-500">
            Data source:{' '}
            <span className="font-mono text-ink-700">{dataSourceLabel}</span>
            <span className="mx-2">·</span>
            {properties.length} accounts
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={exportFiltered}>
              Export filtered CSV
            </button>
          </div>
        </div>

        <PortfolioSummary stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          <ThresholdControls
            thresholds={thresholds}
            onChange={setThresholds}
          />
          <ScatterPlot
            properties={properties}
            thresholds={thresholds}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        <FilterBar
          search={search}
          onSearch={setSearch}
          ownerFilter={ownerFilter}
          onOwnerFilter={setOwnerFilter}
          categoryFilter={categoryFilter}
          onCategoryFilter={setCategoryFilter}
          hideCompleted={hideCompleted}
          onHideCompleted={setHideCompleted}
        />

        <CaseTable
          properties={sorted}
          thresholds={thresholds}
          selectedId={selectedId}
          onSelect={handleSelect}
          cases={Object.fromEntries(
            Object.entries(cases).map(([id, c]) => [
              id,
              { ownerId: c.ownerId, status: c.status },
            ])
          )}
          onOwnerChange={(id, ownerId) => updateCase(id, { ownerId })}
          onStatusChange={(id, status) => updateCase(id, { status })}
        />

        <div ref={actionPanelRef}>
          {selectedProperty ? (
            (() => {
              const cs = getCaseFor(selectedProperty);
              return (
                <ActionPanel
                  property={selectedProperty}
                  allProperties={properties}
                  thresholds={thresholds}
                  caseState={cs}
                  modelId={modelId}
                  onOwnerChange={(ownerId) =>
                    updateCase(selectedProperty.id, { ownerId })
                  }
                  onStatusChange={(status) =>
                    updateCase(selectedProperty.id, { status })
                  }
                  onNotesChange={(notes) =>
                    updateCase(selectedProperty.id, { notes })
                  }
                  onDraftChange={(record) =>
                    onDraftChange(selectedProperty.id, record)
                  }
                  draftRecord={drafts[selectedProperty.id]}
                />
              );
            })()
          ) : (
            <div className="panel p-6 text-center text-13 text-ink-500">
              Click any dot on the scatter plot or any row in the table to open
              the action panel.
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-surface-200 py-4 mt-6">
        <div className="max-w-[1200px] mx-auto px-6 text-2xs text-ink-500 flex items-center justify-between flex-wrap gap-2">
          <span>
            Pulse · prototype by{' '}
            <a
              className="text-brand-700 hover:underline"
              href="https://github.com/adarsh-rai-secure"
              target="_blank"
              rel="noreferrer"
            >
              Adarsh Rai
            </a>
          </span>
          <span className="font-mono">
            React · TypeScript · Tailwind · OpenRouter
          </span>
        </div>
      </footer>

      <SplashModal
        open={splashOpen}
        onClose={() => setSplashOpen(false)}
        onUploadInstead={() => setUploadOpen(true)}
      />
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onLoad={onLoadProperties}
        currentSampleCsv={SAMPLE_CSV_TEXT}
      />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <DevPanel
        open={devOpen}
        onClose={() => setDevOpen(false)}
        modelId={modelId}
        onModelChange={setModelId}
        lastDraft={lastDraft}
        pinnedCount={pinnedCount}
        onClearStore={() => {
          setCases({});
          setDrafts({});
        }}
      />
      <Modal
        open={whyOpen}
        onClose={() => setWhyOpen(false)}
        title="Why Pulse exists"
        width="max-w-xl"
      >
        <div className="space-y-3 text-13 leading-relaxed text-ink-700">
          <p>
            B2B AI companies sell one product to many clients. Adoption looks
            wildly different at every account. A CSM owning 50 accounts opens
            three dashboards every morning to figure out who needs attention.
          </p>
          <p>
            Pulse is a portfolio health monitor. It classifies every account
            into one of four quadrants, surfaces the right playbook, and uses
            an LLM to draft outreach grounded in each account's actual numbers
            and notes. The CSM reads, edits, sends.
          </p>
          <p className="text-ink-500">
            Built as a portfolio project to show how a forward-deployed engineer
            ships AI tooling for a real operational problem.
          </p>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-ink-900 text-white text-13 rounded-lg px-4 py-2.5 shadow-panel z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
