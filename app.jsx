const { useState, useEffect } = React;

// --- Firebase Configuration Placeholder ---
// Replace these with your actual Firebase Project settings.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- Mock Data for UI Demonstration ---
const MOCK_STUDENTS = [
    { id: 1, name: "Alice Johnson", marks: 85, attendance: 90, risk: "Good" },
    { id: 2, name: "Bob Smith", marks: 35, attendance: 65, risk: "At Risk" },
    { id: 3, name: "Charlie Davis", marks: 60, attendance: 80, risk: "Average" },
];

// --- Icons (SVG inline for React) ---
const Icons = {
    Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
    Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
    AlertTriangle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>,
    Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>,
    Bell: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>,
    UserCircle: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
    TrendingUp: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>,
    BookOpen: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
    BarChart2: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 20V10m-6 10V4m-6 16v-8"></path></svg>,
    SettingsIcon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
};

// --- Login Component ---
const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // In a real app, call Firebase auth here
        // For demonstration, we just log in with mock data
        onLogin({ email: email || 'teacher@school.edu', displayName: 'Teacher' });
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="glass p-8 max-w-md w-full floating">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                    <p className="text-gray-600">Enter your credentials to access the dashboard</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-3 glass-input text-gray-800" 
                            placeholder="teacher@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 glass-input text-gray-800" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transform transition hover:-translate-y-1">
                        Sign In
                    </button>
                    
                    {firebaseConfig.apiKey === "YOUR_API_KEY" && (
                        <div className="mt-4 p-3 bg-yellow-100/50 rounded-lg text-xs text-yellow-800 border border-yellow-200">
                            <strong>Note:</strong> Firebase is not configured. Logging in will use mock data for demonstration.
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

// --- Performance Chart Component ---
const PerformanceChart = ({ students }) => {
    useEffect(() => {
        if (students.length === 0 || typeof Chart === 'undefined') return;
        
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        // Destroy previous chart instance if it exists
        let chartStatus = Chart.getChart("performanceChart"); 
        if (chartStatus != undefined) {
          chartStatus.destroy();
        }

        const labels = students.map(s => s.name.split(' ')[0]);
        const marksData = students.map(s => s.marks);
        const attendanceData = students.map(s => s.attendance);

        new Chart(ctx, {
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
    }, [students]);

    return (
        <div className="glass p-6 mb-8 relative h-80 floating">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Overview</h3>
            <div className="absolute inset-0 pt-16 pb-4 px-6">
                {students.length > 0 ? (
                    <canvas id="performanceChart"></canvas>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">No data available for chart</div>
                )}
            </div>
        </div>
    );
};

// --- Dashboard Component ---
const Dashboard = ({ user, onLogout }) => {
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [marks, setMarks] = useState('');
    const [attendance, setAttendance] = useState('');

    const calculateRisk = (m, a) => {
        if (m < 40 || a < 75) return 'At Risk';
        if (m >= 75 && a >= 85) return 'Good';
        return 'Average';
    };

    const handleAddStudent = (e) => {
        e.preventDefault();
        const m = parseFloat(marks);
        const a = parseFloat(attendance);
        const risk = calculateRisk(m, a);
        
        const newStudent = {
            id: Date.now(),
            name,
            marks: m,
            attendance: a,
            risk
        };
        
        setStudents([...students, newStudent]);
        setName(''); setMarks(''); setAttendance('');
        setShowForm(false);
    };

    const atRiskCount = students.filter(s => s.risk === 'At Risk').length;
    const avgMarks = Math.round(students.reduce((acc, curr) => acc + curr.marks, 0) / (students.length || 1));

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 glass-deep m-4 flex flex-col rounded-3xl overflow-hidden shadow-2xl hidden md:flex">
                <div className="p-6">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">EduVision</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/40 rounded-xl text-purple-700 font-medium transition">
                        <Icons.Dashboard /> Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white/20 rounded-xl transition">
                        <Icons.BookOpen /> Courses
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white/20 rounded-xl transition">
                        <Icons.Users /> Students
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white/20 rounded-xl transition">
                        <Icons.BarChart2 /> Grades
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white/20 rounded-xl transition">
                        <Icons.AlertTriangle /> At Risk
                    </a>
                    <div className="pt-4 mt-4 border-t border-white/30">
                        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white/20 rounded-xl transition">
                            <Icons.SettingsIcon /> Settings
                        </a>
                    </div>
                </nav>
                <div className="p-4 border-t border-white/30">
                    <button onClick={onLogout} className="w-full py-2 text-sm text-gray-600 hover:text-red-500 transition font-medium">
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-8">
                {/* Navbar */}
                <header className="flex justify-between items-center mb-8 glass px-6 py-4">
                    <div className="relative w-64">
                        <span className="absolute left-3 top-2.5 text-gray-400"><Icons.Search /></span>
                        <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 glass-input text-sm" />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-500 hover:text-purple-600 transition relative">
                            <Icons.Bell />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-2">
                            <Icons.UserCircle />
                            <span className="font-medium text-gray-700 hidden sm:block">{user.displayName}</span>
                        </div>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass p-6 floating relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 group-hover:opacity-70 transition"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Students</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">{students.length}</h3>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Icons.Users /></div>
                        </div>
                    </div>
                    
                    <div className="glass p-6 floating relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 group-hover:opacity-70 transition"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">At Risk Students</p>
                                <h3 className="text-3xl font-bold text-red-600 mt-1">{atRiskCount}</h3>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg text-red-600"><Icons.AlertTriangle /></div>
                        </div>
                    </div>

                    <div className="glass p-6 floating relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 group-hover:opacity-70 transition"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Average Performance</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">{avgMarks}%</h3>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg text-green-600"><Icons.TrendingUp /></div>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <PerformanceChart students={students} />

                {/* Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Student List */}
                    <div className="lg:col-span-2 glass p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Student Overview</h3>
                            <button 
                                onClick={() => setShowForm(!showForm)}
                                className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium transition text-sm">
                                {showForm ? 'Cancel' : '+ Add Student'}
                            </button>
                        </div>
                        
                        {showForm && (
                            <form onSubmit={handleAddStudent} className="mb-6 p-4 bg-white/30 rounded-xl border border-white/50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Student Name</label>
                                        <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 glass-input text-sm" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Marks (%)</label>
                                        <input required type="number" min="0" max="100" value={marks} onChange={e=>setMarks(e.target.value)} className="w-full px-3 py-2 glass-input text-sm" placeholder="85" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Attendance (%)</label>
                                        <input required type="number" min="0" max="100" value={attendance} onChange={e=>setAttendance(e.target.value)} className="w-full px-3 py-2 glass-input text-sm" placeholder="90" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition text-sm">
                                    Save Student Data
                                </button>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200/50 text-sm text-gray-500">
                                        <th className="pb-3 font-medium">Name</th>
                                        <th className="pb-3 font-medium">Marks</th>
                                        <th className="pb-3 font-medium">Attendance</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student.id} className="border-b border-gray-200/30 hover:bg-white/20 transition group">
                                            <td className="py-3 font-medium text-gray-800">{student.name}</td>
                                            <td className="py-3 text-gray-600">{student.marks}%</td>
                                            <td className="py-3 text-gray-600">{student.attendance}%</td>
                                            <td className="py-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                                    ${student.risk === 'At Risk' ? 'bg-red-100 text-red-700' : 
                                                      student.risk === 'Good' ? 'bg-green-100 text-green-700' : 
                                                      'bg-yellow-100 text-yellow-700'}`}>
                                                    {student.risk}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {students.length === 0 && <p className="text-center text-gray-500 py-6">No student data available.</p>}
                        </div>
                    </div>

                    {/* Insights Side Panel */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Actionable Insights</h3>
                        <div className="space-y-4">
                            {atRiskCount > 0 ? (
                                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="text-red-500 mt-0.5"><Icons.AlertTriangle /></div>
                                        <div>
                                            <h4 className="text-sm font-bold text-red-800">Intervention Needed</h4>
                                            <p className="text-xs text-red-600 mt-1">You have {atRiskCount} student(s) at risk due to low marks or attendance.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="text-green-500 mt-0.5"><Icons.TrendingUp /></div>
                                        <div>
                                            <h4 className="text-sm font-bold text-green-800">Looking Good</h4>
                                            <p className="text-xs text-green-600 mt-1">No students are currently marked as At Risk.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-white/40 rounded-xl">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Prediction Model</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    The system flags students as <strong>"At Risk"</strong> if their academic marks fall below 40% or their attendance drops below 75%. Early intervention is recommended for these cases.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- Main App Component ---
const App = () => {
    const [user, setUser] = useState(null);

    // Initial check for Firebase Auth state (if configured)
    useEffect(() => {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            const unsubscribe = firebase.auth().onAuthStateChanged((currentUser) => {
                if (currentUser) setUser(currentUser);
            });
            return () => unsubscribe();
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            firebase.auth().signOut().then(() => setUser(null));
        } else {
            setUser(null);
        }
    };

    return user ? <Dashboard user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
