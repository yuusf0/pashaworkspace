import type { TimeRecord } from '../types';
import { formatDuration, getLast7DateKeys } from '../utils/time';

interface WeeklySummaryProps {
  records: TimeRecord[];
}

export function WeeklySummary({ records }: WeeklySummaryProps) {
  const last7 = getLast7DateKeys();
  const byDay = last7.map((date) => ({
    date,
    total: records.filter((r) => r.tarih === date).reduce((sum, r) => sum + r.sureSaniye, 0),
  }));

  const max = Math.max(...byDay.map((d) => d.total), 1);

  const projectTotals = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.proje] = (acc[record.proje] ?? 0) + record.sureSaniye;
    return acc;
  }, {});

  const topProject = Object.entries(projectTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <section className="card">
      <h2>Haftalık Özet</h2>
      <div className="bar-chart">
        {byDay.map((item) => (
          <div key={item.date} className="bar-col">
            <div className="bar" style={{ height: `${Math.round((item.total / max) * 100)}%` }} title={formatDuration(item.total)} />
            <span>{item.date.slice(5)}</span>
          </div>
        ))}
      </div>
      <p className="muted">
        En çok zaman harcanan proje: <strong>{topProject ? `${topProject[0]} (${formatDuration(topProject[1])})` : 'Henüz yok'}</strong>
      </p>
    </section>
  );
}
