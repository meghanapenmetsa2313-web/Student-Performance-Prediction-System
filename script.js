// script.js

// Mock Data
let students = [
    { id: 1, name: "Alice Johnson", marks: 85, attendance: 90, risk: "Good" },
    { id: 2, name: "Bob Smith", marks: 35, attendance: 65, risk: "At Risk" },
    { id: 3, name: "Charlie Davis", marks: 60, attendance: 80, risk: "Average" },
];

let detailedStudents = [
    { id: 1, name: "Alice Johnson", studentId: "CS21045", department: "Computer Science", semester: 5, internalMarks: 45, externalMarks: 85, assignmentScore: 92, attendance: 90, prevGpa: 3.8, risk: "Good" },
    { id: 2, name: "Bob Smith", studentId: "IT21012", department: "Information Tech", semester: 5, internalMarks: 18, externalMarks: 35, assignmentScore: 40, attendance: 65, prevGpa: 2.1, risk: "At Risk" },
    { id: 3, name: "Charlie Davis", studentId: "EC21088", department: "Electronics", semester: 5, internalMarks: 30, externalMarks: 60, assignmentScore: 75, attendance: 80, prevGpa: 3.0, risk: "Average" },
    { id: 4, name: "David Kim", studentId: "CS21099", department: "Computer Science", semester: 5, internalMarks: 22, externalMarks: 45, assignmentScore: 55, attendance: 72, prevGpa: 2.5, risk: "At Risk" },
    { id: 5, name: "Eva Martinez", studentId: "EE21034", department: "Electrical Eng", semester: 5, internalMarks: 48, externalMarks: 92, assignmentScore: 98, attendance: 95, prevGpa: 3.9, risk: "Good" },
];

let performanceChartInstance = null;
let currentFilter = 'All';
let editingStudentId = null;

// Utility to calculate risk (Requirement 5)
function calculateRisk(m, a) {
    if (m < 40 || a < 75) return 'At Risk';
    if (m >= 75 && a >= 85) return 'Good';
    return 'Average'; // covers 40-74
}

// LocalStorage Helpers (Bonus Requirement 9)
function saveToLocal() {
    localStorage.setItem('eduvision_students', JSON.stringify(students));
    
    // Save Admin Overrides
    const adminData = {
        total: document.getElementById('adminTotal')?.value || '',
        risk: document.getElementById('adminRisk')?.value || '',
        avg: document.getElementById('adminAvg')?.value || ''
    };
    localStorage.setItem('eduvision_admin', JSON.stringify(adminData));
}

function loadFromLocal() {
    const savedStudents = localStorage.getItem('eduvision_students');
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    }
    
    const savedAdmin = localStorage.getItem('eduvision_admin');
    if (savedAdmin) {
        const adminData = JSON.parse(savedAdmin);
        const t = document.getElementById('adminTotal');
        const r = document.getElementById('adminRisk');
        const a = document.getElementById('adminAvg');
        if (t) t.value = adminData.total;
        if (r) r.value = adminData.risk;
        if (a) a.value = adminData.avg;
    }
}

