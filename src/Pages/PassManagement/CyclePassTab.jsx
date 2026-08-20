import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Printer, ChevronLeft, ChevronRight, ChevronDown, X, Bike } from 'lucide-react';

const AVATAR_COLORS = ['#0F6E6E', '#C9781F', '#6A4FC9', '#C6433E', '#1F8A55', '#0F2A2E'];

const getInitials = (name) => (name ? String(name).split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : 'ST');
const getColorForId = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

const formatClassDisplay = (cName, sName) => {
    if (!cName || cName === '—') return sName || '—';
    const cleanCName = String(cName).trim().startsWith('Class') ? cName : `Class ${cName}`;
    return sName && sName !== '—' ? `${cleanCName} - ${sName}` : cleanCName;
};

const getPaginationRange = (totalPages, currentPage) => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, '...', totalPages - 1, totalPages];
    if (currentPage >= totalPages - 2) return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

const dropdownClass = `
    appearance-none cursor-pointer pl-3 pr-7 py-2
    rounded-lg border border-slate-200 bg-slate-100
    text-xs text-slate-700 font-medium
    focus:outline-none focus:ring-2 focus:ring-blue-600/30
    hover:border-slate-300 transition-all w-full
`;

export default function CyclePassTab({
    classes = [],
    selectedClassId = 'all',
    setSelectedClassId = () => { },
    selectedSectionId = 'all',
    setSelectedSectionId = () => { },
    availableSections = [],
    searchQuery = '',
    setSearchQuery = () => { },
    students = [],
    loadingStudents = false,
    onPreview = () => { },
    onPrint = () => { },
    onBulkGenerate = () => { },
    showToast = () => { }
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    // Custom entered cycle registration numbers map
    const [cycleRegMap, setCycleRegMap] = useState({});

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempRegMap, setTempRegMap] = useState({});

    const safeClasses = Array.isArray(classes) ? classes : [];
    const safeSections = Array.isArray(availableSections) ? availableSections : [];
    const safeStudents = Array.isArray(students) ? students : [];

    // Filter ya Rows per page badalne par reset
    useEffect(() => {
        setCurrentPage(1);
        setSelectedStudentIds([]);
    }, [selectedClassId, selectedSectionId, searchQuery, itemsPerPage]);

    const filteredStudents = useMemo(() => {
        return safeStudents.filter((s) => {
            if (!s) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const sName = String(s.name || '').toLowerCase();
                const sRoll = String(s.roll || '').toLowerCase();
                return sName.includes(q) || sRoll.includes(q);
            }
            return true;
        });
    }, [safeStudents, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = useMemo(
        () => filteredStudents.slice(startIndex, startIndex + itemsPerPage),
        [filteredStudents, startIndex, itemsPerPage]
    );
    const paginationRange = useMemo(() => getPaginationRange(totalPages, currentPage), [totalPages, currentPage]);

    // Selection handlers
    const handleToggleStudent = (studentId) => {
        if (selectedStudentIds.includes(studentId)) {
            setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
        } else {
            if (selectedStudentIds.length >= itemsPerPage) {
                showToast(`You can select a maximum of ${itemsPerPage} students at a time.`, true);
                return;
            }
            setSelectedStudentIds((prev) => [...prev, studentId]);
        }
    };

    const currentPageIds = useMemo(() => paginatedStudents.map((s) => s.id), [paginatedStudents]);

    const isAllPageSelected = useMemo(() => {
        if (currentPageIds.length === 0) return false;
        return currentPageIds.every((id) => selectedStudentIds.includes(id));
    }, [currentPageIds, selectedStudentIds]);

    const isSomePageSelected = useMemo(() => {
        return currentPageIds.some((id) => selectedStudentIds.includes(id)) && !isAllPageSelected;
    }, [currentPageIds, selectedStudentIds, isAllPageSelected]);

    const handleSelectAllCurrentPage = () => {
        if (isAllPageSelected) {
            setSelectedStudentIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
        } else {
            const newSelection = [...selectedStudentIds];
            let reachedMax = false;

            for (const s of paginatedStudents) {
                if (!newSelection.includes(s.id)) {
                    if (newSelection.length < itemsPerPage) {
                        newSelection.push(s.id);
                    } else {
                        reachedMax = true;
                        break;
                    }
                }
            }

            setSelectedStudentIds(newSelection);
            if (reachedMax) {
                showToast(`Maximum selection limit of ${itemsPerPage} students reached.`, true);
            }
        }
    };

    const selectedStudentsList = useMemo(() => {
        return safeStudents.filter((s) => selectedStudentIds.includes(s.id));
    }, [safeStudents, selectedStudentIds]);

    // Open popup modal on Generate Cycle Pass button tap
    const handleOpenModal = () => {
        if (selectedStudentIds.length === 0) {
            showToast('Please select at least one student.', true);
            return;
        }

        const initialInputs = {};
        safeStudents.forEach((s) => {
            if (selectedStudentIds.includes(s.id)) {
                initialInputs[s.id] = cycleRegMap[s.id] || s.cycleReg || '';
            }
        });
        setTempRegMap(initialInputs);
        setIsModalOpen(true);
    };

    // Form submit -> Save state -> Trigger frontend PDF print of selected passes
    const handleSaveAndPrintPasses = (e) => {
        if (e) e.preventDefault();

        // 1. Table state update
        setCycleRegMap((prev) => ({
            ...prev,
            ...tempRegMap
        }));

        // 2. Build list with assigned Cycle Reg No.
        const updatedSelectedList = selectedStudentsList.map((s) => ({
            ...s,
            cycleReg: tempRegMap[s.id]?.trim() || s.cycleReg || 'No Cycle'
        }));

        // 3. Trigger bulk print engine
        const success = onBulkGenerate('cycle', updatedSelectedList);
        if (success) {
            setIsModalOpen(false);
            setSelectedStudentIds([]);
        }
    };

    const AvatarCell = ({ student, size = 'md' }) => {
        const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-xs';
        return student?.profileImageUrl ? (
            <img src={student.profileImageUrl} alt={student.name} className={`${dim} rounded-full object-cover shrink-0 border border-slate-200`} />
        ) : (
            <div className={`${dim} rounded-full text-white font-bold flex items-center justify-center shrink-0`} style={{ backgroundColor: getColorForId(student?.id) }}>
                {getInitials(student?.name)}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Filter Bar */}
            <div className="bg-white flex flex-col lg:flex-row lg:items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 shrink-0 w-full shadow-xs">
                <div className="w-full lg:flex-1 lg:min-w-0 flex items-center gap-2 border border-slate-200 rounded-lg bg-slate-100 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search student name or roll no..."
                        className="text-xs focus:outline-none text-slate-700 w-full bg-transparent placeholder:text-slate-400 font-medium"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="w-4 h-4 rounded-full bg-slate-300 hover:bg-slate-400 flex items-center justify-center shrink-0 text-slate-600 text-xs font-bold">×</button>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto lg:shrink-0">
                    <div className="relative flex-1 lg:w-36">
                        <select value={selectedClassId} onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSectionId('all'); }} className={dropdownClass}>
                            <option value="all">All Classes</option>
                            {safeClasses.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    </div>

                    <div className="relative flex-1 lg:w-36">
                        <select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} className={dropdownClass}>
                            <option value="all">All Sections</option>
                            {safeSections.map((sec) => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto lg:shrink-0">
                    <span className="px-3 py-2 rounded-lg bg-[#E4F3F1] text-blue-600 font-bold text-xs whitespace-nowrap text-center flex-1 lg:flex-none">
                        {filteredStudents.length} Students
                    </span>
                    
                </div>
            </div>

            {/* Bulk Toolbar */}
            <div className="bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 shrink-0 w-full shadow-xs">
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            ref={(el) => {
                                if (el) el.indeterminate = isSomePageSelected;
                            }}
                            checked={isAllPageSelected && paginatedStudents.length > 0}
                            onChange={handleSelectAllCurrentPage}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-700">Select All (Page)</span>
                    </label>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${selectedStudentIds.length > 0
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                        {selectedStudentIds.length} / {itemsPerPage} Selected
                    </span>

                    {selectedStudentIds.length > 0 && (
                        <button
                            onClick={() => setSelectedStudentIds([])}
                            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                            Clear Selection
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleOpenModal}
                        disabled={selectedStudentIds.length === 0}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold text-xs bg-[#0B2126] text-white hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    >
                        <Bike className="w-3.5 h-3.5 text-blue-400" />
                        <span>Generate Cycle Passes ({selectedStudentIds.length})</span>
                    </button>
                </div>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden pb-2">
                {loadingStudents ? (
                    <div className="col-span-full text-center py-10 text-slate-400 text-xs">Loading student records...</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-400 text-xs">No students found matching filters.</div>
                ) : (
                    paginatedStudents.map((s) => {
                        const isChecked = selectedStudentIds.includes(s.id);
                        const isDisabled = !isChecked && selectedStudentIds.length >= itemsPerPage;
                        const assignedRegNo = cycleRegMap[s.id] || s.cycleReg;

                        return (
                            <div
                                key={s.id}
                                className={`bg-white border rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-3 transition-all ${isChecked ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={() => handleToggleStudent(s.id)}
                                        className={`mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                                            }`}
                                    />
                                    <AvatarCell student={s} size="md" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-slate-900 text-xs truncate">{s.name}</p>
                                        <p className="text-[10px] font-mono text-slate-400">{s.roll}</p>
                                    
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-blue-600 font-bold text-[10px] shrink-0">
                                        {formatClassDisplay(s.className, s.sectionName)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                    <button
                                        onClick={() => onPreview({ ...s, cycleReg: assignedRegNo || 'No Cycle' }, 'cycle')}
                                        className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                        <Eye className="w-3 h-3 text-blue-600" /> View
                                    </button>
                                    <button
                                        onClick={() => onPrint({ ...s, cycleReg: assignedRegNo || 'No Cycle' }, 'cycle')}
                                        className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                        <Printer className="w-3 h-3 text-slate-600" /> Print
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:flex lg:flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-xs">
                        <colgroup>
                            <col style={{ width: '4%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '16%' }} />
                        </colgroup>
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-3 py-2.5 text-center">
                                    <input
                                        type="checkbox"
                                        ref={(el) => {
                                            if (el) el.indeterminate = isSomePageSelected;
                                        }}
                                        checked={isAllPageSelected && paginatedStudents.length > 0}
                                        onChange={handleSelectAllCurrentPage}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                    />
                                </th>
                                <th className="px-3 py-2.5 text-left">Student</th>
                                <th className="px-3 py-2.5 text-left">Roll No.</th>
                                <th className="px-3 py-2.5 text-left">Class / Sec</th>
                                <th className="px-3 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {loadingStudents ? (
                                <tr><td colSpan="6" className="py-12 text-center text-slate-400">Loading student records...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="6" className="py-12 text-center text-slate-400">No students match current filters.</td></tr>
                            ) : (
                                paginatedStudents.map((s) => {
                                    const isChecked = selectedStudentIds.includes(s.id);
                                    const isDisabled = !isChecked && selectedStudentIds.length >= itemsPerPage;
                                    const assignedRegNo = cycleRegMap[s.id] || s.cycleReg;

                                    return (
                                        <tr
                                            key={s.id}
                                            className={`transition-colors ${isChecked ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    disabled={isDisabled}
                                                    onChange={() => handleToggleStudent(s.id)}
                                                    className={`w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-all ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                                                        }`}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <AvatarCell student={s} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 truncate leading-snug">{s.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono truncate">{s.roll}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 font-mono font-semibold text-slate-800">{s.roll}</td>
                                            <td className="px-3 py-2">
                                                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-blue-600 font-bold text-[10.5px]">
                                                    {formatClassDisplay(s.className, s.sectionName)}
                                                </span>
                                            </td>
                                           
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => onPreview({ ...s, cycleReg: assignedRegNo || 'No Cycle' }, 'cycle')}
                                                        className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Eye className="w-3 h-3 text-blue-600" /> View
                                                    </button>
                                                    <button
                                                        onClick={() => onPrint({ ...s, cycleReg: assignedRegNo || 'No Cycle' }, 'cycle')}
                                                        className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Printer className="w-3 h-3 text-slate-600" /> Print
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="shrink-0 px-4 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                        <span>Showing <strong className="font-semibold text-slate-900">{filteredStudents.length === 0 ? 0 : startIndex + 1}</strong> to <strong className="font-semibold text-slate-900">{Math.min(startIndex + itemsPerPage, filteredStudents.length)}</strong> of <strong className="font-semibold text-slate-900">{filteredStudents.length}</strong></span>
                        <div className="flex items-center gap-1.5">
                            <span>Rows:</span>
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white font-medium cursor-pointer">
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center justify-center w-7 h-7 rounded hover:bg-slate-100 text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {paginationRange.map((page, idx) => (
                            page === '...' ? <span key={`dots-${idx}`} className="w-6 h-7 flex items-center justify-center text-slate-400 text-xs">...</span> :
                                <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[28px] h-7 px-1.5 rounded text-xs font-medium transition-all cursor-pointer ${page === currentPage ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}>
                                    {page}
                                </button>
                        ))}
                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center justify-center w-7 h-7 rounded hover:bg-slate-100 text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Cycle Reg. No. Verification / Entry Popup Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2126]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Bike className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Enter Cycle Registration Details</h3>
                                    <p className="text-xs text-slate-500">{selectedStudentsList.length} student(s) selected for Cycle Pass generation</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Student Inputs List */}
                        <form onSubmit={handleSaveAndPrintPasses} className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100">
                                {selectedStudentsList.map((s) => (
                                    <div key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <AvatarCell student={s} size="sm" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 truncate">{s.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">Roll: {s.roll} • {formatClassDisplay(s.className, s.sectionName)}</p>
                                            </div>
                                        </div>
                                        <div className="w-44 shrink-0">
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. CYC-101"
                                                value={tempRegMap[s.id] || ''}
                                                onChange={(e) => setTempRegMap({ ...tempRegMap, [s.id]: e.target.value })}
                                                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-slate-800"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-[#0B2126] rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" /> Save & Generate Passes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}