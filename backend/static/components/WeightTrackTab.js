// ----------------------------------------------------
// WEIGHT TRACK TAB
// ----------------------------------------------------
function WeightTrackTab({ athletes, parentAthletes, role }) {
    const [selectedAthleteId, setSelectedAthleteId] = React.useState('');
    const [history, setHistory] = React.useState([]);
    const [timeRange, setTimeRange] = React.useState('1m');
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    // Filter and sort athletes based on role and belt color
    const selectableAthletes = React.useMemo(() => {
        let list = role === 'parent' 
            ? athletes.filter(a => parentAthletes.includes(a.id))
            : [...athletes];
            
        return list.sort((a, b) => getBeltScore(b.beltColor) - getBeltScore(a.beltColor));
    }, [athletes, parentAthletes, role]);

    // Set initial selection
    React.useEffect(() => {
        if (!selectedAthleteId && selectableAthletes.length > 0) {
            setSelectedAthleteId(selectableAthletes[0].id.toString());
        }
    }, [selectableAthletes, selectedAthleteId]);

    // Fetch history when selection changes
    React.useEffect(() => {
        if (!selectedAthleteId) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/athletes/${selectedAthleteId}/weights`);
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                }
            } catch (err) {
                console.error("Failed to fetch weight history", err);
            }
        };

        fetchHistory();
    }, [selectedAthleteId]);

    const filteredHistory = React.useMemo(() => {
        if (timeRange === 'all') return history;
        
        const now = new Date();
        const cutoff = new Date(now);
        
        if (timeRange === '1w') cutoff.setDate(now.getDate() - 7);
        else if (timeRange === '2w') cutoff.setDate(now.getDate() - 14);
        else if (timeRange === '1m') cutoff.setMonth(now.getMonth() - 1);
        else if (timeRange === '3m') cutoff.setMonth(now.getMonth() - 3);

        cutoff.setHours(0, 0, 0, 0);

        return history.filter(h => {
            const d = new Date(h.date);
            return d >= cutoff;
        });
    }, [history, timeRange]);

    // Render chart
    React.useEffect(() => {
        if (!chartRef.current) return;

        // Destroy previous instance
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        if (filteredHistory.length === 0) return;

        const ctx = chartRef.current.getContext('2d');
        
        // Prepare data
        const labels = filteredHistory.map(h => {
            const d = new Date(h.date);
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        });
        const data = filteredHistory.map(h => parseFloat(h.weight));

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'น้ำหนัก (กก.)',
                    data: data,
                    borderColor: '#9333ea',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#9333ea',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        padding: 12,
                        titleFont: { family: 'Prompt', size: 14 },
                        bodyFont: { family: 'Prompt', size: 14 },
                        callbacks: {
                            label: (context) => ` ${context.parsed.y} กก.`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: '#f3f4f6', drawBorder: false }
                    },
                    x: {
                        grid: { display: false, drawBorder: false }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [filteredHistory]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-tkd-100">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">ติดตามน้ำหนัก</h2>
                        <p className="text-gray-500 text-sm mt-1">กราฟแสดงแนวโน้มน้ำหนักของนักกีฬา</p>
                    </div>
                    <div className="w-full sm:w-[280px]">
                        <select 
                            value={selectedAthleteId}
                            onChange={(e) => setSelectedAthleteId(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-tkd-500 focus:ring-0 bg-gray-50 font-medium cursor-pointer"
                        >
                            {selectableAthletes.length === 0 && <option value="">ไม่มีข้อมูลนักกีฬา</option>}
                            {selectableAthletes.map(a => (
                                <option key={a.id} value={a.id}>{a.nickname} {a.fullName ? `(${a.fullName})` : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {history.length > 0 ? (
                    <>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {[
                                { id: '1w', label: '1 สัปดาห์' },
                                { id: '2w', label: '2 สัปดาห์' },
                                { id: '1m', label: '1 เดือน' },
                                { id: '3m', label: '3 เดือน' },
                                { id: 'all', label: 'ทั้งหมด' }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setTimeRange(filter.id)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                        timeRange === filter.id
                                            ? 'bg-tkd-100 text-tkd-700 border-tkd-200 border'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {filteredHistory.length > 0 ? (
                            <>
                                <div className="h-64 sm:h-80 w-full mt-4">
                                    <canvas ref={chartRef}></canvas>
                                </div>
                                
                                <div className="mt-8 border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลย้อนหลัง</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 rounded-lg">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">วันที่</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">น้ำหนัก (กก.)</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">การเปลี่ยนแปลง</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[...filteredHistory].reverse().map((h, index, arr) => {
                                            const prev = arr[index + 1];
                                            const diff = prev ? (parseFloat(h.weight) - parseFloat(prev.weight)).toFixed(1) : 0;
                                            
                                            const d = new Date(h.date);
                                            const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                            
                                            return (
                                                <tr key={h.date} className="hover:bg-tkd-50 transition-colors">
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{dateStr}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{h.weight}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right">
                                                        {index < arr.length - 1 ? (
                                                            diff > 0 
                                                                ? <span className="text-red-500 flex items-center justify-end gap-1"><i className="fa-solid fa-arrow-trend-up"></i> +{diff}</span>
                                                                : diff < 0 
                                                                    ? <span className="text-green-500 flex items-center justify-end gap-1"><i className="fa-solid fa-arrow-trend-down"></i> {diff}</span>
                                                                    : <span className="text-gray-400">-</span>
                                                        ) : (
                                                            <span className="text-gray-400">เริ่มต้น</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                            </>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <i className="fa-regular fa-calendar-xmark text-3xl mb-3 text-gray-300"></i>
                                <p>ไม่มีข้อมูลน้ำหนักในช่วงเวลานี้</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-4">
                        <i className="fa-solid fa-chart-line text-4xl mb-3 text-gray-300"></i>
                        <p>ยังไม่มีประวัติการบันทึกน้ำหนักสำหรับนักกีฬาท่านนี้</p>
                    </div>
                )}
            </div>
        </div>
    );
}
