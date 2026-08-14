import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Eye, Printer, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const AVATAR_COLORS = ['#0F6E6E', '#C9781F', '#6A4FC9', '#C6433E', '#1F8A55', '#0F2A2E'];

const getInitials = (name) => name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : 'ST';
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
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedSectionId,
    setSelectedSectionId,
    availableSections,
    searchQuery,
    setSearchQuery,
    students,
    onPreview,
    onPrint,
    showToast
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [cycleSelected, setCycleSelected] = useState(new Set());

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

    const toggleCycleSelect = (id) => {
        setCycleSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAllCycle = () => {
        if (cycleSelected.size === filteredStudents.length) {
            setCycleSelected(new Set());
        } else {
            setCycleSelected(new Set(filteredStudents.map((s) => s.id)));
        }
    };

    const generateCsv = () => {
        const rows = students.filter((s) => cycleSelected.has(s.id));
        if (rows.length === 0) {
            showToast('Select at least one student to generate cycle passes.', true);
            return;
        }
        const header = ['Student Name', 'Roll No.', 'Class', 'Section', 'Cycle Reg. No.'];
        const lines = rows.map((s) =>
            [s.name, s.roll, s.className, s.sectionName, s.cycleReg]
                .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                .join(',')
        );
        const csvContent = [header.map((v) => `"${v}"`).join(','), ...lines].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cycle_passes_batch.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`cycle_passes_batch.csv downloaded (${rows.length} records).`);
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
                    <button disabled={cycleSelected.size === 0} onClick={generateCsv} className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all cursor-pointer shadow-2xs">
                        <Download className="w-3.5 h-3.5" /> Cycle CSV
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:flex lg:flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden min-h-0">
                <div className="flex-1 overflow-auto">
                    <table className="w-full table-fixed text-xs">
                        <colgroup>
                            <col style={{ width: '5%' }} /><col style={{ width: '25%' }} /><col style={{ width: '15%' }} /><col style={{ width: '22%' }} /><col style={{ width: '18%' }} /><col style={{ width: '15%' }} />
                        </colgroup>
                        <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-3 py-2.5">
                                    <input type="checkbox" checked={filteredStudents.length > 0 && cycleSelected.size === filteredStudents.length} onChange={toggleSelectAllCycle} className="rounded text-blue-600 focus:ring-blue-600 cursor-pointer" />
                                </th>
                                <th className="px-3 py-2.5 text-left">Student</th>
                                <th className="px-3 py-2.5 text-left">Roll No.</th>
                                <th className="px-3 py-2.5 text-left">Class / Sec</th>
                                <th className="px-3 py-2.5 text-left">Cycle Reg. No.</th>
                                <th className="px-3 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {filteredStudents.length === 0 ? (
                                <tr><td colSpan="6" className="py-12 text-center text-slate-400">No students found.</td></tr>
                            ) : (
                                paginatedStudents.map((s) => {
                                    const isChecked = cycleSelected.has(s.id);
                                    return (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-2">
                                                <input type="checkbox" checked={isChecked} onChange={() => toggleCycleSelect(s.id)} className="rounded text-blue-600 focus:ring-blue-600 cursor-pointer" />
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
                                                <span className="px-2 py-0.5 rounded-full bg-green-50 text-blue-600 font-bold text-[10.5px]">
                                                    {formatClassDisplay(s.className, s.sectionName)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 font-mono font-bold text-slate-700">{s.cycleReg}</td>
                                            <td className="px-3 py-2 text-right">
                                                {isChecked ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button onClick={() => onPreview(s, 'cycle')} className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer">
                                                            <Eye className="w-3 h-3 text-blue-600" /> View
                                                        </button>
                                                        <button onClick={() => onPrint(s, 'cycle')} className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer">
                                                            <Printer className="w-3 h-3 text-slate-600" /> Print
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Select checkbox</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="shrink-0 px-4 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500"><b className="text-slate-900">{cycleSelected.size}</b> student(s) selected</span>
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