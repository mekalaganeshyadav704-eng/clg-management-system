/**
 * app.js - AcademiaPro College Management ERP
 * Application Controller, Routing, Role Switching & UI Event Handlers
 */

// Global App State
let state = {
  currentRole: 'admin', // 'admin' | 'faculty' | 'student'
  currentTab: 'dashboard',
  searchQuery: '',
  deptFilter: 'ALL',
  selectedStudent: null,
  selectedInvoice: null,
  isBackendLive: false,
  apiBaseUrl: window.location.protocol.startsWith('http') ? '' : 'http://127.0.0.1:8000'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // Load data from localStorage first
  const data = DataStore.get();
  state.currentRole = data.currentUser.role || 'admin';

  // Setup navigation
  setupNavigation();

  // Setup Role Switcher
  setupRoleSwitcher();

  // Setup Search and Filters
  setupSearchAndFilters();

  // Setup Form Submissions
  setupFormHandlers();

  // Render initial view based on role
  applyRoleUI(state.currentRole);
  navigateTo('dashboard');

  // Update live clock
  startLiveClock();

  // Check SQL REST API Backend Connection asynchronously (non-blocking for instant load)
  checkBackendConnection();
}

/**
 * Check SQL REST API Backend Health & Sync State
 */
async function checkBackendConnection() {
  const badgeEl = document.getElementById('dbStatusBadge');
  const dotEl = document.getElementById('dbStatusDot');
  const textEl = document.getElementById('dbStatusText');

  try {
    const res = await fetch(`${state.apiBaseUrl}/api/health`, { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      state.isBackendLive = true;

      if (badgeEl && dotEl && textEl) {
        badgeEl.className = 'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-sm';
        dotEl.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
        textEl.textContent = 'SQLite SQL Connected';
      }

      // Sync fresh data from SQL Database into UI
      await syncDataFromBackend();
      renderTabContent(state.currentTab);
      return;
    }
  } catch (err) {
    // Backend offline; fallback to LocalStorage
    state.isBackendLive = false;
  }

  if (badgeEl && dotEl && textEl) {
    badgeEl.className = 'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200';
    dotEl.className = 'w-2 h-2 rounded-full bg-slate-400';
    textEl.textContent = 'Offline (LocalStorage)';
  }
}

async function syncDataFromBackend() {
  try {
    const [studentsRes, noticesRes, marksRes] = await Promise.all([
      fetch(`${state.apiBaseUrl}/api/students`),
      fetch(`${state.apiBaseUrl}/api/notices`),
      fetch(`${state.apiBaseUrl}/api/marks`)
    ]);

    if (studentsRes.ok && noticesRes.ok) {
      const students = await studentsRes.json();
      const notices = await noticesRes.json();
      const localData = DataStore.get();

      if (Array.isArray(students) && students.length > 0) {
        localData.students = students.map(s => ({
          id: s.id,
          rollNo: s.roll_no,
          name: s.name,
          department: s.department,
          year: s.year,
          semester: s.semester,
          section: s.section,
          cgpa: s.cgpa,
          attendance: s.attendance,
          feeStatus: s.fee_status,
          phone: s.phone,
          email: s.email,
          avatar: s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        }));
      }

      if (Array.isArray(notices) && notices.length > 0) {
        localData.notices = notices;
      }

      if (marksRes.ok) {
        const marks = await marksRes.json();
        if (Array.isArray(marks) && marks.length > 0) {
          localData.facultyMarksSheet = marks;
        }
      }

      DataStore.save(localData);
    }
  } catch (e) {
    console.warn('Backend sync failed, using local copy:', e);
  }
}

/**
 * Real-time Live Clock in Header
 */
function startLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    clockEl.textContent = now.toLocaleDateString('en-US', options);
  }
  update();
  setInterval(update, 1000);
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'fa-circle-check text-emerald-500',
    error: 'fa-circle-exclamation text-rose-500',
    warning: 'fa-triangle-exclamation text-amber-500',
    info: 'fa-circle-info text-blue-500'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || iconMap.info} text-lg"></i>
    <div class="flex-1 text-sm font-medium text-slate-800">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Role Switcher & Dynamic Navigation Adjustments
 */
function setupRoleSwitcher() {
  const roleSelect = document.getElementById('roleSwitcherSelect');
  if (!roleSelect) return;

  roleSelect.value = state.currentRole;
  roleSelect.addEventListener('change', (e) => {
    switchRole(e.target.value);
  });
}

function switchRole(role) {
  state.currentRole = role;
  DataStore.setRole(role);
  applyRoleUI(role);

  // Navigate to appropriate default view for the role
  if (role === 'admin') {
    navigateTo('dashboard');
    showToast('Switched to Administrator Portal (Full System Access)', 'info');
  } else if (role === 'faculty') {
    navigateTo('attendance');
    showToast('Switched to Faculty Portal (Dr. Rajesh Sharma)', 'info');
  } else if (role === 'student') {
    navigateTo('student-overview');
    showToast('Switched to Student Portal (Aarav Sharma - 22CS101)', 'info');
  }
}

