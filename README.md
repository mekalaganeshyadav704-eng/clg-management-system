# AcademiaPro - Autonomous College ERP & Campus Management System
## Full-Stack Architecture: Modern Web UI + Python REST API + SQLite ANSI SQL

> **A production-ready, full-stack College Management ERP built with an ANSI SQL database, Python REST API, and modern responsive frontend — designed for lab external exams.**

---

## 🚀 Quick Launch (How to Run Everything)

### 1-Click Launch (Recommended)
Simply **double-click `run_project.bat`** in this folder:
1. It automatically initializes the SQLite relational database (`college_erp.db`).
2. It launches the Python REST API backend server on `http://localhost:8000`.
3. It opens the web interface in your default browser with live database connectivity!

### Manual Launch (Command Line)
You can also run the backend directly:
```bash
python server.py
```
Then open: **`http://localhost:8000/index.html`** in your browser.

---

## 🏛️ Full-Stack System Architecture

```
[ Frontend: Modern Web UI (Tailwind CSS + Chart.js) ]
                      │  ▲
                      │  │  REST API (JSON over HTTP)
                      ▼  │
[ Backend: Python ThreadingHTTPServer (server.py:8000) ]
                      │  ▲
                      │  │  ANSI SQL Queries (SELECT, INSERT, UPDATE, DELETE)
                      ▼  │
[ Database: SQLite 3 Engine (college_erp.db via schema.sql) ]
```

### 1. 🗄️ Relational SQL Database (`schema.sql` & `college_erp.db`)
* **Pure ANSI SQL Relational Schema** with 10 tables:
  * `departments` (code PK, name, hod, intake, labs, faculty_count)
  * `faculty` (id PK, emp_code UNIQUE, name, department FK, designation, qualification, email, phone, subjects, avatar)
  * `students` (id PK, roll_no UNIQUE, name, department FK, year, semester, section, cgpa, attendance, fee_status, phone, email, avatar)
  * `courses` (code PK, name, dept FK, sem, credits, faculty, type)
  * `attendance` (id PK AUTOINCREMENT, student_roll FK, subject_code FK, attendance_date, status, remark)
  * `marks` (id PK AUTOINCREMENT, student_roll FK, subject_code FK, cat1, cat2, lab, assign, total, grade)
  * `fees` (invoice_id PK, student_id FK, total_amount, paid_amount, due_amount, status, payment_date, payment_mode)
  * `fee_breakdown` (id PK AUTOINCREMENT, invoice_id FK, item, amount)
  * `notices` (id PK, title, category, badge_color, publish_date, target, content, posted_by, is_pinned)
  * `timetable` (id PK AUTOINCREMENT, day, time_slot, subject, faculty, room, type)
* Foreign keys with `ON DELETE CASCADE` and query performance indexes.

---

### 2. 🔌 Python REST API Backend (`server.py`)
Built using Python's standard library (`http.server.ThreadingHTTPServer` + `sqlite3`), requiring **zero pip installs**:

| Method | Endpoint | Description | Database Operation |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health check & table inventory | `SELECT name FROM sqlite_master` |
| `GET` | `/api/stats` | Aggregated institutional KPI metrics | `COUNT(*)`, `AVG(attendance)`, `SUM(paid_amount)` |
| `GET` | `/api/students` | List students with search & dept filter | `SELECT * FROM students WHERE ...` |
| `POST` | `/api/students` | Enroll a new student | `INSERT INTO students (...) VALUES (...)` |
| `PUT` | `/api/students/<id>` | Update student academic record | `UPDATE students SET ... WHERE id = ?` |
| `DELETE` | `/api/students/<id>` | Remove student record | `DELETE FROM students WHERE id = ?` |
| `GET` | `/api/faculty` | List faculty with handled subjects | `SELECT * FROM faculty` |
| `GET` | `/api/courses` | Current semester course syllabus | `SELECT * FROM courses` |
| `GET` | `/api/attendance` | Daily attendance roster for class | `SELECT ... FROM students LEFT JOIN attendance` |
| `POST` | `/api/attendance` | Save finalized attendance statuses | `INSERT INTO attendance ... ON CONFLICT DO UPDATE` |
| `GET` | `/api/marks` | Continuous assessment evaluation sheet | `SELECT ... FROM marks JOIN students` |
| `PUT` | `/api/marks` | Update CAT 1, CAT 2, Lab marks | `UPDATE marks SET ... WHERE student_roll = ?` |
| `GET` | `/api/fees` | Fee ledgers and itemized breakdowns | `SELECT ... FROM fees JOIN fee_breakdown` |
| `POST` | `/api/fees/pay` | Process student fee payment | `UPDATE fees SET status = 'Paid' ...` |
| `GET` | `/api/notices` | Fetch official campus circulars | `SELECT * FROM notices ORDER BY is_pinned DESC` |
| `POST` | `/api/notices` | Broadcast a new circular | `INSERT INTO notices (...) VALUES (...)` |
| `GET` | `/api/timetable` | Weekly timetable slots | `SELECT * FROM timetable` |
| `POST` | `/api/reset` | Restore clean database seed state | Drops and re-executes `init_db.py` |

