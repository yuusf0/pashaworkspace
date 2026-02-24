import type { Theme } from '../types';

interface SettingsProps {
  dailyGoalMinutes: number;
  theme: Theme;
  onGoalChange: (minutes: number) => void;
  onThemeToggle: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function Settings({ dailyGoalMinutes, theme, onGoalChange, onThemeToggle, onExport, onImport }: SettingsProps) {
  return (
    <section className="card">
      <div className="row-between">
        <h2>Ayarlar</h2>
        <button className="btn" onClick={onThemeToggle}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
      <label>
        Günlük hedef (dakika)
        <input type="number" min={1} value={dailyGoalMinutes} onChange={(e) => onGoalChange(Number(e.target.value))} />
      </label>
      <div className="actions inline">
        <button className="btn" onClick={onExport}>
          JSON Export
        </button>
        <label className="btn">
          JSON Import
          <input
            type="file"
            accept="application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.currentTarget.value = '';
            }}
            hidden
          />
        </label>
      </div>
    </section>
  );
}
