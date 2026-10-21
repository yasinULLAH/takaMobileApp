# 📘 USERGUIDE.md

# پختونخوا ٹھیکیدار اینڈ مزدور حساب کتاب سسٹم
### KPK Tekedar & Mazdoor Management System — Complete User Guide

**Version:** 1.0.0  
**Author:** Yasin Ullah — [LinkedIn](https://www.linkedin.com/in/yasin-ullah-029229232/) | WhatsApp: 03361593533  
**Tech Stack:** HTML5 + Tailwind CSS + jQuery + DataTables + SweetAlert2 + CryptoJS (frontend), MySQL (`root/root`) + PHP (backend helpers like `upload_logo.php`)  
**Storage:** Browser `localStorage` (primary) + MySQL (server-side persistence)  
**Language:** Urdu (RTL) with English fallback

---

## 1. 🎯 What Is This App? / ایپ کیا ہے؟

A **construction contractor & labor management system** built for KPK (Khyber Pakhtunkhwa) contractors. It helps you track:

| Module | Urdu | Purpose |
|--------|------|---------|
| Thekas | ٹھیکے | Construction contracts (running + completed) |
| Mazdoors | مزدور | Workers, masons, helpers & their wages |
| Attendance | حاضری | Daily attendance, dihaari (daily wage), overtime |
| Hisab | حساب | Cash flow — owner payments received, labor/material spent |
| Dashboard | ڈیش بورڈ | Live KPIs & profit/loss summary |
| Settings | سیٹنگز | Theme, backup, users, cities, worker roles |

**Who can use it:** Admins (contractors) and Standard Users (site munshi / supervisor).

---

## 2. 🔐 Login & Test Credentials

### 2.1 Default / Seed Accounts

| # | Name | Phone (Login ID) | Password | Role |
|---|------|------------------|----------|------|
| 1 | حاجی یاسین اللہ خان (بڑا ٹھیکیدار) | `03361593533` | `Tekedar@786` | **Admin** |
| 2 | عمران خان خٹک (سائٹ منشی) | `03129876543` | `Munshi@786` | Standard User |
| 3 | انجینئر تیمور علی مہمند | `03451122334` | `Taimur@786` | **Admin** |
| 4 | وقار احمد یوسفزئی (سپروائزر) | `03015566778` | `Waqar@786` | Standard User |

### 2.2 Quick Test Buttons (1-Click)

On the login screen you'll find **two green/blue buttons**:
- 🟢 **بڑا ٹھیکیدار (Admin)** → auto-fills `03361593533 / Tekedar@786`
- 🔵 **سائٹ منشی (User)** → auto-fills `03129876543 / Munshi@786`

> ✅ Captcha (math) is auto-solved by the quick-fill buttons. Just press **"کھاتہ کھولیں (لاگ ان)"**.

### 2.3 Login Rules

- **Password requirement:** minimum **8 characters** + at least **1 special character** (`@ # $ % ! _ -` etc.)
- **Math Captcha:** must be solved to log in or register.
- **Throttle:** after 5 wrong attempts → **45-second lockout**.
- **Session:** auto-logout after **40 min idle** or **8 hours absolute**.
- **Expired membership:** shows amber banner with **"فوری تجدید کریں" (renew)** button.

---

## 3. 🗺️ Routes / URLs

The app uses **hash-based routing** (`#/route`). Actual URL pattern: `https://your-domain.com/#/dashboard`

| Route | Page Title (English / Urdu) | Purpose |
|-------|-----------------------------|---------|
| `/dashboard` | Dashboard / خلاصہ | KPI cards, contract profit/loss, quick actions |
| `/thekas` | Thekas / ٹھیکے | All contracts (running + completed) table |
| `/mazdoors` | Mazdoors / مزدور | Worker directory with balances |
| `/attendance` | Attendance / حاضری | Daily attendance register |
| `/hisab` | Hisab / حساب | All cash-in & cash-out transactions |
| `/settings` | Settings / سیٹنگز | Theme, backup, users, cities, roles, logo |

**Default route:** `/dashboard` (on login or invalid route)

---

## 4. 📊 Module-by-Module Guide

### 4.1 🔐 Auth Screen (`#auth-view`)

**What it does:** Handles Login & Registration.

**How it works:**
- Two tabs: **Login (لاگ ان)** and **Register (نیا ٹھیکیدار اکاؤنٹ)**.
- Registration captures: Name, Phone, Role (Admin / Standard User), Password, Captcha.
- Passwords are hashed with `SHA256(password + "_KPK_SALT_786")` → stored in `db.users[].passwordHash`.
- Successful login creates a session object: `{ userId, loginTime, lastActive }` → saved in `localStorage.KPK_TEKEDAR_SESSION_V1`.

**Effect on App:** If session is valid → shell (`#app-shell`) shows; otherwise login screen stays.

---

### 4.2 🏠 Dashboard (`/dashboard`)

**What it does:** Central executive command center and live intelligence hub of the entire business with full role-based visibility.

**Role-Based Adaptive Presentation:**
- **بڑا ٹھیکیدار (Admin / Super Admin):** Complete system visibility, net profit margins, cashflow solvency ratios, labor liabilities, and system administration status.
- **سائٹ منشی / سپروائزر (Standard User):** Operational on-site metrics, daily attendance headcounts, material logs, and immediate field actions.

**Interactive Site Filter (ڈیش بورڈ سائٹ فلٹر):**
- Dropdown at the top of the dashboard allowing the contractor to filter all KPI cards, financial calculations, charts, and tables for **ALL sites** or a **specific Theka project** in real time.

**8 High-Impact KPI Metric Cards:**
1. **جاری اور مکمل ٹھیکے** — Running vs Completed sites, active portfolio count, and total contract volume (PKR).
2. **مالکان سے کل وصولی** — Total cash received from clients, recovery rate percentage (%), and remaining receivables due from owners.
3. **کل مزدوری و میٹریل خرچہ** — Combined expenditures (labor wages + construction materials), budget burn rate (%), and current cash-in-hand.
4. **مزدوروں کا بقایا حساب** — Net unpaid labor liabilities across all workers, total registered workforce, and count of workers with pending wages.
5. **خالص متوقع منافع / بچت** — Projected net profit in PKR, overall profit margin percentage (`(contract - spent) / contract * 100`), and profitability status badge.
6. **آج کی سائٹ حاضری** — On-site workers present today, shift breakdown (Full / Half-Day / Absent), and today's workforce attendance percentage (%).
7. **میٹریل و سامان کل خرچہ** — Total spent on cement, steel, bricks, sand, and crushing, with material-to-total-expense ratio.
8. **سسٹم کیش فلو پوزیشن** — Real-time liquidity assessment, net cash surplus compared to pending liabilities, and financial safety badge.

**Smart Alerts & Operational Watchlist (اہم انتباہات اور ہنگامی الرٹس):**
- **High Receivables Alert:** Flags any site where owner balance exceeds Rs 400,000 with a direct "کھاتہ پرنٹ" button.
- **Deficit / Overrun Alert:** Warns if site expenses exceed received cash with a direct "نیا فنڈ وصولی" button.
- **Labor Overdue Alert:** Identifies workers with unpaid wages ≥ Rs 5,000 with a direct "ادائیگی درج کریں" button.
- **Daily Attendance Status:** Reminds supervisors if today's attendance has not yet been registered, with a direct 1-click shortcut to Bulk Attendance.
- Displays an all-clear green badge ("تمام کھاتے اور پروجیکٹس بروقت اور درست ہیں") when no urgent items require attention.

**3 Interactive Business Infographics:**
1. **ٹھیکیدار بزنس ہیلتھ انڈیکس (Business Health Index):**
   - Dynamic 0–100 score with animated circular SVG meter, letter grade (A+, A, B, C), and breakdown chips for Collection Efficiency (%), Cost Control (%), and Labor Settlement (%).
2. **خیبر پختونخوا اضلاع وار پروجیکٹس (KPK Regional Footprint):**
   - Geographic distribution across Peshawar, Mardan, Swat, Abbottabad, Nowshera, Swabi, etc. showing site counts and contract values per district.
3. **کل بیلنس شیٹ فلو (Cashflow Waterfall):**
   - 4-step financial pipeline: `[1. کل طے شدہ رقم] ➔ [2. وصول شدہ (+)] ➔ [3. ادا شدہ اخراجات (-)] ➔ [4. خالص نقد کیش ان ہینڈ (=)]`.

**5 Interactive Visual Charts (مع 'ڈیٹا دیکھیں' View Data & CSV Export):**
1. **ٹھیکہ جاتی فنانشل موازنہ (Theka Financial Comparison - Multi-Bar):** Compares Contract Value, Received, Total Spent, and Projected Profit for all sites.
2. **تعمیراتی اخراجات کی تفصیلی تقسیم (Expense Category Distribution - Doughnut):** Visual split between Materials & Supplies, Paid Labor Wages, and Pending Labor Liabilities.
3. **وصولی اور بجٹ استعمال کا تناسب % (Recovery vs Budget % - Horizontal Bar):** Side-by-side percentage of contract collected vs budget spent per project.
4. **افرادی قوت کی درجہ بندی اور دیہاڑی بوجھ (Workforce Skill Distribution - Polar Area):** Mason, Shuttering, Steel Fixer, and Helper workforce share and daily wage pool.
5. **حالیہ مزدور حاضری اور یومیہ لاگت کا رجحان (Attendance & Wage Trend - Dual Axis Area Line):** Daily on-site workers count on left axis and daily labor cost (PKR) on right axis over recent log dates.

**'ڈیٹا دیکھیں' (View Data Modal) & CSV Download:**
- Every chart card features a **"ڈیٹا دیکھیں"** button.
- Clicking opens `#modal-chart-data` presenting the exact mathematical table, raw metrics, summary stat chips, and formulas that derived that specific visual chart.
- Includes a **"CSV ڈاؤن لوڈ"** button that exports the data table as an Excel-compatible UTF-8 CSV file with BOM (`\uFEFF`) to preserve Urdu text formatting.

**Live Operational Boards:**
- **جاری اور پچھلے ٹھیکوں کا نفع و نقصان کارڈز:** Individual contract cards with live financial progress bars, cash-in, cash-out, and print shortcut.
- **اعلیٰ واجب الادا مزدور (Top Unpaid Labor Board):** Interactive table showing top 5 workers with pending wages, role, site, earned, and a direct 1-click "ادائیگی" button that opens the Hisab modal pre-filled with that worker.
- **حالیہ روزنامچہ و مالیاتی لین دین (Recent Activity Feed):** Chronological timeline of latest 6 cashflow receipts, material vouchers, and labor entries with visual color-coded badges and descriptions.

**Quick Operations Hub (6 Shortcut Tiles):**
- ➕ **نیا ٹھیکہ لکھیں** → Opens Theka Modal
- 👤 **نیا مزدور / مستری** → Opens Mazdoor Modal
- 📋 **اجتماعی حاضری شیٹ** → Opens Bulk Attendance Modal with cherry-pick checkboxes
- 💵 **نیا خرچہ / وصولی** → Opens Hisab Modal
- 🖨️ **مکمل رپورٹ پرنٹ** → Opens Print Preview Modal (with direct Print, PDF download, and PNG Image download options)
- ⚙️ **سیٹنگز و بیک اپ** → Navigates to `/settings`

**Effect:** Real-time calculated dashboard reflecting live data from Thekas + Mazdoors + Attendance + Hisab without database alterations.

---

### 4.3 🏗️ Thekas (`/thekas`)

**What it does:** Manages all construction contracts (running and completed).

**Form fields (Theka Modal):**
- Title (site name) — required
- Client (owner name) — required
- Client phone — required
- City/location — dropdown (`db.cities`)
- Contract type: **لیبر ریٹ (مربع فٹ)** | **بمعہ میٹریل** | **لمسم ٹھیکہ**
- Status: **جاری ہے** (running) | **مکمل شدہ** (completed)
- Contract amount (PKR) — required
- Start date — required
- Sq ft / Marla — optional
- Notes — optional

**Filters:** ALL / جاری ہے (running) / مکمل شدہ (completed).

**Table Columns:** Title, Client, City+Type, Contract Amount, Received, Total Spent, Balance+Profit, Status, Actions.

**Row Actions:**
- 🖨️ **Print** — full theka report (cash-in, cash-out, attendance)
- ✏️ **Edit** — reopen modal
- 🗑️ **Delete** — only **Admin** (confirmation required)

**How it affects other modules:**
- Every theka appears in **Mazdoor assignment**, **Attendance**, **Hisab**, and **Dashboard**.
- Deleting a theka does **not** delete linked records — reassign them first.

---

### 4.4 👷 Mazdoors (`/mazdoors`)

**What it does:** Directory of all workers (masons, helpers, steel fixers, etc.).

**Form fields (Mazdoor Modal):**
- Name — required
- Role / skill — dropdown (`db.roles`), taggable
- Daily wage (diihaari rate) — required
- Phone — required
- Assigned current theka (site) — required
- CNIC — optional
- Photo — optional (auto-compressed <100KB, JPG/PNG/WEBP)

**Table Columns:** Photo+Name, Role, Current Site, Daily Wage, Total Earned, Total Paid, Net Payable, Phone, Actions.

**Net Payable colors:**
- 🟡 **Amber** = `Earned − Paid ≥ 0` → "واجب الادا" (you owe worker)
- 🔴 **Red** = `Earned − Paid < 0` → "ایڈوانس زیادہ" (worker owes you)

**Row Actions:**
- 🧾 **Print Khata Slip** — full attendance + payment history for that worker with direct Print, PDF file, and PNG Image download options
- ✏️ **Edit**
- 🗑️ **Delete** (Admin only)

**How it affects other modules:**
- Wage auto-fills into **Attendance** modal when selecting a worker.
- Total earned = sum of all `attendance.totalEarned` for that worker.
- Total paid = sum of all `hisab` entries where `type = مزدور ادائیگی` and `mazdoorId` matches.

---

### 4.5 📅 Attendance (`/attendance`)

**What it does:** Records daily attendance + diihaari for each worker.

**Individual Attendance Modal:**
- Date (defaults today) — required
- Worker (mazdoor) — required
- Theka site — required (auto-syncs from worker's site)
- Attendance type:
  - پورا دن (Full) = **1.0× wage**
  - آدھا دن (Half) = **0.5× wage**
  - ڈبل شفٹ (Double) = **2.0× wage**
  - غیر حاضر (Absent) = **0× wage**
- Overtime / bonus (PKR) — optional
- Note / description — optional

**Calculation:** `totalEarned = (baseWage × multiplier) + overtime`

**Bulk Attendance Modal (اجتماعی حاضری شیٹ):**
- Filter by site (or "All Sites")
- Pick a date
- Each worker row has: checkbox, site select, status select, overtime input
- Master checkbox = select/deselect all
- **Saves N attendance records in one click**

**Table Columns:** Date, Worker, Site, Status, Base Wage, Overtime, Total Earned, Note, Actions.

**How it affects other modules:**
- Every attendance record adds to **worker's total earned** → affects **Mazdoor balance**.
- Also adds to **theka total spent** → affects **Dashboard** and **Theka profit/loss**.

---

### 4.6 💰 Hisab (`/hisab`)

**What it does:** Cash ledger — every rupee in and out.

**3 Transaction Types:**

| Type | Direction | Use |
|------|-----------|-----|
| **مالک سے قسط وصولی** | ➕ Cash IN | Money received from site owner |
| **مزدور ادائیگی / ایڈوانس** | ➖ Cash OUT | Payment to worker (wage / advance) |
| **میٹریل اور سائٹ خرچہ** | ➖ Cash OUT | Cement, steel, sand, food, etc. |

**Form fields:**
- Date — required
- Type — required
- Theka site — required
- Worker (only for "مزدور ادائیگی") — appears conditionally
- Amount (PKR) — required
- Payment method: نقد | ایزی پیسہ | جاز کیش | بینک چیک
- Description — required
- Receipt image — optional (<100KB auto-compressed)

**Row Actions:**
- 🖨️ **Print Voucher** — printable receipt for that transaction
- ✏️ **Edit**
- 🗑️ **Delete** (Admin only)

**How it affects other modules:**
- **مالک سے قسط وصولی** → increases theka's `received` → reduces owner's balance → increases cash-in-hand on dashboard.
- **مزدور ادائیگی** → reduces that worker's `net payable` → reduces theka's labor cost.
- **میٹریل خرچہ** → increases theka's material cost → reduces cash-in-hand → affects projected profit.

---

### 4.7 ⚙️ Settings (`/settings`)

Six sub-sections:

#### 4.7.1 🎨 Theme (Dynamic UI)
- Font family (Calibri / Noto Sans / Nastaliq / Readex)
- Font size (15 / 16 / 18 / 20 px)
- 8 color pickers: header bg/text, sidebar bg/text, page bg/text, footer bg/text
- **Saved per-user** in `db.users[].theme` → applied on next login
- **"اصلی ڈیزائن بحال کریں"** restores defaults

#### 4.7.2 🔒 Encrypted Backup (AES-256)
- **Backup key (default):** `KPKTekedar@Secret2025`
- **Export:** downloads `.json` file — encrypted with AES + HMAC-SHA256 signature
- **Import:** file is HMAC-verified → AES decrypted → **merged (not overwritten)** by `id`
- **Auto-backup schedule:** Daily / Weekly / Custom (N days)

⚠️ **If you lose the backup key, the backup file cannot be decrypted.**

#### 4.7.3 🗄️ Sample Data Control
- **تمام ڈیٹا صاف کریں** — wipes thekas, mazdoors, attendance, hisab (users kept)
- **نمونہ ڈیٹا لوڈ کریں** — restores seed demo data (users kept)

#### 4.7.4 🏙️ Cities & Roles CRUD
- Add / edit / delete **cities** (locations for thekas)
- Add / edit / delete **worker roles** (Mason, Helper, Shuttering, etc.)
- Both dropdowns are **also taggable** in modals — you can type a new value on the fly

#### 4.7.5 🖼️ Logo & Favicon (Admin only)
- Upload PNG/JPG/WEBP logo → calls `upload_logo.php`
- Server auto-generates: `favicon.ico`, 16×16, 32×32, 180×180 Apple, PWA icons
- All `<img class="app-logo-img">` refresh with cache-bust timestamp

#### 4.7.6 👥 Users Management (Admin only)
- **New user** → name, phone, role, status, password
- **Edit** → change name, phone, role, status, password (blank = keep old)
- **Delete** → cannot delete **yourself**
- **Toggle role** → Admin ↔ Standard User
- **Toggle status** → Active ↔ Expired (simulates membership expiry)
- **Renew banner** → Admin sees amber banner if own membership expired

---

## 5. 🗃️ Sample / Seed Data Reference

### 5.1 Thekas

| ID | Title | Client | City | Type | Status | Amount |
|----|-------|--------|------|------|--------|--------|
| THK-101 | حاجی یوسف دس مرلہ ڈبل سٹوری بنگلہ | حاجی محمد یوسف خان | پشاور (حیات آباد / رنگ روڈ) | بمعہ میٹریل | جاری ہے | Rs 8,500,000 |
| THK-102 | ملک طارق کمرشل پلازہ بیسمنٹ و گراؤنڈ | ملک طارق محمود مردان | مردان (شیخ ملتون ٹاؤن) | لیبر ریٹ | جاری ہے | Rs 3,200,000 |
| THK-103 | ڈاکٹر نعمان سواتی رہائشی کوٹھی | ڈاکٹر نعمان علی سواتی | سوات (مینگورہ / سیدو شریف) | بمعہ میٹریل | مکمل شدہ | Rs 6,400,000 |
| THK-104 | چوہدری ارسلان مارکیٹ تزئین و مرمت | چوہدری ارسلان جدون | ایبٹ آباد (مانسہرہ روڈ) | لمسم ٹھیکہ | مکمل شدہ | Rs 1,850,000 |

### 5.2 Mazdoors

| ID | Name | Role | Daily Wage | Phone | Site |
|----|------|------|-----------|-------|------|
| MZD-201 | استاد گلزار خان آفریدی | راج مستری | Rs 3,000 | 03018881122 | THK-101 |
| MZD-202 | شیر عالم خان مہمند | شٹرنگ مستری | Rs 2,800 | 03147772233 | THK-102 |
| MZD-203 | بختیار علی چارسدہ | مزدور / ہیلپر | Rs 1,600 | 03426663344 | THK-101 |
| MZD-204 | وقاص احمد سریا بائنڈر | سریا بائنڈر | Rs 2,700 | 03329994455 | THK-102 |

### 5.3 Attendance (Sample)

| ID | Date | Worker | Site | Status | Multiplier | Overtime | Total Earned |
|----|------|--------|------|--------|-----------|----------|--------------|
| ATT-301 | 2025-02-22 | MZD-201 | THK-101 | ڈبل شفٹ | 2.0 | 1,500 | Rs 7,500 |
| ATT-302 | 2025-02-22 | MZD-202 | THK-102 | پورا دن | 1.0 | 3,200 | Rs 6,000 |
| ATT-303 | 2025-02-23 | MZD-203 | THK-101 | پورا دن | 1.0 | 1,600 | Rs 3,200 |
| ATT-304 | 2025-02-23 | MZD-204 | THK-102 | ڈبل شفٹ | 2.0 | 600 | Rs 6,000 |

### 5.4 Hisab (Sample)

| ID | Date | Type | Site | Worker | Amount | Method |
|----|------|------|------|--------|--------|--------|
| HSB-401 | 2025-02-10 | مالک سے قسط وصولی | THK-101 | — | Rs 4,200,000 | بینک ٹرانسفر |
| HSB-402 | 2025-02-15 | میٹریل خرچہ | THK-101 | — | Rs 2,150,000 | نقد |
| HSB-403 | 2025-02-18 | مالک سے قسط وصولی | THK-103 | — | Rs 6,400,000 | بینک ٹرانسفر |
| HSB-404 | 2025-02-21 | مزدور ادائیگی | THK-101 | MZD-201 | Rs 4,500 | ایزی پیسہ |

### 5.5 Cities & Roles (Seed)

**Cities:** پشاور (حیات آباد / رنگ روڈ), مردان (شیخ ملتون ٹاؤن), سوات (مینگورہ / سیدو شریف), ایبٹ آباد (مانسہرہ روڈ), نوشہرہ / چارسدہ, کوہاٹ / بنوں / ڈیرہ, صوابی / ملاکنڈ / دیر

**Roles:** راج مستری, مزدور / ہیلپر, شٹرنگ مستری, سریا بائنڈر, پلمبر / الیکٹریشن, ٹائل / ماربل مستری

---

## 6. 🔄 How Modules Interconnect (Data Flow)

```
                    ┌──────────────────┐
                    │   THEKAS (Sites) │
                    └────────┬─────────┘
                             │ 1 theka has many...
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
    ┌──────────┐      ┌────────────┐     ┌────────────┐
    │ MAZDOORS │ ───► │ ATTENDANCE │ ──► │   HISAB    │
    └──────────┘      └────────────┘     └────────────┘
          │                  │                  │
          │  dailyWage ×     │  totalEarned     │  cash in / out
          │  multiplier +    │  ────────────►   │
          │  overtime        │  adds to worker  │
          │                  │  balance & theka │
          │                  │  cost            │
          ▼                  ▼                  ▼
                     ┌──────────────────┐
                     │   DASHBOARD KPIs │
                     │  (live summary)  │
                     └──────────────────┘
```

**Money logic summary:**
- **Theka received** = Σ Hisab where `type = مالک سے قسط وصولی` and `thekaId = X`
- **Theka spent** = Σ Attendance.totalEarned + Σ Hisab where `type = میٹریل` and `thekaId = X`
- **Theka profit (projected)** = `contractAmount − totalSpent`
- **Owner's balance** = `contractAmount − received`
- **Worker payable** = Σ Attendance.totalEarned − Σ Hisab where `type = مزدور ادائیگی`
- **Cash-in-hand** = Σ All cash-in − Σ All cash-out

---

## 7. 🛡️ Roles & Permissions

| Action | Admin | Standard User |
|--------|:-----:|:-------------:|
| View all pages | ✅ | ✅ |
| Add / Edit Theka | ✅ | ✅ |
| **Delete Theka** | ✅ | ❌ |
| Add / Edit Mazdoor | ✅ | ✅ |
| **Delete Mazdoor** | ✅ | ❌ |
| Add attendance (indiv/bulk) | ✅ | ✅ |
| **Delete attendance** | ✅ | ❌ |
| Add / Edit Hisab | ✅ | ✅ |
| **Delete Hisab** | ✅ | ❌ |
| Manage users (CRUD) | ✅ | ❌ |
| Upload logo | ✅ | ❌ |
| Change theme | ✅ | ✅ (own theme only) |
| Backup / restore | ✅ | ✅ |

---

## 8. 💾 Data & Storage Notes

| Key | What it holds |
|-----|---------------|
| `KPK_TEKEDAR_PRO_DB_V1` | Full app database (users, thekas, mazdoors, attendance, hisab, cities, roles, meta) |
| `KPK_TEKEDAR_SESSION_V1` | Current session `{ userId, loginTime, lastActive }` |
| `KPK_TEKEDAR_THROTTLE_V1` | Login attempt counter for brute-force protection |

**MySQL:** The backend helper `upload_logo.php` uses MySQL `root/root` credentials to persist **logo changes** server-side. All other data is stored client-side in `localStorage` — meaning **each browser/device has its own database**. To sync between devices use the **encrypted backup → import** workflow.

---

## 9. 🚀 Quick Start Checklist

1. **Open** the app URL → you land on `#auth-view`.
2. **Click** the 🟢 Admin quick-test button (fills credentials automatically).
3. **Press** "کھاتہ کھولیں" → dashboard opens.
4. **Go to** `/thekas` → add your first real theka.
5. **Go to** `/mazdoors` → add workers, assign them to the theka.
6. **Go to** `/attendance` → use **Bulk Attendance** to mark today for all workers.
7. **Go to** `/hisab` → record owner payments & material purchases.
8. **Check** `/dashboard` → see live profit, balances, cash-in-hand.
9. **Go to** `/settings` → upload your logo, change colors, download encrypted backup.
10. **Repeat** daily: attendance → expenses → verify dashboard.

---

## 10. ⚠️ Important Warnings

- 🚫 **Do not lose the backup key** (`KPKTekedar@Secret2025` by default) — encrypted backups are **unrecoverable** without it.
- 🚫 **Deleting a theka** does not auto-delete its attendance/hisab records — reassign or delete those first.
- 🚫 **Clearing browser data / cache** wipes `localStorage` → download backup **before** any browser cleanup.
- ✅ **Always download a fresh backup** before: changing roles, mass-deleting, or migrating devices.
- 🔒 **Never share** Admin credentials with site staff — create Standard User accounts instead.

---

## 11. 🧾 Footer & Credits

- **Created by:** Yasin Ullah
- **LinkedIn:** https://www.linkedin.com/in/yasin-ullah-029229232/
- **WhatsApp:** 03361593533
- **App version:** 1.0.0
- **System name:** پختونخوا ٹھیکیدار اینڈ مزدور حساب کتاب سسٹم

---

*This guide covers the complete app as implemented in `index.html`. Any new module added later should be documented in a new section here.*