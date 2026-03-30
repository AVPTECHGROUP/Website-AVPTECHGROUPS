import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import CardComponent from '../../Components/CommonComp/CardComponent';
import { getStudents, searchStudents } from '../../Api/StudentsApi';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ListLoader from '../../Components/CommonComp/ListLoader';
import ActionDropDownComp from '../../Components/CommonComp/ActionDropDownComp';
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
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                const hasFilters =
                    search.trim() !== '' ||
                    (statusFilter && statusFilter !== 'All Status');

                let res;
                if (hasFilters) {
                    const filters = {
                        searchTerm: search || undefined,
                        status:
                            statusFilter && statusFilter !== 'All Status'
                                ? statusFilter
                                : undefined,
                    };
                    res = await searchStudents(filters, page - 1, rowsPerPage, 'id');
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
                                stu.imageUrl ||
                                stu.profileImage ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(stu.fullName)}&background=random`,
                            name: stu.fullName || `${stu.firstName} ${stu.lastName}`,
                            mobile: stu.personalDetails?.mobile || 'N/A',
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
    }, [page, rowsPerPage, search, statusFilter]);

    const getAvatarColor = (name) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500',
            'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500',
        ];
        return colors[name?.charCodeAt(0) % colors.length || 0];
    };

    // ── Smart Pagination ──────────────────────────────────────────────────────
    const renderPageButtons = () => {
        if (totalPages <= 1) return null;
        const base = 'min-w-[32px] h-8 px-2 rounded text-sm transition-all font-medium';
        const active = 'bg-blue-500 text-white';
        const inactive = 'text-gray-600 hover:bg-gray-100';
        const dots = (key) => (
            <span key={key} className="min-w-8 h-8 flex items-center justify-center text-gray-400 text-sm select-none">
                …
            </span>
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
    // ─────────────────────────────────────────────────────────────────────────

    const cardsArray = [
        {
            IconName: UsersIcon,
            keyName: 'Total Students',
            val: totalElements,
            iconTxColor: 'text-blue-600',
            iconBgColor: 'bg-blue-50',
        },
    ];

    // ✅ Updated: 5 columns now — added Class and Section
    const tableHeadItems = ['Student Name', 'Mobile Number', 'Class', 'Section', 'Status'];
    const tdStyle = 'px-6 py-3 text-center text-gray-700 text-sm';

    // ✅ Updated: only Edit Student action remains
    const actionOptions = [
        { value: 'editStudent', label: 'Edit Student', icon: UserPenIcon, text: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:bg-blue-100' },
    ];

    const callAllActions = async (optVal, student) => {
        if (optVal === 'editStudent') navigate(`/students/editStudent/${student.id}`);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex flex-col flex-1 overflow-hidden p-4 sm:p-5 lg:p-4 gap-4">

                    {/* Page Title */}
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            <TooltipComponent message="Efficiently manage all student records, class assignments and account status." direction='right' color='nocolor'>
                                Manage All Students
                            </TooltipComponent>
                        </h2>
                    </div>

                    {/* Cards */}
                    <div className="flex flex-wrap gap-4">
                        {loading
                            ? cardsArray.map((_, i) => <CardLoader key={i} />)
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

                    {/* Search + Add Student Bar */}
                    <div className="bg-white flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 shrink-0">
                        <button
                            onClick={() => navigate('/students/addStudents')}
                            className="shrink-0 flex items-center justify-center gap-2 cursor-pointer
                                       px-4 py-2.5 rounded-lg font-medium text-sm
                                       bg-blue-600 hover:bg-blue-700 active:scale-[0.97]
                                       text-white transition-all duration-150"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add New Student
                        </button>

                        <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-100 px-2 py-2.5 focus-within:shadow-sm focus-within:shadow-blue-200 transition-all">
                            <SearchIcon className="w-4 h-4 text-gray-500 shrink-0" />
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search by name.."
                                className="text-sm font-normal focus:outline-none text-gray-600 w-full bg-transparent placeholder:text-gray-400"
                            />
                            {search && (
                                <button
                                    onClick={() => { setSearch(''); setPage(1); }}
                                    className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shrink-0 text-gray-600 text-xs font-bold transition-colors"
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* MOBILE / TABLET CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 col-span-full">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium">Loading students...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 col-span-full">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserRoundXIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Students</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Retry
                                </button>
                            </div>
                        ) : noUserFound ? (
                            <div className="text-center py-8 col-span-full">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserSearch className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Students Found</h3>
                                <p className="text-gray-600 mb-4">There are no students to display.</p>
                            </div>
                        ) : (
                            students.map((student) => (
                                <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-12 h-12 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white font-semibold`}>
                                            {student.avatar}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{student.name}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <span className="font-medium text-gray-600">Contact:</span>
                                            <span className="text-gray-800 ml-4">{student.mobile}</span>
                                        </p>
                                        {/* ✅ Separate Class and Section fields in mobile card */}
                                        <p>
                                            <span className="font-medium text-gray-600">Class:</span>
                                            <span className="text-gray-800 ml-4">
                                                {student.className
                                                    ? <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">{student.className}</span>
                                                    : <span className="text-gray-400 text-xs">N/A</span>
                                                }
                                            </span>
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-600">Section:</span>
                                            <span className="text-gray-800 ml-2">
                                                {student.sectionName
                                                    ? <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">{student.sectionName}</span>
                                                    : <span className="text-gray-400 text-xs">N/A</span>
                                                }
                                            </span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-medium text-gray-600">Status:</span>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${student.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {student.status}
                                            </span>
                                        </p>
                                        {/* Edit + View buttons */}
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

                    {/* DESKTOP TABLE */}
                    <div className="hidden lg:flex lg:flex-col flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-0">

                        <div className="flex-1 overflow-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-100">
                                    <tr>
                                        {tableHeadItems.map((h) => (
                                            <th key={h} className="px-6 py-3 text=center text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-50">
                                                {h}
                                            </th>
                                        ))}
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-50">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <ListLoader />
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center">
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
                                            <td colSpan="6" className="px-6 py-12 text-center">
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
                                                {/* Student Name */}
                                                <td className={tdStyle}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                                                            {student.avatar}
                                                        </div>
                                                        <p className="font-medium text-gray-900">{student.name}</p>
                                                    </div>
                                                </td>

                                                {/* Mobile Number */}
                                                <td className={`${tdStyle} text-center`}>{student.mobile}</td>

                                                {/* ✅ Class — separate column */}
                                                <td className={tdStyle}>
                                                    {student.className
                                                        ? <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{student.className}</span>
                                                        : <span className="text-gray-400 text-xs">—</span>
                                                    }
                                                </td>

                                                {/* ✅ Section — separate column */}
                                                <td className={tdStyle}>
                                                    {student.sectionName
                                                        ? <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">{student.sectionName}</span>
                                                        : <span className="text-gray-400 text-xs">—</span>
                                                    }
                                                </td>

                                                {/* Status */}
                                                <td className={tdStyle}>
                                                    <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${student.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        {student.status}
                                                    </span>
                                                </td>

                                                {/* Edit + View action buttons */}
                                                <td className='text-center'>
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
                        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
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