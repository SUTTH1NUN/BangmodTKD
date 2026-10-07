// ----------------------------------------------------
// WEIGHT TAB
// ----------------------------------------------------
function WeightTab({ athletes, parentAthletes, setAthletes, role, fetchData }) {
    const [selectedDate, setSelectedDate] = React.useState(getLocalDateString());
    const [activeMode, setActiveMode] = React.useState('entry'); // 'entry' or 'track'

    const canEdit = (id) => role === 'admin' || (parentAthletes && parentAthletes.includes(id));

    const handleWeightChange = (id, newWeight) => {
        setAthletes(prev => prev.map(a => a.id === id ? { ...a, weight: newWeight } : a));
    };

    React.useEffect(() => {
        const fetchDailyData = async () => {
            try {
                const [attRes, wtRes] = await Promise.all([
                    fetch(`/api/attendance?date=${selectedDate}`),
                    fetch(`/api/weights?date=${selectedDate}`)
                ]);
                
                if (attRes.ok && wtRes.ok) {
                    const attData = await attRes.json();
                    const wtData = await wtRes.json();
                    
                    setAthletes(prevAthletes => prevAthletes.map(a => {
                        const record = attData.find(r => r.person_type === 'athlete' && r.person_id === a.id);
                        const weightRecord = wtData.find(w => w.athlete_id === a.id);
                        return { 
                            ...a, 
                            present: record ? record.present : false,
                            weight: weightRecord ? weightRecord.weight : '0'
                        };
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch daily data:", err);
            }
        };
        fetchDailyData();
    }, [setAthletes, selectedDate]);

    const handleSaveWeight = async () => {
        try {
            const records = athletes.filter(a => a.present && a.weight && a.weight !== '0').map(a => ({
                id: a.id,
                weight: a.weight
            }));
            
            await fetch('/api/weights', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: selectedDate, records })
            });
            
            alert('บันทึกน้ำหนักสำเร็จ!');
            if (fetchData) fetchData();
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการบันทึกน้ำหนัก');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-tkd-100 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">จัดการน้ำหนัก</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {role === 'admin' ? 'บันทึกน้ำหนักนักกีฬาทั้งหมด' : 'บันทึกน้ำหนักบุตรหลานของท่าน'}
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="relative border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:border-tkd-500 focus-within:ring-1 focus-within:ring-tkd-500 w-full sm:max-w-[180px]">
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
                <div className="flex-1 max-w-full overflow-hidden flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    <button 
                        onClick={() => setActiveMode('entry')}
                        className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                            activeMode === 'entry'
                                ? 'bg-tkd-600 text-white shadow-md shadow-tkd-200' 
                                : 'bg-white text-gray-600 hover:bg-tkd-50 border border-gray-200 shadow-sm'
                        }`}
                    >
                        กรอกน้ำหนัก
                    </button>
                    <button 
                        onClick={() => setActiveMode('track')}
                        className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                            activeMode === 'track'
                                ? 'bg-tkd-600 text-white shadow-md shadow-tkd-200' 
                                : 'bg-white text-gray-600 hover:bg-tkd-50 border border-gray-200 shadow-sm'
                        }`}
                    >
                        ติดตามน้ำหนัก
                    </button>
                </div>
                {activeMode === 'entry' && (
                    <button 
                        onClick={handleSaveWeight}
                        className="bg-gradient-to-r from-tkd-600 to-tkd-500 hover:from-tkd-700 hover:to-tkd-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-tkd-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap ml-auto"
                    >
                        <i className="fa-solid fa-floppy-disk"></i>
                        <span className="hidden sm:inline">บันทึกข้อมูล</span>
                    </button>
                )}
            </div>

            {activeMode === 'entry' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-tkd-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">นักกีฬา</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">น้ำหนัก (กก.)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {athletes.filter(a => {
                                const isMyChild = role === 'parent' && parentAthletes && parentAthletes.includes(a.id);
                                return a.present || isMyChild;
                            }).sort((a,b) => {
                                const aIsMyChild = role === 'parent' && parentAthletes && parentAthletes.includes(a.id);
                                const bIsMyChild = role === 'parent' && parentAthletes && parentAthletes.includes(b.id);
                                
                                const aNeedsWeight = aIsMyChild && (!a.weight || a.weight === '0');
                                const bNeedsWeight = bIsMyChild && (!b.weight || b.weight === '0');
                                
                                if (aNeedsWeight && !bNeedsWeight) return -1;
                                if (!aNeedsWeight && bNeedsWeight) return 1;
                                
                                return getBeltScore(b.beltColor) - getBeltScore(a.beltColor);
                            }).map(athlete => {
                                const isMyChild = role === 'parent' && parentAthletes && parentAthletes.includes(athlete.id);
                                return (
                                <tr key={athlete.id} className={`transition-colors ${isMyChild ? 'bg-tkd-50/50' : 'hover:bg-tkd-50'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-tkd-100 text-tkd-600 flex items-center justify-center font-bold">
                                                    {athlete.nickname.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {athlete.nickname} {isMyChild && <span className="text-xs bg-tkd-100 text-tkd-700 px-2 py-0.5 rounded-full ml-2">บุตรหลาน</span>}
                                                </div>
                                                <div className="text-sm text-gray-500">{athlete.fullName || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {!athlete.present ? (
                                            <div className="text-gray-400 font-normal italic py-1 px-2">
                                                ไม่ได้เช็คชื่อ
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={athlete.weight || ''}
                                                    onChange={(e) => handleWeightChange(athlete.id, e.target.value)}
                                                    disabled={!canEdit(athlete.id)}
                                                    className={`w-24 text-right border-b-2 py-1 px-2 text-lg font-bold transition-colors ${canEdit(athlete.id) ? 'border-gray-200 focus:border-tkd-500 focus:outline-none text-tkd-700 bg-transparent' : 'border-transparent text-gray-500 bg-gray-50 cursor-not-allowed'}`}
                                                    placeholder={canEdit(athlete.id) ? "0.0" : "-"}
                                                />
                                                <span className="text-gray-400">kg</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                            {athletes.filter(a => a.present).length === 0 && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                                        ยังไม่มีนักกีฬาที่เช็คชื่อในรอบนี้
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            ) : (
                <WeightTrackTab athletes={athletes} parentAthletes={parentAthletes} role={role} />
            )}
        </div>
    );
}
