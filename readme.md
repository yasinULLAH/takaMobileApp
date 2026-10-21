# پختونخوا ٹھیکیدار اینڈ مزدور حساب کتاب سسٹم
### KPK Tekedar & Construction Labor Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-emerald?style=for-the-badge&logo=github)](https://yasinullah.github.io/takaMobileApp/)
[![Repository](https://img.shields.io/badge/Repository-GitHub-blue?style=for-the-badge&logo=github)](https://github.com/yasinULLAH/takaMobileApp/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

A mobile-first, serverless Single-Page Application (SPA) tailored specifically for construction contractors (*ٹھیکیدار*) and site supervisors (*منشی*) in Khyber Pakhtunkhwa (KPK) and across Pakistan. The system handles active and past contract sites (*ٹھیکے*), worker directories (*مزدور و مستری*), daily attendance with automatic wage calculations (*حاضری و دیہاڑی*), cash flow ledgers (*روزنامچہ کھاتہ*), print-ready vouchers, and client-side AES-256 encrypted backups.

---

## 🌐 Live Application
Access the production application directly in any modern mobile or desktop browser:
👉 **[https://yasinullah.github.io/takaMobileApp/](https://yasinullah.github.io/takaMobileApp/)**

---

## 🔑 Default Credentials

The application comes pre-loaded with demonstration accounts. Defaults are auto-filled on page launch for immediate testing:

| Role | Mobile / Username | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **بڑا ٹھیکیدار (Admin)** | `03361593533` | `Tekedar@786` | Full Control (Create, Edit, Delete, Roles, Backups) |
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

### 2. مزدور اور مستری کھاتہ (Labor Directory & Ledgers)
* Categories for Mason (*راج مستری*), Shuttering (*شٹرنگ*), Steel Fixer (*سریا بائنڈر*), Plumber/Electrician, and Helpers (*مزدور*).
* Automatic photo compression below **100 KB** using client-side HTML5 canvas prior to storage.
* Automated tracking of total days worked, gross wages earned, advances paid, and balance payable.

### 3. حاضری و دیہاڑی رجسٹر (Daily Attendance & Automated Payroll)
* Shift variants with automated wage multipliers:
  * پورا دن (Full Day = 1.0x)
  * آدھا دن (Half Day = 0.5x)
  * ڈبل شفٹ (Double Shift = 2.0x)
  * غیر حاضر (Absent = 0.0x)
* Support for daily overtime bonuses and project-specific notes.
* **اجتماعی حاضری شیٹ (Bulk Attendance Register):** Mark attendance for the entire workforce simultaneously with one click.

### 4. نقد حساب کتاب و روزنامچہ (Cashbook & Expense Ledger)
* Categorized entry streams:
  * مالک سے قسط وصولی (Client Installment Receipts - Cash Inflow)
  * مزدور ادائیگی / ایڈوانس (Labor Wage & Advance Disbursement - Cash Outflow)
  * میٹریل اور سائٹ خرچہ (Cement, Steel, Bricks, Crushed Stone & Logistics - Cash Outflow)
* Integrated bill/receipt image capture with auto-compression.
* Payment modes: Cash, EasyPaisa, JazzCash, and Bank Cheque / Transfer.

### 5. رپورٹ پرنٹنگ و واؤچرز (Print Engine & Receipts)
* Ready-to-print formatted reports for single sites, worker ledger slips, and expense vouchers.
* Data export to **PDF**, **Excel (XLSX)**, **CSV**, and clean printer views via DataTables.

### 6. سیکیورٹی و انکرپٹڈ بیک اپ (Security & Encryption)
* **Mathematical Dynamic Captcha:** Canvas-based anti-bot verification with random noise and rotation.
* **Brute-Force Rate Limiting:** Temporary account lockouts after consecutive failed attempts.
* **Session Lifecycle:** 40-minute inactivity auto-logout and 8-hour maximum session cap.
* **AES-256 + HMAC-SHA256 Encrypted Backups:** Full database download in encrypted `.json` format with cryptographic integrity verification on restore.

---

## 🛠️ Technology Stack

* **Typography:** Calibri, Segoe UI, and Urdu system fonts with full RTL support.
* **Styling:** [Tailwind CSS CDN](https://tailwindcss.com/) + Custom CSS variable theming.
* **Core Logic:** Vanilla JavaScript (ES6+) architecture within a single self-contained application file.
* **DOM & UI Helpers:** [jQuery 3.7.1](https://jquery.com/), [SweetAlert2](https://sweetalert2.github.io/), [Select2 RTL](https://select2.org/).
* **Validation:** [JustValidate 4.3](https://just-validate.dev/).
* **Data Grids:** [DataTables](https://datatables.net/) with Responsive, Buttons, ColReorder, JSZip, and pdfMake integrations.
* **Cryptography:** [CryptoJS 4.2.0](https://cryptojs.gitbook.io/) (SHA-256, AES-256, HMAC).

---

## 📁 Repository Structure

```text
takaMobileApp/
│
├── index.html        # Complete standalone application (UI, styles, and logic)
├── README.md         # Comprehensive project documentation
└── LICENSE           # MIT open-source license
```

---

## 💻 Local Setup & Deployment

Because the application is completely client-side without external backend dependencies, you can run it locally in seconds:

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

### Deploying to GitHub Pages
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