import type { TimeRecord } from '../types';
import { formatDuration, formatTimeInIstanbul } from '../utils/time';

interface RecordListProps {
  records: TimeRecord[];
  onEdit: (record: TimeRecord) => void;
  onDelete: (id: string) => void;
}

export function RecordList({ records, onEdit, onDelete }: RecordListProps) {
  if (!records.length) {
    return <div className="card empty-state">Kayıt bulunamadı.</div>;
  }

  return (
    <section className="card">
      <h2>Kayıtlar</h2>
      <div className="record-list">
        {records.map((record) => (
          <article key={record.id} className="record-item">
            <div>
              <span className="badge">{formatDuration(record.sureSaniye)}</span>
              <strong>{record.proje || 'İsimsiz Proje'}</strong>
              <p className="muted">{record.aciklama || '-'}</p>
              <small>
                {formatTimeInIstanbul(record.baslangicZamani)} - {formatTimeInIstanbul(record.bitisZamani)}
              </small>
            </div>
            <div className="actions inline">
              <button className="btn" onClick={() => onEdit(record)}>
                Düzenle
              </button>
              <button className="btn danger" onClick={() => onDelete(record.id)}>
                Sil
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