---

### 3. 💻 Modern Frontend Web UI
* **Live Database Connectivity Badge**:
  * Shows `🟢 SQLite SQL Connected` when `server.py` is active.
  * Gracefully falls back to offline LocalStorage if the server is stopped (zero crashes!).
* **Multi-Role Experience**:
  * 🛡️ **Administrator**: Institutional analytics, CRUD on students, faculty directory, curriculum, fee invoices, printable receipts.
  * 👨‍🏫 **Faculty**: Live attendance marker with "Mark All Present" toggle and continuous internal marks grading with auto-grade computation.
  * 🎓 **Student**: Digital Student ID Card, subject-wise attendance health meter (<75% exam warning), grade card, and simulated payment gateway.
* **Administrative Tools**:
  * 1-Click Export to CSV / Excel spreadsheet.
  * `@media print` print engine for fee receipts and student ID cards.

---

## 🎯 Step-by-Step Demo Script for Lab External Examiner

| Step | Action | What to Say to the Examiner |
| :--- | :--- | :--- |
| **1** | Show the terminal running `server.py` | *"Sir/Madam, here is our Python REST API backend running on port 8000 and connected to our relational SQLite database `college_erp.db`."* |
| **2** | Open `http://localhost:8000/index.html` | *"Notice the top navigation badge: `🟢 SQLite SQL Connected`. The dashboard metrics are dynamically calculated via SQL aggregation queries (`COUNT`, `AVG`, `SUM`)."* |
| **3** | Go to **Students Directory** & click **"Add New Student"** | *"When we enroll a student here, the frontend issues a `POST /api/students` request which executes a parameterized SQL `INSERT INTO students` query in SQLite."* (Enroll student and show the new entry). |
| **4** | Show the SQLite terminal log | *"The server terminal confirms the HTTP POST 201 Created and transaction commit."* |
| **5** | Switch to **Faculty Portal** | *"In the Faculty portal, marking attendance sends a batch upsert to the `attendance` table, and editing CAT marks executes an SQL `UPDATE marks` statement with automated grade recalculation."* |
| **6** | Switch to **Student Portal** | *"Students can view their attendance health meter, view their digital ID card, and simulate fee payment which updates the `fees` ledger in real time."* |
| **7** | Click **"Export CSV"** & **"View Receipt"** | *"Finally, the system supports data export to Excel/CSV and A4-formatted official fee receipts."* |

---

## 📁 File Structure

```
clg management/
├── schema.sql           # Pure ANSI SQL Relational Schema (10 Tables & Indexes)
├── init_db.py           # Database Initializer & Seed Generator
├── college_erp.db       # Active SQLite Relational Database File
├── server.py            # Python REST API & Static File Server (Port 8000)
├── start_server.bat     # Windows batch script to launch backend server
├── run_project.bat      # 1-Click launcher (initializes DB + launches server + opens browser)
├── index.html           # Main Single Page Application Shell
├── css/
│   └── styles.css       # Custom glassmorphism, micro-animations, & @media print styles
├── js/
│   ├── app.js           # REST API consumer, role switcher, CRUD, & UI event engine
│   ├── charts.js        # Dynamic Chart.js visualizations
│   └── data.js          # Offline fallback seed data & LocalStorage manager
├── README.md            # Complete project documentation
└── VIVA_QUESTIONS.md    # Top Viva Questions & Answers for Lab External Exam
```
