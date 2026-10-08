const { useState, useEffect } = React;

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null); // 'admin' or 'parent'
    const [userName, setUserName] = useState(null);
    const [instructorId, setInstructorId] = useState(null);
    const [parentAthletes, setParentAthletes] = useState([]);
    const [athletes, setAthletes] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = '/api';

    const fetchData = async () => {
        try {
            const [athletesRes, instructorsRes] = await Promise.all([
                fetch(`${API_BASE}/athletes`),
                fetch(`${API_BASE}/instructors`)
            ]);
            
            if (athletesRes.ok) {
                const data = await athletesRes.json();
                // Add default present=false state for UI, but preserve existing state if any
                setAthletes(prev => data.map(newA => {
                    const existing = prev.find(a => a.id === newA.id);
                    return { ...newA, present: existing ? existing.present : false };
                }));
            }
            if (instructorsRes.ok) {
                const data = await instructorsRes.json();
                setInstructors(prev => data.map(newI => {
                    const existing = prev.find(i => i.id === newI.id);
                    return { ...newI, present: existing ? existing.present : false };
                }));
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Check localStorage on mount for "Remember me" functionality
    useEffect(() => {
        const savedAuth = localStorage.getItem('tkd_auth');
        if (savedAuth) {
            const parsed = JSON.parse(savedAuth);
            setIsLoggedIn(true);
            setRole(parsed.role);
            setParentAthletes(parsed.parentAthletes || []);
            setUserName(parsed.userName || (parsed.role === 'admin' ? 'Admin' : 'Parent'));
            setInstructorId(parsed.instructorId || null);
        }
    }, []);

    const handleLogin = (selectedRole, selectedAthletes, rememberMe, nickname, instructor_id) => {
        setIsLoggedIn(true);
        setRole(selectedRole);
        setParentAthletes(selectedAthletes);
        setUserName(nickname || (selectedRole === 'admin' ? 'Admin' : 'Parent'));
        setInstructorId(instructor_id || null);

        if (rememberMe) {
            localStorage.setItem('tkd_auth', JSON.stringify({
                role: selectedRole,
                parentAthletes: selectedAthletes,
                userName: nickname || (selectedRole === 'admin' ? 'Admin' : 'Parent'),
                instructorId: instructor_id || null
            }));
        } else {
            localStorage.removeItem('tkd_auth');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setRole(null);
        setParentAthletes([]);
        setUserName(null);
        setInstructorId(null);
        localStorage.removeItem('tkd_auth');
    };

    const handleSave = () => {
        // Will be handled by individual tabs via API, this function is mostly a placeholder now
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-tkd-600">กำลังโหลดข้อมูล...</div>;
    }

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} athletes={athletes} />;
    }

    return (
        <MainApp 
            role={role} 
            userName={userName}
            instructorId={instructorId}
            parentAthletes={parentAthletes} 
            athletes={athletes} 
            setAthletes={setAthletes} 
            instructors={instructors}
            setInstructors={setInstructors}
            onLogout={handleLogout} 
            onSave={handleSave}
            fetchData={fetchData} // Pass down to allow refresh
        />
    );
}
const beltColors = ['White', 'Yellow', 'Green', 'Blue', 'Brown', 'Red', 'Black'];
const getBeltScore = (beltStr) => {
    if (!beltStr) return 0;
    const parts = beltStr.split(' ');
    const color = parts[0];
    const level = parseInt(parts[1]) || 1;
    const colorScores = { 'White': 100, 'Yellow': 200, 'Green': 300, 'Blue': 400, 'Brown': 500, 'Red': 600, 'Black': 700 };
    return (colorScores[color] || 0) + level;
};
const getLocalDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return (new Date(today - offset)).toISOString().split('T')[0];
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
