# Product Requirement Document (PRD)
## Personal Kanban Board Web Application

---

## 1. Overview & Objective

### 1.1 Document Overview
Document ini berisi spesifikasi kebutuhan produk (Product Requirement Document / PRD) untuk pengembangan aplikasi web **Personal Kanban Board**. PRD ini dirancang untuk memberikan panduan teknis dan fungsional yang jelas kepada tim pengembang/AI coding assistant.

### 1.2 Product Vision
Menyediakan media manajemen tugas harian yang cepat, ringan, responsif, dan bebas gangguan (*frictionless*) bagi pengguna individu untuk memantau alur kerja (*workflow*) dari tahap perencanaan hingga penyelesaian secara visual.

---

## 2. Target Audience & User Personas

* **Target Pengguna**: Freelancer, Software Developer, Student, Project Manager, dan Professional yang membutuhkan sistem pelacakan tugas pribadi tanpa kerumitan fitur kolaborasi enterprise.
* **Kebutuhan Utama**:
  * Visualisasi alur kerja yang jelas dan real-time.
  * Kemudahan memindahkan tugas antar status.
  * Penyimpanan data lokal tanpa perlu otentikasi/login berbelit-belit.
  * Aksesibilitas di perangkat desktop maupun seluler.

---

## 3. Workflow & Column Structure

Aplikasi ini mengadopsi 4 tahap alur kerja utama (*4-Stage Kanban Workflow*):

1. **To Do**: Menampung seluruh tugas yang telah terencana namun belum dimunculkan ke dalam tahap eksekusi.
2. **On Progress**: Menampung tugas yang saat ini aktif sedang dikerjakan.
3. **On Review**: Menampung tugas yang pengerjaannya telah selesai dan sedang dalam tahap verifikasi, pengujian, atau peninjauan ulang.
4. **Done**: Menampung tugas yang sudah selesai sepenuhnya dan terverifikasi.

---

## 4. Functional Requirements

### 4.1 Task Management (CRUD)
* **Create**: Pengguna dapat menambahkan tugas baru melalui modal dialog/form dengan parameter:
  * **Judul (Title)**: String (Wajib, max 100 karakter)
  * **Deskripsi (Description)**: Text (Opsional, Markdown support jika memungkinkan)
  * **Prioritas (Priority)**: Dropdown pilihan (`Low`, `Medium`, `High`)
  * **Tanggal Tenggat (Due Date)**: Date Picker (Opsional, format YYYY-MM-DD)
* **Read**: Menampilkan kartu tugas pada kolom yang sesuai dengan indikator visual prioritas dan batas waktu.
* **Update**: Pengguna dapat mengubah detail tugas (judul, deskripsi, prioritas, tenggat, status) melalui modal edit.
* **Delete**: Pengguna dapat menghapus tugas dengan pop-up konfirmasi keselamatan data.

### 4.2 Interaction & Drag-and-Drop
* **Drag-and-Drop (Desktop Focus)**: Pengguna dapat menggeser kartu tugas antar kolom secara intuitif.
* **Quick Status Button (Mobile/Touch Focus)**: Opsi menu cepat pada setiap kartu untuk memindahkan tugas ke kolom sebelum/sesudahnya tanpa melakukan drag.

### 4.3 Search, Filter & Sorting
* **Search Bar**: Pencarian cerdas secara real-time berdasarkan kata kunci pada judul dan deskripsi tugas.
* **Priority Filter**: Menyaring tampilan kartu berdasarkan tingkatan prioritas (`All`, `High`, `Medium`, `Low`).
* **Column Counter**: Menampilkan jumlah total task yang ada pada setiap header kolom (Contoh: `To Do (4)`).

### 4.4 Data Persistence
* **Local Storage Integration**: Seluruh state data tersimpan secara otomatis di `window.localStorage` pengguna.
* **Initial Seed Data**: Apabila `localStorage` kosong, sistem akan memuat 3-4 data tugas contoh (*sample tasks*) agar antarmuka tidak kosong pada kunjungan pertama.

---

## 5. Non-Functional Requirements

* **Performance**: Waktu muat aplikasi (*First Contentful Paint*) < 1.5 detik, tanpa dependensi backend eksternal yang memperlambat rendering.
* **Responsiveness**: Berjalan lancar pada resolusi layar Smartphone (>=360px), Tablet, hingga Desktop (>=1920px).
* **Usability & Accessibility**: Kontras warna memenuhi standar WCAG AA, dukungan navigasi keyboard dasar, serta animasi transisi yang halus (smooth transitions).

---

## 6. Technical Architecture & Tech Stack

* **Framework**: React.js / Next.js (App Router)
* **Styling**: Tailwind CSS (Utility-first styling)
* **Icons**: Lucide React Icons
* **Drag and Drop Library**: `@hello-pangea/dnd` atau `dnd-kit`
* **State Management**: React `useState` & `useEffect` dengan custom hook `useLocalStorage`

---

## 7. UI/UX Design System

### 7.1 Priority Color Codes
* 🔴 **High Priority**: Red/Rose Theme (`bg-red-500/10`, `text-red-600`, `border-red-200`)
* 🟡 **Medium Priority**: Amber/Yellow Theme (`bg-amber-500/10`, `text-amber-600`, `border-amber-200`)
* 🔵 **Low Priority**: Sky/Blue Theme (`bg-sky-500/10`, `text-sky-600`, `border-sky-200`)

### 7.2 Theme & Layout
* Modern Clean Dashboard Theme (Neutral Slate/Zinc background `#f8fafc` atau Dark Theme `#0f172a`).
* Soft Card Shadows (`shadow-sm` hover `shadow-md`).
* Rounded borders (`rounded-xl` / `rounded-2xl`).

---

## 8. Roadmap & Future Scope
* Impor/Ekspor data JSON.
* Dark Mode / Light Mode toggle.
* Sub-task / Checklist dalam setiap kartu tugas.
* Sub-fitur statistik & grafik produktivitas mingguan.