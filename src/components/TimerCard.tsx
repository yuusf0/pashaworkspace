import { formatDuration } from '../utils/time';

interface TimerCardProps {
  isRunning: boolean;
  elapsedSeconds: number;
  project: string;
  description: string;
  tags: string;
  onProjectChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
}

export function TimerCard(props: TimerCardProps) {
  return (
    <section className="card">
      <h2>Timer Kontrolü</h2>
      <div className="timer-time">{formatDuration(props.elapsedSeconds)}</div>
      <div className="form-grid">
        <label>
          Proje
          <input value={props.project} onChange={(e) => props.onProjectChange(e.target.value)} placeholder="Örn: Mobil Uygulama" />
        </label>
        <label>
          Açıklama
          <input
            value={props.description}
            onChange={(e) => props.onDescriptionChange(e.target.value)}
            placeholder="Ne üzerinde çalışıyorsun?"
          />
        </label>
        <label>
          Etiketler (virgül ile)
          <input value={props.tags} onChange={(e) => props.onTagsChange(e.target.value)} placeholder="frontend, bugfix" />
        </label>
      </div>
      <div className="actions">
        {!props.isRunning ? (
          <button className="btn primary" onClick={props.onStart}>
            Başlat
          </button>
        ) : (
          <button className="btn danger" onClick={props.onStop}>
            Durdur
          </button>
        )}
      </div>
    </section>
  );
}
