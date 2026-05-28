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
} from 'lucide-react';
import CardComponent from '../../Components/CommonComp/CardComponent';
import { getStudents, searchStudents } from '../../Api/StudentsApi';
import { getAllSections } from '../../Api/TeachersAPI';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ListLoader from '../../Components/CommonComp/ListLoader';
import TooltipComponent from '../../Components/CommonComp/Tooltip_comp/TooltipComp';

const Student = () => {
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

    // ── Sections grouped by class ────────────────────────────────────────────
    const [groupedSections, setGroupedSections] = useState([]); // [{ className, classId, sections: [{id, name}] }]
    const [sectionsLoading, setSectionsLoading] = useState(false);

    // ── Combined class+section filter — stores sectionId (or '') ────────────
    const [selectedSectionId, setSelectedSectionId] = useState('');

    // ── Status dropdown ──────────────────────────────────────────────────────
    const [statusFilter, setStatusFilter] = useState('');

    // ── Fetch & group sections on mount ─────────────────────────────────────
    useEffect(() => {
        const fetchSections = async () => {
            setSectionsLoading(true);
            try {
                const res = await getAllSections();
                if (res?.success && Array.isArray(res.data)) {
                    // Group sections by className / classId
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

    // ── Fetch students ────────────────────────────────────────────────────────
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
                        // Pass sectionId — backend will also resolve classId from it
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

    // ── Pagination ────────────────────────────────────────────────────────────
    const renderPageButtons = () => {
        if (totalPages <= 1) return null;
        const base = 'min-w-[32px] h-8 px-2 rounded text-sm transition-all font-medium';
        const active = 'bg-blue-500 text-white';
        const inactive = 'text-gray-600 hover:bg-gray-100';
        const dots = (key) => (
            <span key={key} className="min-w-8 h-8 flex items-center justify-center text-gray-400 text-sm select-none">…</span>
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

    const PrevBtn = ({ mobile = false }) => (
        <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading || !!error}
            className={`flex items-center justify-center rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${mobile ? 'w-8 h-8 bg-gray-100 hover:bg-gray-200' : 'px-2 py-1 hover:bg-gray-100 text-gray-600'}`}
        >
            <ChevronLeft className="w-4 h-4" />
        </button>
    );

    const NextBtn = ({ mobile = false }) => (
        <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading || !!error}
            className={`flex items-center justify-center rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${mobile ? 'w-8 h-8 bg-gray-100 hover:bg-gray-200' : 'px-2 py-1 hover:bg-gray-100 text-gray-600'}`}
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

    const tableHeadItems = ['Student Name', 'Mobile Number', 'Email', 'Class', 'Section', 'Status'];
    const tdStyle = 'px-4 py-3 text-center text-gray-700 text-sm';

    const dropdownClass = `
        appearance-none cursor-pointer
        pl-3 pr-8 py-2.5
        rounded-lg border border-gray-200 bg-gray-100
        text-sm text-gray-600 font-normal
        focus:outline-none focus:ring-2 focus:ring-blue-300
        hover:border-gray-300 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        w-full
    `;

    return (
        <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
            <div className="flex flex-col flex-1 lg:overflow-hidden">
                <div className="flex flex-col flex-1 lg:overflow-hidden p-3 sm:p-4 lg:p-4 gap-3 sm:gap-4">

                    {/* Page Title */}
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            <TooltipComponent message="Efficiently manage all student records, class assignments and account status." direction='right' color='nocolor'>
                                Manage All Students
                            </TooltipComponent>
                        </h2>
                    </div>

                    {/* Cards */}
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                        {loading
                            ? cardsArray.map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 w-48 sm:w-56 animate-pulse"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 shrink-0" />
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

                    {/* ── Search + Filter + Add Bar ── */}
                    <div className="bg-white flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl border border-gray-200 shrink-0">

                        {/* Add Student Button */}
                        <button
                            onClick={() => navigate('/students/addStudents')}
                            className="shrink-0 flex items-center justify-center gap-2 cursor-pointer
                                       px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm
                                       bg-blue-600 hover:bg-blue-700 active:scale-[0.97]
                                       text-white transition-all duration-150 whitespace-nowrap"
                        >
                            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Add New Student</span>
                        </button>

                        {/* ── Search Input ── */}
                        <div className="flex-1 min-w-35 flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-100 px-2 py-2 sm:py-2.5 focus-within:shadow-sm focus-within:shadow-blue-200 transition-all">
                            <SearchIcon className="w-4 h-4 text-gray-500 shrink-0" />
                            <input
                                value={searchInput}
                                onChange={handleSearchChange}
                                placeholder="Search by name, email or admission no..."
                                className="text-xs sm:text-sm font-normal focus:outline-none text-gray-600 w-full bg-transparent placeholder:text-gray-400"
                            />
                            {searchInput && searchInput !== debouncedSearch && (
                                <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                            )}
                            {searchInput && (
                                <button
                                    onClick={handleClearSearch}
                                    className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shrink-0 text-gray-600 text-xs font-bold transition-colors"
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* ── Class → Section Dropdown (combined) ── */}
                        <div className="relative shrink-0 w-full sm:w-auto">
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
                                                {grp.className} - Section {sec.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        </div>

                        {/* ── Status Dropdown ── */}
                        <div className="relative shrink-0 w-full sm:w-auto">
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

                    {/* ── MOBILE / TABLET CARDS ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:hidden overflow-y-auto pb-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 col-span-full">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium text-sm">Loading students...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 col-span-full">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserRoundXIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Students</h3>
                                <p className="text-gray-600 mb-4 text-sm">{error}</p>
                                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                    Retry
                                </button>
                            </div>
                        ) : noUserFound ? (
                            <div className="text-center py-8 col-span-full">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserSearch className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Students Found</h3>
                                <p className="text-gray-600 mb-4 text-sm">There are no students to display.</p>
                            </div>
                        ) : (
                            students.map((student) => (
                                <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        {student.image ? (
                                            <img 
                                                src={student.image} 
                                                alt={student.name}
                                                className="w-9 h-9 rounded-full object-cover shrink-0"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-9 h-9 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white text-sm font-semibold shrink-0 ${student.image ? 'hidden' : ''}`}
                                             style={student.image ? { display: 'none' } : {}}>
                                            {student.avatar}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-gray-900 text-sm truncate">{student.name}</span>
                                            <span className="text-xs text-gray-500 truncate">{student.admissionNumber}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex items-center gap-2">
                                            <span className="font-medium text-gray-500 w-16 shrink-0 text-xs">Contact</span>
                                            <span className="text-gray-800 text-xs">{student.mobile}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-medium text-gray-500 w-16 shrink-0 text-xs">Class</span>
                                            {student.className
                                                ? <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">{student.className}</span>
                                                : <span className="text-gray-400 text-xs">N/A</span>
                                            }
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-medium text-gray-500 w-16 shrink-0 text-xs">Section</span>
                                            {student.sectionName
                                                ? <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">{student.sectionName}</span>
                                                : <span className="text-gray-400 text-xs">N/A</span>
                                            }
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-medium text-gray-500 w-16 shrink-0 text-xs">Status</span>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${student.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {student.status}
                                            </span>
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                onClick={() => navigate(`/students/editStudent/${student.id}`)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                            >
                                                <UserPenIcon className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => navigate(`/students/${student.id}`)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                            >
                                                <Info className="w-3.5 h-3.5" />
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── DESKTOP TABLE ── */}
                    <div className="hidden lg:flex lg:flex-col flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-0">
                        <div className="flex-1 overflow-auto">
                            <table className="w-full min-w-175">
                                <thead className="border-b border-gray-100 sticky top-0 z-10">
                                    <tr>
                                        {tableHeadItems.map((h) => (
                                            <th key={h} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                                                {h}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <ListLoader />
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center">
                                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <UserRoundXIcon className="w-6 h-6 text-red-600" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Students</h3>
                                                <p className="text-gray-600 mb-4">{error}</p>
                                                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                    Retry
                                                </button>
                                            </td>
                                        </tr>
                                    ) : noUserFound ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <UserSearch className="w-7 h-7 text-blue-500" />
                                                </div>
                                                <h3 className="text-sm font-semibold text-gray-700 mb-1">No Students Found</h3>
                                                <p className="text-xs text-gray-400">Try a different search or add a new student.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-gray-700 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        {student.image ? (
                                                            <img 
                                                                src={student.image} 
                                                                alt={student.name}
                                                                className="w-9 h-9 rounded-full object-cover shrink-0"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextElementSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`w-9 h-9 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white text-sm font-semibold shrink-0 ${student.image ? 'hidden' : ''}`}
                                                             style={student.image ? { display: 'none' } : {}}>
                                                            {student.avatar}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-medium text-gray-900 truncate">{student.name}</span>
                                                            <span className="text-xs text-gray-500 truncate">{student.admissionNumber}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`${tdStyle} text-center`}>{student.mobile}</td>
                                                <td className={`${tdStyle} text-center max-w-45 truncate`}>{student.email}</td>
                                                <td className={tdStyle}>
                                                    {student.className
                                                        ? <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{student.className}</span>
                                                        : <span className="text-gray-400 text-xs">—</span>
                                                    }
                                                </td>
                                                <td className={tdStyle}>
                                                    {student.sectionName
                                                        ? <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">{student.sectionName}</span>
                                                        : <span className="text-gray-400 text-xs">—</span>
                                                    }
                                                </td>
                                                <td className={tdStyle}>
                                                    <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${student.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/students/editStudent/${student.id}`)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                        >
                                                            <UserPenIcon className="w-3.5 h-3.5" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/students/${student.id}`)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                                        >
                                                            <Info className="w-3.5 h-3.5" />
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Desktop Pagination */}
                        <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                                <span className="text-sm text-gray-500">
                                    Showing{' '}
                                    <span className="font-medium text-gray-700">{totalElements === 0 ? 0 : (page - 1) * rowsPerPage + 1}</span>
                                    {' '}to{' '}
                                    <span className="font-medium text-gray-700">{Math.min(page * rowsPerPage, totalElements)}</span>
                                    {' '}of{' '}
                                    <span className="font-medium text-gray-700">{totalElements}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Rows per page:</span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                        className="px-2.5 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
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

                    {/* Mobile Pagination */}
                    <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4 shrink-0">
                        <div className="flex flex-col gap-3">
                            <div className="text-center text-sm text-gray-500">
                                Showing{' '}
                                <span className="font-medium text-gray-700">{totalElements === 0 ? 0 : (page - 1) * rowsPerPage + 1}</span>
                                {' '}–{' '}
                                <span className="font-medium text-gray-700">{Math.min(page * rowsPerPage, totalElements)}</span>
                                {' '}of{' '}
                                <span className="font-medium text-gray-700">{totalElements}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-gray-500">Rows:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                    className="px-2.5 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                <PrevBtn mobile />
                                {renderPageButtons()}
                                <NextBtn mobile />
                            </div>
                            <div className="text-center text-xs text-gray-400">Page {page} of {totalPages}</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Student;