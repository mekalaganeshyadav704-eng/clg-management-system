"""
server.py - AcademiaPro REST API & Static File Server
Pure Python + SQLite Standard Library Architecture (Zero external pip dependencies!)
"""

import os
import json
import sqlite3
import mimetypes
from urllib.parse import urlparse, parse_qs
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get('PORT', 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'college_erp.db')

# In-Memory Cache for Blazing Fast Static File Serving
STATIC_CACHE = {}

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA cache_size = 10000;")
    conn.execute("PRAGMA temp_store = MEMORY;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def query_db(query, args=(), one=False):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.close()
    if one:
        return dict(rv[0]) if rv else None
    return [dict(ix) for ix in rv]

def execute_db(query, args=()):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    conn.commit()
    last_id = cur.lastrowid
    rowcount = cur.rowcount
    conn.close()
    return last_id, rowcount

class AcademiaERPRequestHandler(BaseHTTPRequestHandler):

    def address_string(self):
        # High Performance: Avoid DNS reverse resolution on Windows (saves 1000ms+ per request)
        return self.client_address[0]

    def log_message(self, format, *args):
        # Ultra fast console logging without DNS blocking
        pass

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode('utf-8'))

    def parse_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                return json.loads(body)
            except Exception:
                return {}
        return {}

    # -------------------------------------------------------------
    # GET REQUEST ROUTER
    # -------------------------------------------------------------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        # 1. API Endpoints
        if path.startswith('/api/'):
            return self.handle_api_get(path, params)

        # 2. Static File Serving
        return self.handle_static_get(path)

    def handle_api_get(self, path, params):
        try:
            # Health check
            if path == '/api/health':
                tables = query_db("SELECT name FROM sqlite_master WHERE type='table';")
                return self.send_json({
                    "status": "online",
                    "engine": "SQLite 3 (ANSI SQL)",
                    "database": "college_erp.db",
                    "tables_count": len(tables),
                    "tables": [t['name'] for t in tables]
                })

            # Dashboard Macro Stats
            if path == '/api/stats':
                stu_count = query_db("SELECT COUNT(*) as count FROM students", one=True)['count']
                fac_count = query_db("SELECT COUNT(*) as count FROM faculty", one=True)['count']
                crs_count = query_db("SELECT COUNT(*) as count FROM courses", one=True)['count']
                avg_att = query_db("SELECT AVG(attendance) as avg FROM students", one=True)['avg'] or 85.0
                fee_stats = query_db("SELECT SUM(paid_amount) as paid, SUM(due_amount) as due FROM fees", one=True)

                return self.send_json({
                    "totalStudents": stu_count,
                    "totalFaculty": fac_count,
                    "totalCourses": crs_count,
                    "avgAttendance": round(avg_att, 1),
                    "totalPaidFees": fee_stats['paid'] or 0,
                    "totalDueFees": fee_stats['due'] or 0
                })

            # Students List
            if path == '/api/students':
                search = params.get('search', [''])[0].strip().lower()
                dept = params.get('dept', ['ALL'])[0].strip()

                sql = "SELECT * FROM students WHERE 1=1"
                args = []
                if dept != 'ALL':
                    sql += " AND department = ?"
                    args.append(dept)
                if search:
                    sql += " AND (LOWER(name) LIKE ? OR LOWER(roll_no) LIKE ? OR LOWER(email) LIKE ?)"
                    args.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

                sql += " ORDER BY roll_no ASC"
                students = query_db(sql, args)
                return self.send_json(students)

            # Single Student
            if path.startswith('/api/students/'):
                stu_id = path.split('/')[-1]
                student = query_db("SELECT * FROM students WHERE id = ? OR roll_no = ?", (stu_id, stu_id), one=True)
                if student:
                    return self.send_json(student)
                return self.send_json({"error": "Student not found"}, 404)

            # Faculty
            if path == '/api/faculty':
                faculty = query_db("SELECT * FROM faculty ORDER BY id ASC")
                for f in faculty:
                    f['subjects'] = [s.strip() for s in f['subjects'].split(',') if s.strip()]
                return self.send_json(faculty)

            # Departments
            if path == '/api/departments':
                departments = query_db("SELECT * FROM departments ORDER BY code ASC")
                return self.send_json(departments)

            # Courses
            if path == '/api/courses':
                courses = query_db("SELECT * FROM courses ORDER BY code ASC")
                return self.send_json(courses)

            # Attendance
            if path == '/api/attendance':
                roster = query_db("""
                    SELECT s.roll_no as rollNo, s.name, COALESCE(a.status, 'Present') as status, COALESCE(a.remark, '') as remark
                    FROM students s
                    LEFT JOIN attendance a ON s.roll_no = a.student_roll AND a.subject_code = 'CS501' AND a.attendance_date = '2026-11-06'
                    WHERE s.department = 'CSE'
                    ORDER BY s.roll_no ASC
                """)
                return self.send_json(roster)

            # Marks
            if path == '/api/marks':
                marks = query_db("""
                    SELECT m.student_roll as rollNo, s.name, m.cat1, m.cat2, m.lab, m.assign, m.total, m.grade
                    FROM marks m
                    JOIN students s ON m.student_roll = s.roll_no
                    WHERE m.subject_code = 'CS501'
                    ORDER BY m.student_roll ASC
                """)
                return self.send_json(marks)

            # Fees & Invoices
            if path == '/api/fees':
                fees = query_db("""
                    SELECT f.invoice_id as invoiceId, f.student_id as studentId, s.name as studentName,
                           s.roll_no as rollNo, s.department, s.year, f.total_amount as totalAmount,
                           f.paid_amount as paidAmount, f.due_amount as dueAmount, f.status,
                           f.payment_date as paymentDate, f.payment_mode as paymentMode
                    FROM fees f
                    JOIN students s ON f.student_id = s.id
                    ORDER BY f.invoice_id ASC
                """)
                for f in fees:
                    breakdown = query_db("SELECT item, amount FROM fee_breakdown WHERE invoice_id = ?", (f['invoiceId'],))
                    f['breakdown'] = breakdown
                return self.send_json(fees)

            # Notices
            if path == '/api/notices':
                notices = query_db("SELECT * FROM notices ORDER BY is_pinned DESC, id DESC")
                formatted = []
                for n in notices:
                    formatted.append({
                        "id": n['id'],
                        "title": n['title'],
                        "category": n['category'],
                        "badgeColor": n['badge_color'],
                        "date": n['publish_date'],
                        "target": n['target'],
                        "content": n['content'],
                        "postedBy": n['posted_by'],
                        "isPinned": bool(n['is_pinned'])
                    })
                return self.send_json(formatted)

            # Timetable
            if path == '/api/timetable':
                slots = query_db("SELECT * FROM timetable ORDER BY id ASC")
                timetable_by_day = {}
                for s in slots:
                    day = s['day']
                    if day not in timetable_by_day:
                        timetable_by_day[day] = []
                    timetable_by_day[day].append({
                        "time": s['time_slot'],
                        "subject": s['subject'],
                        "faculty": s['faculty'],
                        "room": s['room'],
                        "type": s['type']
                    })
                return self.send_json(timetable_by_day)

            return self.send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            return self.send_json({"error": str(e)}, 500)

    # -------------------------------------------------------------
    # POST REQUEST ROUTER
    # -------------------------------------------------------------
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.parse_body()

        try:
            # 1. Enroll Student
            if path == '/api/students':
                stu_id = body.get('id') or f"STU-{int(os.urandom(2).hex(), 16)}"
                roll_no = body.get('rollNo')
                name = body.get('name')
                dept = body.get('department')
                year = body.get('year')
                sem = body.get('semester', '5th Sem')
                sec = body.get('section', 'A')
                cgpa = float(body.get('cgpa', 8.0))
                att = int(body.get('attendance', 85))
                fee_stat = body.get('feeStatus', 'Paid')
                phone = body.get('phone', '')
                email = body.get('email')
                avatar = body.get('avatar') or 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'

                execute_db("""
                    INSERT INTO students (id, roll_no, name, department, year, semester, section, cgpa, attendance, fee_status, phone, email, avatar)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (stu_id, roll_no, name, dept, year, sem, sec, cgpa, att, fee_stat, phone, email, avatar))

                return self.send_json({"success": True, "message": "Student enrolled successfully", "id": stu_id}, 201)

            # 2. Save Attendance
            if path == '/api/attendance':
                roster = body.get('roster', [])
                subject = body.get('subjectCode', 'CS501')
                date_str = body.get('date', '2026-11-06')

                for r in roster:
                    execute_db("""
                        INSERT INTO attendance (student_roll, subject_code, attendance_date, status, remark)
                        VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(student_roll, subject_code, attendance_date)
                        DO UPDATE SET status = excluded.status, remark = excluded.remark
                    """, (r.get('rollNo'), subject, date_str, r.get('status', 'Present'), r.get('remark', '')))

                return self.send_json({"success": True, "message": "Attendance records saved to SQL database"})

            # 3. Post Notice
            if path == '/api/notices':
                notice_id = f"NOT-{int(os.urandom(2).hex(), 16)}"
                title = body.get('title')
                cat = body.get('category')
                badge_col = 'blue'
                pub_date = body.get('date', 'Today')
                target = body.get('target', 'All Engineering Students')
                content = body.get('content')
                posted_by = body.get('postedBy', 'Administration')
                is_pinned = 1 if body.get('isPinned') else 0

                execute_db("""
                    INSERT INTO notices (id, title, category, badge_color, publish_date, target, content, posted_by, is_pinned)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (notice_id, title, cat, badge_col, pub_date, target, content, posted_by, is_pinned))

                return self.send_json({"success": True, "message": "Notice published to SQL database", "id": notice_id}, 201)

            # 4. Pay Fees
            if path == '/api/fees/pay':
                invoice_id = body.get('invoiceId')
                execute_db("""
                    UPDATE fees
                    SET paid_amount = total_amount, due_amount = 0, status = 'Paid', payment_date = datetime('now', 'localtime')
                    WHERE invoice_id = ?
                """, (invoice_id,))
                return self.send_json({"success": True, "message": "Fee payment recorded in SQL database"})

            # 5. Reset Database
            if path == '/api/reset':
                from init_db import init_database
                init_database()
                return self.send_json({"success": True, "message": "Database reset to defaults"})

            return self.send_json({"error": "Unknown POST route"}, 404)

        except Exception as e:
            return self.send_json({"error": str(e)}, 500)

    # -------------------------------------------------------------
    # PUT REQUEST ROUTER
    # -------------------------------------------------------------
    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.parse_body()

        try:
            # Update Student
            if path.startswith('/api/students/'):
                stu_id = path.split('/')[-1]
                execute_db("""
                    UPDATE students
                    SET roll_no = ?, name = ?, department = ?, year = ?, cgpa = ?, attendance = ?, fee_status = ?, phone = ?, email = ?
                    WHERE id = ?
                """, (
                    body.get('rollNo'), body.get('name'), body.get('department'),
                    body.get('year'), float(body.get('cgpa', 8.0)), int(body.get('attendance', 85)),
                    body.get('feeStatus'), body.get('phone'), body.get('email'), stu_id
                ))
                return self.send_json({"success": True, "message": "Student updated in SQL database"})

            # Update Marks
            if path == '/api/marks':
                roll_no = body.get('rollNo')
                cat1 = int(body.get('cat1', 0))
                cat2 = int(body.get('cat2', 0))
                lab = int(body.get('lab', 0))
                assign = int(body.get('assign', 0))
                total = cat1 + cat2 + lab + assign

                if total >= 90: grade = 'O'
                elif total >= 80: grade = 'A+'
                elif total >= 70: grade = 'A'
                elif total >= 60: grade = 'B+'
                elif total >= 50: grade = 'B'
                else: grade = 'RA'

                execute_db("""
                    UPDATE marks
                    SET cat1 = ?, cat2 = ?, lab = ?, assign = ?, total = ?, grade = ?
                    WHERE student_roll = ? AND subject_code = 'CS501'
                """, (cat1, cat2, lab, assign, total, grade, roll_no))

                return self.send_json({"success": True, "total": total, "grade": grade})

            return self.send_json({"error": "Unknown PUT route"}, 404)

        except Exception as e:
            return self.send_json({"error": str(e)}, 500)

    # -------------------------------------------------------------
    # DELETE REQUEST ROUTER
    # -------------------------------------------------------------
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            if path.startswith('/api/students/'):
                stu_id = path.split('/')[-1]
                _, count = execute_db("DELETE FROM students WHERE id = ? OR roll_no = ?", (stu_id, stu_id))
                if count > 0:
                    return self.send_json({"success": True, "message": "Student deleted from SQL database"})
                return self.send_json({"error": "Student not found"}, 404)

            return self.send_json({"error": "Unknown DELETE route"}, 404)

        except Exception as e:
            return self.send_json({"error": str(e)}, 500)

    # -------------------------------------------------------------
    # STATIC FILE HANDLER
    # -------------------------------------------------------------
    def handle_static_get(self, path):
        if path == '/' or path == '':
            path = '/index.html'

        # Sanitize path to prevent directory traversal
        rel_path = path.lstrip('/')
        full_path = os.path.normpath(os.path.join(BASE_DIR, rel_path))

        if not full_path.startswith(BASE_DIR) or not os.path.exists(full_path) or os.path.isdir(full_path):
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(b"<h1>404 Not Found</h1><p>AcademiaPro ERP static file not found.</p>")
            return

        # Fast In-Memory Static File Serving
        mtime = os.path.getmtime(full_path)
        if full_path in STATIC_CACHE and STATIC_CACHE[full_path]['mtime'] == mtime:
            cached = STATIC_CACHE[full_path]
            content, ctype = cached['content'], cached['ctype']
        else:
            ctype, _ = mimetypes.guess_type(full_path)
            if not ctype:
                ctype = 'application/octet-stream'
            with open(full_path, 'rb') as f:
                content = f.read()
            STATIC_CACHE[full_path] = {'content': content, 'ctype': ctype, 'mtime': mtime}

        try:
            self.send_response(200)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'public, max-age=3600')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

def run_server():
if not os.path.exists(DB_PATH):
    print('[*] Database not found on startup. Initializing database...')
    from init_db import init_database
    init_database()

    server_address = ('0.0.0.0', PORT)
    httpd = ThreadingHTTPServer(server_address, AcademiaERPRequestHandler)
    print("=" * 72)
    print(f"  ACADEMIAPRO ULTRA-FAST SQL BACKEND & REST API SERVER")
    print(f"  Running on: http://127.0.0.1:{PORT}")
    print(f"  Database Engine: SQLite ANSI SQL (college_erp.db - WAL Mode)")
    print("=" * 72)
    print(f"[*] API Health: http://127.0.0.1:{PORT}/api/health")
    print(f"[*] Students API: http://127.0.0.1:{PORT}/api/students")
    print(f"[*] Frontend Web UI: http://127.0.0.1:{PORT}/index.html")
    print("\nPress Ctrl+C to stop the server.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Shutting down AcademiaPro server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
