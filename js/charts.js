/**
 * charts.js - AcademiaPro Analytics & Visualizations
 * Dynamic Chart.js wrappers with canvas memory management
 */

let attendanceChartInstance = null;
let feeDistributionChartInstance = null;
let performanceChartInstance = null;

const AppCharts = {
  // Initialize all dashboard charts
  initDashboardCharts() {
    this.renderAttendanceByDept();
    this.renderFeeDoughnut();
    this.renderPerformanceDistribution();
  },

  // 1. Attendance % across Departments
  renderAttendanceByDept() {
    const canvas = document.getElementById('attendanceDeptChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (attendanceChartInstance) {
      attendanceChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    attendanceChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['CSE', 'AI & DS', 'IT', 'ECE', 'MECH'],
        datasets: [{
          label: 'Avg Attendance %',
          data: [88.5, 85.2, 91.0, 83.8, 77.4],
          backgroundColor: [
            'rgba(59, 130, 246, 0.85)',
            'rgba(99, 102, 241, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(100, 116, 139, 0.85)'
          ],
          borderColor: [
            '#2563eb',
            '#4f46e5',
            '#059669',
            '#d97706',
            '#475569'
          ],
          borderWidth: 1.5,
          borderRadius: 8,
          barPercentage: 0.6
        }]
      },
      options: {
        animation: { duration: 300 },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Attendance: ${context.raw}%`
            }
          }
        },
        scales: {
          y: {
            min: 50,
            max: 100,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              callback: (value) => `${value}%`,
              font: { family: "'Plus Jakarta Sans', sans-serif" }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' }
            }
          }
        }
      }
    });
  },

  // 2. Fee Collection Status (Doughnut)
  renderFeeDoughnut() {
    const canvas = document.getElementById('feeCollectionChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (feeDistributionChartInstance) {
      feeDistributionChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    feeDistributionChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Fees Collected (85%)', 'Pending Dues (15%)'],
        datasets: [{
          data: [14250000, 2480000],
          backgroundColor: [
            '#10b981',
            '#f59e0b'
          ],
          hoverBackgroundColor: [
            '#059669',
            '#d97706'
          ],
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: {
        animation: { duration: 300 },
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.raw;
                const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
                return ` ${context.label.split(' ')[0]}: ${formatted}`;
              }
            }
          }
        }
      }
    });
  },

  // 3. Academic Grade Bell Curve / Performance
  renderPerformanceDistribution() {
    const canvas = document.getElementById('gradeDistributionChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (performanceChartInstance) {
      performanceChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    performanceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['O Grade (90-100)', 'A+ (80-89)', 'A (70-79)', 'B+ (60-69)', 'B (50-59)', 'RA (<50)'],
        datasets: [{
          label: 'Number of Students',
          data: [145, 320, 280, 110, 42, 18],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        animation: { duration: 300 },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.raw} Students`
            }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
          }
        }
      }
    });
  }
};
