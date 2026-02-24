export type Theme = 'light' | 'dark';

export interface TimeRecord {
  id: string;
  tarih: string;
  proje: string;
  aciklama: string;
  baslangicZamani: string;
  bitisZamani: string;
  sureSaniye: number;
  etiketler?: string[];
}

export interface RunningState {
  isRunning: boolean;
  startedAt: string | null;
  draft: {
    proje: string;
    aciklama: string;
    etiketler: string[];
  };
}

export interface Settings {
  dailyGoalMinutes: number;
  theme: Theme;
}

export interface Filters {
  date: string;
  project: string;
  search: string;
}
