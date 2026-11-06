"""
init_db.py - AcademiaPro SQLite Database Initializer
Executes schema.sql and populates the database with initial seed records.
"""

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'college_erp.db')
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schema.sql')

def init_database():
    print(f"[*] Initializing Database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Enable foreign key constraints in SQLite
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Execute Schema
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    cursor.executescript(schema_sql)
    print("[+] Relational tables and indexes created successfully.")

    # 2. Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM departments")
    if cursor.fetchone()[0] > 0:
        print("[!] Database already populated with seed data. Skipping seed step.")
        conn.close()
        return

    print("[*] Seeding initial academic data...")

    # Seed Departments
    departments = [
        ('CSE', 'Computer Science & Engineering', 'Dr. Rajesh Sharma', 180, 8, 24),
        ('AI&DS', 'Artificial Intelligence & Data Science', 'Dr. Meenakshi Sundaram', 120, 6, 16),
        ('IT', 'Information Technology', 'Dr. Sanjay Verma', 120, 5, 18),
        ('ECE', 'Electronics & Communication', 'Dr. Kavita Nair', 180, 7, 22),
        ('MECH', 'Mechanical Engineering', 'Dr. R. Prabhakar', 60, 9, 14)
    ]
    cursor.executemany(
        "INSERT INTO departments (code, name, hod, intake, labs, faculty_count) VALUES (?, ?, ?, ?, ?, ?)",
        departments
    )

    # Seed Faculty
    faculty = [
        ('FAC-101', 'EMP-CSE-001', 'Dr. Arvind Swaminathan', 'CSE', 'Dean & Professor', '21 Years', 'Ph.D. in AI, M.Tech (IIT Madras)', 'dean.academic@apexinstitute.edu.in', '+91 98400 11223', 'Advanced Cloud Computing', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
        ('FAC-102', 'EMP-CSE-012', 'Dr. Rajesh Sharma', 'CSE', 'Professor & HOD', '16 Years', 'Ph.D. in Distributed Systems', 'rajesh.sharma@apexinstitute.edu.in', '+91 98765 43210', 'Database Management Systems (CS501), Web Technologies (CS503)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
        ('FAC-103', 'EMP-CSE-024', 'Prof. Priya Iyer', 'CSE', 'Associate Professor', '11 Years', 'M.Tech (NIT Trichy), (Ph.D.)', 'priya.iyer@apexinstitute.edu.in', '+91 97890 23456', 'Design & Analysis of Algorithms (CS502)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
        ('FAC-104', 'EMP-AI-005', 'Dr. Meenakshi Sundaram', 'AI&DS', 'Professor & HOD', '14 Years', 'Ph.D. in Machine Learning', 'meenakshi@apexinstitute.edu.in', '+91 94440 98765', 'Deep Learning & Neural Networks (AI501)', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'),
        ('FAC-105', 'EMP-ECE-008', 'Dr. Kavita Nair', 'ECE', 'Professor & HOD', '18 Years', 'Ph.D. in Signal Processing', 'kavita.nair@apexinstitute.edu.in', '+91 98412 34567', 'Digital Signal Processing (EC502)', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80')
    ]
    cursor.executemany(
        "INSERT INTO faculty (id, emp_code, name, department, designation, experience, qualification, email, phone, subjects, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        faculty
    )

    # Seed Students
    students = [
        ('STU-1001', '22CS101', 'Aarav Sharma', 'CSE', '3rd Year', '5th Sem', 'A', 8.92, 88, 'Paid', '+91 91234 56789', 'aarav.22cs101@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'),
        ('STU-1002', '22CS102', 'Ananya Deshmukh', 'CSE', '3rd Year', '5th Sem', 'A', 9.45, 94, 'Paid', '+91 98220 11223', 'ananya.22cs102@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
        ('STU-1003', '22CS103', 'Rohan Kulkarni', 'CSE', '3rd Year', '5th Sem', 'A', 7.21, 71, 'Pending', '+91 97410 44556', 'rohan.22cs103@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
        ('STU-1004', '22CS104', 'Pooja Hegde', 'CSE', '3rd Year', '5th Sem', 'A', 8.65, 89, 'Paid', '+91 96321 88990', 'pooja.22cs104@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'),
        ('STU-1005', '22CS105', 'Karthik Raja', 'CSE', '3rd Year', '5th Sem', 'B', 8.10, 82, 'Paid', '+91 94432 12345', 'karthik.22cs105@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'),
        ('STU-1006', '22AI101', 'Sneha Reddy', 'AI&DS', '3rd Year', '5th Sem', 'A', 9.12, 91, 'Paid', '+91 99887 76655', 'sneha.22ai101@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'),
        ('STU-1007', '22AI102', 'Aditya Varma', 'AI&DS', '3rd Year', '5th Sem', 'A', 7.84, 69, 'Pending', '+91 98450 11998', 'aditya.22ai102@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'),
        ('STU-1008', '22IT101', 'Divya Balan', 'IT', '3rd Year', '5th Sem', 'A', 8.78, 95, 'Paid', '+91 94477 66554', 'divya.22it101@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'),
        ('STU-1009', '22EC101', 'Gautam Menon', 'ECE', '3rd Year', '5th Sem', 'A', 8.35, 84, 'Paid', '+91 98760 54321', 'gautam.22ec101@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'),
        ('STU-1010', '22ME101', 'Vikas Patil', 'MECH', '3rd Year', '5th Sem', 'A', 7.95, 78, 'Pending', '+91 91230 45678', 'vikas.22me101@apexinstitute.edu.in', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80')
    ]
    cursor.executemany(
        "INSERT INTO students (id, roll_no, name, department, year, semester, section, cgpa, attendance, fee_status, phone, email, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        students
    )

    # Seed Courses
    courses = [
        ('CS501', 'Database Management Systems & SQL', 'CSE', '5th Sem', 4, 'Dr. Rajesh Sharma', 'Core Theory'),
        ('CS502', 'Design & Analysis of Algorithms', 'CSE', '5th Sem', 4, 'Prof. Priya Iyer', 'Core Theory'),
        ('CS503', 'Web Technologies & Full Stack Dev', 'CSE', '5th Sem', 3, 'Dr. Rajesh Sharma', 'Integrated Theory & Lab'),
        ('CS504', 'Operating Systems & Virtualization', 'CSE', '5th Sem', 4, 'Prof. Vikram Malhotra', 'Core Theory'),
        ('AI501', 'Deep Learning & Neural Networks', 'AI&DS', '5th Sem', 4, 'Dr. Meenakshi Sundaram', 'Core Theory'),
        ('EC502', 'Digital Signal Processing', 'ECE', '5th Sem', 4, 'Dr. Kavita Nair', 'Core Theory')
    ]
    cursor.executemany(
        "INSERT INTO courses (code, name, dept, sem, credits, faculty, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        courses
    )

    # Seed Attendance for today
    today_date = "2026-11-06"
    attendance_records = [
        ('22CS101', 'CS501', today_date, 'Present', ''),
        ('22CS102', 'CS501', today_date, 'Present', ''),
        ('22CS103', 'CS501', today_date, 'Absent', 'Medical leave pending approval'),
        ('22CS104', 'CS501', today_date, 'Present', ''),
        ('22CS105', 'CS501', today_date, 'Present', '')
    ]
    cursor.executemany(
        "INSERT OR REPLACE INTO attendance (student_roll, subject_code, attendance_date, status, remark) VALUES (?, ?, ?, ?, ?)",
        attendance_records
    )

    # Seed Marks
    marks_records = [
        ('22CS101', 'CS501', 19, 18, 28, 10, 93, 'O'),
        ('22CS102', 'CS501', 20, 19, 29, 10, 96, 'O'),
        ('22CS103', 'CS501', 14, 13, 22, 7, 68, 'B+'),
        ('22CS104', 'CS501', 18, 17, 27, 9, 87, 'A+'),
        ('22CS105', 'CS501', 16, 15, 25, 8, 80, 'A')
    ]
    cursor.executemany(
        "INSERT OR REPLACE INTO marks (student_roll, subject_code, cat1, cat2, lab, assign, total, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        marks_records
    )

    # Seed Fees
    fees_records = [
        ('INV-2026-8801', 'STU-1001', 95000, 95000, 0, 'Paid', '2026-08-12', 'Online UPI / NetBanking'),
        ('INV-2026-8802', 'STU-1003', 95000, 50000, 45000, 'Pending', '2026-08-20 (Partial)', 'Demand Draft'),
        ('INV-2026-8803', 'STU-1007', 98000, 40000, 58000, 'Pending', '2026-08-15 (Partial)', 'NEFT Bank Transfer')
    ]
    cursor.executemany(
        "INSERT INTO fees (invoice_id, student_id, total_amount, paid_amount, due_amount, status, payment_date, payment_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        fees_records
    )

    # Seed Fee Breakdown
    breakdown_records = [
        ('INV-2026-8801', 'Tuition Fee (Odd Sem 2026)', 65000),
        ('INV-2026-8801', 'Specialized Lab & Computer Center Fee', 15000),
        ('INV-2026-8801', 'Library & Digital Resources Subscription', 5000),
        ('INV-2026-8801', 'Examination & Autonomous Evaluation Fee', 6000),
        ('INV-2026-8801', 'Student Welfare & Campus Amenities', 4000),
        ('INV-2026-8802', 'Tuition Fee (Odd Sem 2026)', 65000),
        ('INV-2026-8802', 'Specialized Lab & Computer Center Fee', 15000),
        ('INV-2026-8802', 'Library & Digital Resources Subscription', 5000),
        ('INV-2026-8802', 'Examination & Autonomous Evaluation Fee', 6000),
        ('INV-2026-8802', 'Student Welfare & Campus Amenities', 4000)
    ]
    cursor.executemany(
        "INSERT INTO fee_breakdown (invoice_id, item, amount) VALUES (?, ?, ?)",
        breakdown_records
    )

    # Seed Notices
    notices = [
        ('NOT-301', 'Schedule for Continuous Assessment Test 2 (CAT-2) Released', 'Examination', 'red', 'Nov 05, 2026', 'All 2nd, 3rd & 4th Year Students', 'The Continuous Internal Assessment Examination (CAT-2) for the Odd Semester will commence from November 18, 2026. Hall tickets will be downloadable via the Student Portal for students with a minimum of 75% attendance.', 'Office of the Controller of Examinations', 1),
        ('NOT-302', "National Level Hackathon 'HACK-A-THON 2026' Registrations Open", 'Event', 'purple', 'Nov 04, 2026', 'All Engineering Departments', 'Apex Innovation Cell invites teams of 2 to 4 students for the 36-hour National Hackathon sponsored by Google Cloud & Microsoft. Total prize pool: ₹5,00,000. Registration closes Nov 15.', 'Head - Centre for Innovation & Incubation', 1),
        ('NOT-303', 'Last Date for Odd Semester Tuition Fee Payment Without Fine', 'Finance', 'amber', 'Nov 02, 2026', 'Pending Fee Students', 'Students with pending semester tuition dues are advised to clear the outstanding balance through the ERP portal before November 12, 2026 to avoid late penalty charges and exam blocking.', 'Accounts & Finance Department', 0),
        ('NOT-304', 'Holiday Declared on Account of Regional Festival', 'General', 'emerald', 'Oct 28, 2026', 'Faculty & Students', 'The college will remain closed on Friday, November 14, 2026. Academic sessions will resume as per regular timetable on the following Monday.', "Principal's Secretariat", 0)
    ]
    cursor.executemany(
        "INSERT INTO notices (id, title, category, badge_color, publish_date, target, content, posted_by, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        notices
    )

    # Seed Timetable
    timetable_slots = [
        ('Monday', '09:00 - 10:00 AM', 'CS501: DBMS', 'Dr. Rajesh Sharma', 'LH-302', 'Lecture'),
        ('Monday', '10:00 - 11:00 AM', 'CS502: Algorithms', 'Prof. Priya Iyer', 'LH-302', 'Lecture'),
        ('Monday', '11:15 - 01:15 PM', 'CS503: Web Tech Lab', 'Dr. Rajesh Sharma', 'Computing Lab 4', 'Practical'),
        ('Monday', '02:00 - 03:00 PM', 'CS504: Operating Systems', 'Prof. Vikram', 'LH-302', 'Lecture'),
        ('Monday', '03:00 - 04:00 PM', 'Library / Sports', 'Staff in charge', 'Central Library', 'Activity'),
        ('Tuesday', '09:00 - 10:00 AM', 'MA501: Discrete Math', 'Dr. Ananth', 'LH-302', 'Lecture'),
        ('Tuesday', '10:00 - 11:00 AM', 'CS501: DBMS', 'Dr. Rajesh Sharma', 'LH-302', 'Lecture'),
        ('Tuesday', '11:15 - 12:15 PM', 'CS504: Operating Systems', 'Prof. Vikram', 'LH-302', 'Lecture'),
        ('Tuesday', '01:15 - 03:15 PM', 'CS501: DBMS Lab', 'Dr. Rajesh Sharma', 'Database Lab 2', 'Practical'),
        ('Tuesday', '03:15 - 04:00 PM', 'Seminar / Mentoring', 'Mentor', 'LH-302', 'Tutorial')
    ]
    cursor.executemany(
        "INSERT INTO timetable (day, time_slot, subject, faculty, room, type) VALUES (?, ?, ?, ?, ?, ?)",
        timetable_slots
    )

    conn.commit()
    conn.close()
    print("[+] Database successfully populated with initial seed records.")

if __name__ == '__main__':
    init_database()
