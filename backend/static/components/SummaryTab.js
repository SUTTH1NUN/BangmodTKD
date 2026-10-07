// ----------------------------------------------------
// SUMMARY TAB
// ----------------------------------------------------
function SummaryTab({ allAthletes, filterUI, instructors: allInstructors }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedMonthVal, setSelectedMonthVal] = useState(currentMonth);
    const [viewMode, setViewMode] = useState('daily');
    
    const selectedMonth = `${selectedYear}-${selectedMonthVal}`;
    
    const [athletes, setAthletes] = useState([]);
    const [instructors, setInstructors] = useState([]);

    useEffect(() => {
        const fetchSummaryData = async () => {
            if (viewMode === 'daily') {
                const res = await fetch(`/api/attendance?date=${selectedDate}`);
                if (res.ok) {
                    const records = await res.json();
                    
                    let updatedA = allAthletes.map(a => ({...a, present: false}));
                    let updatedI = allInstructors.map(i => ({...i, present: false}));
                    
                    records.forEach(r => {
                        if (r.person_type === 'athlete') {
                            const found = updatedA.find(a => a.id === r.person_id);
                            if (found) found.present = r.present;
                        } else if (r.person_type === 'instructor') {
                            const found = updatedI.find(i => i.id === r.person_id);
                            if (found) found.present = r.present;
                        }
                    });
                    
                    setAthletes(updatedA);
                    setInstructors(updatedI);
                }
            } else {
                // monthly
                const res = await fetch(`/api/attendance/monthly?month=${selectedMonth}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    let updatedA = allAthletes.map(a => ({
                        ...a, 
                        attendanceCount: data.athletes[a.id] || 0
                    }));
                    let updatedI = allInstructors.map(i => ({
                        ...i, 
                        attendanceCount: data.instructors[i.id] || 0
                    }));
                    
                    setAthletes(updatedA);
                    setInstructors(updatedI);
                }
            }
        };
        fetchSummaryData();
    }, [viewMode, selectedDate, selectedMonth, allAthletes, allInstructors]);

    const visibleAthletes = athletes.filter(a => allAthletes.some(da => da.id === a.id));
    const total = visibleAthletes.length;
    const months = [
        { value: '01', label: 'มกราคม' }, { value: '02', label: 'กุมภาพันธ์' },
        { value: '03', label: 'มีนาคม' }, { value: '04', label: 'เมษายน' },
        { value: '05', label: 'พฤษภาคม' }, { value: '06', label: 'มิถุนายน' },
        { value: '07', label: 'กรกฎาคม' }, { value: '08', label: 'สิงหาคม' },
        { value: '09', label: 'กันยายน' }, { value: '10', label: 'ตุลาคม' },
        { value: '11', label: 'พฤศจิกายน' }, { value: '12', label: 'ธันวาคม' }
    ];
    const years = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];
    const present = visibleAthletes.filter(a => a.present).length;
    const absent = total - present;
    const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
    const handleExport = () => {
        const rows = [
            ["ชื่อเล่น", "ชื่อ-นามสกุล", "ประเภท", "น้ำหนัก (กก.)", "มาเรียนวันนี้", "มาเรียนสะสม (ครั้ง)"]
        ];
        
        // Add Instructors first
        if (instructors && instructors.length > 0) {
            rows.push(["--- ครูผู้สอน ---", "", "", "", "", ""]);
            instructors.forEach(i => {
                rows.push([i.name, "-", "-", "-", i.present ? "มาสอน" : "ไม่ได้มาสอน", "-"]);
            });
            rows.push(["--- นักกีฬา ---", "", "", "", "", ""]);
        }

        visibleAthletes.forEach(a => {
            rows.push([
                a.nickname,
                a.fullName || "-",
                a.classType || "-",
                a.weight || "-",
                a.present ? "มา" : "ขาด",
                a.attendanceCount || 0
            ]);
        });
        
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `TKD_Report_${viewMode === 'daily' ? selectedDate : selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-tkd-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">สรุปข้อมูลภาพรวม</h2>
                    <p className="text-gray-500 text-sm mt-1">ข้อมูลสรุปของนักกีฬาตามตัวกรองที่เลือก</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                        <button 
                            onClick={() => setViewMode('daily')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'daily' ? 'bg-white text-tkd-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            รายวัน
                        </button>
                        <button 
                            onClick={() => setViewMode('monthly')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'monthly' ? 'bg-white text-tkd-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            รายเดือน
                        </button>
                    </div>
                    <div className="w-full sm:w-[240px] flex justify-start sm:justify-end mt-3 sm:mt-0">
                        {viewMode === 'daily' ? (
                            <div className="relative border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:border-tkd-500 focus-within:ring-1 focus-within:ring-tkd-500 w-full max-w-[180px]">
                                <input 
                                    type="date" 
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-4 py-2 bg-transparent text-gray-700 focus:outline-none font-medium w-full"
                                />
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <div className="relative border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:border-tkd-500 focus-within:ring-1 focus-within:ring-tkd-500">
                                    <select 
                                        value={selectedMonthVal}
                                        onChange={(e) => setSelectedMonthVal(e.target.value)}
                                        className="px-4 py-2 pr-8 bg-transparent text-gray-700 focus:outline-none font-medium appearance-none w-32 cursor-pointer"
                                    >
                                        {months.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <i className="fa-solid fa-chevron-down text-xs"></i>
                                    </div>
                                </div>
                                <div className="relative border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:border-tkd-500 focus-within:ring-1 focus-within:ring-tkd-500">
                                    <select 
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="px-4 py-2 pr-8 bg-transparent text-gray-700 focus:outline-none font-medium appearance-none w-24 cursor-pointer"
                                    >
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <i className="fa-solid fa-chevron-down text-xs"></i>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex-1 max-w-full overflow-hidden">
                    {filterUI}
                </div>
                <button 
                    onClick={handleExport}
                    className="bg-gradient-to-r from-tkd-600 to-tkd-500 hover:from-tkd-700 hover:to-tkd-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-tkd-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap ml-auto"
                    title="ส่งออกรายงานเป็น CSV"
                >
                    <i className="fa-solid fa-file-export"></i>
                    <span className="hidden sm:inline">Export ข้อมูล</span>
                </button>
            </div>
            
            {viewMode === 'daily' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                        <div className="text-gray-500 text-sm font-semibold mb-2">จำนวนนักกีฬา</div>
                        <div className="text-4xl font-black text-gray-800">{total} <span className="text-lg font-normal text-gray-500">คน</span></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-2 -mt-2"></div>
                        <div className="text-green-600 text-sm font-semibold mb-2 relative z-10">มาเรียนวันนี้</div>
                        <div className="text-4xl font-black text-green-600 relative z-10">{present} <span className="text-lg font-normal">คน</span></div>
                        <div className="text-xs text-green-500 mt-2 bg-green-50 px-2 py-1 rounded-full relative z-10">{presentPercent}% จากทั้งหมด</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-2 -mt-2"></div>
                        <div className="text-red-500 text-sm font-semibold mb-2 relative z-10">ขาดเรียน</div>
                        <div className="text-4xl font-black text-red-500 relative z-10">{absent} <span className="text-lg font-normal">คน</span></div>
                        <div className="text-xs text-red-400 mt-2 bg-red-50 px-2 py-1 rounded-full relative z-10">{total > 0 ? 100 - presentPercent : 0}% จากทั้งหมด</div>
                    </div>
                </div>
            )}

            {instructors && instructors.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-tkd-100 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">รายชื่อผู้สอนประจำวัน</h3>
                    <div className="flex flex-col gap-3">
                        {[...instructors].sort((a, b) => {
                            if (viewMode === 'monthly') return (b.attendanceCount || 0) - (a.attendanceCount || 0);
                            return (a.present === b.present) ? 0 : a.present ? -1 : 1;
                        }).map(instructor => (
                            <div key={instructor.id} className={`flex justify-between items-center p-3 rounded-xl border ${viewMode === 'monthly' ? 'border-gray-200' : instructor.present ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${viewMode === 'monthly' ? 'bg-tkd-100 text-tkd-700' : instructor.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        <i className="fa-solid fa-user-tie"></i>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{instructor.name}</div>
                                    </div>
                                </div>
                                <div>
                                    {viewMode === 'monthly' ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-tkd-100 text-tkd-700">
                                            มาสอน {instructor.attendanceCount || 0} ครั้ง
                                        </span>
                                    ) : instructor.present ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                            <i className="fa-solid fa-check mr-1"></i> มาสอน
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                            <i className="fa-solid fa-xmark mr-1"></i> ไม่ได้มาสอน
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-tkd-100 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">รายชื่อนักกีฬาประจำวัน</h3>
                <div className="flex flex-col gap-3">
                    {[...visibleAthletes].sort((a, b) => {
                        if (viewMode === 'monthly') return (b.attendanceCount || 0) - (a.attendanceCount || 0);
                        return (a.present === b.present) ? 0 : a.present ? -1 : 1;
                    }).map(athlete => (
                        <div key={athlete.id} className={`flex justify-between items-center p-3 rounded-xl border ${viewMode === 'monthly' ? 'border-gray-200' : athlete.present ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${viewMode === 'monthly' ? 'bg-tkd-100 text-tkd-700' : athlete.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {athlete.nickname.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{athlete.nickname}</div>
                                    <div className="text-xs text-gray-500">{athlete.beltColor} Belt</div>
                                </div>
                            </div>
                            <div>
                                {viewMode === 'monthly' ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-tkd-100 text-tkd-700">
                                        มาเรียน {athlete.attendanceCount || 0} ครั้ง
                                    </span>
                                ) : athlete.present ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                        <i className="fa-solid fa-check mr-1"></i> มาเรียน
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                        <i className="fa-solid fa-xmark mr-1"></i> ขาดเรียน
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {athletes.length === 0 && (
                        <div className="text-center py-6 text-gray-500">ไม่มีข้อมูลนักกีฬา</div>
                    )}
                </div>
            </div>
        </div>
    );
}
