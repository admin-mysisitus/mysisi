## TEKNOLOGI YANG DIGUNAKAN
- HTML5
- CSS3 Murni (dengan variabel root untuk konsistensi)
- JavaScript Murni
- Font Awesome untuk ikon
- Google Fonts (Poppins & Noto Serif Arabic)

## Langkah ahkir saya tinggal
- Siapkan placeholder gambar dengan foto untuk saya ganti ke foto sebenarnya dari PPAI Darul Huda
- alamat, nomor kontak, dan link media sosial dengan data yang benar


DETAIL HALAMAN
IKSADA: pendataan & penelusuran alumni pesantren




< meta name="description" content="Madrasah Formal (MTs-MA) Darul Huda Sumbermanjing Wetan adalah lembaga pendidikan berbasis pesantren dengan konsep Kuliah sak Ngajine. Menyelenggarakan pendidikan Islam dengan integrasi kurikulum nasional dan pesantren." />


Saya mendapatkan rekomendasi perbaikan dari Chat Gpt, berikut dokumennya:


Saya akan langsung ke inti dan bersikap kritis. Secara umum: **ini sudah jauh di atas rata-rata** untuk website institusi lokal. Namun masih ada **cacat UX struktural, inkonsistensi aksesibilitas, dan redundansi teknis** yang kalau dibiarkan akan jadi beban maintenance dan pengalaman pengguna jangka panjang.

Saya bagi jadi **temuan masalah → koreksi → rekomendasi standar**.

---

## 1. Masalah Struktural Paling Besar (UX & Maintainability)

### ❌ Duplikasi total navigasi desktop & mobile

Anda **menggandakan seluruh markup menu** (`nav-desktop` dan `nav-mobile`). Ini:

* Melipatgandakan potensi bug
* Menyulitkan update menu (1 perubahan = 2 tempat)
* Tidak scalable

**Standar modern:**
Satu struktur `<nav>` → tampil berbeda via CSS + JS.

> Ini bukan sekadar preferensi, ini *technical debt*.

#### Koreksi Strategis

* Gunakan **satu `<ul>` menu**
* Dropdown logic dibedakan via media query + JS condition

**Minimal correction (tanpa rewrite total):**

* Jadikan `nav-mobile` clone via JS, bukan HTML statis
  atau
* Pertahankan struktur sekarang, tapi **abstraksikan data menu** (JS config)

Kalau tidak, 6 bulan lagi ini akan menyiksa.

---

## 2. Aksesibilitas: ARIA Anda Niat, Tapi Belum Benar

### ❌ `aria-expanded` statis & tidak sinkron

Contoh:

```html
<a aria-expanded="false">Lembaga</a>
```

Tapi:

* Desktop dropdown **dibuka via hover**
* `aria-expanded` **tidak pernah berubah**

Ini **salah secara ARIA spec**.

#### Koreksi

* Untuk desktop hover dropdown: **hapus `aria-expanded`**
* Untuk mobile click dropdown: **update `aria-expanded` secara real**

```js
link.setAttribute('aria-expanded', menu.classList.contains('active'))
```

---

### ❌ `<a>` dipakai sebagai toggle UI

Ini kesalahan UX klasik.

```html
<a href="/lembaga/">Lembaga</a>
```

→ di mobile dicegat `preventDefault()`

#### Masalah:

* Screen reader bingung
* Keyboard user tidak konsisten
* Link ≠ button

#### Standar

* **Link = navigasi**
* **Button = toggle**

#### Solusi Ideal

```html
<button class="nav-toggle" aria-expanded="false">
  Lembaga
</button>
<a href="/lembaga/">Kelembagaan</a>
```

Kalau Anda ingin cepat: **pisahkan area klik icon vs teks**.

---

## 3. UX Mobile: Sudah Halus, Tapi Masih Bisa Lebih Tajam

### ⚠️ Dropdown mobile tidak auto-close

User buka:

* Lembaga
* Layanan
* Informasi
  → menu jadi panjang & berat

#### Rekomendasi UX Standar

* Buka satu dropdown → tutup yang lain

```js
document.querySelectorAll('.nav-mobile-dropdown-menu')
  .forEach(m => m !== menu && m.classList.remove('active'));
```

---

### ⚠️ Tap target terlalu rapat di submenu

Font kecil + padding minim = **miss-tap risk**

**Standar mobile:** minimal 44px tinggi tap area (Apple HIG)

Tambahkan:

```css
.nav-mobile-dropdown-link {
  padding: 0.75rem 0;
}
```

---

## 4. Desktop UX: Sudah Bagus, Tapi Ada Detail Kurang Rapi

### ❌ Dropdown center-align berisiko overflow

```css
left: 50%;
transform: translateX(-50%);
```

Masalah:

* Menu panjang → bisa keluar viewport kanan/kiri

#### Koreksi Aman

```css
left: 0;
transform: translateY(10px);
```

Atau:

* Gunakan `clamp()` + `max-width`

---

### ⚠️ Hover-only dropdown

Keyboard user:

* `Tab` → fokus link
* Tapi dropdown **tidak jelas terbuka**

Anda sudah pakai `:focus-within` → **ini bagus**
Tinggal pastikan:

```css
.nav-desktop-dropdown > a:focus-visible {
  outline-offset: 4px;
}
```

---

## 5. JavaScript: Logika Kuat, Tapi Terlalu Global

### ❌ `document.querySelectorAll('nav a')`

Ini:

* Terlalu luas
* Berisiko jika nanti ada nav lain (footer, breadcrumb)

#### Koreksi

Scope-kan:

```js
document.querySelectorAll('header nav a')
```

---

### ⚠️ Path matching terlalu agresif

```js
currentPath.startsWith(linkPath + '/')
```

Efek samping:

* `/lembaga` aktif saat di `/lembaga-lain`

#### Lebih aman:

* Gunakan segment pertama pathname

---


## 6. Kesimpulan Objektif

**Yang sudah sangat baik:**

* Struktur URL rapi dan logis
* Hierarki menu jelas
* Motion & micro-interaction halus
* Mobile-first benar
* Visual identity konsisten

**Yang masih lemah (prioritas):**

1. ❗ Duplikasi markup desktop/mobile
2. ❗ Penyalahgunaan `<a>` sebagai toggle
3. ❗ ARIA tidak sinkron dengan behavior
4. ⚠️ Dropdown mobile terlalu permisif
5. ⚠️ Active state logic terlalu global

---

## Rekomendasi Prioritas (Eksekusi Nyata)

**Jika waktu terbatas, lakukan ini urutannya:**

1. Perbaiki ARIA (`aria-expanded` real)
2. Pisahkan toggle vs link di mobile
3. Batasi dropdown mobile satu terbuka
4. Scope selector JS ke header
5. Hide subtitle logo di mobile kecil