// --- Login Page Logic ---
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // If firebase is not configured, show notice
        if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey === "YOUR_API_KEY") {
            const notice = document.getElementById('loginNotice');
            if (notice) notice.classList.remove('hidden');
        }

        let isLoginMode = true;
        const toggleBtn = document.getElementById('toggleAuthMode');
        const formTitle = document.getElementById('formTitle');
        const formSubtitle = document.getElementById('formSubtitle');
        const toggleText = document.getElementById('toggleText');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('loginError');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                isLoginMode = !isLoginMode;
                if (isLoginMode) {
                    formTitle.textContent = 'Welcome Back';
                    formSubtitle.textContent = 'Enter your credentials to access the dashboard';
                    submitBtn.textContent = 'Sign In';
                    toggleText.textContent = "Don't have an account?";
                    toggleBtn.textContent = 'Register here';
                } else {
                    formTitle.textContent = 'Create Account';
                    formSubtitle.textContent = 'Register a new account to access the dashboard';
                    submitBtn.textContent = 'Sign Up';
                    toggleText.textContent = "Already have an account?";
                    toggleBtn.textContent = 'Sign in here';
                }
                if (errorDiv) errorDiv.classList.add('hidden');
            });
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (errorDiv) {
                errorDiv.classList.add('hidden');
                errorDiv.textContent = '';
            }

            if (typeof auth !== 'undefined' && auth) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = isLoginMode ? 'Signing in...' : 'Creating account...';
                submitBtn.disabled = true;

                const authPromise = isLoginMode 
                    ? auth.signInWithEmailAndPassword(email, password)
                    : auth.createUserWithEmailAndPassword(email, password);

                authPromise
                    .then((userCredential) => {
                        // Go to the dashboard section on success
                        window.location.href = 'dashboard.html';
                    })
                    .catch((error) => {
                        if (errorDiv) {
                            // Simplify error message for UI
                            let msg = error.message;
                            if (error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
                            if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
                            if (error.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
                            errorDiv.textContent = `${isLoginMode ? 'Login' : 'Registration'} failed: ${msg}`;
                            errorDiv.classList.remove('hidden');
                        }
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    });
            } else {
                // Mock fallback
                window.location.href = 'dashboard.html';
            }
        });
    }
}

// --- Dashboard Page Logic ---
function initDashboard() {
    const logoutBtn = document.getElementById('logoutBtn');
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    const addStudentForm = document.getElementById('addStudentForm');

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof auth !== 'undefined' && auth) {
                auth.signOut().then(() => {
                    window.location.href = 'login.html';
                });
            } else {
                window.location.href = 'login.html'; // Mock logout
            }
        });
    }

    // Toggle Form logic removed - form is now always visible
    if (addStudentForm) {
        // Handle Add/Edit Student
        addStudentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('sName').value.trim();
            const marks = parseFloat(document.getElementById('sMarks').value);
            const attendance = parseFloat(document.getElementById('sAttendance').value);
            const errorDiv = document.getElementById('formError');

            // Validation
            if (!name || isNaN(marks) || isNaN(attendance)) {
                errorDiv.textContent = 'Please fill all fields correctly.';
                errorDiv.classList.remove('hidden');
                return;
            }

            if (marks < 0 || marks > 100 || attendance < 0 || attendance > 100) {
                errorDiv.textContent = 'Marks and Attendance must be between 0 and 100.';
                errorDiv.classList.remove('hidden');
                return;
            }

            errorDiv.classList.add('hidden');
            
            if (editingStudentId) {
                // Update Existing
                const index = students.findIndex(s => s.id === editingStudentId);
                if (index !== -1) {
                    students[index] = {
                        ...students[index],
                        name,
                        marks,
                        attendance,
                        risk: calculateRisk(marks, attendance)
                    };
                }
                editingStudentId = null;
            } else {
                // Add New
                const newStudent = {
                    id: Date.now(),
                    name: name,
                    marks: marks,
                    attendance: attendance,
                    risk: calculateRisk(marks, attendance)
                };
                students.push(newStudent);
            }
            
            // Reset form
            addStudentForm.reset();
            addStudentForm.querySelector('button[type="submit"]').textContent = 'Save Student Data';

            saveToLocal(); // Persistence
            updateDashboardUI();
        });
    }

    // Admin Panel Listeners (Requirement 1)
    const adminInputs = ['adminTotal', 'adminRisk', 'adminAvg'];
    adminInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                saveToLocal();
                updateDashboardUI();
            });
        }
    });

    // Clear All Functionality (Bonus Requirement 9)
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all student data?')) {
                students = [];
                const t = document.getElementById('adminTotal');
                const r = document.getElementById('adminRisk');
                const a = document.getElementById('adminAvg');
                if (t) t.value = '';
                if (r) r.value = '';
                if (a) a.value = '';
                saveToLocal();
                updateDashboardUI();
            }
        });
    }

    // Filter Change
    const studentFilter = document.getElementById('studentFilter');
    if (studentFilter) {
        studentFilter.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            updateDashboardUI();
        });
    }

    // Table Actions (Edit/Delete)
    const tableBody = document.getElementById('studentTableBody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            const editBtn = e.target.closest('.edit-btn');

            if (deleteBtn) {
                const id = parseInt(deleteBtn.dataset.id);
                students = students.filter(s => s.id !== id);
                saveToLocal(); // Persistence
                updateDashboardUI();
            }

            if (editBtn) {
                const id = parseInt(editBtn.dataset.id);
                const student = students.find(s => s.id === id);
                if (student) {
                    editingStudentId = id;
                    document.getElementById('sName').value = student.name;
                    document.getElementById('sMarks').value = student.marks;
                    document.getElementById('sAttendance').value = student.attendance;
                    
                    addStudentForm.querySelector('button[type="submit"]').textContent = 'Update Student Data';
                    document.getElementById('formError').classList.add('hidden');
                    addStudentForm.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Add manual override capability to KPI cards
    const kpiIds = ['kpiTotal', 'kpiRisk', 'kpiAvg'];
    kpiIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('contenteditable', 'true');
    });

    // Load saved data
    loadFromLocal();
    updateDashboardUI();
}

