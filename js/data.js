/**
 * data.js - AcademiaPro College Management System
 * Comprehensive Seed Data & LocalStorage State Manager
 */

const STORAGE_KEY = 'ACADEMIA_PRO_DATA_V1';

const DEFAULT_DATA = {
  collegeInfo: {
    name: "APEX INSTITUTE OF TECHNOLOGY & SCIENCE",
    tagline: "Autonomous Institution | Affiliated to State Technological University | Accredited 'A++' by NAAC",
    code: "AIT-2026",
    academicYear: "2026 - 2027",
    semester: "Odd Semester (Fall 2026)",
    address: "Tech Knowledge Park, Cyber Hills, Phase 2, Innovation Corridor",
    phone: "+91 44 2890 5500",
    email: "contact@apexinstitute.edu.in",
    website: "https://www.apexinstitute.edu.in"
  },

  currentUser: {
    role: "admin", // 'admin' | 'faculty' | 'student'
    name: "Dr. Arvind Swaminathan",
    designation: "Dean of Academics & Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "dean.academic@apexinstitute.edu.in",
    department: "Administration"
  },

  // Faculty logged-in persona when switching to Faculty role
  facultyPersona: {
    id: "FAC-102",
    name: "Dr. Rajesh Sharma",
    designation: "Professor & Head",
    department: "Computer Science & Engineering",
    email: "rajesh.sharma@apexinstitute.edu.in",
    phone: "+91 98765 43210",
    assignedSubjects: ["CS501", "CS503"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },

  // Student logged-in persona when switching to Student role
  studentPersona: {
    id: "STU-1001",
    rollNo: "22CS101",
    name: "Aarav Sharma",
    email: "aarav.22cs101@apexinstitute.edu.in",
    phone: "+91 91234 56789",
    department: "Computer Science & Engineering",
    deptCode: "CSE",
    year: "3rd Year",
    semester: "5th Semester",
    section: "A",
    cgpa: 8.92,
    bloodGroup: "O+ve",
    dob: "2004-05-14",
    parentName: "Suresh Sharma",
    parentPhone: "+91 98401 22334",
    address: "Flat 402, Green Meadows Apt, Outer Ring Road",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
  },

  departments: [
    { code: "CSE", name: "Computer Science & Engineering", hod: "Dr. Rajesh Sharma", intake: 180, labs: 8, facultyCount: 24 },
    { code: "AI&DS", name: "Artificial Intelligence & Data Science", hod: "Dr. Meenakshi Sundaram", intake: 120, labs: 6, facultyCount: 16 },
    { code: "IT", name: "Information Technology", hod: "Dr. Sanjay Verma", intake: 120, labs: 5, facultyCount: 18 },
    { code: "ECE", name: "Electronics & Communication", hod: "Dr. Kavita Nair", intake: 180, labs: 7, facultyCount: 22 },
    { code: "MECH", name: "Mechanical Engineering", hod: "Dr. R. Prabhakar", intake: 60, labs: 9, facultyCount: 14 }
  ],

  courses: [
    { code: "CS501", name: "Database Management Systems & SQL", dept: "CSE", sem: "5th Sem", credits: 4, faculty: "Dr. Rajesh Sharma", type: "Core Theory" },
    { code: "CS502", name: "Design & Analysis of Algorithms", dept: "CSE", sem: "5th Sem", credits: 4, faculty: "Prof. Priya Iyer", type: "Core Theory" },
    { code: "CS503", name: "Web Technologies & Full Stack Dev", dept: "CSE", sem: "5th Sem", credits: 3, faculty: "Dr. Rajesh Sharma", type: "Integrated Theory & Lab" },
    { code: "CS504", name: "Operating Systems & Virtualization", dept: "CSE", sem: "5th Sem", credits: 4, faculty: "Prof. Vikram Malhotra", type: "Core Theory" },
    { code: "AI501", name: "Deep Learning & Neural Networks", dept: "AI&DS", sem: "5th Sem", credits: 4, faculty: "Dr. Meenakshi Sundaram", type: "Core Theory" },
    { code: "EC502", name: "Digital Signal Processing", dept: "ECE", sem: "5th Sem", credits: 4, faculty: "Dr. Kavita Nair", type: "Core Theory" }
  ],

  students: [
    {
      id: "STU-1001",
      rollNo: "22CS101",
      name: "Aarav Sharma",
      department: "CSE",
      year: "3rd Year",
      semester: "5th Sem",
      section: "A",
      cgpa: 8.92,
      attendance: 88,
      feeStatus: "Paid",
      phone: "+91 91234 56789",
      email: "aarav.22cs101@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-1002",
      rollNo: "22CS102",
      name: "Ananya Deshmukh",
      department: "CSE",
      year: "3rd Year",
      semester: "5th Sem",
      section: "A",
      cgpa: 9.45,
      attendance: 94,
      feeStatus: "Paid",
      phone: "+91 98220 11223",
      email: "ananya.22cs102@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-1003",
      rollNo: "22CS103",
      name: "Rohan Kulkarni",
      department: "CSE",
      year: "3rd Year",
      semester: "5th Sem",
      section: "A",
      cgpa: 7.21,
      attendance: 71, // Low attendance warning!
      feeStatus: "Pending",
      phone: "+91 97410 44556",
      email: "rohan.22cs103@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-1004",
      rollNo: "22CS104",
      name: "Pooja Hegde",
      department: "CSE",
      year: "3rd Year",
      semester: "5th Sem",
      section: "A",
      cgpa: 8.65,
      attendance: 89,
      feeStatus: "Paid",
      phone: "+91 96321 88990",
      email: "pooja.22cs104@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-1005",
      rollNo: "22CS105",
      name: "Karthik Raja",
      department: "CSE",
      year: "3rd Year",
      semester: "5th Sem",
      section: "B",
      cgpa: 8.10,
      attendance: 82,
      feeStatus: "Paid",
      phone: "+91 94432 12345",
      email: "karthik.22cs105@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-1006",
      rollNo: "22AI101",
      name: "Sneha Reddy",
      department: "AI&DS",
      year: "3rd Year",
      semester: "5th Sem",
      section: "A",
      cgpa: 9.12,
      attendance: 91,
      feeStatus: "Paid",
      phone: "+91 99887 76655",
      email: "sneha.22ai101@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-1007",
      rollNo: "22AI102",
      name: "Aditya Varma",
      department: "AI&DS",
      year: "3rd Year",
      semester: "5th Sem",
      section: "A",
      cgpa: 7.84,
      attendance: 69, // Low attendance!
      feeStatus: "Pending",
      phone: "+91 98450 11998",
      email: "aditya.22ai102@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-1008",
      rollNo: "22IT101",
      name: "Divya Balan",
      department: "IT",
      year: "3rd Year",
      semester: "5th Sem",
      section: "A",
      cgpa: 8.78,
      attendance: 95,
      feeStatus: "Paid",
      phone: "+91 94477 66554",
      email: "divya.22it101@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-1009",
      rollNo: "22EC101",
      name: "Gautam Menon",
      department: "ECE",
      year: "3rd Year",
      semester: "5th Sem",
      section: "A",
      cgpa: 8.35,
      attendance: 84,
      feeStatus: "Paid",
      phone: "+91 98760 54321",
      email: "gautam.22ec101@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-1010",
      rollNo: "22ME101",
      name: "Vikas Patil",
      department: "MECH",
      year: "3rd Year",
      semester: "5th Sem",
      section: "A",
      cgpa: 7.95,
      attendance: 78,
      feeStatus: "Pending",
      phone: "+91 91230 45678",
      email: "vikas.22me101@apexinstitute.edu.in",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
    }
  ],

  faculty: [
    {
      id: "FAC-101",
      empCode: "EMP-CSE-001",
      name: "Dr. Arvind Swaminathan",
      department: "CSE",
      designation: "Dean & Professor",
      experience: "21 Years",
      qualification: "Ph.D. in AI, M.Tech (IIT Madras)",
      email: "dean.academic@apexinstitute.edu.in",
      phone: "+91 98400 11223",
      subjects: ["Advanced Cloud Computing"],
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "FAC-102",
      empCode: "EMP-CSE-012",
      name: "Dr. Rajesh Sharma",
      department: "CSE",
      designation: "Professor & HOD",
      experience: "16 Years",
      qualification: "Ph.D. in Distributed Systems",
      email: "rajesh.sharma@apexinstitute.edu.in",
      phone: "+91 98765 43210",
      subjects: ["Database Management Systems (CS501)", "Web Technologies (CS503)"],
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "FAC-103",
      empCode: "EMP-CSE-024",
      name: "Prof. Priya Iyer",
      department: "CSE",
      designation: "Associate Professor",
      experience: "11 Years",
      qualification: "M.Tech (NIT Trichy), (Ph.D.)",
      email: "priya.iyer@apexinstitute.edu.in",
      phone: "+91 97890 23456",
      subjects: ["Design & Analysis of Algorithms (CS502)"],
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "FAC-104",
      empCode: "EMP-AI-005",
      name: "Dr. Meenakshi Sundaram",
      department: "AI&DS",
      designation: "Professor & HOD",
      experience: "14 Years",
      qualification: "Ph.D. in Machine Learning",
      email: "meenakshi@apexinstitute.edu.in",
      phone: "+91 94440 98765",
      subjects: ["Deep Learning & Neural Networks (AI501)"],
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "FAC-105",
      empCode: "EMP-ECE-008",
      name: "Dr. Kavita Nair",
      department: "ECE",
      designation: "Professor & HOD",
      experience: "18 Years",
      qualification: "Ph.D. in Signal Processing",
      email: "kavita.nair@apexinstitute.edu.in",
      phone: "+91 98412 34567",
      subjects: ["Digital Signal Processing (EC502)"],
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80"
    }
  ],

  // Student specific mock marks for Aarav Sharma (STU-1001)
  studentMarks: [
    { code: "CS501", name: "Database Management Systems", credits: 4, internal1: 19, internal2: 18, practical: 28, assignment: 10, total: 93, grade: "O", status: "Pass" },
    { code: "CS502", name: "Design & Analysis of Algorithms", credits: 4, internal1: 17, internal2: 16, practical: 27, assignment: 9, total: 85, grade: "A+", status: "Pass" },
    { code: "CS503", name: "Web Technologies & Full Stack Dev", credits: 3, internal1: 20, internal2: 19, practical: 29, assignment: 10, total: 96, grade: "O", status: "Pass" },
    { code: "CS504", name: "Operating Systems & Virtualization", credits: 4, internal1: 16, internal2: 17, practical: 26, assignment: 8, total: 81, grade: "A", status: "Pass" },
    { code: "MA501", name: "Discrete Mathematical Structures", credits: 4, internal1: 18, internal2: 17, practical: 25, assignment: 9, total: 86, grade: "A+", status: "Pass" }
  ],

  // Subject wise attendance breakdown for Student view
  studentAttendanceSummary: [
    { code: "CS501", subject: "Database Management Systems", conducted: 42, attended: 39, percentage: 92.8, status: "safe" },
    { code: "CS502", subject: "Design & Analysis of Algorithms", conducted: 40, attended: 36, percentage: 90.0, status: "safe" },
    { code: "CS503", subject: "Web Technologies & Full Stack", conducted: 38, attended: 36, percentage: 94.7, status: "safe" },
    { code: "CS504", subject: "Operating Systems", conducted: 44, attended: 31, percentage: 70.4, status: "warning", message: "Low Attendance! Attend next 3 classes to cross 75%" },
    { code: "MA501", subject: "Discrete Mathematics", conducted: 36, attended: 30, percentage: 83.3, status: "safe" }
  ],

  // Timetable
  timetable: {
    "Monday": [
      { time: "09:00 - 10:00 AM", subject: "CS501: DBMS", faculty: "Dr. Rajesh Sharma", room: "LH-302", type: "Lecture" },
      { time: "10:00 - 11:00 AM", subject: "CS502: Algorithms", faculty: "Prof. Priya Iyer", room: "LH-302", type: "Lecture" },
      { time: "11:15 - 01:15 PM", subject: "CS503: Web Tech Lab", faculty: "Dr. Rajesh Sharma", room: "Computing Lab 4", type: "Practical" },
      { time: "02:00 - 03:00 PM", subject: "CS504: Operating Systems", faculty: "Prof. Vikram", room: "LH-302", type: "Lecture" },
      { time: "03:00 - 04:00 PM", subject: "Library / Sports", faculty: "Staff in charge", room: "Central Library", type: "Activity" }
    ],
    "Tuesday": [
      { time: "09:00 - 10:00 AM", subject: "MA501: Discrete Math", faculty: "Dr. Ananth", room: "LH-302", type: "Lecture" },
      { time: "10:00 - 11:00 AM", subject: "CS501: DBMS", faculty: "Dr. Rajesh Sharma", room: "LH-302", type: "Lecture" },
      { time: "11:15 - 12:15 PM", subject: "CS504: Operating Systems", faculty: "Prof. Vikram", room: "LH-302", type: "Lecture" },
      { time: "01:15 - 03:15 PM", subject: "CS501: DBMS Lab", faculty: "Dr. Rajesh Sharma", room: "Database Lab 2", type: "Practical" },
      { time: "03:15 - 04:00 PM", subject: "Seminar / Mentoring", faculty: "Mentor", room: "LH-302", type: "Tutorial" }
    ],
    "Wednesday": [
      { time: "09:00 - 10:00 AM", subject: "CS502: Algorithms", faculty: "Prof. Priya Iyer", room: "LH-302", type: "Lecture" },
      { time: "10:00 - 11:00 AM", subject: "CS503: Web Tech", faculty: "Dr. Rajesh Sharma", room: "LH-302", type: "Lecture" },
      { time: "11:15 - 01:15 PM", subject: "Algorithms Lab", faculty: "Prof. Priya Iyer", room: "Computing Lab 2", type: "Practical" },
      { time: "02:00 - 03:00 PM", subject: "MA501: Discrete Math", faculty: "Dr. Ananth", room: "LH-302", type: "Lecture" },
      { time: "03:00 - 04:00 PM", subject: "Aptitude & Soft Skills", faculty: "Placement Cell", room: "Auditorium", type: "Placement" }
    ],
    "Thursday": [
      { time: "09:00 - 10:00 AM", subject: "CS504: Operating Systems", faculty: "Prof. Vikram", room: "LH-302", type: "Lecture" },
      { time: "10:00 - 11:00 AM", subject: "CS501: DBMS", faculty: "Dr. Rajesh Sharma", room: "LH-302", type: "Lecture" },
      { time: "11:15 - 12:15 PM", subject: "CS502: Algorithms", faculty: "Prof. Priya Iyer", room: "LH-302", type: "Lecture" },
      { time: "01:15 - 03:15 PM", subject: "Mini Project Lab", faculty: "Guides", room: "Project Lab", type: "Practical" },
      { time: "03:15 - 04:00 PM", subject: "Open Elective", faculty: "Respective Faculty", room: "Block B", type: "Lecture" }
    ],
    "Friday": [
      { time: "09:00 - 10:00 AM", subject: "CS503: Web Tech", faculty: "Dr. Rajesh Sharma", room: "LH-302", type: "Lecture" },
      { time: "10:00 - 11:00 AM", subject: "MA501: Discrete Math", faculty: "Dr. Ananth", room: "LH-302", type: "Lecture" },
      { time: "11:15 - 01:15 PM", subject: "OS Kernel Lab", faculty: "Prof. Vikram", room: "Systems Lab 1", type: "Practical" },
      { time: "02:00 - 03:30 PM", subject: "Technical Club Activity", faculty: "CSI / ACM Chapter", room: "Seminar Hall 1", type: "Club" }
    ]
  },

  // Fee Details
  fees: [
    {
      invoiceId: "INV-2026-8801",
      studentId: "STU-1001",
      studentName: "Aarav Sharma",
      rollNo: "22CS101",
      department: "CSE",
      year: "3rd Year",
      totalAmount: 95000,
      paidAmount: 95000,
      dueAmount: 0,
      status: "Paid",
      paymentDate: "2026-08-12",
      paymentMode: "Online UPI / NetBanking",
      breakdown: [
        { item: "Tuition Fee (Odd Sem 2026)", amount: 65000 },
        { item: "Specialized Lab & Computer Center Fee", amount: 15000 },
        { item: "Library & Digital Resources Subscription", amount: 5000 },
        { item: "Examination & Autonomous Evaluation Fee", amount: 6000 },
        { item: "Student Welfare & Campus Amenities", amount: 4000 }
      ]
    },
    {
      invoiceId: "INV-2026-8802",
      studentId: "STU-1003",
      studentName: "Rohan Kulkarni",
      rollNo: "22CS103",
      department: "CSE",
      year: "3rd Year",
      totalAmount: 95000,
      paidAmount: 50000,
      dueAmount: 45000,
      status: "Pending",
      paymentDate: "2026-08-20 (Partial)",
      paymentMode: "Demand Draft",
      breakdown: [
        { item: "Tuition Fee (Odd Sem 2026)", amount: 65000 },
        { item: "Specialized Lab & Computer Center Fee", amount: 15000 },
        { item: "Library & Digital Resources Subscription", amount: 5000 },
        { item: "Examination & Autonomous Evaluation Fee", amount: 6000 },
        { item: "Student Welfare & Campus Amenities", amount: 4000 }
      ]
    },
    {
      invoiceId: "INV-2026-8803",
      studentId: "STU-1007",
      studentName: "Aditya Varma",
      rollNo: "22AI102",
      department: "AI&DS",
      year: "3rd Year",
      totalAmount: 98000,
      paidAmount: 40000,
      dueAmount: 58000,
      status: "Pending",
      paymentDate: "2026-08-15 (Partial)",
      paymentMode: "NEFT Bank Transfer",
      breakdown: [
        { item: "Tuition Fee (AI Specialization)", amount: 68000 },
        { item: "GPU Cloud Lab Infrastructure Fee", amount: 15000 },
        { item: "Library & IEEE Access Fee", amount: 5000 },
        { item: "Examination Fee", amount: 6000 },
        { item: "Campus Amenities", amount: 4000 }
      ]
    }
  ],

  // Notice board
  notices: [
    {
      id: "NOT-301",
      title: "Schedule for Continuous Assessment Test 2 (CAT-2) Released",
      category: "Examination",
      badgeColor: "red",
      date: "Nov 05, 2026",
      target: "All 2nd, 3rd & 4th Year Students",
      content: "The Continuous Internal Assessment Examination (CAT-2) for the Odd Semester will commence from November 18, 2026. Hall tickets will be downloadable via the Student Portal for students with a minimum of 75% attendance.",
      postedBy: "Office of the Controller of Examinations",
      isPinned: true
    },
    {
      id: "NOT-302",
      title: "National Level Hackathon 'HACK-A-THON 2026' Registrations Open",
      category: "Event",
      badgeColor: "purple",
      date: "Nov 04, 2026",
      target: "All Engineering Departments",
      content: "Apex Innovation Cell invites teams of 2 to 4 students for the 36-hour National Hackathon sponsored by Google Cloud & Microsoft. Total prize pool: ₹5,00,000. Registration closes Nov 15.",
      postedBy: "Head - Centre for Innovation & Incubation",
      isPinned: true
    },
    {
      id: "NOT-303",
      title: "Last Date for Odd Semester Tuition Fee Payment Without Fine",
      category: "Finance",
      badgeColor: "amber",
      date: "Nov 02, 2026",
      target: "Pending Fee Students",
      content: "Students with pending semester tuition dues are advised to clear the outstanding balance through the ERP portal before November 12, 2026 to avoid late penalty charges and exam blocking.",
      postedBy: "Accounts & Finance Department",
      isPinned: false
    },
    {
      id: "NOT-304",
      title: "Holiday Declared on Account of Regional Festival",
      category: "General",
      badgeColor: "emerald",
      date: "Oct 28, 2026",
      target: "Faculty & Students",
      content: "The college will remain closed on Friday, November 14, 2026. Academic sessions will resume as per regular timetable on the following Monday.",
      postedBy: "Principal's Secretariat",
      isPinned: false
    }
  ],

  // Interactive Live Attendance Roster for faculty marking (CS501 - DBMS)
  liveAttendanceRoster: [
    { rollNo: "22CS101", name: "Aarav Sharma", status: "Present", remark: "" },
    { rollNo: "22CS102", name: "Ananya Deshmukh", status: "Present", remark: "" },
    { rollNo: "22CS103", name: "Rohan Kulkarni", status: "Absent", remark: "Sick leave requested" },
    { rollNo: "22CS104", name: "Pooja Hegde", status: "Present", remark: "" },
    { rollNo: "22CS105", name: "Karthik Raja", status: "Present", remark: "" }
  ],

  // Faculty marks roster for CS501
  facultyMarksSheet: [
    { rollNo: "22CS101", name: "Aarav Sharma", cat1: 19, cat2: 18, lab: 28, assign: 10, total: 93, grade: "O" },
    { rollNo: "22CS102", name: "Ananya Deshmukh", cat1: 20, cat2: 19, lab: 29, assign: 10, total: 96, grade: "O" },
    { rollNo: "22CS103", name: "Rohan Kulkarni", cat1: 14, cat2: 13, lab: 22, assign: 7, total: 68, grade: "B+" },
    { rollNo: "22CS104", name: "Pooja Hegde", cat1: 18, cat2: 17, lab: 27, assign: 9, total: 87, grade: "A+" },
    { rollNo: "22CS105", name: "Karthik Raja", cat1: 16, cat2: 15, lab: 25, assign: 8, total: 80, grade: "A" }
  ]
};

// Data manager helper
const DataStore = {
  get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.save(DEFAULT_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Error reading localStorage, reverting to defaults:", e);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.save(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  },

  // Role Switcher
  setRole(role) {
    const data = this.get();
    data.currentUser.role = role;
    if (role === 'admin') {
      data.currentUser.name = "Dr. Arvind Swaminathan";
      data.currentUser.designation = "Dean of Academics & Admin";
      data.currentUser.avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    } else if (role === 'faculty') {
      data.currentUser.name = data.facultyPersona.name;
      data.currentUser.designation = data.facultyPersona.designation;
      data.currentUser.avatar = data.facultyPersona.avatar;
    } else if (role === 'student') {
      data.currentUser.name = data.studentPersona.name;
      data.currentUser.designation = `Student (${data.studentPersona.rollNo})`;
      data.currentUser.avatar = data.studentPersona.avatar;
    }
    this.save(data);
    return data;
  }
};
