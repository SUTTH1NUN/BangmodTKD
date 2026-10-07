// ----------------------------------------------------
// MAIN APP (DASHBOARD)
// ----------------------------------------------------
function MainApp({ role, userName, parentAthletes, athletes, setAthletes, instructors, setInstructors, onLogout, onSave, fetchData }) {
    const [activeTab, setActiveTab] = useState(role === 'parent' ? 'weight' : 'attendance');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [filterType, setFilterType] = useState('ทั้งหมด');

    const navItems = [
        { id: 'attendance', label: 'เช็คชื่อ', icon: 'fa-user-check', roles: ['admin'] },
        { id: 'weight', label: 'น้ำหนัก', icon: 'fa-weight-scale', roles: ['admin', 'parent'] },
        { id: 'summary', label: 'สรุป', icon: 'fa-chart-pie', roles: ['admin'] },
        { id: 'manage', label: 'จัดการ', icon: 'fa-users-gear', roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(role));

    let filteredAllAthletes = athletes;
    if (role === 'parent') {
        filteredAllAthletes = athletes.filter(a => a.classType === 'รอบนักกีฬา');
    } else if (filterType !== 'ทั้งหมด') {
        filteredAllAthletes = athletes.filter(a => (a.classType || 'รอบปกติ') === filterType);
    }

    let displayAthletes = role === 'parent' 
        ? filteredAllAthletes.filter(a => parentAthletes.includes(a.id))
        : filteredAllAthletes;

    const filterUI = role === 'admin' ? (
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {['ทั้งหมด', 'รอบปกติ', 'รอบนักกีฬา'].map(type => (
                <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                        filterType === type 
                            ? 'bg-tkd-600 text-white shadow-md shadow-tkd-200' 
                            : 'bg-white text-gray-600 hover:bg-tkd-50 border border-gray-200 shadow-sm'
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
    ) : null;

    return (
        <div className="min-h-screen flex flex-col fade-in">
            {/* Header / Navbar */}
            <header className="glass sticky top-0 z-50 shadow-sm border-b border-tkd-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-tr from-tkd-600 to-tkd-400 p-2 rounded-xl text-white shadow-lg shadow-tkd-500/30">
                                <i className="fa-solid fa-khanda text-xl"></i>
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tkd-800 to-tkd-600">
                                BangmodTKD
                            </h1>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex space-x-1">
                            {filteredNavItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        activeTab === item.id
                                            ? 'bg-tkd-100 text-tkd-800 shadow-sm'
                                            : 'text-gray-500 hover:text-tkd-600 hover:bg-tkd-50'
                                    }`}
                                >
                                    <i className={`fa-solid ${item.icon} mr-2`}></i>
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                                    <i className={`fa-solid ${role === 'admin' ? 'fa-user-shield' : 'fa-users'} mr-1.5 text-tkd-600`}></i>
                                    {userName || (role === 'admin' ? 'Admin' : 'Parent')}
                                </span>
                            </div>
                            
                            <button 
                                onClick={onLogout}
                                className="text-sm font-medium text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 border border-red-100 hover:border-red-500"
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span className="hidden sm:inline">ออกจากระบบ</span>
                            </button>

                            {/* Mobile menu button */}
                            <div className="md:hidden flex items-center">
                                <button 
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="text-gray-500 hover:text-tkd-600 focus:outline-none p-2"
                                >
                                    <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-tkd-100 bg-white slide-up absolute w-full shadow-lg rounded-b-2xl">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                                เข้าสู่ระบบในฐานะ: <span className="text-tkd-600">{userName || (role === 'admin' ? 'ผู้สอน (Admin)' : 'ผู้ปกครอง')}</span>
                            </div>
                            {filteredNavItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium transition-colors ${
                                        activeTab === item.id
                                            ? 'bg-tkd-100 text-tkd-800'
                                            : 'text-gray-600 hover:bg-tkd-50 hover:text-tkd-700'
                                    }`}
                                >
                                    <i className={`fa-solid ${item.icon} w-6 text-center mr-2`}></i>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="tab-content slide-up">
                    {activeTab === 'summary' && role === 'admin' && (
                        <SummaryTab athletes={displayAthletes} allAthletes={athletes} filterUI={filterUI} instructors={instructors} fetchData={fetchData} />
                    )}
                    {activeTab === 'attendance' && role === 'admin' && (
                        <AttendanceTab athletes={displayAthletes} setAthletes={setAthletes} filterUI={filterUI} instructors={instructors} setInstructors={setInstructors} onSave={onSave} fetchData={fetchData} />
                    )}
                    {activeTab === 'weight' && (
                        <WeightTab athletes={filteredAllAthletes} parentAthletes={parentAthletes} setAthletes={setAthletes} role={role} fetchData={fetchData} />
                    )}
                    {activeTab === 'manage' && role === 'admin' && (
                        <ManageTab athletes={displayAthletes} setAthletes={setAthletes} instructors={instructors} filterUI={filterUI} fetchData={fetchData} />
                    )}
                </div>
            </main>
            
            <footer className="py-6 text-center text-sm text-gray-400">
                <p>&copy; 2026 Bangmod Taekwondo. All rights reserved.</p>
            </footer>
        </div>
    );
}