// --- UI Updates ---
function updateDashboardUI() {
    // 1. Update KPIs (Requirement 1, 3 & 4)
    const adminTotalVal = document.getElementById('adminTotal')?.value;
    const adminRiskVal = document.getElementById('adminRisk')?.value;
    const adminAvgVal = document.getElementById('adminAvg')?.value;

    const totalStudents = adminTotalVal ? parseInt(adminTotalVal) : students.length;
    const atRiskCount = students.filter(s => s.risk === 'At Risk').length;
    // Special logic for risk count: show admin value if set, otherwise auto count
    const displayRiskCount = adminRiskVal ? parseInt(adminRiskVal) : atRiskCount;
    
    const calculatedAvg = students.length > 0 ? Math.round(students.reduce((acc, curr) => acc + curr.marks, 0) / students.length) : 0;
    const displayAvg = adminAvgVal ? parseInt(adminAvgVal) : calculatedAvg;

    const kpiTotal = document.getElementById('kpiTotal');
    const kpiRisk = document.getElementById('kpiRisk');
    const kpiAvg = document.getElementById('kpiAvg');

    if (kpiTotal) kpiTotal.textContent = totalStudents;
    if (kpiRisk) kpiRisk.textContent = displayRiskCount;
    if (kpiAvg) kpiAvg.textContent = displayAvg + '%';

    // 2. Update Table
    const tableBody = document.getElementById('studentTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        
        const filteredStudents = students.filter(s => currentFilter === 'All' || s.risk === currentFilter);

        if (filteredStudents.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-6">No matching student data available.</td></tr>`;
        } else {
            filteredStudents.forEach(student => {
                const riskClass = student.risk === 'At Risk' ? 'bg-red-100 text-red-700' : 
                                  student.risk === 'Good' ? 'bg-green-100 text-green-700' : 
                                  'bg-yellow-100 text-yellow-700';

                const row = document.createElement('tr');
                row.className = 'border-b border-gray-200/30 hover:bg-white/20 transition group';
                row.innerHTML = `
                    <td class="py-3 font-medium text-gray-800">${student.name}</td>
                    <td class="py-3 text-gray-600">${student.marks}%</td>
                    <td class="py-3 text-gray-600">${student.attendance}%</td>
                    <td class="py-3">
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${riskClass}">
                            ${student.risk}
                        </span>
                    </td>
                    <td class="py-3 text-right">
                        <div class="flex justify-end gap-2 transition">
                            <button class="edit-btn p-1 text-blue-500 hover:bg-blue-50 rounded" data-id="${student.id}" title="Edit">
                                <i data-lucide="edit-2" class="w-4 h-4"></i>
                            </button>
                            <button class="delete-btn p-1 text-red-500 hover:bg-red-50 rounded" data-id="${student.id}" title="Delete">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    // 3. Update Chart
    renderChart();

    // 4. Update Insights
    renderInsights(displayRiskCount);
}

function renderChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    if (typeof Chart === 'undefined') return;

    if (performanceChartInstance) {
        performanceChartInstance.destroy();
    }

    const labels = students.map(s => s.name.split(' ')[0]);
    const marksData = students.map(s => s.marks);
    const attendanceData = students.map(s => s.attendance);

    performanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Marks (%)',
                    data: marksData,
                    backgroundColor: 'rgba(142, 197, 252, 0.7)',
                    borderColor: 'rgba(142, 197, 252, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                },
                {
                    label: 'Attendance (%)',
                    data: attendanceData,
                    backgroundColor: 'rgba(224, 195, 252, 0.7)',
                    borderColor: 'rgba(224, 195, 252, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                x: { grid: { display: false } }
            },
            animation: { duration: 1500, easing: 'easeOutQuart' }
        }
    });
}

function renderInsights(atRiskCount) {
    const container = document.getElementById('insightsContainer');
    if (!container) return;

    let html = '';
    if (atRiskCount > 0) {
        html = `
        <div class="p-4 bg-red-50/50 border border-red-100 rounded-xl">
            <div class="flex items-start gap-3">
                <div class="text-red-500 mt-0.5"><i data-lucide="alert-triangle" class="w-5 h-5"></i></div>
                <div>
                    <h4 class="text-sm font-bold text-red-800">Intervention Needed</h4>
                    <p class="text-xs text-red-600 mt-1">You have ${atRiskCount} student(s) at risk due to low marks or attendance.</p>
                </div>
            </div>
        </div>`;
    } else {
        html = `
        <div class="p-4 bg-green-50/50 border border-green-100 rounded-xl">
            <div class="flex items-start gap-3">
                <div class="text-green-500 mt-0.5"><i data-lucide="trending-up" class="w-5 h-5"></i></div>
                <div>
                    <h4 class="text-sm font-bold text-green-800">Looking Good</h4>
                    <p class="text-xs text-green-600 mt-1">All students performing well.</p>
                </div>
            </div>
        </div>`;
    }
    
    container.innerHTML = html;
    
    // Re-initialize lucide icons for newly added HTML
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// --- Students Page Logic ---
function initStudentsPage() {
    const tableBody = document.getElementById('detailedStudentTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    if (detailedStudents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-gray-500 py-8">No detailed student records found.</td></tr>`;
        return;
    }

    detailedStudents.forEach(student => {
        const riskClass = student.risk === 'At Risk' ? 'bg-red-100 text-red-700' : 
                          student.risk === 'Good' ? 'bg-green-100 text-green-700' : 
                          'bg-yellow-100 text-yellow-700';

        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200/30 hover:bg-white/40 transition group';
        row.innerHTML = `
            <td class="py-4 px-2 font-medium text-gray-800">${student.name}</td>
            <td class="py-4 px-2 text-gray-600 font-mono text-sm">${student.studentId}</td>
            <td class="py-4 px-2 text-gray-600">${student.department}</td>
            <td class="py-4 px-2 text-gray-600">Sem ${student.semester}</td>
            <td class="py-4 px-2 text-center text-gray-600 font-medium">${student.internalMarks} <span class="text-xs text-gray-400">/50</span></td>
            <td class="py-4 px-2 text-center text-gray-600 font-medium">${student.externalMarks} <span class="text-xs text-gray-400">/100</span></td>
            <td class="py-4 px-2 text-center text-gray-600">${student.assignmentScore}%</td>
            <td class="py-4 px-2 text-center text-gray-600">${student.attendance}%</td>
            <td class="py-4 px-2 text-center text-gray-800 font-bold">${student.prevGpa.toFixed(2)}</td>
            <td class="py-4 px-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${riskClass}">
                    ${student.risk}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Handle logout button on this page too
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on
    if (document.getElementById('loginForm')) {
        initLogin();
    } else if (document.getElementById('dashboardMain')) {
        initDashboard();
    } else if (document.getElementById('studentsMain')) {
        initStudentsPage();
    }
});
