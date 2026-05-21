import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ProblemBanner } from './components/ProblemBanner';
import { PortfolioSummary } from './components/PortfolioSummary';
import { ThresholdControls } from './components/ThresholdControls';
import { ScatterPlot } from './components/ScatterPlot';
import { FilterBar } from './components/FilterBar';
import { CaseTable } from './components/CaseTable';
import { ActionPanel } from './components/ActionPanel';
import { OutreachSection } from './components/OutreachSection';
import { TeamSection } from './components/TeamSection';
import { SectionNav } from './components/SectionNav';
import { Section } from './components/Section';
import { SplashModal } from './components/SplashModal';
import { GuideModal } from './components/GuideModal';
import { UploadModal } from './components/UploadModal';
import { DataPreviewModal } from './components/DataPreviewModal';
import { DevPanel } from './components/DevPanel';
import { Modal } from './components/Modal';
import { loadSampleProperties, SAMPLE_CSV_TEXT } from './data/sampleData';
import { CATEGORIES } from './data/categories';
import { TEAM, getMember } from './data/team';
import { classify, summarize } from './lib/classify';
import { ragStore } from './lib/ragStore';
import { propertiesToCsv } from './lib/parseCsv';
import { DEFAULT_MODEL_ID } from './lib/models';
import { activity } from './lib/activity';
import { buildIndex, searchAccounts, SEARCH_HINTS } from './lib/search';
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

const SECTION_IDS = {
  dashboard: 'dashboard',
  outreach: 'outreach',
  accounts: 'all-accounts',
  team: 'team',
} as const;

