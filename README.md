# Günlük Çalışma Süresi Takipçisi (Time Tracker)

Portfolio-ready, offline çalışabilen bir React + TypeScript + Vite uygulaması.

## Özellikler

- Start / Stop timer (yenilemeye rağmen devam eder)
- Kayıt ekleme (proje, açıklama, etiketler, başlangıç/bitiş, süre)
- Günlük özet + hedef progress bar
- Son 7 gün haftalık bar chart
- Tarih/proje/açıklama filtreleme
- Kayıt düzenleme modalı + silme onayı
- JSON export/import
- Light/Dark tema (localStorage)
- Erişilebilirlik: focus-visible, ESC ile modal kapama

## LocalStorage Anahtarları

- `tt_records`
- `tt_running`
- `tt_settings`

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Proje Yapısı

```text
src/
  components/
    DailySummary.tsx
    TimerCard.tsx
    WeeklySummary.tsx
    RecordList.tsx
    RecordModal.tsx
    Settings.tsx
  types/
    index.ts
  utils/
    storage.ts
    time.ts
    time.test.ts
  App.tsx
  main.tsx
  styles.css
```
