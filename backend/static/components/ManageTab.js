// ----------------------------------------------------
// MANAGE TAB (CRUD)
// ----------------------------------------------------

const calculateAge = (dobString) => {
    if (!dobString) return '-';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
};

function ManageTab({ athletes, setAthletes, instructors, filterUI, fetchData }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentAthlete, setCurrentAthlete] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [showInstructorModal, setShowInstructorModal] = useState(false);

    const [formData, setFormData] = useState({
        nickname: '',
        fullName: '',
        beltColor: 'White',
        birthDate: '',
        classType: 'รอบปกติ'
    });

    const [instructorForm, setInstructorForm] = useState({ name: '' });

    const handleInstructorSubmit = async (e) => {
        e.preventDefault();
        if (!instructorForm.name) return;
        
        try {
            const res = await fetch('/api/instructors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: instructorForm.name })
            });
            if (res.ok) {
                if (fetchData) fetchData();
                setShowInstructorModal(false);
                setInstructorForm({ name: '' });
                alert('เพิ่มผู้ฝึกสอนสำเร็จ!');
            } else {
                alert('ไม่สามารถเพิ่มผู้ฝึกสอนได้');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ nickname: '', fullName: '', beltColor: 'White', birthDate: '', classType: 'รอบปกติ' });
        setShowModal(true);
    };

    const openEditModal = (athlete) => {
        setIsEditing(true);
        setCurrentAthlete(athlete);
        setFormData({
            nickname: athlete.nickname,
            fullName: athlete.fullName || '',
            beltColor: athlete.beltColor,
            birthDate: athlete.birthDate || '',
            classType: athlete.classType || 'รอบปกติ'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm('คุณแน่ใจหรือไม่ที่จะลบนักกีฬาท่านนี้?')) {
            try {
                const res = await fetch(`/api/athletes/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    if (fetchData) fetchData();
                } else {
                    alert('ไม่สามารถลบข้อมูลได้');
                }
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            }
        }
    };

    const handleDeleteInstructor = async (id) => {
        if(window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ฝึกสอนท่านนี้?')) {
            try {
                const res = await fetch(`/api/instructors/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    if (fetchData) fetchData();
                } else {
                    alert('ไม่สามารถลบข้อมูลได้');
                }
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nickname) {
            alert('กรุณากรอกชื่อเล่น');
            return;
        }

        try {
            let res;
            if (isEditing && currentAthlete) {
                res = await fetch(`/api/athletes/${currentAthlete.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch('/api/athletes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            if (res.ok) {
                if (fetchData) fetchData();
                setShowModal(false);
            } else {
                alert('ไม่สามารถบันทึกข้อมูลได้');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl shadow-sm border border-tkd-100 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">จัดการระบบ</h2>
                    <p className="text-gray-500 text-sm mt-1">เพิ่ม แก้ไข หรือลบข้อมูลนักกีฬา และผู้ฝึกสอน</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => setShowInstructorModal(true)}
                        className="bg-white hover:bg-tkd-50 border-2 border-tkd-100 text-tkd-700 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                        <i className="fa-solid fa-user-tie"></i>
                        เพิ่มผู้ฝึกสอน
                    </button>
                    <button 
                        onClick={() => openAddModal()}
                        className="bg-gradient-to-r from-tkd-600 to-tkd-500 hover:from-tkd-700 hover:to-tkd-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-tkd-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                        <i className="fa-solid fa-user-graduate"></i>
                        เพิ่มนักกีฬา
                    </button>
                </div>
            </div>

            <div className="mt-6 mb-2">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">รายชื่อผู้ฝึกสอน</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {instructors && instructors.map(instructor => (
                    <div key={instructor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-tkd-100 text-tkd-600 flex items-center justify-center font-bold text-lg border border-tkd-200">
                                <i className="fa-solid fa-user-tie"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{instructor.name}</h3>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDeleteInstructor(instructor.id)}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                            <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                ))}
            </div>

            {filterUI}

            <div className="mt-6 mb-2">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">รายชื่อนักกีฬา</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {athletes.map(athlete => (
                    <div key={athlete.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 athlete-card flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-tkd-50 text-tkd-600 flex items-center justify-center font-bold text-xl border border-tkd-100">
                                    {athlete.nickname.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{athlete.nickname}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-1">{athlete.fullName || 'ไม่ได้ระบุชื่อจริง'}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 text-center">
                                <div className="text-xs text-gray-400">อายุ</div>
                                <div className="font-semibold text-gray-700">{calculateAge(athlete.birthDate)}</div>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-tkd-50 text-tkd-700 border border-tkd-100">
                                    {athlete.beltColor} Belt
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${athlete.classType === 'รอบนักกีฬา' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                    {athlete.classType || 'รอบปกติ'}
                                </span>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openEditModal(athlete)}
                                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                >
                                    <i className="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button 
                                    onClick={() => handleDelete(athlete.id)}
                                    className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                                >
                                    <i className="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden slide-up border border-white">
                        <div className="bg-gradient-to-r from-tkd-600 to-tkd-500 p-6 text-white">
                            <h3 className="text-xl font-bold">{isEditing ? 'แก้ไขข้อมูลนักกีฬา' : 'เพิ่มนักกีฬาใหม่'}</h3>
                            <p className="text-tkd-100 text-sm mt-1">{isEditing ? 'อัปเดตข้อมูลของนักกีฬา' : 'กรอกข้อมูลพื้นฐานของนักกีฬา'}</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อเล่น <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.nickname}
                                    onChange={e => setFormData({...formData, nickname: e.target.value})}
                                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-tkd-500 focus:ring-0 transition-colors"
                                    placeholder="เช่น น้องนนท์"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                                <input 
                                    type="text" 
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-tkd-500 focus:ring-0 transition-colors"
                                    placeholder="ชื่อจริง (ไม่บังคับ)"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">วดป. เกิด</label>
                                    <input 
                                        type="date" 
                                        value={formData.birthDate}
                                        onChange={e => setFormData({...formData, birthDate: e.target.value})}
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-tkd-500 focus:ring-0 transition-colors bg-white/80"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">รอบการเรียน</label>
                                    <select 
                                        value={formData.classType}
                                        onChange={e => setFormData({...formData, classType: e.target.value})}
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-tkd-500 focus:ring-0 transition-colors bg-white"
                                    >
                                        <option value="รอบปกติ">รอบปกติ</option>
                                        <option value="รอบนักกีฬา">รอบนักกีฬา</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">สายคาดเอว</label>
                                    <select 
                                        value={formData.beltColor}
                                        onChange={e => setFormData({...formData, beltColor: e.target.value})}
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-tkd-500 focus:ring-0 transition-colors bg-white"
                                    >
                                        {beltColors.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-tkd-600 text-white rounded-xl font-semibold hover:bg-tkd-700 shadow-lg shadow-tkd-500/30 transition-colors"
                                >
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Instructor Modal */}
            {showInstructorModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden slide-up border border-white">
                        <div className="bg-gradient-to-r from-tkd-600 to-tkd-500 p-6 text-white">
                            <h3 className="text-xl font-bold">เพิ่มผู้ฝึกสอนใหม่</h3>
                            <p className="text-tkd-100 text-sm mt-1">กรอกข้อมูลผู้สอนในระบบ</p>
                        </div>
                        
                        <form onSubmit={handleInstructorSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อเรียก / ชื่อเล่น (เช่น ครูปูเป้) <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={instructorForm.name}
                                    onChange={(e) => setInstructorForm({...instructorForm, name: e.target.value})}
                                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-tkd-500 focus:ring-0 transition-colors"
                                    placeholder="กรอกชื่อเรียกสำหรับแสดงในระบบ"
                                    required
                                />
                            </div>


                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowInstructorModal(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-tkd-600 text-white rounded-xl font-semibold hover:bg-tkd-700 shadow-lg shadow-tkd-500/30 transition-colors"
                                >
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