export default function App() {
  const [properties, setProperties] = useState<Property[]>(() =>
    loadSampleProperties()
  );
  const [dataSourceLabel, setDataSourceLabel] = useState(
    'sample portfolio'
  );
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
  const [uploadInitial, setUploadInitial] = useState<
    'pick' | 'sample-preview'
  >('pick');
  const [guideOpen, setGuideOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [dataPreviewOpen, setDataPreviewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activityNonce, setActivityNonce] = useState(0);
  const outreachRef = useRef<HTMLDivElement>(null);

  function bumpActivity() {
    setActivityNonce((n) => n + 1);
  }

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

  const completedIds = useMemo(() => {
    const s = new Set<string>();
    for (const [id, c] of Object.entries(cases)) {
      if (c.status === 'completed') s.add(id);
    }
    return s;
  }, [cases]);

  const searchIndex = useMemo(
    () =>
      buildIndex(
        properties,
        thresholds,
        Object.fromEntries(
          Object.entries(cases).map(([id, c]) => [
            id,
            { ownerId: c.ownerId, notes: c.notes },
          ])
        )
      ),
    [properties, thresholds, cases]
  );

  const filteredAccounts = useMemo(() => {
    return searchAccounts(searchIndex, search, {
      ownerFilter,
      categoryFilter,
      hideCompleted,
      completedIds,
    });
  }, [searchIndex, search, ownerFilter, categoryFilter, hideCompleted, completedIds]);

  const filteredProperties = useMemo(
    () => filteredAccounts.map((h) => h.property),
    [filteredAccounts]
  );

  const selectedProperty = selectedId
    ? properties.find((p) => p.id === selectedId) ?? null
    : null;

  function handleSelect(id: string) {
    setSelectedId(id);
    setTimeout(() => {
      outreachRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 40);
  }

  function jumpToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // Pure-ish updater: compute next case + log activities + persist outside the setState callback
  function updateCase(propertyId: string, patch: Partial<CaseEntry>) {
    const p = properties.find((x) => x.id === propertyId);
    if (!p) return;
    const cat = classify(p.userAdoption, p.conversionRate, thresholds);
    const prev = cases[propertyId] ?? {
      ...defaultCase(cat),
      notes: p.notes ?? '',
    };
    const next: CaseEntry = { ...prev, ...patch };

    if (patch.ownerId && patch.ownerId !== prev.ownerId) {
      activity.log({
        type: 'owner_changed',
        propertyId,
        ownerId: patch.ownerId,
        summary: `Reassigned from ${getMember(prev.ownerId).name} to ${getMember(patch.ownerId).name}`,
      });
    }
    if (patch.status && patch.status !== prev.status) {
      activity.log({
        type: 'status_changed',
        propertyId,
        ownerId: next.ownerId,
        summary: `Status → ${patch.status.replace('_', ' ')}`,
      });
    }
    if (
      typeof patch.notes === 'string' &&
      patch.notes !== prev.notes &&
      Math.abs(patch.notes.length - prev.notes.length) > 3
    ) {
      activity.log({
        type: 'notes_edited',
        propertyId,
        ownerId: next.ownerId,
        summary: `Notes updated (${patch.notes.length} chars)`,
      });
    }

    ragStore.saveCase(propertyId, next);
    setCases((prevState) => ({ ...prevState, [propertyId]: next }));
    bumpActivity();
  }

  function onLoadProperties(props: Property[], filename: string) {
    setProperties(props);
    setDataSourceLabel(filename);
    setCases({});
    setDrafts({});
    setSelectedId(null);
    ragStore.clearAll();
    activity.clear();
    activity.log({
      type: 'data_loaded',
      summary: `Loaded ${props.length} accounts from ${filename}`,
    });
    bumpActivity();
    setToast(`Loaded ${props.length} accounts from ${filename}`);
    setTimeout(() => setToast(null), 3000);
  }

  function onDraftChange(propertyId: string, record: DraftRecord) {
    setDrafts((prev) => ({ ...prev, [propertyId]: record }));
    const p = properties.find((x) => x.id === propertyId);
    const ownerId =
      cases[propertyId]?.ownerId ??
      (p
        ? CATEGORIES[classify(p.userAdoption, p.conversionRate, thresholds)]
            .defaultOwner
        : 'csm');
    activity.log({
      type: 'draft_generated',
      propertyId,
      ownerId,
      summary: `Drafted "${record.subject}"`,
      meta: { model: record.model, latency: record.latencyMs },
    });
    bumpActivity();
  }

  function onMailtoOpened(propertyId: string) {
    const ownerId = cases[propertyId]?.ownerId ?? 'csm';
    activity.log({
      type: 'mailto_opened',
      propertyId,
      ownerId,
      summary: 'Opened draft in mail client',
    });
    bumpActivity();
  }

  function onDraftPinned(propertyId: string) {
    const ownerId = cases[propertyId]?.ownerId ?? 'csm';
    activity.log({
      type: 'draft_pinned',
      propertyId,
      ownerId,
      summary: 'Pinned draft as golden example',
    });
    bumpActivity();
  }

  function exportFiltered() {
    const csv = propertiesToCsv(filteredProperties);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pulse-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function openUpload(initial: 'pick' | 'sample-preview' = 'pick') {
    setUploadInitial(initial);
    setUploadOpen(true);
  }

  useEffect(() => {
    if (!splashOpen && !splashSeen) setSplashSeen(true);
  }, [splashOpen, splashSeen, setSplashSeen]);

  const lastDraft = selectedId ? drafts[selectedId] : undefined;
  const pinnedCount = Object.keys(ragStore.loadGolden()).length;
  const activeOutreachCount = useMemo(
    () => activity.all().filter((e) => e.propertyId).length,
    [activityNonce]
  );

  const navItems = [
    {
      id: SECTION_IDS.dashboard,
      label: 'Dashboard',
      count: stats.byCategory.churn,
      tone: 'churn' as const,
    },
    {
      id: SECTION_IDS.outreach,
      label: 'Outreach',
      count: activeOutreachCount,
    },
    {
      id: SECTION_IDS.accounts,
      label: 'All accounts',
      count: filteredProperties.length,
    },
    {
      id: SECTION_IDS.team,
      label: 'Team',
      count: TEAM.length,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onUploadClick={() => openUpload('pick')}
        onGuideClick={() => setGuideOpen(true)}
        onDevPanelClick={() => setDevOpen(true)}
        onWhyClick={() => setWhyOpen(true)}
      />
      <ProblemBanner />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="text-2xs text-ink-500 flex items-center gap-2 flex-wrap">
            <span>Data source:</span>
            <button
              className="font-mono text-ink-700 hover:text-brand-700 underline underline-offset-2 decoration-dotted"
              onClick={() => setDataPreviewOpen(true)}
              title="Preview the dataset currently loaded"
            >
              {dataSourceLabel}
            </button>
            <span className="text-ink-400">·</span>
            <span>{properties.length} accounts</span>
            <button
              className="text-brand-700 hover:text-brand-900 underline underline-offset-2 ml-1"
              onClick={() => setDataPreviewOpen(true)}
            >
              view
            </button>
            <span className="text-ink-400">·</span>
            <button
              className="text-brand-700 hover:text-brand-900 underline underline-offset-2"
              onClick={() => openUpload('pick')}
            >
              replace
            </button>
          </div>
          <button className="btn-ghost" onClick={exportFiltered}>
            Export filtered CSV
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
          <SectionNav items={navItems} />

          <div className="space-y-10 min-w-0">
            <Section
              id={SECTION_IDS.dashboard}
              title="Dashboard"
              subtitle="Where every account sits on the health map. Slide the cutoffs to redraw the four groups."
              tip="The scatter plot shows every account. The two sliders on the left define what counts as 'high enough' on each axis. Stat cards summarize the whole portfolio."
            >
              <PortfolioSummary stats={stats} />
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 mt-3">
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
            </Section>

            <div ref={outreachRef}>
              <Section
                id={SECTION_IDS.outreach}
                title="Outreach"
                subtitle="Pick an account, read the AI-drafted email, edit and send. Every action is logged below."
                tip="The action panel shows the selected account's playbook, who owns it, and a streaming AI draft. Below is the running log of every draft generated, every email opened, every reassignment."
              >
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
                        activityNonce={activityNonce}
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
                        onMailtoOpened={() =>
                          onMailtoOpened(selectedProperty.id)
                        }
                        onDraftPinned={() => onDraftPinned(selectedProperty.id)}
                        draftRecord={drafts[selectedProperty.id]}
                      />
                    );
                  })()
                ) : (
                  <div className="panel p-6 text-center text-13 text-ink-500">
                    Click any dot on the dashboard chart, or any row in "All
                    accounts" below, to open the action panel here.
                  </div>
                )}

                <div className="mt-6">
                  <div className="label-eyebrow mb-2">Activity log</div>
                  <OutreachSection
                    properties={properties}
                    drafts={drafts}
                    onSelect={(id) => {
                      handleSelect(id);
                    }}
                    nonce={activityNonce}
                  />
                </div>
              </Section>
            </div>

            <Section
              id={SECTION_IDS.accounts}
              title="All accounts"
              subtitle="Full portfolio. Type to filter; click a row to load the account in Outreach above."
              tip="Type to filter by name, city (state names work — 'Texas' matches 'TX'), notes, owner, or health group. Hint chips appear when the box is empty."
            >
              <FilterBar
                search={search}
                onSearch={setSearch}
                ownerFilter={ownerFilter}
                onOwnerFilter={setOwnerFilter}
                categoryFilter={categoryFilter}
                onCategoryFilter={setCategoryFilter}
                hideCompleted={hideCompleted}
                onHideCompleted={setHideCompleted}
                hints={SEARCH_HINTS.map((h) => h.token)}
              />
              <CaseTable
                properties={filteredProperties}
                thresholds={thresholds}
                selectedId={selectedId}
                onSelect={handleSelect}
                cases={Object.fromEntries(
                  Object.entries(cases).map(([id, c]) => [
                    id,
                    { ownerId: c.ownerId, status: c.status },
                  ])
                )}
                onStatusChange={(id, status) => updateCase(id, { status })}
              />
            </Section>

            <Section
              id={SECTION_IDS.team}
              title="Team"
              subtitle="Who owns what, how busy they are, what they've touched recently."
              tip="Workload bars come from current case ownership. Recent activity is whatever you've done in this browser session."
              collapsible
              defaultOpen={false}
            >
              <TeamSection
                properties={properties}
                thresholds={thresholds}
                cases={cases}
                onShowQueue={(ownerId) => {
                  setOwnerFilter(ownerId);
                  setHideCompleted(false);
                  jumpToSection(SECTION_IDS.accounts);
                }}
                nonce={activityNonce}
              />
            </Section>
          </div>
        </div>
      </main>

      <footer className="border-t border-surface-200 py-4 mt-6">
        <div className="max-w-[1280px] mx-auto px-6 text-2xs text-ink-500 flex items-center justify-between flex-wrap gap-2">
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
        onUploadInstead={() => openUpload('pick')}
        onPreviewSample={() => openUpload('sample-preview')}
      />
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onLoad={onLoadProperties}
        currentSampleCsv={SAMPLE_CSV_TEXT}
        initialView={uploadInitial}
      />
      <DataPreviewModal
        open={dataPreviewOpen}
        onClose={() => setDataPreviewOpen(false)}
        properties={properties}
        sourceLabel={dataSourceLabel}
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
          activity.clear();
          bumpActivity();
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
            wildly different at every account. A customer success manager
            owning 50 accounts opens three dashboards every morning to figure
            out who needs attention.
          </p>
          <p>
            Pulse is a portfolio health monitor. It sorts every account into
            one of four health groups, surfaces the right playbook, and uses an
            LLM to draft outreach grounded in each account's actual numbers and
            notes. The customer success manager reads, edits, sends.
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
