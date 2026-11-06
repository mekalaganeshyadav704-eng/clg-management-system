-- ==============================================================================
-- ACADEMIAPRO - COLLEGE MANAGEMENT SYSTEM
-- Relational Database Schema (ANSI SQL / SQLite)
-- ==============================================================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hod VARCHAR(100) NOT NULL,
    intake INTEGER NOT NULL DEFAULT 120,
    labs INTEGER NOT NULL DEFAULT 6,
    faculty_count INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id VARCHAR(20) PRIMARY KEY,
    emp_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(10) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    qualification VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    subjects TEXT NOT NULL, -- Stored as comma-separated or JSON
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department) REFERENCES departments(code) ON DELETE CASCADE
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(20) PRIMARY KEY,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(10) NOT NULL,
    year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    section VARCHAR(5) NOT NULL DEFAULT 'A',
    cgpa REAL NOT NULL DEFAULT 8.00,
    attendance INTEGER NOT NULL DEFAULT 85,
    fee_status VARCHAR(20) NOT NULL DEFAULT 'Paid',
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department) REFERENCES departments(code) ON DELETE CASCADE
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    dept VARCHAR(10) NOT NULL,
    sem VARCHAR(20) NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3,
    faculty VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Core Theory',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept) REFERENCES departments(code) ON DELETE CASCADE
);

-- 5. Daily Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_roll VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(15) NOT NULL CHECK(status IN ('Present', 'Absent', 'OD', 'Late')),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_roll) REFERENCES students(roll_no) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES courses(code) ON DELETE CASCADE,
    UNIQUE(student_roll, subject_code, attendance_date)
);

-- 6. Continuous Internal Assessment (Marks) Table
CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_roll VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    cat1 INTEGER NOT NULL DEFAULT 0 CHECK(cat1 BETWEEN 0 AND 20),
    cat2 INTEGER NOT NULL DEFAULT 0 CHECK(cat2 BETWEEN 0 AND 20),
    lab INTEGER NOT NULL DEFAULT 0 CHECK(lab BETWEEN 0 AND 30),
    assign INTEGER NOT NULL DEFAULT 0 CHECK(assign BETWEEN 0 AND 10),
    total INTEGER NOT NULL DEFAULT 0 CHECK(total BETWEEN 0 AND 100),
    grade VARCHAR(5) NOT NULL DEFAULT 'RA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_roll) REFERENCES students(roll_no) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES courses(code) ON DELETE CASCADE,
    UNIQUE(student_roll, subject_code)
);

-- 7. Fee Invoices Table
CREATE TABLE IF NOT EXISTS fees (
    invoice_id VARCHAR(30) PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    total_amount INTEGER NOT NULL DEFAULT 95000,
    paid_amount INTEGER NOT NULL DEFAULT 0,
    due_amount INTEGER NOT NULL DEFAULT 95000,
    status VARCHAR(20) NOT NULL CHECK(status IN ('Paid', 'Pending', 'Overdue')),
    payment_date VARCHAR(50),
    payment_mode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 8. Fee Item Breakdown Table
CREATE TABLE IF NOT EXISTS fee_breakdown (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id VARCHAR(30) NOT NULL,
    item VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES fees(invoice_id) ON DELETE CASCADE
);

-- 9. Campus Notices & Circulars Table
CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    badge_color VARCHAR(20) NOT NULL DEFAULT 'blue',
    publish_date VARCHAR(50) NOT NULL,
    target VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    posted_by VARCHAR(100) NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Weekly Timetable Table
CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day VARCHAR(20) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    room VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Lecture'
);

-- Create Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_attendance_roll ON attendance(student_roll);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_marks_roll ON marks(student_roll);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
