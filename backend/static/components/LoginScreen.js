// ----------------------------------------------------
// LOGIN SCREEN
// ----------------------------------------------------
function LoginScreen({ onLogin, athletes }) {
    const [loginRole, setLoginRole] = useState('admin');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedAthleteIds, setSelectedAthleteIds] = useState([]);
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (loginRole === 'admin') {
            if (!username || !password) {
                setErrorMsg('กรุณากรอก Username และ Password');
            } else {
                try {
                    const res = await fetch('/api/login/admin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        onLogin('admin', [], rememberMe, data.nickname);
                    } else {
                        setErrorMsg('Username หรือ Password ไม่ถูกต้อง');
                    }
                } catch (err) {
                    setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
                }
            }
        } else {
            if (selectedAthleteIds.length > 0) {
                onLogin('parent', selectedAthleteIds, rememberMe);
            } else {
                setErrorMsg('กรุณาเลือกนักกีฬาอย่างน้อย 1 คน');
            }
        }
    };

    const toggleAthlete = (id) => {
        if (selectedAthleteIds.includes(id)) {
            setSelectedAthleteIds(selectedAthleteIds.filter(aid => aid !== id));
        } else {
            setSelectedAthleteIds([...selectedAthleteIds, id]);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-tkd-50 fade-in relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-tkd-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-tkd-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl relative z-10 slide-up border border-white/50">
                <div className="text-center mb-8">
                    <div className="inline-flex bg-gradient-to-tr from-tkd-600 to-tkd-400 p-4 rounded-2xl text-white shadow-xl shadow-tkd-500/30 mb-4 transform hover:rotate-12 transition-transform">
                        <i className="fa-solid fa-khanda text-4xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tkd-900 to-tkd-600">
                        BangmodTKD
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">ระบบจัดการนักกีฬาเทควันโด</p>
                </div>

                {/* Role Tabs */}
                <div className="flex p-1 mb-6 bg-gray-100 rounded-xl">
                    <button
                        type="button"
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginRole === 'admin' ? 'bg-white text-tkd-700 shadow-md' : 'text-gray-500 hover:text-tkd-600'}`}
                        onClick={() => { setLoginRole('admin'); setErrorMsg(''); }}
                    >
                        <i className="fa-solid fa-user-shield mr-2"></i> ผู้สอน
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginRole === 'parent' ? 'bg-white text-tkd-700 shadow-md' : 'text-gray-500 hover:text-tkd-600'}`}
                        onClick={() => { setLoginRole('parent'); setErrorMsg(''); }}
                    >
                        <i className="fa-solid fa-users mr-2"></i> ผู้ปกครอง
                    </button>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 slide-up">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {loginRole === 'admin' ? (
                        <div className="space-y-4 fade-in">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <i className="fa-regular fa-user"></i>
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full border-2 border-gray-100 rounded-xl pl-11 pr-4 py-3 focus:border-tkd-500 focus:ring-0 transition-colors bg-white/80"
                                        placeholder="กรอกชื่อผู้ใช้"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <i className="fa-solid fa-lock"></i>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border-2 border-gray-100 rounded-xl pl-11 pr-4 py-3 focus:border-tkd-500 focus:ring-0 transition-colors bg-white/80"
                                        placeholder="รหัสผ่าน"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 fade-in">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                เลือกบุตรหลานของท่าน (เลือกได้มากกว่า 1 คน)
                            </label>
                            <div className="max-h-52 overflow-y-auto space-y-2 pr-2" style={{ scrollbarWidth: 'thin' }}>
                                {athletes.slice().sort((a, b) => getBeltScore(b.beltColor) - getBeltScore(a.beltColor)).map(athlete => (
                                    <label key={athlete.id} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedAthleteIds.includes(athlete.id) ? 'bg-tkd-50 border-tkd-400 shadow-sm' : 'bg-white border-gray-100 hover:border-tkd-200'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedAthleteIds.includes(athlete.id)}
                                            onChange={() => toggleAthlete(athlete.id)}
                                        />
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tkd-100 text-tkd-600 flex items-center justify-center font-bold mr-3">
                                            {athlete.nickname.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-800">{athlete.nickname}</div>
                                            <div className="text-xs text-gray-500">{athlete.beltColor} Belt</div>
                                        </div>
                                        <div className="ml-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedAthleteIds.includes(athlete.id) ? 'bg-tkd-600 border-tkd-600' : 'bg-white border-gray-300'}`}>
                                                {selectedAthleteIds.includes(athlete.id) && (
                                                    <i className="fa-solid fa-check text-white text-xs"></i>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center mt-2">
                        <input
                            id="remember"
                            type="checkbox"
                            className="w-4 h-4 rounded text-tkd-600 focus:ring-tkd-500 border-gray-300 cursor-pointer"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                            จดจำการเข้าสู่ระบบ (Remember me)
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 bg-gradient-to-r from-tkd-600 to-tkd-500 hover:from-tkd-700 hover:to-tkd-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-tkd-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>
            </div>
        </div>
    );
}
