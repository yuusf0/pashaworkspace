const ISTANBUL_TZ = 'Europe/Istanbul';

export const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const mins = Math.floor((safeSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (safeSeconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

export const getDateKeyInIstanbul = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ISTANBUL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const formatTimeInIstanbul = (iso: string): string => {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: ISTANBUL_TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
};

export const getLast7DateKeys = (): string[] => {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - index));
    return getDateKeyInIstanbul(d);
  });
};

export const recalculateDuration = (startIso: string, endIso: string): number => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.floor((end - start) / 1000));
};

export const toDateTimeLocalValue = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const fromDateTimeLocalValue = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};