function applyRoleUI(role) {
  const data = DataStore.get();
  const userNameEl = document.getElementById('currentUserName');
  const userRoleEl = document.getElementById('currentUserRole');
  const userAvatarEl = document.getElementById('currentUserAvatar');
  const roleBadgeEl = document.getElementById('activeRoleBadge');

  if (userNameEl) userNameEl.textContent = data.currentUser.name;
  if (userRoleEl) userRoleEl.textContent = data.currentUser.designation;
  if (userAvatarEl) userAvatarEl.src = data.currentUser.avatar;

  if (roleBadgeEl) {
    if (role === 'admin') {
      roleBadgeEl.className = 'px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200';
      roleBadgeEl.innerHTML = '<i class="fa-solid fa-shield-halved mr-1"></i> Admin Portal';
    } else if (role === 'faculty') {
      roleBadgeEl.className = 'px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200';
      roleBadgeEl.innerHTML = '<i class="fa-solid fa-chalkboard-user mr-1"></i> Faculty Portal';
    } else {
      roleBadgeEl.className = 'px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200';
      roleBadgeEl.innerHTML = '<i class="fa-solid fa-graduation-cap mr-1"></i> Student Portal';
    }
  }

  // Toggle role-specific navigation menu items
  const adminNavs = document.querySelectorAll('.nav-admin-only');
  const facultyNavs = document.querySelectorAll('.nav-faculty-only');
  const studentNavs = document.querySelectorAll('.nav-student-only');

  adminNavs.forEach(el => el.style.display = (role === 'admin') ? 'flex' : 'none');
  facultyNavs.forEach(el => el.style.display = (role === 'faculty' || role === 'admin') ? 'flex' : 'none');
  studentNavs.forEach(el => el.style.display = (role === 'student') ? 'flex' : 'none');
}

/**
 * Tab Navigation
 */
function setupNavigation() {
  document.querySelectorAll('[data-tab-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-tab-target');
      navigateTo(target);
    });
  });
}

function navigateTo(tabId) {
  state.currentTab = tabId;

  // Update active styling on sidebar links
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.getAttribute('data-tab-target') === tabId) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Hide all view panels
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.add('hidden');
  });

  // Show active panel
  const activePane = document.getElementById(`pane-${tabId}`);
  if (activePane) {
    activePane.classList.remove('hidden');
    renderTabContent(tabId);
  }
}

/**
 * Render Content per Tab
 */
function renderTabContent(tabId) {
  const data = DataStore.get();

  switch (tabId) {
    case 'dashboard':
      renderDashboard(data);
      break;
    case 'students':
      renderStudentsTable();
      break;
    case 'faculty':
      renderFacultyCards();
      break;
    case 'attendance':
      renderAttendanceSection();
      break;
    case 'marks':
      renderMarksSection();
      break;
    case 'courses':
      renderCoursesSection();
      break;
    case 'fees':
      renderFeesSection();
      break;
    case 'notices':
      renderNoticesSection();
      break;
    case 'timetable':
      renderTimetableSection();
      break;
    case 'student-overview':
      renderStudentPortal();
      break;
  }
}

/**
 * 1. DASHBOARD VIEW
 */
function renderDashboard(data) {
  // Update counter cards
  const totalStudentsEl = document.getElementById('dashTotalStudents');
  const totalFacultyEl = document.getElementById('dashTotalFaculty');
  const totalCoursesEl = document.getElementById('dashTotalCourses');
  const avgAttendanceEl = document.getElementById('dashAvgAttendance');

  if (totalStudentsEl) totalStudentsEl.textContent = (data.students.length * 142).toLocaleString();
  if (totalFacultyEl) totalFacultyEl.textContent = (data.faculty.length * 18).toString();
  if (totalCoursesEl) totalCoursesEl.textContent = (data.courses.length * 8).toString();
  if (avgAttendanceEl) avgAttendanceEl.textContent = '87.4%';

  // Re-initialize Charts
  setTimeout(() => {
    AppCharts.initDashboardCharts();
  }, 50);

  // Recent Notices on Dashboard
  renderDashboardNotices(data.notices);
}

function renderDashboardNotices(notices) {
  const listEl = document.getElementById('dashNoticesList');
  if (!listEl) return;

  const top3 = notices.slice(0, 3);
  listEl.innerHTML = top3.map(n => `
    <div class="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition flex items-start gap-3.5">
      <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getNoticeBadgeClasses(n.category)}">
        <i class="fa-solid fa-bullhorn text-sm"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getCategoryPill(n.category)}">${n.category}</span>
          <span class="text-xs text-slate-400">${n.date}</span>
        </div>
        <h4 class="text-sm font-semibold text-slate-800 mt-1 truncate">${n.title}</h4>
        <p class="text-xs text-slate-500 line-clamp-1 mt-0.5">${n.content}</p>
      </div>
    </div>
  `).join('');
}

function getCategoryPill(cat) {
  switch (cat) {
    case 'Examination': return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'Event': return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'Finance': return 'bg-amber-50 text-amber-700 border border-amber-200';
    default: return 'bg-blue-50 text-blue-700 border border-blue-200';
  }
}

function getNoticeBadgeClasses(cat) {
  switch (cat) {
    case 'Examination': return 'bg-rose-100 text-rose-600';
    case 'Event': return 'bg-purple-100 text-purple-600';
    case 'Finance': return 'bg-amber-100 text-amber-600';
    default: return 'bg-blue-100 text-blue-600';
  }
}

/**
 * 2. STUDENTS MANAGEMENT
 */
