const { useState, useEffect } = React;

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null); // 'admin' or 'parent'
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
                // Add default present=false state for UI
                setAthletes(data.map(a => ({...a, present: false})));
            }
            if (instructorsRes.ok) {
                const data = await instructorsRes.json();
                setInstructors(data.map(i => ({...i, present: false})));
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
        }
    }, []);

    const handleLogin = (selectedRole, selectedAthletes, rememberMe) => {
        setIsLoggedIn(true);
        setRole(selectedRole);
        setParentAthletes(selectedAthletes);

        if (rememberMe) {
            localStorage.setItem('tkd_auth', JSON.stringify({
                role: selectedRole,
                parentAthletes: selectedAthletes
            }));
        } else {
            localStorage.removeItem('tkd_auth');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setRole(null);
        setParentAthletes([]);
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
