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
    Info,
} from 'lucide-react';
import ActionDropDownComp from '../../Components/CommonComp/ActionDropDownComp';
import CardComponent from '../../Components/CommonComp/CardComponent';
import QuickActions from '../../Components/CommonComp/QuickActions';
import { getStudents, searchStudents } from '../../Api/StudentsApi';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ListLoader from '../../Components/CommonComp/ListLoader';

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
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");


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
                            image: stu.imageUrl || stu.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(stu.fullName)}&background=random`,
                            name: stu.fullName || `${stu.firstName} ${stu.lastName}`,
                            mobile: stu.personalDetails?.mobile || 'N/A',
                            status: stu.status,
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
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-yellow-500'
        ];
        const index = name?.charCodeAt(0) % colors.length || 0;
        return colors[index];
    };

    const cardsArray = [
        { IconName: UsersIcon, keyName: "Total Students", val: totalElements, iconTxColor: "text-blue-600", iconBgColor: "bg-blue-50" },
    ];

    const tableHeadItems = ['Student Name', 'Mobile Number', 'Status'];
    const tabledataItemsStyle = 'px-6 py-3 text-left text-gray-700 text-sm';

    const actionOptions = [
        {
            value: "editStudent",
            label: "Edit Student",
            icon: UserPenIcon,
            text: "text-blue-600",
            bg: "bg-blue-50",
            hover: "hover:bg-blue-100",
        },
        {
            value: "viewStudent",
            label: "View Student",
            icon: Info,
            text: "text-orange-600",
            bg: "bg-orange-50",
            hover: "hover:bg-orange-100",
        }
    ];

    const callAllActions = async (optVal, student) => {
        if (optVal === 'editStudent') navigate(`/students/editStudent/${student.id}`);
        if (optVal === 'viewStudent') navigate(`/students/${student.id}`);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
            <div className="flex-1 flex flex-col overflow-hidden w-0">
                <div className="flex-1 overflow-auto p-4 sm:p-5 lg:p-4">
                    {/* Page Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage All Students</h2>
                            <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Efficiently manage all students.</p>
                        </div>
                    </div>

                    {/* Cards */}
  <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-sm mt-5'>
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
                ))
            }
          </div>

                    {/* Quick Actions */}
                    <QuickActions buttonText="Add New Student" navigateTo="/students/addStudents" />

                    {/* filters */}
                    <div className="bg-white grid lg:grid-cols-3 gap-2 px-4 py-2 rounded-xl border border-gray-200 mb-4">
                        <div className="flex col-span-3 items-center gap-2 border rounded-lg border-gray-200 bg-gray-100 px-2 py-2 focus-within:shadow-sm focus-within:shadow-blue-200">
                            <SearchIcon className="w-5 h-5 text-gray-500" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search by name, email or ID.."
                                className="text-base sm:text-sm font-normal focus:outline-none appearance-none text-gray-600 w-full"
                            />
                        </div>
                    </div>

                    {/* MOBILE/TABLET CARDS VIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 col-span-full">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
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
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-12 h-12 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white font-semibold`}>
                                                {student.avatar}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{student.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <span className="font-medium text-gray-600">Contact:</span>
                                            <span className="text-gray-800 ml-4">{student.mobile}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-600">Status:</span>
                                            <span
                                                className={`inline-flex size-fit items-center gap-1 px-3 py-1 ml-6 rounded-sm text-xs font-medium ${student.status === "ACTIVE"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-red-50 text-red-700"
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${student.status === "ACTIVE" ? "bg-green-700" : "bg-red-700"
                                                        }`}
                                                />
                                                {student.status}
                                            </span>
                                        </p>
                                        <div className='flex justify-start items-center align-middle'>
                                            <span className="font-medium text-gray-600">Actions: </span>
                                            <span className="text-gray-800 ml-4">
                                                <ActionDropDownComp
                                                    actionOptions={actionOptions}
                                                    onAction={(optVal) => callAllActions(optVal, student)}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden lg:block bg-white rounded-xl border border-gray-200">
                        <div className="overflow-x-auto min-h-[calc(250px)] max-h-[calc(100vh-480px)] overflow-y-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        {tableHeadItems.map((heading) => (
                                            <th key={heading} className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                                {heading}
                                            </th>
                                        ))}
                                        <th className="px-6 py-3 text-start text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 font-normal">
                                    {loading ? (
                                        <ListLoader />
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center">
                                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <UserRoundXIcon className="w-6 h-6 text-red-600" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Students</h3>
                                                <p className="text-gray-600 mb-4">{error}</p>
                                                <button
                                                    onClick={() => window.location.reload()}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Retry
                                                </button>
                                            </td>
                                        </tr>
                                    ) : noUserFound ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                                    <UserSearch className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-700 mb-2">No Students Found</h3>
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className={tabledataItemsStyle}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white font-semibold`}>
                                                            {student.avatar}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-black">{student.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={tabledataItemsStyle}>{student.mobile}</td>
                                                <td className={tabledataItemsStyle}>
                                                    <span
                                                        className={`inline-flex size-fit items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${student.status === "ACTIVE"
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-red-50 text-red-700"
                                                            }`}
                                                    >
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className={tabledataItemsStyle}>
                                                    <ActionDropDownComp
                                                        actionOptions={actionOptions}
                                                        onAction={(optVal) => callAllActions(optVal, student)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Desktop Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <span className="text-sm text-gray-700">
                                    Showing {(page - 1) * rowsPerPage + 1} to{' '}
                                    {Math.min(page * rowsPerPage, totalElements)} of {totalElements}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">Rows per page:</span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1 || loading || error}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx + 1}
                                        onClick={() => setPage(idx + 1)}
                                        className={`px-3 py-1 rounded transition-all ${page === idx + 1
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages || loading || error}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Pagination */}
                    <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4 mt-4">
                        <div className="flex flex-col gap-4">
                            <div className="text-center text-sm text-gray-700">
                                Showing {(page - 1) * rowsPerPage + 1} to{' '}
                                {Math.min(page * rowsPerPage, totalElements)} of {totalElements}
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-gray-700">Rows:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1 || loading || error}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {totalPages <= 5 ? (
                                        [...Array(totalPages)].map((_, idx) => (
                                            <button
                                                key={idx + 1}
                                                onClick={() => setPage(idx + 1)}
                                                className={`px-3 py-1 rounded transition-all ${page === idx + 1
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setPage(1)}
                                                className={`px-3 py-1 rounded transition-all ${page === 1
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                1
                                            </button>
                                            {page > 3 && <span className="px-2 text-gray-400">...</span>}
                                            {page > 2 && page < totalPages - 1 && (
                                                <button
                                                    onClick={() => setPage(page)}
                                                    className="px-3 py-1 rounded bg-blue-500 text-white"
                                                >
                                                    {page}
                                                </button>
                                            )}
                                            {page < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                                            <button
                                                onClick={() => setPage(totalPages)}
                                                className={`px-3 py-1 rounded transition-all ${page === totalPages
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages || loading || error}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Page {page} of {totalPages}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Student;