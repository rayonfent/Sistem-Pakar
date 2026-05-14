# UNILA Academic Expert Chatbot

Sistem pakar akademik berbasis React untuk membantu mahasiswa Universitas Lampung memahami aturan akademik melalui percakapan berbahasa Indonesia. Aplikasi ini menggabungkan NLP sederhana, *forward chaining inference engine*, dan basis pengetahuan aturan kampus.

## Fitur Utama

- Chatbot akademik dengan respons berbasis aturan (rule-based).
- Inference engine dengan evaluasi kondisi, *rule firing*, dan *trace* proses inferensi.
- Deteksi intent dan ekstraksi fakta (IPK, semester, SKS, presensi, status administrasi, dll).
- Admin panel untuk meninjau rules, intents, logs, users, dan simulasi upload PDF.
- Multi-chat sederhana berbasis penyimpanan in-memory.

## Teknologi

- React 19 (`react`, `react-dom`)
- `react-scripts` (Create React App)
- Testing library (`@testing-library/*`, `web-vitals`)

## Menjalankan Proyek

### 1) Install dependency

```bash
npm install
```

### 2) Jalankan mode development

```bash
npm start
```

Lalu buka `http://localhost:3000`.

### 3) Build production

```bash
npm run build
```

### 4) Menjalankan test

```bash
npm test
```

## Akun Demo

- Admin
  - Email: `admin@unila.ac.id`
  - Password: `admin123`
- Mahasiswa
  - Email: `demo@student.unila.ac.id`
  - Password: `demo123`

> Catatan: data user berada di memori (`src/database.js`) dan bersifat demo.

## Arsitektur Singkat

Alur utama saat user mengirim pesan:

1. Input pengguna dikirim dari UI (`UnilaExpertChatbot`).
2. `NLPEngine` melakukan normalisasi, tokenisasi, stopword removal, stemming, deteksi intent, ekstraksi fakta.
3. `InferenceEngine` menjalankan forward chaining terhadap `KNOWLEDGE_BASE.rules`.
4. `ResponseGenerator` memilih rule paling relevan, mengisi template, menambahkan ringkasan data dan sumber.
5. Hasil ditampilkan ke chat, metadata/log disimpan ke `Database` in-memory.

## Struktur Proyek dan Fungsi Tiap File

### Root

- `package.json`: metadata proyek, dependencies, dan scripts (`start`, `build`, `test`, `eject`).
- `package-lock.json`: lockfile npm.
- `.gitignore`: daftar file/folder yang diabaikan Git.
- `README.md`: dokumentasi proyek.

### `public/`

- `public/index.html`: HTML entry point.
- `public/favicon.ico`: favicon aplikasi.
- `public/logo.png`: logo UNILA untuk UI.
- `public/darkbg.png`: background mode gelap.
- `public/lightbg.png`: background mode terang.
- `public/manifest.json`: konfigurasi web app manifest.
- `public/robots.txt`: aturan crawler.

### `src/`

- `src/index.js`: bootstrap React (`createRoot`) dan render `<App />`.
- `src/index.css`: styling global dasar.
- `src/App.js`: entry komponen aplikasi, mengekspor `UnilaExpertChatbot`.
- `src/App.css`: stylesheet bawaan CRA (saat ini tidak jadi pusat styling karena banyak inline style).

- `src/components/UnilaExpertChatbot.js`:
  - Komponen utama aplikasi.
  - Menangani login, tampilan chat, tampilan admin, dark/light mode, riwayat chat.
  - Menjalankan inferensi melalui `InferenceEngine` dan membangkitkan respons dengan `ResponseGenerator`.
  - Menyimpan pesan/chat/log ke `Database` in-memory.

- `src/knowledgeBase.js`:
  - Sumber aturan utama (`KNOWLEDGE_BASE.rules`) dan definisi intent (`KNOWLEDGE_BASE.intents`).
  - Berisi 100+ rule akademik UNILA lintas topik: SKS, IPK, UTS/UAS, skripsi, KKN, PKL, yudisium, wisuda, registrasi, DO, cuti, MBKM, dll.
  - Setiap rule memuat `rule_id`, `category`, `priority`, `conditions`, `result`, `template`, `source`.

- `src/nlpEngine.js`:
  - Pipeline NLP ringan untuk Bahasa Indonesia.
  - Fitur: normalisasi teks, tokenisasi, stopword removal, stemming sederhana, cosine similarity.
  - `detectIntent()` menggabungkan hard-signal keyword routing + similarity scoring.
  - `extractFacts()` mengekstrak fakta numerik/boolean dari kalimat user.

- `src/inferenceEngine.js`:
  - Menilai kondisi rule (`>=`, `<=`, `>`, `<`, `==`, `!=`).
  - Menjalankan `forwardChain()` dengan pemeringkatan rule berdasarkan spesifisitas kondisi dan prioritas.
  - Menghasilkan daftar rule yang *fired*, skor relevansi, dan trace inferensi.

- `src/responseGenerator.js`:
  - Mengisi placeholder template (`{ipk}`, `{semester}`, dll).
  - Menyusun respons final dari rule utama + informasi tambahan relevan.
  - Menyisipkan ringkasan data terdeteksi dan sumber aturan.

- `src/database.js`:
  - Simulasi database in-memory untuk `users`, `chats`, `messages`, `logs`.
  - Menyediakan utilitas `createChat`, `addMessage`, `addLog`, `getMessages`, `getUserChats`.

- `src/reportWebVitals.js`: utilitas metrik performa web (bawaan CRA).
- `src/App.test.js`: file test bawaan React Testing Library.
- `src/setupTests.js`: setup testing environment (`jest-dom`).
- `src/logo.svg`: aset logo bawaan CRA.

## Detail Data Knowledge Base

Knowledge base disusun dalam dua bagian:

- `rules`: aturan inferensi yang dievaluasi mesin.
- `intents`: peta intent pengguna ke kategori rule dan fakta minimum yang dibutuhkan.

Contoh struktur rule:

```js
{
  rule_id: "R001",
  category: "SKS",
  priority: 1,
  conditions: [{ field: "ipk", op: ">=", val: 3.0 }],
  result: { max_sks: 24 },
  template: "Mahasiswa dengan IPK {ipk} ...",
  source: "Peraturan Akademik UNILA ..."
}
```

## Cara Menambah Aturan Baru

1. Buka `src/knowledgeBase.js`.
2. Tambahkan objek rule baru ke array `rules`.
3. Pastikan konsisten pada:
   - `rule_id` unik,
   - `category` sesuai intent,
   - `conditions` valid,
   - `template` memakai placeholder yang sesuai data.
4. Jika perlu, tambahkan/ubah intent di array `intents` agar pertanyaan user dapat diarahkan ke kategori rule yang tepat.

## Keterbatasan Saat Ini

- Database belum persisten (restart aplikasi akan menghapus chat/log).
- Keamanan autentikasi masih demo (credential hardcoded).
- Upload PDF di admin panel masih simulasi UI, belum parsing nyata di backend.
- NLP masih berbasis rule/heuristic sederhana (belum model language learning).

## Pengembangan Lanjutan (Saran)

- Tambahkan backend + database persisten (PostgreSQL/MySQL/MongoDB).
- Implementasi parser PDF aktual untuk update knowledge base otomatis.
- Tambahkan validasi konflik rule dan tools manajemen knowledge base.
- Tambah testing unit untuk `nlpEngine`, `inferenceEngine`, `responseGenerator`.
- Hardening keamanan login dan manajemen sesi.
