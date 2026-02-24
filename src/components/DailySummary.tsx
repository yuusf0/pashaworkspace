import { formatDuration } from '../utils/time';

interface DailySummaryProps {
  todaySeconds: number;
  goalMinutes: number;
  selectedDateTotal: number;
  selectedDate: string;
}

export function DailySummary({ todaySeconds, goalMinutes, selectedDateTotal, selectedDate }: DailySummaryProps) {
  const goalSeconds = goalMinutes * 60;
  const progress = Math.min(100, Math.round((todaySeconds / goalSeconds) * 100));

  return (
    <section className="card">
      <h2>Bugün</h2>
      <div className="summary-grid">
        <div>
          <p className="muted">Toplam Çalışma</p>
          <p className="big">{formatDuration(todaySeconds)}</p>
        </div>
        <div>
          <p className="muted">Seçilen Gün ({selectedDate})</p>
          <p className="big">{formatDuration(selectedDateTotal)}</p>
        </div>
      </div>
      <div>
        <div className="progress-label">
          <span>Günlük hedef: {goalMinutes} dk</span>
          <span>%{progress}</span>
        </div>
        <div className="progress-track" aria-label="günlük hedef ilerleme">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
