import type { RunningState, Settings, TimeRecord } from '../types';

const RECORDS_KEY = 'tt_records';
const RUNNING_KEY = 'tt_running';
const SETTINGS_KEY = 'tt_settings';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const defaultRunningState: RunningState = {
  isRunning: false,
  startedAt: null,
  draft: {
    proje: '',
    aciklama: '',
    etiketler: [],
  },
};

const defaultSettings: Settings = {
  dailyGoalMinutes: 360,
  theme: 'light',
};

export const readRecords = (): TimeRecord[] => {
  if (!canUseStorage()) return [];
  const raw = localStorage.getItem(RECORDS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TimeRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeRecords = (records: TimeRecord[]) => {
  if (!canUseStorage()) return;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const readRunningState = (): RunningState => {
  if (!canUseStorage()) return defaultRunningState;
  const raw = localStorage.getItem(RUNNING_KEY);
  if (!raw) return defaultRunningState;
  try {
    const parsed = JSON.parse(raw) as RunningState;
    if (typeof parsed !== 'object' || parsed === null) return defaultRunningState;
    return {
      isRunning: Boolean(parsed.isRunning),
      startedAt: parsed.startedAt ?? null,
      draft: {
        proje: parsed.draft?.proje ?? '',
        aciklama: parsed.draft?.aciklama ?? '',
        etiketler: Array.isArray(parsed.draft?.etiketler) ? parsed.draft.etiketler : [],
      },
    };
  } catch {
    return defaultRunningState;
  }
};

export const writeRunningState = (state: RunningState) => {
  if (!canUseStorage()) return;
  localStorage.setItem(RUNNING_KEY, JSON.stringify(state));
};

export const readSettings = (): Settings => {
  if (!canUseStorage()) return defaultSettings;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw) as Settings;
    return {
      dailyGoalMinutes: Number(parsed.dailyGoalMinutes) > 0 ? Number(parsed.dailyGoalMinutes) : 360,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return defaultSettings;
  }
};

export const writeSettings = (settings: Settings) => {
  if (!canUseStorage()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const storageKeys = {
  RECORDS_KEY,
  RUNNING_KEY,
  SETTINGS_KEY,
};
