// ----------------------------------------------------
// ATTENDANCE TAB
// ----------------------------------------------------
function AttendanceTab({ athletes, setAthletes, filterUI, instructors, setInstructors, fetchData }) {
    const [selectedDate, setSelectedDate] = useState(getLocalDateString());
    const [saveStatus, setSaveStatus] = useState('idle');

    useEffect(() => {
        const fetchDaily = async () => {
            try {
                const res = await fetch(`/api/attendance?date=${selectedDate}`);
                if (res.ok) {
                    const records = await res.json();
                    
                    // Reset all to false first
                    let updatedAthletes = athletes.map(a => ({...a, present: false}));
                    let updatedInstructors = instructors.map(i => ({...i, present: false}));
                    
                    // Apply saved records
                    records.forEach(r => {
                        if (r.person_type === 'athlete') {
                            const found = updatedAthletes.find(a => a.id === r.person_id);
                            if (found) found.present = r.present;
                        } else if (r.person_type === 'instructor') {
                            const found = updatedInstructors.find(i => i.id === r.person_id);
                            if (found) found.present = r.present;
                        }
                    });
                    
                    setAthletes(updatedAthletes);
                    setInstructors(updatedInstructors);
                }
            } catch (err) {
                console.error("Failed to load daily attendance", err);
            }
        };
        // Fetch when date changes, assuming athletes/instructors are already loaded from main app
        if (athletes.length > 0 || instructors.length > 0) {
            fetchDaily();
        }
    }, [selectedDate]);

    const toggleAttendance = (id) => {
        setAthletes(athletes.map(a => a.id === id ? { ...a, present: !a.present } : a));
    };

    const toggleInstructorAttendance = (id) => {
        if(setInstructors) {
            setInstructors(instructors.map(i => i.id === id ? { ...i, present: !i.present } : i));
        }
    };

    const handleSaveAttendance = async () => {
        const records = [
            ...athletes.map(a => ({ id: a.id, type: 'athlete', present: a.present ? 1 : 0 })),
            ...instructors.map(i => ({ id: i.id, type: 'instructor', present: i.present ? 1 : 0 }))
        ];
        
        try {
            setSaveStatus('saving');
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: selectedDate, records })
            });
            if (res.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 1500);
                fetchData(); // Refresh summary counts
            } else {
                setSaveStatus('idle');
                alert('ไม่สามารถบันทึกข้อมูลได้');
            }
        } catch (err) {
            setSaveStatus('idle');
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const sortedAthletes = [...athletes].sort((a, b) => getBeltScore(b.beltColor) - getBeltScore(a.beltColor));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-tkd-100 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">เช็คชื่อ</h2>
                    <p className="text-gray-500 text-sm mt-1">ประจำวันที่ {new Date(selectedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:border-tkd-500 focus-within:ring-1 focus-within:ring-tkd-500 w-full max-w-[180px]">
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 bg-transparent text-gray-700 focus:outline-none font-medium w-full cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex-1 max-w-full overflow-hidden">
                    {filterUI}
                </div>
                <button 
                    onClick={handleSaveAttendance}
                    disabled={saveStatus !== 'idle'}
                    className={`px-5 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap ml-auto ${
                        saveStatus === 'success' 
                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' 
                            : saveStatus === 'saving'
                                ? 'bg-gray-400 text-white cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-tkd-600 to-tkd-500 hover:from-tkd-700 hover:to-tkd-600 text-white shadow-tkd-500/20'
                    }`}
                >
                    {saveStatus === 'success' ? (
                        <><i className="fa-solid fa-check"></i><span className="hidden sm:inline">บันทึกแล้ว</span></>
                    ) : saveStatus === 'saving' ? (
                        <><i className="fa-solid fa-circle-notch fa-spin"></i><span className="hidden sm:inline">กำลังบันทึก...</span></>
                    ) : (
                        <><i className="fa-solid fa-floppy-disk"></i><span className="hidden sm:inline">บันทึกข้อมูล</span></>
                    )}
                </button>
            </div>

            {instructors && instructors.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">ผู้สอนประจำรอบ</h3>
                    <div className="flex flex-wrap gap-3">
                        {instructors.map(instructor => (
                            <div 
                                key={instructor.id} 
                                onClick={() => toggleInstructorAttendance(instructor.id)}
                                className={`flex items-center gap-3 p-3 pr-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    instructor.present 
                                    ? 'bg-tkd-50 border-tkd-300 shadow-sm' 
                                    : 'bg-white border-gray-200 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                    instructor.present ? 'bg-tkd-600 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    <i className="fa-solid fa-user-tie"></i>
                                </div>
                                <div>
                                    <div className={`font-bold ${instructor.present ? 'text-tkd-800' : 'text-gray-600'}`}>
                                        {instructor.nickname}
                                    </div>
                                </div>
                                <div className="ml-2">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        instructor.present ? 'bg-tkd-600 border-tkd-600' : 'border-gray-300'
                                    }`}>
                                        {instructor.present && <i className="fa-solid fa-check text-white text-xs"></i>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2 mt-4">รายชื่อนักกีฬา</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedAthletes.map(athlete => (
                    <div key={athlete.id} className={`athlete-card p-4 rounded-2xl border-2 transition-all ${athlete.present ? 'bg-tkd-50 border-tkd-300 shadow-md shadow-tkd-200/50' : 'bg-white border-transparent shadow-sm'}`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg border-2 border-white shadow-sm">
                                        {athlete.nickname.charAt(0)}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${athlete.present ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{athlete.nickname}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                            {athlete.beltColor} Belt
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <input 
                                    type="checkbox" 
                                    className="attendance-checkbox"
                                    checked={athlete.present}
                                    onChange={() => toggleAttendance(athlete.id)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}
