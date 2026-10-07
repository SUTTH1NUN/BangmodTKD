// ----------------------------------------------------
// WEIGHT TAB
// ----------------------------------------------------
function WeightTab({ athletes, setAthletes, role, filterUI, fetchData }) {
    const handleWeightChange = (id, newWeight) => {
        setAthletes(athletes.map(a => a.id === id ? { ...a, weight: newWeight } : a));
    };

    const handleSaveWeight = async () => {
        try {
            // Update all visible athletes
            await Promise.all(athletes.filter(a => role === 'parent' || a.present).map(a => 
                fetch(`/api/athletes/${a.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ weight: a.weight })
                })
            ));
            alert('บันทึกน้ำหนักสำเร็จ!');
            if (fetchData) fetchData();
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการบันทึกน้ำหนัก');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-tkd-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">จัดการน้ำหนัก</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {role === 'admin' ? 'บันทึกน้ำหนักนักกีฬาทั้งหมด' : 'บันทึกน้ำหนักบุตรหลานของท่าน'}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex-1 max-w-full overflow-hidden">
                    {filterUI}
                </div>
                <button 
                    onClick={handleSaveWeight}
                    className="bg-gradient-to-r from-tkd-600 to-tkd-500 hover:from-tkd-700 hover:to-tkd-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-tkd-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap ml-auto"
                >
                    <i className="fa-solid fa-floppy-disk"></i>
                    <span className="hidden sm:inline">บันทึกข้อมูล</span>
                </button>
            </div>

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
                            {athletes.filter(a => role === 'parent' || a.present).map(athlete => (
                                <tr key={athlete.id} className="hover:bg-tkd-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-tkd-100 text-tkd-600 flex items-center justify-center font-bold">
                                                    {athlete.nickname.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{athlete.nickname}</div>
                                                <div className="text-sm text-gray-500">{athlete.fullName || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={athlete.weight}
                                                onChange={(e) => handleWeightChange(athlete.id, e.target.value)}
                                                className="w-24 text-right border-b-2 border-gray-200 focus:border-tkd-500 focus:outline-none bg-transparent py-1 px-2 text-lg font-bold text-tkd-700 transition-colors"
                                                placeholder="0.0"
                                            />
                                            <span className="text-gray-400">kg</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {athletes.filter(a => role === 'parent' || a.present).length === 0 && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                                        {role === 'parent' ? 'ยังไม่มีรายชื่อนักกีฬาของคุณ' : 'ยังไม่มีนักกีฬาที่เช็คชื่อในรอบนี้'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
