import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Eye, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const AVATAR_COLORS = ['#0F6E6E', '#C9781F', '#6A4FC9', '#C6433E', '#1F8A55', '#0F2A2E'];

const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
};

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

export default function StudentIdGatePassTab({
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedSectionId,
    setSelectedSectionId,
    availableSections,
    searchQuery,
    setSearchQuery,
    students,
    loadingStudents,
    onPreview,
    showToast
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedClassId, selectedSectionId, searchQuery, itemsPerPage]);

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return s.name.toLowerCase().includes(q) || String(s.roll).toLowerCase().includes(q);
            }
            return true;
        });
    }, [students, searchQuery]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = useMemo(() => filteredStudents.slice(startIndex, startIndex + itemsPerPage), [filteredStudents, startIndex, itemsPerPage]);
    const paginationRange = useMemo(() => getPaginationRange(totalPages, currentPage), [totalPages, currentPage]);

    const generateCsv = (type) => {
        if (filteredStudents.length === 0) {
            showToast('No students in the current filter to generate passes.', true);
            return;
        }
        const header = ['Student Name', 'Roll No.', 'Class', 'Section', "Father's Name", 'Contact'];
        const lines = filteredStudents.map((s) =>
            [s.name, s.roll, s.className, s.sectionName, s.father, s.contact]
                .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                .join(',')
        );
        const filename = type === 'id' ? 'id_cards_batch.csv' : 'gate_passes_batch.csv';
        const csvContent = [header.map((v) => `"${v}"`).join(','), ...lines].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`${filename} downloaded (${filteredStudents.length} records).`);
    };

    const AvatarCell = ({ student, size = 'md' }) => {
        const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-xs';
        return student.profileImageUrl ? (
            <img src={student.profileImageUrl} alt={student.name} className={`${dim} rounded-full object-cover shrink-0 border border-slate-200`} />
        ) : (
            <div className={`${dim} rounded-full text-white font-bold flex items-center justify-center shrink-0`} style={{ backgroundColor: getColorForId(student.id) }}>
                {getInitials(student.name)}
            </div>
        );
    };

    return (
        <>
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
                            {classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    </div>

                    <div className="relative flex-1 lg:w-36">
                        <select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} className={dropdownClass}>
                            <option value="all">All Sections</option>
                            {availableSections.map((sec) => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto lg:shrink-0">
                    <span className="px-3 py-2 rounded-lg bg-[#E4F3F1] text-blue-600 font-bold text-xs whitespace-nowrap text-center flex-1 lg:flex-none">
                        {filteredStudents.length} Students
                    </span>
                    <button onClick={() => generateCsv('id')} className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all whitespace-nowrap cursor-pointer shadow-2xs">
                        <Download className="w-3.5 h-3.5 text-slate-500" /> ID CSV
                    </button>
                    <button onClick={() => generateCsv('gate')} className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-[#0B2126] text-white transition-all whitespace-nowrap cursor-pointer shadow-2xs">
                        <Download className="w-3.5 h-3.5" /> Gate CSV
                    </button>
                </div>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden overflow-y-auto pb-2 flex-1">
                {loadingStudents ? (
                    <div className="col-span-full text-center py-10 text-slate-400 text-xs">Loading student records...</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-400 text-xs">No students found matching filters.</div>
                ) : (
                    paginatedStudents.map((s) => (
                        <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-3">
                            <div className="flex items-center gap-3">
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
                                <button onClick={() => onPreview(s, 'id')} className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer">
                                    <Eye className="w-3 h-3 text-blue-600" /> ID Card
                                </button>
                                <button onClick={() => onPreview(s, 'gate')} className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer">
                                    <Eye className="w-3 h-3 text-amber-600" /> Gate Pass
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:flex lg:flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden min-h-0">
                <div className="flex-1 overflow-auto">
                    <table className="w-full table-fixed text-xs">
                        <colgroup>
                            <col style={{ width: '22%' }} /><col style={{ width: '12%' }} /><col style={{ width: '18%' }} /><col style={{ width: '20%' }} /><col style={{ width: '14%' }} /><col style={{ width: '14%' }} />
                        </colgroup>
                        <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-3 py-2.5 text-left">Student</th>
                                <th className="px-3 py-2.5 text-left">Roll No.</th>
                                <th className="px-3 py-2.5 text-left">Class / Sec</th>
                                <th className="px-3 py-2.5 text-left">Father's Name</th>
                                <th className="px-3 py-2.5 text-left">Contact</th>
                                <th className="px-3 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {loadingStudents ? (
                                <tr><td colSpan="6" className="py-12 text-center text-slate-400">Loading student records...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="6" className="py-12 text-center text-slate-400">No students match current filters.</td></tr>
                            ) : (
                                paginatedStudents.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
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
                                        <td className="px-3 py-2 truncate">{s.father}</td>
                                        <td className="px-3 py-2 font-mono text-slate-600">{s.contact}</td>
                                        <td className="px-3 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => onPreview(s, 'id')} className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer">
                                                    <Eye className="w-3 h-3 text-blue-600" /> ID
                                                </button>
                                                <button onClick={() => onPreview(s, 'gate')} className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer">
                                                    <Eye className="w-3 h-3 text-amber-600" /> Gate
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="shrink-0 px-4 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                        <span>Showing <strong className="font-semibold text-slate-900">{filteredStudents.length === 0 ? 0 : startIndex + 1}</strong> to <strong className="font-semibold text-slate-900">{Math.min(startIndex + itemsPerPage, filteredStudents.length)}</strong> of <strong className="font-semibold text-slate-900">{filteredStudents.length}</strong></span>
                        <div className="flex items-center gap-1.5">
                            <span>Rows:</span>
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white font-medium">
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
        </>
    );
}