import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    ChevronLeft,
    UserRoundXIcon,
    SearchIcon,
    UsersIcon,
    UserPenIcon,
    UserSearch,
    UserPlus,
    Info,
    ChevronDown,
    Upload,
} from 'lucide-react';
import { toast } from 'react-toastify';
import CardComponent from '../../Components/CommonComp/CardComponent';
import { getStudents, searchStudents } from '../../Api/StudentsApi';
import { getAllSections } from '../../Api/TeachersAPI';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ListLoader from '../../Components/CommonComp/ListLoader';
import TooltipComponent from '../../Components/CommonComp/Tooltip_comp/TooltipComp';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS as P } from '../../Constants/Permission';

const Student = () => {
    const { hasPermission } = useAuth();
    const [error, setError] = useState(null);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noUserFound, setNoUserFound] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debounceTimer = useRef(null);

    const [groupedSections, setGroupedSections] = useState([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchSections = async () => {
            setSectionsLoading(true);
            try {
                const res = await getAllSections();
                if (res?.success && Array.isArray(res.data)) {
                    const map = new Map();
                    res.data.forEach((sec) => {
                        const key = sec.classId;
                        if (!map.has(key)) {
                            map.set(key, {
                                classId: sec.classId,
                                className: sec.className || `Class ${sec.classId}`,
                                sections: [],
                            });
                        }
                        map.get(key).sections.push({ id: sec.id, name: sec.name });
                    });
                    setGroupedSections(Array.from(map.values()));
                }
            } catch (err) {
                console.error('Failed to fetch sections:', err);
            } finally {
                setSectionsLoading(false);
            }
        };
        fetchSections();
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 500);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setDebouncedSearch('');
        setPage(1);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };

    const handleSectionChange = (e) => {
        setSelectedSectionId(e.target.value);
        setPage(1);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                const hasFilters =
                    debouncedSearch.trim() !== '' ||
                    selectedSectionId !== '' ||
                    statusFilter !== '';

                let res;
                if (hasFilters) {
                    const filters = {
                        ...(debouncedSearch.trim() && { searchTerm: debouncedSearch.trim() }),
                        ...(selectedSectionId && { sectionId: Number(selectedSectionId) }),
                        ...(statusFilter && { status: statusFilter }),
                    };
                    res = await searchStudents(filters, page - 1, rowsPerPage, ['id']);
                } else {
                    res = await getStudents(page - 1, rowsPerPage, 'id');
                }

                const list = res?.data || [];
                if (list.length === 0) {
                    setStudents([]);
                    setNoUserFound(true);
                } else {
                    setNoUserFound(false);
                    setStudents(
                        list.map((stu) => ({
                            id: stu.id,
                            avatar: (stu.fullName || 'U')[0].toUpperCase(),
                            image:
                                stu.profileImageUrl ||
                                stu.imageUrl ||
                                stu.profileImage ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(stu.fullName)}&background=random`,
                            name: stu.fullName || `${stu.firstName} ${stu.lastName}`,
                            admissionNumber: stu.admissionNumber,
                            mobile: stu.personalDetails?.mobile || 'N/A',
                            email: stu.personalDetails?.email || 'N/A',
                            status: stu.status,
                            className: stu.className || '',
                            sectionName: stu.sectionName || '',
                        }))
                    );
                }
                setTotalElements(res.pagination?.totalElements || 0);
                setTotalPages(res.pagination?.totalPages || 0);
            } catch (err) {
                setError(err.message || 'Failed to load students');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [page, rowsPerPage, debouncedSearch, selectedSectionId, statusFilter]);

    const getAvatarColor = (name) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500',
            'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500',
        ];
        return colors[name?.charCodeAt(0) % colors.length || 0];
    };

    const renderPageButtons = () => {
        if (totalPages <= 1) return null;
        const base = 'min-w-[28px] h-7 px-1.5 rounded text-xs transition-all font-medium';
        const active = 'bg-blue-500 text-white';
        const inactive = 'text-gray-600 hover:bg-gray-100';
        const dots = (key) => (
            <span key={key} className="min-w-[28px] h-7 flex items-center justify-center text-gray-400 text-xs select-none">…</span>
        );
        const btn = (num) => (
            <button key={num} onClick={() => setPage(num)} className={`${base} ${page === num ? active : inactive}`}>
                {num}
            </button>
        );
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => btn(i + 1));
        const items = [];
        items.push(btn(1));
        const left = page - 1;
        const right = page + 1;
        if (left > 2) items.push(dots('dl'));
        else if (left === 2) items.push(btn(2));
        for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) items.push(btn(i));
        if (right < totalPages - 1) items.push(dots('dr'));
        else if (right === totalPages - 1) items.push(btn(totalPages - 1));
        items.push(btn(totalPages));
        return items;
    };

    const PrevBtn = () => (
        <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading || !!error}
            className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 text-gray-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <ChevronLeft className="w-4 h-4" />
        </button>
    );

    const NextBtn = () => (
        <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading || !!error}
            className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 text-gray-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <ChevronRight className="w-4 h-4" />
        </button>
    );

    const cardsArray = [
        {
            IconName: UsersIcon,
            keyName: 'Total Students',
            val: totalElements,
            iconTxColor: 'text-blue-600',
            iconBgColor: 'bg-blue-50',
        },
    ];

    const dropdownClass = `
        appearance-none cursor-pointer
        pl-3 pr-7 py-2
        rounded-lg border border-gray-200 bg-gray-100
        text-xs text-gray-600 font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-300
        hover:border-gray-300 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        w-full
    `;

    const AvatarCell = ({ student, size = 'md' }) => {
        const [imgError, setImgError] = useState(false);
        const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
        return imgError || !student.image ? (
            <div className={`${dim} rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white font-semibold shrink-0`}>
                {student.avatar}
            </div>
        ) : (
            <img
                src={student.image}
                alt={student.name}
                className={`${dim} rounded-full object-cover shrink-0`}
                onError={() => setImgError(true)}
            />
        );
    };

    // ── CSV EXPORT ──────────────────────────────────────────────────────────────
    const csvCell = (val) => {
        const str = val == null ? '' : String(val).trim();
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const handleExportStudentsCSV = () => {
        if (students.length === 0) {
            toast.info('No students on this page to export.');
            return;
        }
        const HEADERS = ['Student Name', 'Admission Number', 'Mobile Number', 'Email', 'Class', 'Section', 'Status'];
        const dataRows = students.map((s) => [
            csvCell(s.name || 'Unknown'),
            csvCell(s.admissionNumber || 'N/A'),
            csvCell(s.mobile || 'N/A'),
            csvCell(s.email || 'N/A'),
            csvCell(s.className || 'N/A'),
            csvCell(s.sectionName || 'N/A'),
            csvCell(s.status || 'N/A'),
        ].join(','));
        const csvString = [HEADERS.join(','), ...dataRows].join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        anchor.href = url;
        anchor.download = `students_page${page}of${totalPages}_${rowsPerPage}rows_${date}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        toast.success(`✓ Exported ${students.length} student${students.length !== 1 ? 's' : ''} — CSV ${page} of ${totalPages}`);
    };

    return (
        <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-b from-sky-50 to-sky-100">
            <div className="flex flex-col flex-1 lg:overflow-hidden p-3 sm:p-4 gap-3">

                {/* ── Page Title ── */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        <TooltipComponent
                            message="Efficiently manage all student records, class assignments and account status."
                            direction="right"
                            color="nocolor"
                        >
                            Manage All Students
                        </TooltipComponent>
                    </h2>
                </div>

                {/* ── Stat Card ── */}
                <div className="flex flex-wrap gap-3 w-fit">
                    {loading
                        ? cardsArray.map((_, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 w-48 animate-pulse">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 shrink-0" />
                                <div className="flex flex-col gap-2 flex-1">
                                    <div className="h-3 w-20 bg-gray-200 rounded-full" />
                                    <div className="h-5 w-10 bg-gray-300 rounded-full" />
                                </div>
                            </div>
                        ))
                        : cardsArray.map((card) => (
                            <CardComponent
                                key={card.keyName}
                                IconName={card.IconName}
                                keyName={card.keyName.toUpperCase()}
                                val={card.val}
                                iconTxColor={card.iconTxColor}
                                iconBgColor={card.iconBgColor}
                            />
                        ))}
                </div>

                {/* ── Toolbar ──────────────────────────────────────────────────────────────
                    mobile (<sm)      : sab ek ke niche ek
                    tablet (sm–lg)    : search full width, dropdowns+buttons side-by-side row
                    desktop (lg+)     : single row — search flex-1, rest shrink-0
                ──────────────────────────────────────────────────────────────────────── */}
                <div className="bg-white flex flex-col lg:flex-row lg:items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 shrink-0 w-full">

                    {/* 1. Search — flex-1 on lg so it takes all leftover space */}
                    <div className="w-full lg:flex-1 lg:min-w-0 flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-100 px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                        <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                            value={searchInput}
                            onChange={handleSearchChange}
                            placeholder="Search name, email or admission no…"
                            className="text-xs focus:outline-none text-gray-600 w-full bg-transparent placeholder:text-gray-400"
                        />
                        {searchInput && searchInput !== debouncedSearch && (
                            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                        )}
                        {searchInput && (
                            <button
                                onClick={handleClearSearch}
                                className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shrink-0 text-gray-600 text-xs font-bold"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* 2. Dropdowns — side-by-side on all screens, shrink-0 on lg */}
                    <div className="flex items-center gap-2 w-full lg:w-auto lg:shrink-0">
                        {/* Class/Section Dropdown */}
                        <div className="relative flex-1 lg:w-36">
                            <select
                                value={selectedSectionId}
                                onChange={handleSectionChange}
                                disabled={sectionsLoading}
                                className={dropdownClass}
                            >
                                <option value="">All Classes</option>
                                {groupedSections.map((grp) => (
                                    <optgroup key={grp.classId} label={grp.className}>
                                        {grp.sections.map((sec) => (
                                            <option key={sec.id} value={sec.id}>
                                                {grp.className} – {sec.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        </div>

                        {/* Status Dropdown */}
                        <div className="relative flex-1 lg:w-28">
                            <select
                                value={statusFilter}
                                onChange={handleStatusChange}
                                className={dropdownClass}
                            >
                                <option value="">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        </div>
                    </div>

                    {/* 3. Action Buttons — side-by-side on all screens, shrink-0 on lg */}
                    <div className="flex items-center gap-2 w-full lg:w-auto lg:shrink-0">
                        <button
                            onClick={() => navigate('/students/addStudents')}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white transition-all whitespace-nowrap cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Student
                        </button>

                        <button
                            onClick={handleExportStudentsCSV}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-xs bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-[0.97] transition-all whitespace-nowrap cursor-pointer"
                        >
                            <Upload className="w-4 h-4 text-gray-500" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* ── MOBILE / TABLET CARDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden overflow-y-auto pb-2">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-10 gap-3">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500 text-sm">Loading students…</p>
                        </div>
                    ) : error ? (
                        <div className="col-span-full text-center py-10">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <UserRoundXIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <p className="text-gray-900 font-semibold mb-1">Error loading students</p>
                            <p className="text-gray-500 text-sm mb-4">{error}</p>
                            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Retry</button>
                        </div>
                    ) : noUserFound ? (
                        <div className="col-span-full text-center py-10">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <UserSearch className="w-6 h-6 text-blue-500" />
                            </div>
                            <p className="text-gray-700 font-semibold">No Students Found</p>
                            <p className="text-gray-400 text-sm mt-1">Try a different search or add a new student.</p>
                        </div>
                    ) : (
                        students.map((student) => (
                            <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <AvatarCell student={student} />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{student.admissionNumber}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    {[
                                        { label: 'Contact', value: student.mobile },
                                        { label: 'Email', value: student.email },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 w-14 shrink-0">{label}</span>
                                            <span className="text-xs text-gray-700 truncate">{value}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-14 shrink-0">Class</span>
                                        {student.className
                                            ? <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">{student.className}</span>
                                            : <span className="text-gray-400 text-xs">N/A</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-14 shrink-0">Section</span>
                                        {student.sectionName
                                            ? <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">{student.sectionName}</span>
                                            : <span className="text-gray-400 text-xs">N/A</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-14 shrink-0">Status</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                                            ${student.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {student.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                    {hasPermission(P.STUDENT_EDIT) && (
                                      <button
                                          onClick={() => navigate(`/students/editStudent/${student.id}`)}
                                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100"
                                      >
                                          <UserPenIcon className="w-3.5 h-3.5" /> Edit
                                      </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/students/${student.id}`)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100"
                                    >
                                        <Info className="w-3.5 h-3.5" /> View
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ── DESKTOP TABLE ── */}
                <div className="hidden lg:flex lg:flex-col flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-0">
                    <div className="flex-1 overflow-auto">
                        <table className="w-full table-fixed text-xs">
                            <colgroup>
                                <col style={{ width: '24%' }} />
                                <col style={{ width: '13%' }} />
                                <col style={{ width: '20%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '9%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '14%' }} />
                            </colgroup>

                            <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Student Name', 'Mobile Number', 'Email', 'Class', 'Section', 'Status', 'Actions'].map((h) => (
                                        <th key={h} className="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <ListLoader />
                                ) : error ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center">
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <UserRoundXIcon className="w-6 h-6 text-red-600" />
                                            </div>
                                            <p className="font-semibold text-gray-900 mb-1">Error loading students</p>
                                            <p className="text-gray-500 text-sm mb-4">{error}</p>
                                            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Retry</button>
                                        </td>
                                    </tr>
                                ) : noUserFound ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center">
                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <UserSearch className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <p className="font-semibold text-gray-700 text-sm">No Students Found</p>
                                            <p className="text-gray-400 text-xs mt-1">Try a different search or add a new student.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <AvatarCell student={student} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{student.name}</p>
                                                        <p className="text-[10px] text-gray-400 truncate">{student.admissionNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-gray-600">{student.mobile}</td>
                                            <td className="px-3 py-2.5 text-center text-gray-600 max-w-0">
                                                <span className="block truncate">{student.email}</span>
                                            </td>
                                            <td className="px-2 py-2.5 text-center">
                                                {student.className
                                                    ? <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[10px] leading-tight text-center">{student.className}</span>
                                                    : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-2 py-2.5 text-center">
                                                {student.sectionName
                                                    ? <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium text-[10px]">{student.sectionName}</span>
                                                    : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-2 py-2.5 text-center">
                                                <span className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full font-medium text-[10px]
                                                    ${student.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${student.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => navigate(`/students/editStudent/${student.id}`)}
                                                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap text-[10px]"
                                                    >
                                                        <UserPenIcon className="w-3 h-3" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/students/${student.id}`)}
                                                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors whitespace-nowrap text-[10px]"
                                                    >
                                                        <Info className="w-3 h-3" /> View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="shrink-0 px-4 py-2.5 border-t border-gray-100 bg-white flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                                Showing{' '}
                                <span className="font-medium text-gray-700">{totalElements === 0 ? 0 : (page - 1) * rowsPerPage + 1}</span>
                                {' '}to{' '}
                                <span className="font-medium text-gray-700">{Math.min(page * rowsPerPage, totalElements)}</span>
                                {' '}of{' '}
                                <span className="font-medium text-gray-700">{totalElements}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">Rows per page:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                    className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <PrevBtn />
                            {renderPageButtons()}
                            <NextBtn />
                        </div>
                    </div>
                </div>

                {/* ── Mobile Pagination Footer ── */}
                <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-3 shrink-0">
                    <div className="flex flex-col gap-2">
                        <div className="text-center text-xs text-gray-500">
                            Showing{' '}
                            <span className="font-medium text-gray-700">{totalElements === 0 ? 0 : (page - 1) * rowsPerPage + 1}</span>
                            {' '}–{' '}
                            <span className="font-medium text-gray-700">{Math.min(page * rowsPerPage, totalElements)}</span>
                            {' '}of{' '}
                            <span className="font-medium text-gray-700">{totalElements}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-gray-500">Rows:</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                            <PrevBtn />
                            {renderPageButtons()}
                            <NextBtn />
                        </div>
                        <div className="text-center text-xs text-gray-400">Page {page} of {totalPages}</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Student;