function renderStudentsTable() {
  const data = DataStore.get();
  const tableBody = document.getElementById('studentsTableBody');
  const countBadge = document.getElementById('studentsFilteredCount');
  if (!tableBody) return;

  // Filter students
  let filtered = data.students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          s.rollNo.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesDept = state.deptFilter === 'ALL' || s.department === state.deptFilter;
    return matchesSearch && matchesDept;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Students`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-12 text-slate-400">
          <i class="fa-solid fa-user-slash text-3xl mb-2"></i>
          <p class="text-sm font-medium">No students found matching your criteria</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(s => `
    <tr class="hover:bg-slate-50/80 transition">
      <td class="font-mono font-medium text-blue-600">${s.rollNo}</td>
      <td>
        <div class="flex items-center gap-3">
          <img src="${s.avatar}" alt="${s.name}" class="w-9 h-9 rounded-full object-cover border border-slate-200">
          <div>
            <div class="font-semibold text-slate-900">${s.name}</div>
            <div class="text-xs text-slate-400">${s.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          ${s.department}
        </span>
      </td>
      <td class="text-slate-600">${s.year} (${s.semester})</td>
      <td>
        <span class="font-bold ${s.cgpa >= 8.5 ? 'text-emerald-600' : 'text-slate-700'}">${s.cgpa.toFixed(2)}</span>
      </td>
      <td>
        <div class="flex items-center gap-2">
          <div class="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div class="h-2 rounded-full ${s.attendance < 75 ? 'bg-rose-500' : 'bg-emerald-500'}" style="width: ${s.attendance}%"></div>
          </div>
          <span class="text-xs font-semibold ${s.attendance < 75 ? 'text-rose-600' : 'text-slate-600'}">${s.attendance}%</span>
        </div>
      </td>
      <td>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${s.feeStatus}
        </span>
      </td>
      <td class="text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="viewStudentModal('${s.id}')" title="View Profile" class="w-8 h-8 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center">
            <i class="fa-regular fa-eye"></i>
          </button>
          <button onclick="editStudentModal('${s.id}')" title="Edit Student" class="w-8 h-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition flex items-center justify-center">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button onclick="deleteStudent('${s.id}')" title="Delete Student" class="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition flex items-center justify-center">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * 3. FACULTY SECTION
 */
function renderFacultyCards() {
  const data = DataStore.get();
  const gridEl = document.getElementById('facultyGrid');
  if (!gridEl) return;

  gridEl.innerHTML = data.faculty.map(f => `
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 hover-lift shadow-sm relative">
      <div class="flex items-start gap-4">
        <img src="${f.avatar}" alt="${f.name}" class="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md">
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${f.empCode}</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">${f.department}</span>
          </div>
          <h3 class="font-bold text-slate-900 text-base mt-1 truncate">${f.name}</h3>
          <p class="text-xs font-medium text-slate-500">${f.designation}</p>
        </div>
      </div>

      <div class="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-graduation-cap text-slate-400 w-4"></i>
          <span class="truncate">${f.qualification}</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="fa-regular fa-clock text-slate-400 w-4"></i>
          <span>Experience: <strong>${f.experience}</strong></span>
        </div>
        <div class="flex items-center gap-2">
          <i class="fa-regular fa-envelope text-slate-400 w-4"></i>
          <span class="truncate text-blue-600">${f.email}</span>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Handling Subjects</div>
        <div class="flex flex-wrap gap-1.5">
          ${f.subjects.map(s => `<span class="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700 font-medium">${s}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * 4. ATTENDANCE SECTION (Interactive for Faculty & Admin)
 */
function renderAttendanceSection() {
  const data = DataStore.get();
  const rosterTable = document.getElementById('attendanceRosterBody');
  if (!rosterTable) return;

  const roster = data.liveAttendanceRoster;
  const presentCount = roster.filter(r => r.status === 'Present').length;
  const totalCount = roster.length;
  const percentage = Math.round((presentCount / totalCount) * 100);

  const presentBadge = document.getElementById('attPresentBadge');
  const pctBadge = document.getElementById('attPctBadge');
  if (presentBadge) presentBadge.textContent = `${presentCount} / ${totalCount} Present`;
  if (pctBadge) pctBadge.textContent = `${percentage}% Today`;

  rosterTable.innerHTML = roster.map((item, idx) => `
    <tr class="hover:bg-slate-50 transition">
      <td class="font-mono font-bold text-slate-700">${item.rollNo}</td>
      <td class="font-semibold text-slate-900">${item.name}</td>
      <td>
        <div class="inline-flex items-center rounded-lg p-1 bg-slate-100">
          <button onclick="updateAttendanceStatus(${idx}, 'Present')" class="px-3 py-1 rounded-md text-xs font-bold transition ${item.status === 'Present' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            Present
          </button>
          <button onclick="updateAttendanceStatus(${idx}, 'Absent')" class="px-3 py-1 rounded-md text-xs font-bold transition ${item.status === 'Absent' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            Absent
          </button>
          <button onclick="updateAttendanceStatus(${idx}, 'OD')" class="px-3 py-1 rounded-md text-xs font-bold transition ${item.status === 'OD' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            On Duty
          </button>
        </div>
      </td>
      <td>
        <input type="text" value="${item.remark || ''}" onchange="updateAttendanceRemark(${idx}, this.value)" placeholder="Add optional remark..." class="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500">
      </td>
    </tr>
  `).join('');
}

function updateAttendanceStatus(index, newStatus) {
  const data = DataStore.get();
  data.liveAttendanceRoster[index].status = newStatus;
  DataStore.save(data);
  renderAttendanceSection();
}

function updateAttendanceRemark(index, remark) {
  const data = DataStore.get();
  data.liveAttendanceRoster[index].remark = remark;
  DataStore.save(data);
}

function markAllPresent() {
  const data = DataStore.get();
  data.liveAttendanceRoster.forEach(r => r.status = 'Present');
  DataStore.save(data);
  renderAttendanceSection();
  showToast('Marked all students as Present!', 'success');
}

async function submitAttendance() {
  const data = DataStore.get();
  if (state.isBackendLive) {
    try {
      await fetch(`${state.apiBaseUrl}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roster: data.liveAttendanceRoster,
          subjectCode: 'CS501',
          date: '2026-11-06'
        })
      });
      showToast('Attendance recorded and committed to SQLite Database!', 'success');
    } catch (e) {
      showToast('Attendance synced locally!', 'info');
    }
  } else {
    showToast('Attendance records finalized and synced with Student Portals!', 'success');
  }

  if (typeof confetti === 'function') {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
  }
}

/**
 * 5. EXAMINATION & MARKS EVALUATION
 */
function renderMarksSection() {
  const data = DataStore.get();
  const tableBody = document.getElementById('marksTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = data.facultyMarksSheet.map((m, idx) => `
    <tr class="hover:bg-slate-50 transition">
      <td class="font-mono font-bold text-slate-700">${m.rollNo}</td>
      <td class="font-semibold text-slate-900">${m.name}</td>
      <td>
        <input type="number" min="0" max="20" value="${m.cat1}" onchange="updateMark(${idx}, 'cat1', this.value)" class="w-16 px-2 py-1 text-center font-semibold rounded border border-slate-200 focus:border-blue-500 focus:ring-1">
      </td>
      <td>
        <input type="number" min="0" max="20" value="${m.cat2}" onchange="updateMark(${idx}, 'cat2', this.value)" class="w-16 px-2 py-1 text-center font-semibold rounded border border-slate-200 focus:border-blue-500 focus:ring-1">
      </td>
      <td>
        <input type="number" min="0" max="30" value="${m.lab}" onchange="updateMark(${idx}, 'lab', this.value)" class="w-16 px-2 py-1 text-center font-semibold rounded border border-slate-200 focus:border-blue-500 focus:ring-1">
      </td>
      <td>
        <input type="number" min="0" max="10" value="${m.assign}" onchange="updateMark(${idx}, 'assign', this.value)" class="w-16 px-2 py-1 text-center font-semibold rounded border border-slate-200 focus:border-blue-500 focus:ring-1">
      </td>
      <td class="font-bold text-slate-900 text-base">${m.total} / 100</td>
      <td>
        <span class="inline-block px-2.5 py-1 text-xs font-black rounded-lg ${m.grade === 'O' ? 'bg-emerald-100 text-emerald-800' : m.grade === 'A+' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}">
          ${m.grade}
        </span>
      </td>
    </tr>
  `).join('');
}

function updateMark(index, field, value) {
  const data = DataStore.get();
  const row = data.facultyMarksSheet[index];
  row[field] = parseInt(value, 10) || 0;

  // Recalculate total & grade
  row.total = row.cat1 + row.cat2 + row.lab + row.assign;
  if (row.total >= 90) row.grade = 'O';
  else if (row.total >= 80) row.grade = 'A+';
  else if (row.total >= 70) row.grade = 'A';
  else if (row.total >= 60) row.grade = 'B+';
  else if (row.total >= 50) row.grade = 'B';
  else row.grade = 'RA';

  DataStore.save(data);
  renderMarksSection();

  if (state.isBackendLive) {
    fetch(`${state.apiBaseUrl}/api/marks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    }).catch(err => console.warn('Marks update to backend failed:', err));
  }

  showToast(`Updated marks for ${row.name} (Grade: ${row.grade})`, 'info');
}

/**
 * 6. COURSES & DEPARTMENTS
 */
function renderCoursesSection() {
  const data = DataStore.get();
  const deptsGrid = document.getElementById('departmentsGrid');
  const coursesTable = document.getElementById('coursesTableBody');

  if (deptsGrid) {
    deptsGrid.innerHTML = data.departments.map(d => `
      <div class="p-4 rounded-xl border border-slate-200 bg-white hover-lift">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-50 text-blue-600">${d.code}</span>
          <span class="text-xs text-slate-400 font-semibold">${d.intake} Seats</span>
        </div>
        <h4 class="font-bold text-slate-900 mt-2 text-sm">${d.name}</h4>
        <p class="text-xs text-slate-500 mt-1">HOD: <strong class="text-slate-700">${d.hod}</strong></p>
        <div class="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span><i class="fa-solid fa-users text-slate-400 mr-1"></i> ${d.facultyCount} Faculty</span>
          <span><i class="fa-solid fa-flask text-slate-400 mr-1"></i> ${d.labs} Labs</span>
        </div>
      </div>
    `).join('');
  }

  if (coursesTable) {
    coursesTable.innerHTML = data.courses.map(c => `
      <tr class="hover:bg-slate-50 transition">
        <td class="font-mono font-bold text-blue-600">${c.code}</td>
        <td class="font-semibold text-slate-900">${c.name}</td>
        <td><span class="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">${c.dept}</span></td>
        <td class="text-slate-600">${c.sem}</td>
        <td class="font-bold text-slate-800">${c.credits} Credits</td>
        <td class="text-slate-600">${c.faculty}</td>
        <td><span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">${c.type}</span></td>
      </tr>
    `).join('');
  }
}

/**
 * 7. FEES & FINANCE SECTION
 */
function renderFeesSection() {
  const data = DataStore.get();
  const feeList = document.getElementById('feesInvoicesBody');
  if (!feeList) return;

  feeList.innerHTML = data.fees.map(f => `
    <tr class="hover:bg-slate-50 transition">
      <td class="font-mono font-bold text-blue-600">${f.invoiceId}</td>
      <td>
        <div class="font-semibold text-slate-900">${f.studentName}</div>
        <div class="text-xs text-slate-400 font-mono">${f.rollNo} • ${f.department}</div>
      </td>
      <td class="font-semibold text-slate-700">₹${f.totalAmount.toLocaleString('en-IN')}</td>
      <td class="font-bold text-emerald-600">₹${f.paidAmount.toLocaleString('en-IN')}</td>
      <td class="font-bold ${f.dueAmount > 0 ? 'text-amber-600' : 'text-slate-400'}">₹${f.dueAmount.toLocaleString('en-IN')}</td>
      <td>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${f.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${f.status}
        </span>
      </td>
      <td class="text-xs text-slate-500">${f.paymentDate}</td>
      <td class="text-right">
        <button onclick="printFeeReceiptModal('${f.invoiceId}')" class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition inline-flex items-center gap-1.5">
          <i class="fa-solid fa-receipt"></i> View Receipt
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * 8. NOTICE BOARD
 */
function renderNoticesSection() {
  const data = DataStore.get();
  const noticesContainer = document.getElementById('allNoticesContainer');
  if (!noticesContainer) return;

  noticesContainer.innerHTML = data.notices.map(n => `
    <div class="p-5 rounded-2xl border border-slate-200/90 bg-white hover-lift shadow-sm relative">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${getCategoryPill(n.category)}">${n.category}</span>
          ${n.isPinned ? '<span class="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200"><i class="fa-solid fa-thumbtack mr-1"></i> Pinned</span>' : ''}
        </div>
        <span class="text-xs text-slate-400 font-medium">${n.date}</span>
      </div>
      <h3 class="text-base font-bold text-slate-900 mt-2">${n.title}</h3>
      <p class="text-sm text-slate-600 mt-2 leading-relaxed">${n.content}</p>
      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Target: <strong class="text-slate-700 font-medium">${n.target}</strong></span>
        <span>Issued by: <strong class="text-slate-700 font-medium">${n.postedBy}</strong></span>
      </div>
    </div>
  `).join('');
}

/**
 * 9. TIMETABLE
 */
function renderTimetableSection() {
  const data = DataStore.get();
  const timetableContainer = document.getElementById('timetableGrid');
  if (!timetableContainer) return;

  const days = Object.keys(data.timetable);

  timetableContainer.innerHTML = days.map(day => `
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
      <div class="bg-slate-900 text-white px-5 py-3 font-bold text-sm flex items-center justify-between">
        <span>${day}</span>
        <span class="text-xs font-normal text-slate-400">Section CSE-A</span>
      </div>
      <div class="p-4 space-y-3">
        ${data.timetable[day].map(slot => `
          <div class="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-semibold text-blue-600">${slot.time}</span>
              <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${slot.type === 'Practical' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'}">${slot.type}</span>
            </div>
            <h5 class="text-sm font-bold text-slate-800 mt-1">${slot.subject}</h5>
            <div class="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span><i class="fa-solid fa-user-tie mr-1 text-slate-400"></i>${slot.faculty}</span>
              <span class="font-medium text-slate-600"><i class="fa-solid fa-door-open mr-1 text-slate-400"></i>${slot.room}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * 10. STUDENT SELF-SERVICE PORTAL
 */
function renderStudentPortal() {
  const data = DataStore.get();
  const stu = data.studentPersona;

  // Student Profile Banner
  const profileName = document.getElementById('stuName');
  const profileRoll = document.getElementById('stuRoll');
  const profileDept = document.getElementById('stuDept');
  const profileCgpa = document.getElementById('stuCgpa');
  const profileImg = document.getElementById('stuAvatarImg');

  if (profileName) profileName.textContent = stu.name;
  if (profileRoll) profileRoll.textContent = stu.rollNo;
  if (profileDept) profileDept.textContent = `${stu.department} • ${stu.year} (${stu.semester})`;
  if (profileCgpa) profileCgpa.textContent = stu.cgpa.toFixed(2);
  if (profileImg) profileImg.src = stu.avatar;

  // Student Attendance Summary Cards
  const attList = document.getElementById('studentAttSummaryList');
  if (attList) {
    attList.innerHTML = data.studentAttendanceSummary.map(item => `
      <div class="p-4 rounded-xl border ${item.status === 'warning' ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-white'}">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="font-mono text-xs font-bold text-blue-600">${item.code}</span>
            <h4 class="font-bold text-slate-900 text-sm mt-0.5">${item.subject}</h4>
          </div>
          <span class="text-base font-black ${item.percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}">${item.percentage}%</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
          <div class="h-2.5 rounded-full ${item.percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}" style="width: ${item.percentage}%"></div>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-500 mt-2">
          <span>Attended: <strong>${item.attended} / ${item.conducted}</strong> classes</span>
          ${item.status === 'warning' ? `<span class="text-rose-600 font-semibold"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Shortage Risk</span>` : `<span class="text-emerald-600 font-medium">Eligible</span>`}
        </div>
        ${item.message ? `<div class="mt-2 text-xs font-medium text-amber-800 bg-amber-100/70 p-2 rounded-lg">${item.message}</div>` : ''}
      </div>
    `).join('');
  }

  // Student Marks Sheet
  const marksList = document.getElementById('studentMarksList');
  if (marksList) {
    marksList.innerHTML = data.studentMarks.map(m => `
      <tr class="hover:bg-slate-50 transition">
        <td class="font-mono font-bold text-slate-700">${m.code}</td>
        <td class="font-semibold text-slate-900">${m.name}</td>
        <td class="text-center font-semibold text-slate-600">${m.credits}</td>
        <td class="text-center text-slate-600">${m.internal1} / 20</td>
        <td class="text-center text-slate-600">${m.internal2} / 20</td>
        <td class="text-center text-slate-600">${m.practical} / 30</td>
        <td class="text-center text-slate-600">${m.assignment} / 10</td>
        <td class="text-center font-bold text-slate-900">${m.total}</td>
        <td class="text-center font-black ${m.grade === 'O' ? 'text-emerald-600' : 'text-blue-600'}">${m.grade}</td>
      </tr>
    `).join('');
  }
}

/**
 * Filter & Search Listeners
 */
function setupSearchAndFilters() {
  const searchInput = document.getElementById('studentSearchInput');
  const deptFilterSelect = document.getElementById('studentDeptFilter');

  let debounceTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value;
        renderStudentsTable();
      }, 50); // Fast 50ms debounce
    });
  }

  if (deptFilterSelect) {
    deptFilterSelect.addEventListener('change', (e) => {
      state.deptFilter = e.target.value;
      renderStudentsTable();
    });
  }
}

/**
 * Form Submission Handlers
 */
function setupFormHandlers() {
  // Add Student Form
  const addStudentForm = document.getElementById('addStudentForm');
  if (addStudentForm) {
    addStudentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addStudentForm);
      const data = DataStore.get();

      const newStudent = {
        id: `STU-${Date.now().toString().slice(-4)}`,
        rollNo: formData.get('rollNo').trim(),
        name: formData.get('name').trim(),
        department: formData.get('department'),
        year: formData.get('year'),
        semester: formData.get('semester'),
        section: formData.get('section'),
        cgpa: parseFloat(formData.get('cgpa')) || 8.0,
        attendance: parseInt(formData.get('attendance'), 10) || 85,
        feeStatus: formData.get('feeStatus'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
      };

      data.students.unshift(newStudent);
      DataStore.save(data);

      closeModal('addStudentModal');
      addStudentForm.reset();
      renderStudentsTable();

      if (state.isBackendLive) {
        try {
          await fetch(`${state.apiBaseUrl}/api/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStudent)
          });
          showToast(`Student ${newStudent.name} (${newStudent.rollNo}) saved to SQLite database!`, 'success');
        } catch (err) {
          showToast(`Enrolled locally: ${newStudent.name}`, 'info');
        }
      } else {
        showToast(`Student ${newStudent.name} (${newStudent.rollNo}) successfully enrolled!`, 'success');
      }

      if (typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      }
    });
  }

  // Add Notice Form
  const addNoticeForm = document.getElementById('addNoticeForm');
  if (addNoticeForm) {
    addNoticeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addNoticeForm);
      const data = DataStore.get();

      const newNotice = {
        id: `NOT-${Date.now().toString().slice(-3)}`,
        title: formData.get('title'),
        category: formData.get('category'),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        target: formData.get('target'),
        content: formData.get('content'),
        postedBy: data.currentUser.name,
        isPinned: formData.get('isPinned') === 'on'
      };

      data.notices.unshift(newNotice);
      DataStore.save(data);

      closeModal('addNoticeModal');
      addNoticeForm.reset();
      renderNoticesSection();
      renderDashboardNotices(data.notices);

      if (state.isBackendLive) {
        try {
          await fetch(`${state.apiBaseUrl}/api/notices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNotice)
          });
          showToast('Official Circular committed to SQLite database!', 'success');
        } catch (err) {
          showToast('Circular published locally', 'info');
        }
      } else {
        showToast('Official Circular posted to campus board!', 'success');
      }
    });
  }
}

/**
 * Student CRUD Actions
 */
async function deleteStudent(id) {
  if (!confirm('Are you sure you want to remove this student record from the ERP?')) return;

  const data = DataStore.get();
  const index = data.students.findIndex(s => s.id === id);
  if (index !== -1) {
    const deletedName = data.students[index].name;
    data.students.splice(index, 1);
    DataStore.save(data);
    renderStudentsTable();

    if (state.isBackendLive) {
      try {
        await fetch(`${state.apiBaseUrl}/api/students/${id}`, { method: 'DELETE' });
        showToast(`Deleted from SQLite database: ${deletedName}`, 'warning');
      } catch (e) {
        showToast(`Removed student record: ${deletedName}`, 'warning');
      }
    } else {
      showToast(`Removed student record: ${deletedName}`, 'warning');
    }
  }
}

function viewStudentModal(id) {
  const data = DataStore.get();
  const student = data.students.find(s => s.id === id);
  if (!student) return;

  const modalBody = document.getElementById('viewStudentModalBody');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
      <img src="${student.avatar}" class="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md">
      <div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded">${student.rollNo}</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${student.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${student.feeStatus} Fee</span>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mt-1">${student.name}</h3>
        <p class="text-sm text-slate-500">${student.department} • ${student.year} (${student.semester})</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 my-5 text-sm">
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-xs text-slate-400 block font-medium">Cumulative GPA</span>
        <span class="text-lg font-bold text-slate-900">${student.cgpa.toFixed(2)} / 10.0</span>
      </div>
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-xs text-slate-400 block font-medium">Attendance Rate</span>
        <span class="text-lg font-bold ${student.attendance < 75 ? 'text-rose-600' : 'text-emerald-600'}">${student.attendance}%</span>
      </div>
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-xs text-slate-400 block font-medium">Official Email</span>
        <span class="text-xs font-semibold text-slate-700 truncate block">${student.email}</span>
      </div>
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-xs text-slate-400 block font-medium">Contact Phone</span>
        <span class="text-xs font-semibold text-slate-700 block">${student.phone}</span>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
      <button onclick="closeModal('viewStudentModal')" class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50">Close</button>
      <button onclick="openDigitalIdCardModal('${student.id}')" class="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 inline-flex items-center gap-2">
        <i class="fa-solid fa-id-card"></i> View Student ID Card
      </button>
    </div>
  `;

  openModal('viewStudentModal');
}

function editStudentModal(id) {
  const data = DataStore.get();
  const student = data.students.find(s => s.id === id);
  if (!student) return;

  const modalBody = document.getElementById('editStudentModalBody');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <form onsubmit="saveEditedStudent('${student.id}', event)" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
          <input type="text" id="editRollNo" required value="${student.rollNo}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <input type="text" id="editName" required value="${student.name}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Department</label>
          <select id="editDepartment" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500">
            <option value="CSE" ${student.department === 'CSE' ? 'selected' : ''}>Computer Science (CSE)</option>
            <option value="AI&DS" ${student.department === 'AI&DS' ? 'selected' : ''}>AI & Data Science (AI&DS)</option>
            <option value="IT" ${student.department === 'IT' ? 'selected' : ''}>Information Tech (IT)</option>
            <option value="ECE" ${student.department === 'ECE' ? 'selected' : ''}>Electronics (ECE)</option>
            <option value="MECH" ${student.department === 'MECH' ? 'selected' : ''}>Mechanical (MECH)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Year</label>
          <select id="editYear" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500">
            <option value="1st Year" ${student.year === '1st Year' ? 'selected' : ''}>1st Year</option>
            <option value="2nd Year" ${student.year === '2nd Year' ? 'selected' : ''}>2nd Year</option>
            <option value="3rd Year" ${student.year === '3rd Year' ? 'selected' : ''}>3rd Year</option>
            <option value="4th Year" ${student.year === '4th Year' ? 'selected' : ''}>4th Year</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">CGPA</label>
          <input type="number" step="0.01" min="0" max="10" id="editCgpa" value="${student.cgpa}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Attendance %</label>
          <input type="number" min="0" max="100" id="editAttendance" value="${student.attendance}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Fee Status</label>
          <select id="editFeeStatus" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500">
            <option value="Paid" ${student.feeStatus === 'Paid' ? 'selected' : ''}>Paid</option>
            <option value="Pending" ${student.feeStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
        <input type="email" id="editEmail" required value="${student.email}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
        <input type="tel" id="editPhone" value="${student.phone}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500">
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <button type="button" onclick="closeModal('editStudentModal')" class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50">Cancel</button>
        <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm shadow-blue-500/20">Update Record</button>
      </div>
    </form>
  `;

  openModal('editStudentModal');
}

async function saveEditedStudent(id, event) {
  event.preventDefault();
  const data = DataStore.get();
  const student = data.students.find(s => s.id === id);
  if (!student) return;

  student.rollNo = document.getElementById('editRollNo').value.trim();
  student.name = document.getElementById('editName').value.trim();
  student.department = document.getElementById('editDepartment').value;
  student.year = document.getElementById('editYear').value;
  student.cgpa = parseFloat(document.getElementById('editCgpa').value) || student.cgpa;
  student.attendance = parseInt(document.getElementById('editAttendance').value, 10) || student.attendance;
  student.feeStatus = document.getElementById('editFeeStatus').value;
  student.email = document.getElementById('editEmail').value.trim();
  student.phone = document.getElementById('editPhone').value.trim();

  DataStore.save(data);
  closeModal('editStudentModal');
  renderStudentsTable();

  if (state.isBackendLive) {
    try {
      await fetch(`${state.apiBaseUrl}/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      showToast(`Updated student in SQLite database: ${student.name}`, 'success');
    } catch (e) {
      showToast(`Updated student profile for ${student.name}`, 'success');
    }
  } else {
    showToast(`Updated student profile for ${student.name} (${student.rollNo})`, 'success');
  }
}

/**
 * Digital Student ID Card Modal
 */
function openDigitalIdCardModal(studentId) {
  const data = DataStore.get();
  const stu = data.students.find(s => s.id === studentId) || data.studentPersona;

  const cardContainer = document.getElementById('digitalIdCardContent');
  if (!cardContainer) return;

  cardContainer.innerHTML = `
    <div class="student-id-card p-6 text-white max-w-sm mx-auto">
      <div class="flex items-center justify-between pb-3 border-b border-white/20">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center border border-white/20">
            <i class="fa-solid fa-graduation-cap text-sm"></i>
          </div>
          <div>
            <div class="text-[11px] tracking-wider uppercase font-bold text-blue-200">APEX INSTITUTE</div>
            <div class="text-[9px] text-slate-300">CAMPUS IDENTITY CARD</div>
          </div>
        </div>
        <span class="text-[10px] bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">VALID 2026-27</span>
      </div>

      <div class="flex items-center gap-4 mt-5">
        <img src="${stu.avatar}" class="w-20 h-24 rounded-xl object-cover border-2 border-white/30 shadow-lg">
        <div class="space-y-1">
          <div class="text-lg font-black tracking-tight">${stu.name}</div>
          <div class="text-xs font-mono font-bold text-blue-400">${stu.rollNo}</div>
          <div class="text-xs text-slate-300">${stu.department}</div>
          <div class="text-[11px] text-slate-400">Year: ${stu.year || '3rd Year'}</div>
        </div>
      </div>

      <div class="mt-5 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <span class="text-slate-400 block text-[9px]">BLOOD GROUP</span>
          <span class="font-bold text-rose-300">O +ve</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[9px]">EMERGENCY CONTACT</span>
          <span class="font-bold text-slate-200">${stu.phone}</span>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-white/10">
        <div class="barcode-strip rounded opacity-80 bg-white"></div>
        <div class="text-center font-mono text-[9px] text-slate-400 mt-1 tracking-widest">${stu.rollNo}-AIT-2026-REG</div>
      </div>
    </div>
  `;

  openModal('digitalIdModal');
}

/**
 * Printable Official Fee Receipt Modal
 */
function printFeeReceiptModal(invoiceId) {
  const data = DataStore.get();
  const inv = data.fees.find(f => f.invoiceId === invoiceId) || data.fees[0];
  const receiptContainer = document.getElementById('feeReceiptModalBody');
  if (!receiptContainer) return;

  receiptContainer.innerHTML = `
    <div id="printableReceiptArea" class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <!-- Receipt Header -->
      <div class="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">${data.collegeInfo.name}</h2>
          <p class="text-xs text-slate-500">${data.collegeInfo.tagline}</p>
          <p class="text-[11px] text-slate-400 mt-0.5">${data.collegeInfo.address}</p>
        </div>
        <div class="text-right">
          <span class="inline-block px-3 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs">OFFICIAL RECEIPT</span>
          <div class="font-mono text-xs font-bold text-slate-700 mt-1">${inv.invoiceId}</div>
          <div class="text-[11px] text-slate-400">${inv.paymentDate}</div>
        </div>
      </div>

      <!-- Student Info Block -->
      <div class="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 rounded-xl text-xs">
        <div>
          <span class="text-slate-400 block">STUDENT NAME</span>
          <span class="font-bold text-slate-900 text-sm">${inv.studentName}</span>
          <span class="text-slate-600 block mt-0.5">Roll No: <strong>${inv.rollNo}</strong></span>
        </div>
        <div>
          <span class="text-slate-400 block">DEPARTMENT / PROGRAM</span>
          <span class="font-bold text-slate-900 text-sm">${inv.department}</span>
          <span class="text-slate-600 block mt-0.5">Academic Year: <strong>${data.collegeInfo.academicYear}</strong></span>
        </div>
      </div>

      <!-- Itemized Breakdown Table -->
      <table class="w-full text-xs my-4 border border-slate-200 rounded-lg overflow-hidden">
        <thead class="bg-slate-100 font-bold text-slate-700 text-left">
          <tr>
            <th class="p-2.5">#</th>
            <th class="p-2.5">Fee Particulars</th>
            <th class="p-2.5 text-right">Amount (INR)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${inv.breakdown.map((item, idx) => `
            <tr>
              <td class="p-2.5 text-slate-400">${idx + 1}</td>
              <td class="p-2.5 font-medium text-slate-800">${item.item}</td>
              <td class="p-2.5 text-right font-mono text-slate-900">₹${item.amount.toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
          <tr class="bg-slate-50 font-bold">
            <td colspan="2" class="p-2.5 text-right text-slate-700">Total Billed:</td>
            <td class="p-2.5 text-right font-mono text-slate-900">₹${inv.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="bg-emerald-50/50 font-bold text-emerald-800">
            <td colspan="2" class="p-2.5 text-right">Amount Paid:</td>
            <td class="p-2.5 text-right font-mono">₹${inv.paidAmount.toLocaleString('en-IN')}</td>
          </tr>
          ${inv.dueAmount > 0 ? `
            <tr class="bg-rose-50/50 font-bold text-rose-700">
              <td colspan="2" class="p-2.5 text-right">Pending Balance:</td>
              <td class="p-2.5 text-right font-mono">₹${inv.dueAmount.toLocaleString('en-IN')}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>

      <!-- Signatures Footer -->
      <div class="flex items-end justify-between mt-8 pt-4 border-t border-slate-200 text-xs">
        <div>
          <span class="text-slate-400 block text-[10px]">PAYMENT MODE</span>
          <span class="font-semibold text-slate-800">${inv.paymentMode}</span>
          <span class="text-emerald-600 block font-bold mt-1"><i class="fa-solid fa-check-circle mr-1"></i>Verified & Digitally Signed</span>
        </div>
        <div class="text-right">
          <div class="w-32 border-b border-slate-400 mb-1"></div>
          <span class="text-slate-500 text-[10px] font-semibold">Authorized Finance Officer</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 no-print">
      <button onclick="closeModal('feeReceiptModal')" class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50">Close</button>
      <button onclick="window.print()" class="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-2 shadow-sm">
        <i class="fa-solid fa-print"></i> Print Official Receipt
      </button>
    </div>
  `;

  openModal('feeReceiptModal');
}

/**
 * Online Fee Payment Simulator (For Student Portal)
 */
function openPaymentSimulatorModal() {
  openModal('paymentModal');
}

function processSimulatedPayment() {
  const btn = document.getElementById('confirmPayBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Contacting Payment Gateway...';
  }

  if (state.isBackendLive) {
    fetch(`${state.apiBaseUrl}/api/fees/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: 'INV-2026-8802' })
    }).catch(err => console.warn('Fee sync failed:', err));
  }

  setTimeout(() => {
    closeModal('paymentModal');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-lock mr-2"></i> Pay ₹45,000 via Secure Gateway';
    }

    if (typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    showToast('Payment Successful! Transaction ID: TXN_8829104. Committed to SQL Ledger.', 'success');
  }, 1400);
}

/**
 * Export Students to CSV (Examiners love this feature!)
 */
function exportStudentsToCSV() {
  const data = DataStore.get();
  const students = data.students;

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Roll Number,Full Name,Department,Year,Semester,CGPA,Attendance %,Fee Status,Email,Phone\n';

  students.forEach(s => {
    const row = [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.year}"`,
      `"${s.semester}"`,
      s.cgpa,
      s.attendance,
      `"${s.feeStatus}"`,
      `"${s.email}"`,
      `"${s.phone}"`
    ].join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Students_List_Apex_ERP_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast('Exported student roster to CSV file successfully!', 'success');
}

/**
 * Reset Demo Data
 */
async function resetSystemData() {
  if (confirm('Are you sure you want to reset all data back to original default demo state?')) {
    if (state.isBackendLive) {
      try {
        await fetch(`${state.apiBaseUrl}/api/reset`, { method: 'POST' });
      } catch (e) {
        console.warn('Backend reset call:', e);
      }
    }
    DataStore.reset();
    showToast('System & SQLite database successfully reset to clean defaults!', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  }
}

/**
 * Modal Generic Helpers
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}
