# 🎓 AcademiaPro - Lab External Exam Viva Preparation Guide
## Top Viva Questions & High-Scoring Answers (Frontend, Backend & SQL)

---

### Q1: What is the overall architecture of this project?
**Answer:**
> *"AcademiaPro follows a modern **3-Tier Full-Stack Architecture**:
> 1. **Presentation Tier (Frontend)**: Single Page Application built with HTML5, Tailwind CSS, Chart.js, and vanilla JavaScript (ES6+).
> 2. **Application Tier (Backend)**: Lightweight, multi-threaded REST API server written in Python using `http.server.ThreadingHTTPServer` handling JSON payloads and HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
> 3. **Data Tier (Database)**: Relational SQL database managed by **SQLite 3**, structured across 10 normalized tables with primary keys, foreign key constraints, and indexes."*

---

### Q2: Why did you choose SQLite as the SQL database engine?
**Answer:**
> *"SQLite is an **in-process, serverless, zero-configuration, ACID-compliant relational SQL engine**. Unlike MySQL or PostgreSQL, which require dedicated background database daemons, user permission configurations, and open network ports, SQLite stores the entire database in a single cross-platform disk file (`college_erp.db`). This makes it ideal for institutional desktop/embedded deployments, academic lab evaluations, and standalone autonomous systems while supporting standard ANSI SQL syntax including `JOIN`, `INDEX`, `GROUP BY`, and foreign keys."*

---

### Q3: How do you prevent SQL Injection attacks in your backend?
**Answer:**
> *"In `server.py`, all SQL queries use **Parameterized Queries (Prepared Statements)** with placeholder question marks (`?`), such as:
> ```python
> cur.execute('SELECT * FROM students WHERE department = ? AND roll_no = ?', (dept, roll))
> ```
> We never use string concatenation or f-strings for SQL statements. This ensures user input is treated strictly as data literals and can never alter the query's execution plan, completely mitigating SQL Injection vulnerabilities."*

---

### Q4: Explain the database schema and normalization.
**Answer:**
> *"Our database is organized in **Third Normal Form (3NF)** across 10 tables:
> - **1NF**: Every table has a primary key (`roll_no`, `code`, `id`, `invoice_id`), and all attributes contain atomic values.
> - **2NF**: All non-key attributes are fully functionally dependent on the entire primary key (e.g., student marks and attendance depend on composite foreign keys).
> - **3NF**: There are no transitive dependencies; for instance, course details and faculty assignments are isolated in `courses` and `faculty` rather than duplicated in the `students` table. We enforce referential integrity using `FOREIGN KEY (...) REFERENCES ... ON DELETE CASCADE`."*

---

### Q5: How does the frontend communicate with the SQL backend?
**Answer:**
> *"Communication occurs asynchronously via standard HTTP/1.1 REST endpoints using the native browser `fetch()` API. On initial load, the frontend checks `/api/health`. If online, the top header displays `🟢 SQLite SQL Connected`, and all operations (student enrollment, attendance marking, grading updates, and fee payments) trigger asynchronous `POST`, `PUT`, or `DELETE` requests that execute SQL transactions in `server.py`. If the backend server is stopped, the application seamlessly falls back to local storage, ensuring the system never crashes during a live demo."*

---

### Q6: How are transactions handled during attendance or fee payments?
**Answer:**
> *"In SQLite, statements that modify the database run within database transactions. In `server.py`, after executing `INSERT` or `UPDATE` statements, we call `conn.commit()` to write the changes durably to disk. If an error occurs, the transaction is rolled back, guaranteeing ACID properties (Atomicity, Consistency, Isolation, Durability)."*

---

### Q7: How does the attendance shortage warning algorithm work?
**Answer:**
> *"Attendance is computed mathematically as:
> $$\text{Attendance \%} = \left(\frac{\text{Attended Classes}}{\text{Total Conducted Classes}}\right) \times 100$$
> If this percentage drops below the university statutory minimum of 75%, the system triggers a warning and computes the minimum number of consecutive future classes $x$ the student must attend to reach 75%:
> $$\frac{\text{Attended} + x}{\text{Total} + x} \ge 0.75 \implies x \ge \lceil 3 \times \text{Total} - 4 \times \text{Attended} \rceil$$
> This dynamic alert is displayed prominently on the student dashboard."*

---

### Q8: What is the difference between SQLite, MySQL, and PostgreSQL if scaling to 50,000 students?
**Answer:**
> *"For a single institution with thousands of students, SQLite can easily handle tens of thousands of reads per second. However, for a university system with 50,000+ simultaneous concurrent writes, we would migrate to **PostgreSQL** or **MySQL**. Because our queries use standard ANSI SQL (`SELECT`, `INSERT`, `UPDATE`, `JOIN`), our schema (`schema.sql`) can be transferred directly to PostgreSQL with minimal adjustments by swapping the database driver from `sqlite3` to `psycopg2` or `SQLAlchemy`."*
