import { useEffect } from 'react';
import type { TimeRecord } from '../types';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../utils/time';

interface RecordModalProps {
  record: TimeRecord | null;
  onClose: () => void;
  onSave: (record: TimeRecord) => void;
  onChange: (record: TimeRecord) => void;
}

export function RecordModal({ record, onClose, onSave, onChange }: RecordModalProps) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!record) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>Kayıt Düzenle</h3>
        <label>
          Proje
          <input value={record.proje} onChange={(e) => onChange({ ...record, proje: e.target.value })} />
        </label>
        <label>
          Açıklama
          <input value={record.aciklama} onChange={(e) => onChange({ ...record, aciklama: e.target.value })} />
        </label>
        <label>
          Başlangıç
          <input
            type="datetime-local"
            value={toDateTimeLocalValue(record.baslangicZamani)}
            onChange={(e) => {
              const iso = fromDateTimeLocalValue(e.target.value);
              if (iso) onChange({ ...record, baslangicZamani: iso });
            }}
          />
        </label>
        <label>
          Bitiş
          <input
            type="datetime-local"
            value={toDateTimeLocalValue(record.bitisZamani)}
            onChange={(e) => {
              const iso = fromDateTimeLocalValue(e.target.value);
              if (iso) onChange({ ...record, bitisZamani: iso });
            }}
          />
        </label>
        <div className="actions">
          <button className="btn" onClick={onClose}>
            Vazgeç
          </button>
          <button className="btn primary" onClick={() => onSave(record)}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
