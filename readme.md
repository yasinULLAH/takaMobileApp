# پختونخوا ٹھیکیدار اینڈ مزدور حساب کتاب سسٹم
### KPK Tekedar & Construction Labor Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-emerald?style=for-the-badge&logo=github)](https://yasinullah.github.io/takaMobileApp/)
[![Repository](https://img.shields.io/badge/Repository-GitHub-blue?style=for-the-badge&logo=github)](https://github.com/yasinULLAH/takaMobileApp/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20%26%20Offline-success?style=for-the-badge&logo=pwa)](manifest.json)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B%20GD%20Optimized-777BB4?style=for-the-badge&logo=php)](upload_logo.php)

A mobile-first, serverless Single-Page Application (SPA) with Progressive Web App (PWA) capabilities and PHP image optimization, tailored specifically for construction contractors (*ٹھیکیدار*) and site supervisors (*منشی*) in Khyber Pakhtunkhwa (KPK) and across Pakistan. The system handles active and past contract sites (*ٹھیکے*), worker directories (*مزدور و مستری*), daily attendance with automatic wage calculations (*حاضری و دیہاڑی*), cash flow ledgers (*روزنامچہ کھاتہ*), print-ready vouchers, user role permissions, customizable logos and favicons, client-side AES-256 encrypted backups, and offline work.

---

## 🌐 Live Application
Access the production application directly in any modern mobile or desktop browser:
👉 **[https://yasinullah.github.io/takaMobileApp/](https://yasinullah.github.io/takaMobileApp/)**

---

## 🔑 Default Credentials

The application comes pre-loaded with demonstration accounts. Defaults are auto-filled on page launch for immediate testing:

| Role | Mobile / Username | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **بڑا ٹھیکیدار (Admin)** | `03361593533` | `Tekedar@786` | Full Control (Create, Edit, Delete, Roles, Backups, Logo Management) |
| **سائٹ منشی (Standard User)** | `03129876543` | `Munshi@786` | Operational (Add Entries, Attendance, View Records) |

---

## 🚀 Key Modules & Capabilities

### 1. ٹھیکہ مینجمنٹ (Contract Sites Management)
* Separate tracking for **جاری ہے (Running)** and **مکمل شدہ (Completed)** construction projects.
* Support for contract types:
  * صرف لیبر ریٹ (فی مربع فٹ - Labor Rate per Sq. Ft.)
  * بمعہ میٹریل مکمل ٹھیکہ (Turnkey with Material)
  * لمسم یکمشت ٹھیکہ (Lump Sum Contract)
* Real-time calculation of total contract amount, received installments, labor/material expenditure, outstanding receivables, and net profit margins.
* Filter contracts by active and completed status with instant statistics update.

### 2. مزدور اور مستری کھاتہ (Labor Directory & Ledgers)
* Categories for Mason (*راج مستری*), Shuttering (*شٹرنگ*), Steel Fixer (*سریا بائنڈر*), Plumber/Electrician, and Helpers (*مزدور*).
* Automatic photo compression below **100 KB** using client-side HTML5 canvas prior to storage.
* Automated tracking of total days worked, gross wages earned, advances paid, and balance payable.
* Comprehensive worker financial cards showing net payable vs advance payments.

### 3. حاضری و دیہاڑی رجسٹر (Daily Attendance & Automated Payroll)
* Shift variants with automated wage multipliers:
  * پورا دن (Full Day = 1.0x)
  * آدھا دن (Half Day = 0.5x)
  * ڈبل شفٹ (Double Shift = 2.0x)
  * غیر حاضر (Absent = 0.0x)
* Support for daily overtime bonuses and project-specific notes.
* **اجتماعی حاضری شیٹ (Bulk Attendance Register):** Mark attendance for the workforce simultaneously with one click.
* **ٹھیکہ فلٹر اور چیک باکس سلیکشن (Theka Filtering & Cherry-Pick Bulk Attendance):**
  * Filter attendance sheets by specific Theka construction site or view all sites.
  * Individual cherry-pick checkboxes for each worker so contractors can select only those needed for a specific site.
  * Master "تمام منتخب کریں / غیر منتخب کریں (Select All / Deselect All)" checkbox with real-time selection counter (`X / Y مزدور منتخب شدہ`).
  * Per-worker site assignment, custom status selection, and custom overtime bonus input.
  * Safely records attendance only for checked workers.

### 4. نقد حساب کتاب و روزنامچہ (Cashbook & Expense Ledger)
* Categorized entry streams:
  * مالک سے قسط وصولی (Client Installment Receipts - Cash Inflow)
  * مزدور ادائیگی / ایڈوانس (Labor Wage & Advance Disbursement - Cash Outflow)
  * میٹریل اور سائٹ خرچہ (Cement, Steel, Bricks, Crushed Stone & Logistics - Cash Outflow)
* Integrated bill/receipt image capture with auto-compression.
* Payment modes: Cash, EasyPaisa, JazzCash, and Bank Cheque / Transfer.

### 5. رپورٹ پرنٹنگ و واؤچرز (Print Engine & Receipts)
* Ready-to-print formatted reports for single sites, worker ledger slips, and expense vouchers with official app logo branding.
* Data export to **PDF**, **Excel (XLSX)**, **CSV**, and clean printer views via DataTables.
* Direct print dialog triggers with automated page styling.

### 6. صارفین اور اختیارات (User Management & Role Permissions - Full CRUD)
* Dedicated Role & Permission Management panel exclusively accessible to Admin (*بڑا ٹھیکیدار*).
* Complete CRUD (Create, Read, Update, Delete) module for user accounts:
  * **شامل کریں (Create):** Add new users with full name, mobile login identifier, assigned role, account status, and password.
  * **ترمیم (Edit):** In-place editing of all user details via modal dialog; password update is optional on edit.
  * **حذف کریں (Delete):** Secure deletion with confirmation prompts and protection preventing the active user from deleting their own account.
  * **فوری ایکشنز (Quick Actions):** One-click role toggle (Admin ↔ Standard User) and simulated membership expiry toggles.
* Real-time header and navigation role badge synchronization upon profile updates.

### 7. ایپ لوگو، فیو آئیکون و پی ایچ پی آٹو ری سائزر (App Logo, Favicon & PHP Auto-Resizer)
* **خودکار پی ایچ پی ری سائزنگ (PHP Image Processing):**
  * Backend script (`upload_logo.php`) powered by PHP GD library.
  * Automatically resizes and compresses uploaded logos to strictly remain under **200 KB**.
  * Auto-generates multi-resolution static files in-place without database schema modifications:
    * `logo.png` - Primary ultra-fast application brand logo.
    * `favicon.ico` - Multi-size binary ICO file (16x16 & 32x32 frames).
    * `favicon-16x16.png` & `favicon-32x32.png` - Standard browser tab icons.
    * `apple-touch-icon.png` (180x180) - iOS home screen web clip icon.
    * `icon-192.png` & `icon-512.png` - High-DPI PWA launcher and splash icons.
* **ایڈمن برانڈنگ کنٹرول (Admin Logo Manager):**
  * Settings control card allowing admins to upload PNG, JPG, or WEBP images.
  * Live cache-busting timestamp refresh across header, sidebar, login view, and print templates without page reloads.

### 8. پروگریسو ویب ایپ و آف لائن سپورٹ (Progressive Web App - PWA)
* Fully installable as a native app on mobile (Android/iOS) and desktop (Windows/Mac/Linux).
* PWA Web App Manifest (`manifest.json`) with Urdu RTL metadata, standalone display mode, and custom app icons.
* Service Worker (`sw.js`) caching core application assets for complete offline availability and lightning-fast load times.

### 9. حسب ضرورت شہر اور مزدور ہنر کنٹرول (Custom Cities & Labor Roles CRUD)
* Full CRUD manager in Settings for adding, editing, and deleting custom construction cities/locations and worker skill categories.
* Real-time counter badges and dynamic list rendering.
* **سمارٹ ڈراپ ڈاؤنز (Adaptive Dropdowns):** Select2 auto-activates only on select boxes with more than 8 items; uses lightweight native dropdowns for 8 or fewer items for optimal mobile performance.
* In-place custom city/role typing support directly in select boxes.

### 10. نمونہ ڈیٹا کنٹرول (Sample Data Sandbox Controls)
* Dedicated sandbox tools in Settings with safety confirmation modals:
  * **تمام ڈیٹا صاف کریں (Clear Sample Data):** Clears all dummy contracts, workers, attendance, and transactions while keeping all user login accounts secure.
  * **نمونہ ڈیٹا لوڈ کریں (Load Sample Data):** Restores realistic demo projects and transactions while keeping user accounts intact.

### 11. ٹیبل گرڈ و درست کالم میپنگ (Robust Table Grid & Header Alignment)
* Strict 1-to-1 vertical alignment between table headers and data cells across all tables (`table-thekas`, `table-mazdoors`, `table-attendance`, `table-hisab`, `table-users`).
* Elimination of responsive RTL layout glitches and column resizing artifacts.
* Smooth horizontal scrolling containers (`overflow-x-auto`) for small screens preserving single-line data clarity without collapsing columns into hidden rows.

### 12. سیکیورٹی و انکرپٹڈ بیک اپ (Security & Encryption)
* **Mathematical Dynamic Captcha:** Canvas-based anti-bot verification with random noise and rotation.
* **Brute-Force Rate Limiting:** Temporary account lockouts after consecutive failed attempts.
* **Session Lifecycle:** 40-minute inactivity auto-logout and 8-hour maximum session cap with smooth split-second login persistence check preventing auth flash on reload.
* **AES-256 + HMAC-SHA256 Encrypted Backups:** Full database download in encrypted `.json` format with cryptographic integrity verification on restore.

---

## 🛠️ Technology Stack

* **Typography:** Calibri, Segoe UI, Noto Sans Arabic, Noto Nastaliq Urdu, and Readex Pro with full RTL support.
* **Styling:** [Tailwind CSS CDN](https://tailwindcss.com/) + Custom CSS variable theming with responsive touch-target optimizations.
* **Core Logic:** Vanilla JavaScript (ES6+) architecture within a single self-contained application file.
* **PWA Engine:** Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) with static asset caching.
* **Backend Image Processor:** PHP 8.3+ with GD Extension (`upload_logo.php`) for automatic image resizing under 200KB and ICO generation.
* **DOM & UI Helpers:** [jQuery 3.7.1](https://jquery.com/), [SweetAlert2](https://sweetalert2.github.io/), [Select2 RTL](https://select2.org/).
* **Validation:** [JustValidate 4.3](https://just-validate.dev/).
* **Data Grids:** [DataTables](https://datatables.net/) with Buttons, JSZip, and pdfMake integrations.
* **Cryptography:** [CryptoJS 4.2.0](https://cryptojs.gitbook.io/) (SHA-256, AES-256, HMAC).

---

## 📁 Repository Structure

```text
takaMobileApp/
│
├── index.html            # Complete standalone application (UI, styles, and logic)
├── upload_logo.php       # PHP GD script for logo resizing (<200KB) and favicon generation
├── manifest.json         # PWA Web App Manifest configuration
├── sw.js                 # Service worker for offline asset caching
├── logo.png              # Optimized brand logo (<200KB)
├── favicon.ico           # Multi-resolution binary browser icon (16x16, 32x32)
├── favicon-16x16.png     # 16x16 browser tab icon
├── favicon-32x32.png     # 32x32 browser tab icon
├── apple-touch-icon.png  # 180x180 iOS home screen icon
├── icon-192.png          # 192x192 PWA launcher icon
├── icon-512.png          # 512x512 PWA splash icon
├── README.md             # Comprehensive project documentation
└── LICENSE               # MIT open-source license
```

---

## 💻 Local Setup & Deployment

### Method 1: Client-Only Run (Direct Browser Open)
Because the application core is completely client-side, you can run it locally in seconds:

1. Clone the repository:
   ```bash
   git clone https://github.com/yasinULLAH/takaMobileApp.git
   ```
2. Navigate into the folder:
   ```bash
   cd takaMobileApp
   ```
3. Open `index.html` directly in any web browser:
   * **Windows:** Double-click `index.html` or run `start index.html`
   * **macOS:** Run `open index.html`
   * **Linux:** Run `xdg-open index.html`

### Method 2: Local PHP Web Server (Recommended for PWA & Logo Resizing)
To test PWA installation, Service Worker caching, and the PHP logo upload & auto-resize system:

1. Start PHP's built-in web server inside the project root:
   ```bash
   php -S localhost:8000
   ```
2. Open your browser and navigate to:
   ```text
   http://localhost:8000/
   ```

### Method 3: Deploying with Apache / XAMPP / WAMP / cPanel
1. Copy the `takaMobileApp` folder to your server's web root (e.g., `htdocs`, `www`, or `public_html`).
2. Ensure PHP has the `gd` extension enabled in `php.ini`.
3. Access the URL in your browser. All file permissions for logo uploads and static icon generation will operate out-of-the-box.

### Method 4: Deploying to GitHub Pages
1. Go to repository **Settings** on GitHub.
2. Select **Pages** from the left sidebar.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. The app will be available at `https://<username>.github.io/<repo-name>/`.

---

## 👤 Author & Support

* **Developer:** Yasin Ullah
* **LinkedIn:** [https://www.linkedin.com/in/yasin-ullah-029229232/](https://www.linkedin.com/in/yasin-ullah-029229232/)
* **WhatsApp:** `+92 336 1593533`
* **GitHub:** [@yasinULLAH](https://github.com/yasinULLAH)