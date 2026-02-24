import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import { DailySummary } from './components/DailySummary';
import { RecordList } from './components/RecordList';
import { RecordModal } from './components/RecordModal';
import { Settings } from './components/Settings';
import { TimerCard } from './components/TimerCard';
import { WeeklySummary } from './components/WeeklySummary';
import type { Filters, RunningState, Settings as SettingsType, TimeRecord } from './types';
import { getDateKeyInIstanbul, recalculateDuration } from './utils/time';
import { readRecords, readRunningState, readSettings, writeRecords, writeRunningState, writeSettings } from './utils/storage';

const initialFilters: Filters = { date: '', project: '', search: '' };

function App() {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [runningState, setRunningState] = useState<RunningState>(readRunningState());
  const [settings, setSettings] = useState<SettingsType>(readSettings());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const [tagsInput, setTagsInput] = useState(readRunningState().draft.etiketler.join(', '));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRecords(readRecords());
    setLoading(false);
  }, []);

  useEffect(() => {
    writeRecords(records);
  }, [records]);

  useEffect(() => {
    writeRunningState(runningState);
  }, [runningState]);

  useEffect(() => {
    writeSettings(settings);
    document.documentElement.dataset.theme = settings.theme;
  }, [settings]);

  useEffect(() => {
    if (!runningState.isRunning || !runningState.startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const update = () => {
      const started = new Date(runningState.startedAt).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [runningState.isRunning, runningState.startedAt]);

  const startTimer = () => {
    if (runningState.isRunning) return;
    const nowIso = new Date().toISOString();
    setRunningState((prev) => ({ ...prev, isRunning: true, startedAt: nowIso }));
    setError('');
  };

  const stopTimer = () => {
    if (!runningState.startedAt || !runningState.isRunning) return;
    const end = new Date().toISOString();
    const duration = recalculateDuration(runningState.startedAt, end);

    if (duration <= 0) {
      setError('Geçersiz oturum süresi. Lütfen tekrar deneyin.');
      return;
    }

    const newRecord: TimeRecord = {
      id: crypto.randomUUID(),
      tarih: getDateKeyInIstanbul(new Date(end)),
      proje: runningState.draft.proje.trim(),
      aciklama: runningState.draft.aciklama.trim(),
      baslangicZamani: runningState.startedAt,
      bitisZamani: end,
      sureSaniye: duration,
      etiketler: runningState.draft.etiketler,
    };

    setRecords((prev) => [newRecord, ...prev]);
    setRunningState((prev) => ({
      isRunning: false,
      startedAt: null,
      draft: prev.draft,
    }));
    setError('');
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const passDate = !filters.date || record.tarih === filters.date;
      const passProject = !filters.project || record.proje.toLowerCase().includes(filters.project.toLowerCase());
      const passSearch = !filters.search || record.aciklama.toLowerCase().includes(filters.search.toLowerCase());
      return passDate && passProject && passSearch;
    });
  }, [records, filters]);

  const todayKey = getDateKeyInIstanbul(new Date());
  const selectedDate = filters.date || todayKey;

  const todaySeconds = records.filter((r) => r.tarih === todayKey).reduce((sum, r) => sum + r.sureSaniye, 0);
  const selectedDateTotal = records.filter((r) => r.tarih === selectedDate).reduce((sum, r) => sum + r.sureSaniye, 0);

  const handleDelete = (id: string) => {
    if (window.confirm('Bu kaydı silmek istediğine emin misin?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSaveEdit = (record: TimeRecord) => {
    const recalculated = recalculateDuration(record.baslangicZamani, record.bitisZamani);
    if (recalculated <= 0) {
      setError('Bitiş zamanı başlangıçtan sonra olmalıdır.');
      return;
    }
    const updated = { ...record, sureSaniye: recalculated, tarih: getDateKeyInIstanbul(new Date(record.baslangicZamani)) };
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingRecord(null);
    setError('');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      if (!Array.isArray(parsed)) throw new Error('Geçersiz format');

      const sanitized: TimeRecord[] = parsed.map((item) => {
        const candidate = item as Partial<TimeRecord>;
        if (!candidate.id || !candidate.baslangicZamani || !candidate.bitisZamani) {
          throw new Error('Eksik alan');
        }
        const sureSaniye = recalculateDuration(candidate.baslangicZamani, candidate.bitisZamani);
        if (sureSaniye <= 0) throw new Error('Geçersiz süre');

        return {
          id: candidate.id,
          tarih: candidate.tarih ?? getDateKeyInIstanbul(new Date(candidate.baslangicZamani)),
          proje: candidate.proje ?? '',
          aciklama: candidate.aciklama ?? '',
          baslangicZamani: candidate.baslangicZamani,
          bitisZamani: candidate.bitisZamani,
          sureSaniye,
          etiketler: Array.isArray(candidate.etiketler) ? candidate.etiketler.filter(Boolean) : [],
        };
      });

      setRecords(sanitized);
      setError('');
    } catch {
      setError('Import başarısız: Geçersiz JSON dosyası.');
    }
  };

  if (loading) return <div className="container">Yükleniyor...</div>;

  return (
    <div className="container">
      <header className="header">
        <h1>Günlük Çalışma Süresi Takipçisi</h1>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <div className="layout-top">
        <DailySummary
          todaySeconds={todaySeconds + (runningState.isRunning ? elapsedSeconds : 0)}
          goalMinutes={settings.dailyGoalMinutes}
          selectedDateTotal={selectedDateTotal}
          selectedDate={selectedDate}
        />
        <Settings
          dailyGoalMinutes={settings.dailyGoalMinutes}
          theme={settings.theme}
          onGoalChange={(minutes) => setSettings((prev) => ({ ...prev, dailyGoalMinutes: Math.max(1, minutes || 1) }))}
          onThemeToggle={() => setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
          onExport={handleExport}
          onImport={handleImport}
        />
      </div>

      <TimerCard
        isRunning={runningState.isRunning}
        elapsedSeconds={elapsedSeconds}
        project={runningState.draft.proje}
        description={runningState.draft.aciklama}
        tags={tagsInput}
        onProjectChange={(value) => setRunningState((prev) => ({ ...prev, draft: { ...prev.draft, proje: value } }))}
        onDescriptionChange={(value) => setRunningState((prev) => ({ ...prev, draft: { ...prev.draft, aciklama: value } }))}
        onTagsChange={(value) => {
          setTagsInput(value);
          setRunningState((prev) => ({
            ...prev,
            draft: { ...prev.draft, etiketler: value.split(',').map((v) => v.trim()).filter(Boolean) },
          }));
        }}
        onStart={startTimer}
        onStop={stopTimer}
      />

      <section className="card">
        <h2>Filtre / Arama</h2>
        <div className="filters">
          <input type="date" value={filters.date} onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))} />
          <input
            placeholder="Projeye göre filtre"
            value={filters.project}
            onChange={(e) => setFilters((p) => ({ ...p, project: e.target.value }))}
          />
          <input
            placeholder="Açıklamada ara"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
          />
        </div>
      </section>

      <WeeklySummary records={records} />
      <RecordList records={filteredRecords} onEdit={setEditingRecord} onDelete={handleDelete} />

      <RecordModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={handleSaveEdit} onChange={setEditingRecord} />
    </div>
  );
}

export default App;
