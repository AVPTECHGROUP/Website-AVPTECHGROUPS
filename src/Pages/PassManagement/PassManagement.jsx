import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    CreditCard, Bike, Users, Search, Download, Printer, Plus, Eye,
    X, Check, AlertCircle, Clock, Shield, UserCheck, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { useClasses } from '../../ContextAPI/ClassContext';
import { getStudents, getStudentByClass, getStudentsBySection } from '../../Api/Students/StudentsApi';

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
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
        return [1, 2, '...', totalPages - 1, totalPages];
    }
    if (currentPage >= totalPages - 2) {
        return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

export default function PassManagement() {
    const { classes, loading: loadingClasses } = useClasses();

    // Active Tab State ('tab1' = ID/Gate Pass, 'tab2' = Cycle Pass, 'tab3' = Visitor Pass)
    const [activeTab, setActiveTab] = useState('tab1');

    // Filter States
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [selectedSectionId, setSelectedSectionId] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Selection state for Cycle Passes (Tab 2)
    const [cycleSelected, setCycleSelected] = useState(new Set());

    // Data States
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [visitors, setVisitors] = useState([
        {
            id: 1,
            name: 'Ramesh Verma',
            mobile: '9876543210',
            idType: 'Driving Licence',
            idNum: 'DL-908234',
            purpose: 'Meet Teacher',
            personMeet: 'Sunil Sharma',
            meetType: 'Teacher',
            classSecOrDept: 'Class 10 - A',
            date: new Date().toISOString().split('T')[0],
            entry: '10:15 AM',
            exit: '11:00 AM',
            vehicle: 'UP32 AB 4321',
            remarks: 'Submitted document bag at gate',
        },
    ]);

    // Modal and UI States
    const [previewModal, setPreviewModal] = useState({ open: false, data: null, type: null });
    const [visitorFormOpen, setVisitorFormOpen] = useState(false);
    const [visitorConfirmOpen, setVisitorConfirmOpen] = useState(false);
    const [pendingVisitor, setPendingVisitor] = useState(null);
    const [toast, setToast] = useState(null);

    // New Visitor Form State
    const [visitorForm, setVisitorForm] = useState({
        name: '',
        mobile: '',
        idType: 'Driving Licence',
        idNum: '',
        purpose: 'Meet Teacher',
        personMeet: '',
        meetType: 'student',
        classSec: '',
        dept: '',
        date: new Date().toISOString().split('T')[0],
        entry: '10:00',
        exit: '11:00',
        vehicle: '',
        remarks: '',
    });

    const printAreaRef = useRef(null);

    const showToast = (message, isWarn = false) => {
        setToast({ message, isWarn });
        setTimeout(() => setToast(null), 3600);
    };

    // Derive available sections based on selected class
    const availableSections = useMemo(() => {
        if (selectedClassId === 'all') return [];
        const targetClass = classes.find((c) => String(c.id) === String(selectedClassId));
        return targetClass?.sections || [];
    }, [classes, selectedClassId]);

    // Fetch Students strictly from API based on Class & Section selection
    useEffect(() => {
        const fetchStudentsData = async () => {
            setLoadingStudents(true);
            try {
                let responseData = [];

                if (selectedSectionId && selectedSectionId !== 'all') {
                    responseData = await getStudentsBySection(selectedSectionId);
                } else if (selectedClassId && selectedClassId !== 'all') {
                    responseData = await getStudentByClass(selectedClassId);
                } else {
                    const res = await getStudents(0, 4000);
                    responseData = Array.isArray(res) ? res : (res?.content || res?.data || []);
                }

                const rawList = Array.isArray(responseData)
                    ? responseData
                    : (responseData?.data || responseData?.content || []);

                const formattedList = rawList.map((st, idx) => {
                    const sId = st.id || idx + 1;
                    const fName = st.firstName || st.first_name || '';
                    const lName = st.lastName || st.last_name || '';
                    const fullName = st.fullName || (fName || lName ? `${fName} ${lName}`.trim() : `Student ${sId}`);

                    const currentClassObj = classes.find((c) => String(c.id) === String(st.classId || selectedClassId));
                    const currentSecObj = currentClassObj?.sections?.find((sec) => String(sec.id) === String(st.sectionId || selectedSectionId));

                    const cName = st.className || currentClassObj?.name || '—';
                    const secName = st.sectionName || currentSecObj?.name || '—';

                    const father = st.fatherName || 'N/A';
                    const contact = st.fatherPhone || st.motherPhone || 'N/A';
                    const profileImg = st.profileImageUrl || null;

                    return {
                        id: sId,
                        name: fullName,
                        roll: st.rollNumber || st.rollNo || st.roll || `STU-${sId}`,
                        classId: st.classId || selectedClassId,
                        className: cName,
                        sectionId: st.sectionId || selectedSectionId,
                        sectionName: secName,
                        father: father,
                        contact: contact,
                        cycleReg: st.cycleRegNo || st.cycleReg || `CYC-${1000 + sId}`,
                        cycleColor: st.cycleColor || ['Black', 'Red', 'Blue', 'Silver'][sId % 4],
                        profileImageUrl: profileImg,
                    };
                });

                setStudents(formattedList);
            } catch (err) {
                console.error("Error fetching students for pass management:", err);
                setStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudentsData();
    }, [selectedClassId, selectedSectionId, classes]);

    // Reset page when filter, tab or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedClassId, selectedSectionId, searchQuery, activeTab, itemsPerPage]);

    // Filter students by search input
    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return s.name.toLowerCase().includes(q) || String(s.roll).toLowerCase().includes(q);
            }
            return true;
        });
    }, [students, searchQuery]);

    // Filter visitors by search input
    const filteredVisitors = useMemo(() => {
        return visitors.filter((v) => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return v.name.toLowerCase().includes(q) || v.mobile.includes(q);
            }
            return true;
        });
    }, [visitors, searchQuery]);

    // Pagination calculations
    const totalPages = useMemo(() => {
        return Math.ceil(filteredStudents.length / itemsPerPage) || 1;
    }, [filteredStudents, itemsPerPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedStudents = useMemo(() => {
        return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStudents, startIndex, itemsPerPage]);

    const paginationRange = useMemo(() => {
        return getPaginationRange(totalPages, currentPage);
    }, [totalPages, currentPage]);

    // Checkbox handlers for Tab 2
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

    // CSV Batch Export
    const generateCsv = (type) => {
        let rows, filename, header, lines;
        if (type === 'id' || type === 'gate') {
            rows = filteredStudents;
            if (rows.length === 0) {
                showToast('No students in the current filter to generate passes.', true);
                return;
            }
            header = ['Student Name', 'Roll No.', 'Class', 'Section', "Father's Name", 'Contact'];
            lines = rows.map((s) =>
                [s.name, s.roll, s.className, s.sectionName, s.father, s.contact]
                    .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                    .join(',')
            );
            filename = type === 'id' ? 'id_cards_batch.csv' : 'gate_passes_batch.csv';
        } else {
            rows = students.filter((s) => cycleSelected.has(s.id));
            if (rows.length === 0) {
                showToast('Select at least one student to generate cycle passes.', true);
                return;
            }
            header = ['Student Name', 'Roll No.', 'Class', 'Section', 'Cycle Reg. No.'];
            lines = rows.map((s) =>
                [s.name, s.roll, s.className, s.sectionName, s.cycleReg]
                    .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                    .join(',')
            );
            filename = 'cycle_passes_batch.csv';
        }

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

        showToast(`${filename} downloaded (${rows.length} records).`);
    };

    // Visitor Submit
    const handleVisitorSubmit = (e) => {
        e.preventDefault();
        if (!visitorForm.name || !visitorForm.mobile) {
            showToast('Visitor name and mobile number are required.', true);
            return;
        }

        const newV = {
            id: visitors.length + 1,
            name: visitorForm.name,
            mobile: visitorForm.mobile,
            idType: visitorForm.idType,
            idNum: visitorForm.idNum || '—',
            purpose: visitorForm.purpose,
            personMeet: visitorForm.personMeet || '—',
            meetType: visitorForm.meetType === 'student' ? 'Student' : 'Employee',
            classSecOrDept: visitorForm.meetType === 'student' ? (visitorForm.classSec || '—') : (visitorForm.dept || '—'),
            date: visitorForm.date || new Date().toISOString().split('T')[0],
            entry: visitorForm.entry || '—',
            exit: visitorForm.exit || '—',
            vehicle: visitorForm.vehicle || '—',
            remarks: visitorForm.remarks || '—',
        };

        setVisitors([newV, ...visitors]);
        setPendingVisitor(newV);
        setVisitorFormOpen(false);
        setVisitorConfirmOpen(true);
    };

    // Print Execution
    const executePrint = (htmlContent) => {
        if (printAreaRef.current) {
            printAreaRef.current.innerHTML = `<div class="p-4 flex flex-wrap gap-4 justify-center">${htmlContent}</div>`;
            window.print();
        }
    };

    const renderCardHTML = (s, type) => {
        const photoElement = s.profileImageUrl
            ? `<img src="${s.profileImageUrl}" alt="${s.name}" class="w-18 h-22 rounded-lg object-cover border border-gray-200 shrink-0" />`
            : `<div class="w-18 h-22 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs shrink-0 font-medium">Photo</div>`;

        const classDisplay = formatClassDisplay(s.className, s.sectionName);

        if (type === 'id') {
            return `
        <div class="w-[300px] xs:w-[320px] sm:w-[360px] rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200 text-slate-800">
          <div class="p-3.5 bg-gradient-to-r from-blue-600 to-[#0B2126] text-white flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">SS</div>
            <div>
              <div class="font-bold text-sm leading-tight">SchoolSpine Public School</div>
              <div class="text-[10px] opacity-80">Lucknow, Uttar Pradesh</div>
            </div>
            <span class="ml-auto text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">Student ID</span>
          </div>
          <div class="p-4 flex gap-3">
            ${photoElement}
            <div class="flex-1 space-y-1 text-xs">
              <div class="font-bold text-base text-slate-900">${s.name}</div>
              <div><b class="text-slate-700">Roll No:</b> ${s.roll}</div>
              <div><b class="text-slate-700">Class:</b> ${classDisplay}</div>
              <div><b class="text-slate-700">Father:</b> ${s.father}</div>
              <div><b class="text-slate-700">Contact:</b> ${s.contact}</div>
            </div>
          </div>
          <div class="px-4 py-2 bg-gray-50 border-t border-dashed border-gray-200 flex justify-between text-[10px] text-blue-600 font-semibold">
            <span>Session 2026-27</span>
            <span>Valid till Mar 2027</span>
          </div>
        </div>`;
        }
        if (type === 'gate') {
            return `
        <div class="w-[300px] xs:w-[320px] sm:w-[380px] rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200 text-slate-800">
          <div class="p-3.5 bg-gradient-to-r from-[#C9781F] to-[#8a4f10] text-white flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">SS</div>
            <div>
              <div class="font-bold text-sm leading-tight">SchoolSpine Public School</div>
              <div class="text-[10px] opacity-80">Gate Exit Pass</div>
            </div>
            <span class="ml-auto text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">Gate Pass</span>
          </div>
          <div class="p-4 flex gap-3">
            ${photoElement}
            <div class="flex-1 space-y-1 text-xs">
              <div class="font-bold text-base text-slate-900">${s.name}</div>
              <div><b class="text-slate-700">Roll No:</b> ${s.roll}</div>
              <div><b class="text-slate-700">Class:</b> ${classDisplay}</div>
              <div><b class="text-slate-700">Pass No:</b> GP-${s.id + 2000}</div>
              <div><b class="text-slate-700">Purpose:</b> Early Departure</div>
            </div>
          </div>
          <div class="px-4 py-2 bg-gray-50 border-t border-dashed border-gray-200 flex justify-between text-[10px] text-[#C9781F] font-semibold">
            <span>Front Office Copy</span>
            <span>Valid for today only</span>
          </div>
        </div>`;
        }
        if (type === 'cycle') {
            return `
        <div class="w-[300px] xs:w-[320px] sm:w-[380px] rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200 text-slate-800">
          <div class="p-3.5 bg-gradient-to-r from-blue-600 to-[#0f5c39] text-white flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">SS</div>
            <div>
              <div class="font-bold text-sm leading-tight">SchoolSpine Public School</div>
              <div class="text-[10px] opacity-80">Bicycle Parking Pass</div>
            </div>
            <span class="ml-auto text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">Cycle Pass</span>
          </div>
          <div class="p-4 flex gap-3">
            ${photoElement}
            <div class="flex-1 space-y-1.5 text-xs">
              <div class="font-bold text-base text-slate-900">${s.name}</div>
              <div><b class="text-slate-700">Roll No:</b> ${s.roll}</div>
              <div><b class="text-slate-700">Class:</b> ${classDisplay}</div>
              <div class="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold text-[11px]">🚲 ${s.cycleReg || 'CYC-101'}</div>
            </div>
          </div>
          <div class="px-4 py-2 bg-gray-50 border-t border-dashed border-gray-200 flex justify-between text-[10px] text-blue-600 font-semibold">
            <span>Session 2026-27</span>
            <span>Stand B Parking</span>
          </div>
        </div>`;
        }
        if (type === 'visitor') {
            return `
        <div class="w-[300px] xs:w-[320px] sm:w-[400px] rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200 text-slate-800 relative">
          <div class="p-3.5 bg-gradient-to-r from-[#6A4FC9] to-[#3d2b82] text-white flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">SS</div>
            <div>
              <div class="font-bold text-sm leading-tight">SchoolSpine Public School</div>
              <div class="text-[10px] opacity-80">Visitor Gate Pass</div>
            </div>
            <span class="ml-auto text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">Visitor</span>
          </div>
          <div class="p-4 space-y-2 text-xs">
            <div class="font-bold text-lg text-slate-900">${s.name}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><b class="text-slate-600">Mobile:</b> ${s.mobile}</div>
              <div><b class="text-slate-600">ID Proof:</b> ${s.idType} (${s.idNum})</div>
              <div><b class="text-slate-600">Meeting:</b> ${s.personMeet}</div>
              <div><b class="text-slate-600">Purpose:</b> ${s.purpose}</div>
              <div><b class="text-slate-600">Date:</b> ${s.date}</div>
              <div><b class="text-slate-600">Timing:</b> ${s.entry} - ${s.exit}</div>
            </div>
          </div>
          <div class="px-4 py-2 bg-gray-50 border-t border-dashed border-gray-200 flex justify-between text-[10px] text-[#6A4FC9] font-semibold">
            <span>Security Gate Copy</span>
            <span>Valid for date of visit only</span>
          </div>
        </div>`;
        }
    };

    const dropdownClass = `
        appearance-none cursor-pointer
        pl-3 pr-7 py-2
        rounded-lg border border-slate-200 bg-slate-100
        text-xs text-slate-700 font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-600/30
        hover:border-slate-300 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        w-full
    `;

    // Avatar render component
    const AvatarCell = ({ student, size = 'md' }) => {
        const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-xs';
        return student.profileImageUrl ? (
            <img
                src={student.profileImageUrl}
                alt={student.name}
                className={`${dim} rounded-full object-cover shrink-0 border border-slate-200`}
            />
        ) : (
            <div
                className={`${dim} rounded-full text-white font-bold flex items-center justify-center shrink-0`}
                style={{ backgroundColor: getColorForId(student.id) }}
            >
                {getInitials(student.name)}
            </div>
        );
    };

    // Render Pagination Controls
    const renderPaginationButtons = () => {
        return (
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-7 h-7 rounded hover:bg-slate-100 text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {paginationRange.map((page, idx) => {
                    if (page === '...') {
                        return (
                            <span key={`dots-${idx}`} className="w-6 h-7 flex items-center justify-center text-slate-400 text-xs select-none">
                                ...
                            </span>
                        );
                    }
                    const isActive = page === currentPage;
                    return (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[28px] h-7 px-1.5 rounded text-xs font-medium transition-all cursor-pointer ${isActive ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-7 h-7 rounded hover:bg-slate-100 text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-b from-teal-50/40 to-slate-100/60 text-slate-900 font-sans">
            <div className="flex flex-col flex-1 lg:overflow-hidden p-3 sm:p-4 gap-3 min-h-0 w-full max-w-[1600px] mx-auto">

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-[#0B2126] text-white shadow-2xl border border-slate-700 animate-slide-up text-xs max-w-[90vw]">
                        <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${toast.isWarn ? 'text-amber-400' : 'text-[#C9A227]'}`} />
                        <span className="font-medium">{toast.message}</span>
                    </div>
                )}

                {/* Header Title */}
                <div className="shrink-0">
                  
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0B2126] tracking-tight">
                        Pass & ID Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-3xl">
                        Filter students by class & section to generate ID cards, gate passes, and cycle passes in bulk, and log visitor entries with printable passes.
                    </p>
                </div>

                {/* Tabs Selector Bar */}
                <div className="flex flex-wrap sm:flex-nowrap p-1 bg-[#EAEEED] rounded-xl gap-1 shrink-0 border border-slate-200">
                    <button
                        onClick={() => setActiveTab('tab1')}
                        className={`flex-1 min-w-[130px] sm:min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'tab1' ? 'bg-white text-[#0B2126] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="whitespace-nowrap truncate">Student ID & Gate Pass</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tab2')}
                        className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'tab2' ? 'bg-white text-[#0B2126] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Bike className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="whitespace-nowrap truncate">Cycle Pass</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tab3')}
                        className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'tab3' ? 'bg-white text-[#0B2126] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Users className="w-3.5 h-3.5 text-[#6A4FC9] shrink-0" />
                        <span className="whitespace-nowrap truncate">Visitor's Pass</span>
                    </button>
                </div>

                {/* ── TAB 1: STUDENT ID & GATE PASS ── */}
                {activeTab === 'tab1' && (
                    <>
                        {/* Control & Filter Bar */}
                        <div className="bg-white flex flex-col lg:flex-row lg:items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 shrink-0 w-full shadow-xs">
                            {/* Search Input */}
                            <div className="w-full lg:flex-1 lg:min-w-0 flex items-center gap-2 border border-slate-200 rounded-lg bg-slate-100 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
                                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search student name or roll no..."
                                    className="text-xs focus:outline-none text-slate-700 w-full bg-transparent placeholder:text-slate-400 font-medium"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="w-4 h-4 rounded-full bg-slate-300 hover:bg-slate-400 flex items-center justify-center shrink-0 text-slate-600 text-xs font-bold"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            {/* Dropdowns */}
                            <div className="flex items-center gap-2 w-full lg:w-auto lg:shrink-0">
                                <div className="relative flex-1 lg:w-36">
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => {
                                            setSelectedClassId(e.target.value);
                                            setSelectedSectionId('all');
                                        }}
                                        className={dropdownClass}
                                    >
                                        <option value="all">All Classes</option>
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                </div>

                                <div className="relative flex-1 lg:w-36">
                                    <select
                                        value={selectedSectionId}
                                        onChange={(e) => setSelectedSectionId(e.target.value)}
                                        className={dropdownClass}
                                    >
                                        <option value="all">All Sections</option>
                                        {availableSections.map((sec) => (
                                            <option key={sec.id} value={sec.id}>{sec.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </div>

                            {/* Actions & Counter */}
                            <div className="flex items-center gap-2 w-full lg:w-auto lg:shrink-0">
                                <span className="px-3 py-2 rounded-lg bg-[#E4F3F1] text-blue-600 font-bold text-xs whitespace-nowrap text-center flex-1 lg:flex-none">
                                    {filteredStudents.length} Students
                                </span>

                                <button
                                    onClick={() => generateCsv('id')}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all whitespace-nowrap cursor-pointer shadow-2xs"
                                >
                                    <Download className="w-3.5 h-3.5 text-slate-500" />
                                    ID CSV
                                </button>

                                <button
                                    onClick={() => generateCsv('gate')}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-[#0B2126] text-white transition-all whitespace-nowrap cursor-pointer shadow-2xs"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Gate CSV
                                </button>
                            </div>
                        </div>

                        {/* MOBILE / TABLET CARDS VIEW (<1024px) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden overflow-y-auto pb-2 flex-1">
                            {loadingStudents || loadingClasses ? (
                                <div className="col-span-full text-center py-10 text-slate-400 text-xs">
                                    Loading student records...
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-slate-400 text-xs">
                                    No students found matching the selected filters.
                                </div>
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

                                        <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 text-[11px]">Father:</span>
                                                <span className="font-medium truncate">{s.father}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 text-[11px]">Contact:</span>
                                                <span className="font-mono text-slate-700">{s.contact}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                            <button
                                                onClick={() => setPreviewModal({ open: true, data: s, type: 'id' })}
                                                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer"
                                            >
                                                <Eye className="w-3 h-3 text-blue-600" /> ID Card
                                            </button>
                                            <button
                                                onClick={() => setPreviewModal({ open: true, data: s, type: 'gate' })}
                                                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer"
                                            >
                                                <Eye className="w-3 h-3 text-amber-600" /> Gate Pass
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* DESKTOP TABLE VIEW (>=1024px) */}
                        <div className="hidden lg:flex lg:flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden min-h-0">
                            <div className="flex-1 overflow-auto">
                                <table className="w-full table-fixed text-xs">
                                    <colgroup>
                                        <col style={{ width: '22%' }} />
                                        <col style={{ width: '12%' }} />
                                        <col style={{ width: '18%' }} />
                                        <col style={{ width: '20%' }} />
                                        <col style={{ width: '14%' }} />
                                        <col style={{ width: '14%' }} />
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
                                        {loadingStudents || loadingClasses ? (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-slate-400">Loading student records...</td>
                                            </tr>
                                        ) : filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-slate-400">No students match current filters.</td>
                                            </tr>
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
                                                            <button
                                                                onClick={() => setPreviewModal({ open: true, data: s, type: 'id' })}
                                                                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <Eye className="w-3 h-3 text-blue-600" /> ID
                                                            </button>
                                                            <button
                                                                onClick={() => setPreviewModal({ open: true, data: s, type: 'gate' })}
                                                                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                            >
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

                            {/* Desktop Pagination Footer */}
                            <div className="shrink-0 px-4 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <span>
                                        Showing <strong className="font-semibold text-slate-900">{filteredStudents.length === 0 ? 0 : startIndex + 1}</strong> to{' '}
                                        <strong className="font-semibold text-slate-900">{Math.min(startIndex + itemsPerPage, filteredStudents.length)}</strong> of{' '}
                                        <strong className="font-semibold text-slate-900">{filteredStudents.length}</strong>
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span>Rows:</span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                            className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white font-medium"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>
                                {renderPaginationButtons()}
                            </div>
                        </div>

                        {/* MOBILE PAGINATION FOOTER (<1024px) */}
                        <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-3 shrink-0 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Showing {filteredStudents.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length}</span>
                                <div className="flex items-center gap-1">
                                    <span>Rows:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="px-1.5 py-0.5 border border-slate-200 rounded text-xs bg-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                {renderPaginationButtons()}
                            </div>
                        </div>
                    </>
                )}

                {/* ── TAB 2: CYCLE PASS ── */}
                {activeTab === 'tab2' && (
                    <>
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
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => {
                                            setSelectedClassId(e.target.value);
                                            setSelectedSectionId('all');
                                        }}
                                        className={dropdownClass}
                                    >
                                        <option value="all">All Classes</option>
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                </div>

                                <div className="relative flex-1 lg:w-36">
                                    <select
                                        value={selectedSectionId}
                                        onChange={(e) => setSelectedSectionId(e.target.value)}
                                        className={dropdownClass}
                                    >
                                        <option value="all">All Sections</option>
                                        {availableSections.map((sec) => (
                                            <option key={sec.id} value={sec.id}>{sec.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full lg:w-auto lg:shrink-0">
                                {/* <button
                                    disabled={cycleSelected.size === 0}
                                    onClick={() => {
                                        const selectedList = students.filter((s) => cycleSelected.has(s.id));
                                        const html = selectedList.map((s) => renderCardHTML(s, 'cycle')).join('');
                                        executePrint(html);
                                    }}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                                    Print ({cycleSelected.size})
                                </button> */}

                                <button
                                    disabled={cycleSelected.size === 0}
                                    onClick={() => generateCsv('cycle')}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Cycle CSV
                                </button>
                            </div>
                        </div>

                        {/* MOBILE / TABLET CARDS VIEW (<1024px) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden overflow-y-auto pb-2 flex-1">
                            {filteredStudents.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-slate-400 text-xs">No students found.</div>
                            ) : (
                                paginatedStudents.map((s) => {
                                    const isChecked = cycleSelected.has(s.id);
                                    return (
                                        <div key={s.id} className={`bg-white border rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-3 ${isChecked ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleCycleSelect(s.id)}
                                                    className="rounded text-blue-600 focus:ring-blue-600 cursor-pointer"
                                                />
                                                <AvatarCell student={s} size="md" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-slate-900 text-xs truncate">{s.name}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">{s.roll}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400 text-[11px]">Class:</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-blue-600 font-bold text-[10px]">{formatClassDisplay(s.className, s.sectionName)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400 text-[11px]">Cycle Reg:</span>
                                                    <span className="font-mono text-slate-800 font-bold">{s.cycleReg}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                                <button
                                                    onClick={() => setPreviewModal({ open: true, data: s, type: 'cycle' })}
                                                    className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer"
                                                >
                                                    <Eye className="w-3 h-3 text-blue-600" /> View
                                                </button>
                                                <button
                                                    onClick={() => executePrint(renderCardHTML(s, 'cycle'))}
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

                        {/* DESKTOP TABLE VIEW (>=1024px) */}
                        <div className="hidden lg:flex lg:flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden min-h-0">
                            <div className="flex-1 overflow-auto">
                                <table className="w-full table-fixed text-xs">
                                    <colgroup>
                                        <col style={{ width: '5%' }} />
                                        <col style={{ width: '25%' }} />
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '22%' }} />
                                        <col style={{ width: '18%' }} />
                                        <col style={{ width: '15%' }} />
                                    </colgroup>

                                    <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <tr>
                                            <th className="px-3 py-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={filteredStudents.length > 0 && cycleSelected.size === filteredStudents.length}
                                                    onChange={toggleSelectAllCycle}
                                                    className="rounded text-blue-600 focus:ring-blue-600 cursor-pointer"
                                                />
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
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-slate-400">No students found.</td>
                                            </tr>
                                        ) : (
                                            paginatedStudents.map((s) => {
                                                const isChecked = cycleSelected.has(s.id);
                                                return (
                                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleCycleSelect(s.id)}
                                                                className="rounded text-blue-600 focus:ring-blue-600 cursor-pointer"
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
                                                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-blue-600 font-bold text-[10.5px]">
                                                                {formatClassDisplay(s.className, s.sectionName)}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 font-mono font-bold text-slate-700">{s.cycleReg}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            {isChecked ? (
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button
                                                                        onClick={() => setPreviewModal({ open: true, data: s, type: 'cycle' })}
                                                                        className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                                    >
                                                                        <Eye className="w-3 h-3 text-blue-600" /> View
                                                                    </button>
                                                                    <button
                                                                        onClick={() => executePrint(renderCardHTML(s, 'cycle'))}
                                                                        className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                                    >
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
                                <span className="text-slate-500">
                                    <b className="text-slate-900">{cycleSelected.size}</b> student(s) selected
                                </span>
                                {renderPaginationButtons()}
                            </div>
                        </div>

                        {/* MOBILE PAGINATION FOOTER (<1024px) */}
                        <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-3 shrink-0 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span><b className="text-slate-900">{cycleSelected.size}</b> selected</span>
                                <span>Page {currentPage} of {totalPages}</span>
                            </div>
                            <div className="flex justify-center">
                                {renderPaginationButtons()}
                            </div>
                        </div>
                    </>
                )}

                {/* ── TAB 3: VISITOR'S PASS ── */}
                {activeTab === 'tab3' && (
                    <>
                        <div className="bg-white flex flex-col sm:flex-row items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 shrink-0 w-full shadow-xs">
                            <div className="w-full flex-1 min-w-0 flex items-center gap-2 border border-slate-200 rounded-lg bg-slate-100 px-3 py-2 focus-within:ring-2 focus-within:ring-[#6A4FC9]/30 transition-all">
                                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search visitor name or mobile..."
                                    className="text-xs focus:outline-none text-slate-700 w-full bg-transparent placeholder:text-slate-400 font-medium"
                                />
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                                <span className="px-3 py-2 rounded-lg bg-[#FBF3DA] text-[#8A6B0F] font-bold text-xs whitespace-nowrap">
                                    {visitors.length} Visitors
                                </span>

                                <button
                                    onClick={() => setVisitorFormOpen(true)}
                                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C9A227] hover:bg-[#b4901f] text-[#0B2126] font-bold text-xs transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Visitor
                                </button>
                            </div>
                        </div>

                        {/* MOBILE / TABLET CARDS VIEW (<1024px) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden overflow-y-auto pb-2 flex-1">
                            {filteredVisitors.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-slate-400 text-xs">No visitors logged yet.</div>
                            ) : (
                                filteredVisitors.map((v) => (
                                    <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: getColorForId(v.id + 2) }}
                                            >
                                                {getInitials(v.name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-slate-900 text-xs truncate">{v.name}</p>
                                                <p className="text-[10px] font-mono text-slate-400">{v.mobile}</p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-violet-50 text-[#6A4FC9] font-bold text-[10px] shrink-0">
                                                {v.purpose}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 text-[11px]">Meeting:</span>
                                                <span className="font-medium truncate">{v.personMeet} ({v.meetType})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 text-[11px]">Entry:</span>
                                                <span className="font-mono text-slate-700">{v.date} · {v.entry}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                            <button
                                                onClick={() => setPreviewModal({ open: true, data: v, type: 'visitor' })}
                                                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer"
                                            >
                                                <Eye className="w-3 h-3 text-[#6A4FC9]" /> View
                                            </button>
                                            <button
                                                onClick={() => executePrint(renderCardHTML(v, 'visitor'))}
                                                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer"
                                            >
                                                <Printer className="w-3 h-3 text-slate-600" /> Print
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* DESKTOP TABLE VIEW (>=1024px) */}
                        <div className="hidden lg:flex lg:flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden min-h-0">
                            <div className="flex-1 overflow-auto">
                                <table className="w-full table-fixed text-xs">
                                    <colgroup>
                                        <col style={{ width: '22%' }} />
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '18%' }} />
                                        <col style={{ width: '20%' }} />
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '10%' }} />
                                    </colgroup>

                                    <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <tr>
                                            <th className="px-3 py-2.5 text-left">Visitor</th>
                                            <th className="px-3 py-2.5 text-left">Mobile</th>
                                            <th className="px-3 py-2.5 text-left">Purpose</th>
                                            <th className="px-3 py-2.5 text-left">Meeting</th>
                                            <th className="px-3 py-2.5 text-left">Date / Entry</th>
                                            <th className="px-3 py-2.5 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                        {filteredVisitors.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-slate-400">No visitors logged yet.</td>
                                            </tr>
                                        ) : (
                                            filteredVisitors.map((v) => (
                                                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-3 py-2">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div
                                                                className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                                                                style={{ backgroundColor: getColorForId(v.id + 2) }}
                                                            >
                                                                {getInitials(v.name)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-900 truncate leading-snug">{v.name}</p>
                                                                <p className="text-[10px] text-slate-400 truncate">{v.idType}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 font-mono">{v.mobile}</td>
                                                    <td className="px-3 py-2">
                                                        <span className="px-2 py-0.5 rounded-full bg-violet-50 text-[#6A4FC9] font-bold text-[10.5px]">
                                                            {v.purpose}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 truncate">{v.personMeet} <span className="text-[10px] text-slate-400">({v.meetType})</span></td>
                                                    <td className="px-3 py-2 whitespace-nowrap">{v.date} <span className="text-[10px] text-slate-400">· {v.entry}</span></td>
                                                    <td className="px-3 py-2 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => setPreviewModal({ open: true, data: v, type: 'visitor' })}
                                                                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <Eye className="w-3 h-3 text-[#6A4FC9]" /> View
                                                            </button>
                                                            <button
                                                                onClick={() => executePrint(renderCardHTML(v, 'visitor'))}
                                                                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <Printer className="w-3 h-3 text-slate-600" /> Print
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

            </div>

            {/* MODAL: PASS PREVIEW */}
            {previewModal.open && (
                <div className="fixed inset-0 z-50 bg-[#0B2126]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
                        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Pass Preview</h3>
                                <p className="text-[10.5px] text-slate-400">Printable template mockup</p>
                            </div>
                            <button onClick={() => setPreviewModal({ open: false, data: null, type: null })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 flex justify-center bg-slate-50 overflow-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderCardHTML(previewModal.data, previewModal.type) }} />
                        </div>
                        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 shrink-0">
                            <button onClick={() => setPreviewModal({ open: false, data: null, type: null })} className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
                                Close
                            </button>
                            <button onClick={() => executePrint(renderCardHTML(previewModal.data, previewModal.type))} className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-[#0B2126] inline-flex items-center gap-1.5 cursor-pointer">
                                <Printer className="w-3.5 h-3.5" /> Print Pass
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: NEW VISITOR FORM */}
            {visitorFormOpen && (
                <div className="fixed inset-0 z-50 bg-[#0B2126]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">New Visitor Entry</h3>
                                <p className="text-[10.5px] text-slate-400">Log entry details to issue a visitor gate pass</p>
                            </div>
                            <button onClick={() => setVisitorFormOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleVisitorSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
                            <div className="space-y-2.5">
                                <div className="font-bold text-blue-600 uppercase tracking-wider text-[10.5px] border-b border-dashed border-slate-200 pb-1 flex items-center gap-1">
                                    <UserCheck className="w-3.5 h-3.5" /> Visitor Information
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Visitor Name <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={visitorForm.name}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                                            placeholder="e.g. Mahesh Kumar"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="tel"
                                            value={visitorForm.mobile}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, mobile: e.target.value })}
                                            placeholder="10-digit mobile"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">ID Proof Type</label>
                                        <select
                                            value={visitorForm.idType}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, idType: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer"
                                        >
                                            <option>Driving Licence</option>
                                            <option>Voter ID</option>
                                            <option>PAN Card</option>
                                            <option>Passport</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">ID Proof Number</label>
                                        <input
                                            type="text"
                                            value={visitorForm.idNum}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, idNum: e.target.value })}
                                            placeholder="ID document number"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="font-bold text-blue-600 uppercase tracking-wider text-[10.5px] border-b border-dashed border-slate-200 pb-1 flex items-center gap-1">
                                    <Shield className="w-3.5 h-3.5" /> Visit Details
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                                        <select
                                            value={visitorForm.purpose}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer"
                                        >
                                            <option>Meet Teacher</option>
                                            <option>Meet Student</option>
                                            <option>Admission Enquiry</option>
                                            <option>Fee Related</option>
                                            <option>Vendor / Delivery</option>
                                            <option>Official Meeting</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Person to Meet</label>
                                        <input
                                            type="text"
                                            value={visitorForm.personMeet}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, personMeet: e.target.value })}
                                            placeholder="Name of staff / teacher"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 flex items-center gap-4 py-1">
                                        <span className="font-semibold text-slate-700">Visitor is meeting a:</span>
                                        <label className="inline-flex items-center gap-1.5 font-medium cursor-pointer">
                                            <input
                                                type="radio"
                                                name="meetType"
                                                value="student"
                                                checked={visitorForm.meetType === 'student'}
                                                onChange={() => setVisitorForm({ ...visitorForm, meetType: 'student' })}
                                                className="text-blue-600"
                                            /> Student
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 font-medium cursor-pointer">
                                            <input
                                                type="radio"
                                                name="meetType"
                                                value="employee"
                                                checked={visitorForm.meetType === 'employee'}
                                                onChange={() => setVisitorForm({ ...visitorForm, meetType: 'employee' })}
                                                className="text-blue-600"
                                            /> Employee
                                        </label>
                                    </div>

                                    {visitorForm.meetType === 'student' ? (
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Class / Section</label>
                                            <input
                                                type="text"
                                                value={visitorForm.classSec}
                                                onChange={(e) => setVisitorForm({ ...visitorForm, classSec: e.target.value })}
                                                placeholder="e.g. 10 - A"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Department</label>
                                            <input
                                                type="text"
                                                value={visitorForm.dept}
                                                onChange={(e) => setVisitorForm({ ...visitorForm, dept: e.target.value })}
                                                placeholder="e.g. Accounts"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Vehicle Number</label>
                                        <input
                                            type="text"
                                            value={visitorForm.vehicle}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, vehicle: e.target.value })}
                                            placeholder="e.g. UP32 AB 1234"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="font-bold text-blue-600 uppercase tracking-wider text-[10.5px] border-b border-dashed border-slate-200 pb-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> Date & Time
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={visitorForm.date}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, date: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Entry Time</label>
                                        <input
                                            type="time"
                                            value={visitorForm.entry}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, entry: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Expected Exit</label>
                                        <input
                                            type="time"
                                            value={visitorForm.exit}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, exit: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Remarks / Items Carried</label>
                                <textarea
                                    rows="2"
                                    value={visitorForm.remarks}
                                    onChange={(e) => setVisitorForm({ ...visitorForm, remarks: e.target.value })}
                                    placeholder="e.g. Carrying laptop bag"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setVisitorFormOpen(false)}
                                    className="px-4 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#b4901f] text-[#0B2126] font-bold shadow-2xs cursor-pointer"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: VISITOR CONFIRMATION & PRINT */}
            {visitorConfirmOpen && pendingVisitor && (
                <div className="fixed inset-0 z-50 bg-[#0B2126]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center space-y-3 shadow-2xl border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Visitor Added</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {pendingVisitor.name} has been logged in the visitor register. Print pass now?
                            </p>
                        </div>
                        <div className="flex justify-center gap-2.5 pt-1">
                            <button
                                onClick={() => {
                                    setVisitorConfirmOpen(false);
                                    showToast(`${pendingVisitor.name} added to visitor register.`);
                                    setPendingVisitor(null);
                                }}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => {
                                    executePrint(renderCardHTML(pendingVisitor, 'visitor'));
                                    setVisitorConfirmOpen(false);
                                    showToast(`Visitor pass printed for ${pendingVisitor.name}`);
                                    setPendingVisitor(null);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#b4901f] font-bold text-xs text-[#0B2126] inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print Pass
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print Container */}
            <div className="hidden print:block" ref={printAreaRef} />
        </div>
    );
}