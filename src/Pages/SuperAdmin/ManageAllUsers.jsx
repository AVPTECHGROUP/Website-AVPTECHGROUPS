import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    ChevronLeft,
    UserRoundXIcon,
    Power,
    UserCheck2,
    SearchIcon,
    UsersIcon,
    UserPenIcon,
    UserSearch,
    KeyIcon,
    ArrowDown,
    ArrowUp,
    UserPlusIcon,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { activateUserStatus, allUserFilter, deactivateUserStatus, getAllUserRoles, getUsersStatistics, resetUserPassword } from '../../Api/userManagementAPI';
import ActionDropDownComp from '../../Components/CommonComp/ActionDropDownComp';
import CardComponent from '../../Components/CommonComp/CardComponent';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ListLoader from '../../Components/CommonComp/ListLoader';
import { UserContext } from '../../ContextAPI/UserContext';
import PasswordResetModal from '../../Components/PopupResetPassword/ResetPasswordComponent';
import TooltipComponent from '../../Components/CommonComp/Tooltip_comp/TooltipComp';

const ManageAllUsers = () => {
    const [search, setsearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [roleFilter, setroleFilter] = useState('All Roles');
    const [page, setpage] = useState(1);
    const [rowsPerpage, setrowsPerpage] = useState(10);
    const [statistics, setstatistics] = useState({
        totalUsers: 0, activeUsers: 0, inactiveUsers: 0, suspendedUsers: 0, pendingUsers: 0
    });
    const [error, setError] = useState(null);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sysUsers, setsysUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [noUserFound, set_noUserFound] = useState(false);
    const [roleOptions, setRoleOptions] = useState([]);
    const [sorting, setSorting] = useState('firstName,asc');
    const { user } = useContext(UserContext);
    const [isResetOpen, setisResetOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [refressStat, setRefressStat] = useState(0);

    function compareAndGetLabel(data, compareValue) {
        const found = data.find(item => item.roleVal === compareValue);
        return found ? <span className="text-xs font-medium text-gray-800 bg-gray-100 w-fit rounded-xs px-1 py-0.5"> {found.roleDisplay} </span> : "";
    }

    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const rolesRes = await getAllUserRoles();
                const fetchedRoles = rolesRes.data || [];
                const roleOpt = fetchedRoles
                    .filter(val => val.name !== 'SUPER_ADMIN' && val.name !== 'TEACHER' && val.name !== 'GLOBAL_ADMIN')
                    .map(val => ({ roleKey: val.id, roleVal: val.name, roleDisplay: val.displayName }));
                setRoleOptions(roleOpt);
            } catch (e) {
                console.error('Fetch roles error:', e.message);
                throw e;
            }
        };
        fetchUserRoles();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1100);
        return () => clearTimeout(timer);
    }, [search]);

    const hasActiveFilters = useMemo(() => (
        debouncedSearch.trim() !== '' || statusFilter !== 'All Status' || roleFilter !== 'All Roles'
    ), [debouncedSearch, statusFilter, roleFilter]);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const statistics_res = await getUsersStatistics();
                setstatistics(statistics_res.data);
            } catch (e) {
                console.error("get statistics error:", e.message);
            }
        };
        fetchStatistics();
    }, [refressStat]);

    useEffect(() => {
        const fetchsysUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                set_noUserFound(false);
                const filters = {};
                if (debouncedSearch.trim()) filters.searchTerm = debouncedSearch.trim();

                if (statusFilter !== 'All Status') {
                    filters.status = statusFilter.toUpperCase();
                }

                if (roleFilter !== 'All Roles') filters.role = roleFilter;

                const res = await allUserFilter(filters, page - 1, rowsPerpage, sorting);
                let sys_userArray = res.data || [];

                if (statusFilter !== 'All Status') {
                    sys_userArray = sys_userArray.filter(
                        u => u.status?.toUpperCase() === statusFilter.toUpperCase()
                    );
                }

                if (sys_userArray.length === 0) {
                    set_noUserFound(true);
                } else {
                    set_noUserFound(false);
                }

                setsysUsers(sys_userArray.map((sys_user) => ({
                    id: sys_user.id,
                    email: sys_user.email,
                    name: sys_user.fullName || 'Unknown',
                    mobile: sys_user.mobile || 'N/A',
                    empCode: sys_user.employeeCode,
                    avatar: (sys_user.fullName || 'U')[0].toUpperCase(),
                    image: sys_user.imageUrl || sys_user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(sys_user.fullName)}&background=random`,
                    role: sys_user.roles || 'N/A',
                    department: sys_user.department,
                    designation: sys_user.designation,
                    status: sys_user.status,
                })));

                setTotalElements(res.pagination?.totalElements || 0);
                setTotalPages(res.pagination?.totalPages || 0);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err.message || "Something went wrong");
                setsysUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchsysUsers();
    }, [page, rowsPerpage, debouncedSearch, roleFilter, statusFilter, sorting]);

    const getAvatarColor = (name) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'];
        return colors[name?.charCodeAt(0) % colors.length || 0];
    };

    const resetPassword = async (id) => {
        try {
            return await resetUserPassword(id);
        } catch (error) {
            toast.error(error.message || 'Reset password failed');
        }
    };

    const handleToggleStatus = async (id, name, isStatus) => {
        try {
            const messageStatus = await (isStatus === 'ACTIVE' ? deactivateUserStatus(id) : activateUserStatus(id));
            setRefressStat(prev => prev + 1);
            toast.success(`${messageStatus.message} : ${name}`);
            const newStatus = isStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            setsysUsers(prev => {
                if (statusFilter !== 'All Status') {
                    return prev.filter(u => u.id !== id);
                }
                // ✅ Instant optimistic update — status flips immediately in state
                return prev.map(u => u.id === id ? { ...u, status: newStatus } : u);
            });
            if (statusFilter !== 'All Status') {
                set_noUserFound(prev => {
                    const remaining = sysUsers.filter(u => u.id !== id);
                    return remaining.length === 0;
                });
            }
        } catch (error) {
            toast.error(error.message || 'Status update failed');
        }
    };

    // ── Smart Pagination ────────────────────────────────────────────────────
    const renderPageButtons = () => {
        if (totalPages <= 1) return null;
        const base = 'min-w-[32px] h-8 px-2 rounded text-sm transition-all font-medium';
        const active = 'bg-blue-500 text-white';
        const inactive = 'text-gray-600 hover:bg-gray-100';
        const dots = (key) => (
            <span key={key} className="min-w-8 h-8 flex items-center justify-center text-gray-400 text-sm select-none">…</span>
        );
        const btn = (num) => (
            <button key={num} onClick={() => setpage(num)} className={`${base} ${page === num ? active : inactive}`}>
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
            onClick={() => setpage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading || !!error}
            className={`flex items-center justify-center rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${mobile ? 'w-8 h-8 bg-gray-100 hover:bg-gray-200' : 'px-2 py-1 hover:bg-gray-100 text-gray-600'}`}
        >
            <ChevronLeft className="w-4 h-4" />
        </button>
    );

    const NextBtn = ({ mobile = false }) => (
        <button
            onClick={() => setpage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading || !!error}
            className={`flex items-center justify-center rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${mobile ? 'w-8 h-8 bg-gray-100 hover:bg-gray-200' : 'px-2 py-1 hover:bg-gray-100 text-gray-600'}`}
        >
            <ChevronRight className="w-4 h-4" />
        </button>
    );
    // ────────────────────────────────────────────────────────────────────────

    const cardsArray = [
        { IconName: UsersIcon, keyName: "Total Users", val: statistics.totalUsers, iconTxColor: "text-blue-600", iconBgColor: "bg-blue-50" },
        { IconName: UserCheck2, keyName: "Active Users", val: statistics.activeUsers, iconTxColor: "text-green-600", iconBgColor: "bg-green-50" },
        { IconName: UserRoundXIcon, keyName: "Inactive Users", val: statistics.inactiveUsers, iconTxColor: "text-red-600", iconBgColor: "bg-red-50" },
    ];

    const tabledataItemsStyle = 'px-2 py-2 text-left text-gray-700 text-sm';

    // ✅ Build dynamic action options per user based on their current status
    const getActionOptions = (sys_user) => {
        const baseOptions = [
            { value: "editUser", label: "Edit", icon: UserPenIcon, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
            {
                value: "toogleStatus",
                // ✅ Dynamic label: "Deactivate" if ACTIVE, "Activate" if INACTIVE
                label: sys_user.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
                icon: Power,
                text: sys_user.status === 'ACTIVE' ? "text-red-600" : "text-green-600",
                bg: sys_user.status === 'ACTIVE' ? "bg-red-50" : "bg-green-50",
                hover: sys_user.status === 'ACTIVE' ? "hover:bg-red-100" : "hover:bg-green-100",
            },
            { value: "resetPassword", label: "Password Reset", icon: KeyIcon, text: "text-green-600", bg: "bg-green-50", hover: "hover:bg-green-100" },
        ];

        return baseOptions.filter(option =>
            (user.userType === 'SUPER_ADMIN' || user.userType === 'GLOBAL_ADMIN')
                ? true
                : option.value !== "resetPassword"
        );
    };

    const callAllActions = async (optVal, sys_user) => {
        if (optVal === 'editUser') navigate(`/dashboard/editUser/${sys_user.id}`);
        else if (optVal === 'resetPassword') { setSelectedUser(sys_user); setisResetOpen(true); }
        else if (optVal === 'toogleStatus') handleToggleStatus(sys_user.id, sys_user.name, sys_user.status);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
            <div className="flex-1 flex flex-col overflow-hidden w-0">
                <div className="flex-1 overflow-auto p-2 sm:p-5 lg:p-4">

                    {/* Page Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            <TooltipComponent message="Efficiently manage system roles, permissions and account status." direction='right' color='nocolor'>
                                Manage All Users
                            </TooltipComponent>
                        </h2>
                    </div>

                    {/* Cards */}
                    <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-sm mt-5'>
                        {loading
                            ? cardsArray.map((_, i) => <CardLoader key={i} />)
                            : cardsArray.map((card) => (
                                <CardComponent key={card.keyName} IconName={card.IconName} keyName={card.keyName.toUpperCase()}
                                    val={card.val} iconTxColor={card.iconTxColor} iconBgColor={card.iconBgColor} />
                            ))}
                    </div>

                    {/* Password Reset Modal */}
                    <PasswordResetModal isOpen={isResetOpen} onClose={() => setisResetOpen(!isResetOpen)}
                        userName={selectedUser?.name} onReset={() => resetPassword(selectedUser?.id)}
                        currUserId={selectedUser?.id} />

                    {/* Filters */}
                    <div className="bg-white grid grid-cols-2 lg:grid-cols-5 gap-3 px-4 py-3 rounded-xl border border-gray-200 mb-4 mt-4">
                        <button onClick={() => navigate('/dashboard/adduser')}
                            className="col-span-2 lg:col-span-1 px-4 py-2.5 w-full cursor-pointer rounded-lg font-medium flex items-center justify-center gap-2 transition-all bg-blue-600 text-white">
                            <UserPlusIcon className="w-5 h-5" /> Add User
                        </button>
                        <div className="col-span-2 flex items-center gap-2 border rounded-lg border-gray-200 bg-gray-100 px-2 py-1 focus-within:shadow-sm focus-within:shadow-blue-200">
                            <SearchIcon className="w-5 h-5 text-gray-500" />
                            <input value={search} onChange={(e) => { setsearch(e.target.value); setpage(1); }}
                                placeholder="Search by name, email or ID.."
                                className="text-base sm:text-sm font-normal focus:outline-none appearance-none text-gray-600 w-full bg-transparent" />
                        </div>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setpage(1); }}
                            className="col-span-1 px-4 py-2 border cursor-pointer border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm">
                            <option value="All Status">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        <select value={roleFilter} onChange={(e) => { setroleFilter(e.target.value); setpage(1); }}
                            className="cursor-pointer col-span-1 px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm">
                            <option value={"All Roles"}>All Roles</option>
                            {roleOptions.map((item) => (
                                <option key={item.roleKey} value={item.roleVal}>{item.roleDisplay}</option>
                            ))}
                        </select>
                    </div>

                    {/* MOBILE / TABLET CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                        {loading ? (
                            <div className="text-center py-8 col-span-4">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                    <span className="text-gray-600">Loading users ...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserRoundXIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Users</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
                            </div>
                        ) : noUserFound ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserSearch className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Users Found</h3>
                                <p className="text-gray-600 mb-4">There are no users to display.</p>
                            </div>
                        ) : sysUsers.map((sys_user) => (
                            <div key={sys_user.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(sys_user.name)} flex items-center justify-center text-white font-semibold`}>
                                        {sys_user.avatar}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{sys_user.name}</p>
                                        <p>{compareAndGetLabel(roleOptions, sys_user.role[0])}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium text-gray-600">Contact:</span><span className="text-gray-800 ml-4">{sys_user.mobile}</span></p>
                                    <p>
                                        <span className="font-medium text-gray-600">Status:</span>
                                        {/* ✅ Status badge updates instantly via optimistic state update */}
                                        <span className={`inline-flex size-fit items-center gap-1 px-3 py-1 ml-6 rounded-sm text-xs font-medium ${sys_user.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${sys_user.status === "ACTIVE" ? "bg-green-700" : "bg-red-700"}`} />
                                            {sys_user.status}
                                        </span>
                                    </p>
                                    <div className='flex justify-start items-center'>
                                        {/* ✅ Dynamic options per user card */}
                                        <ActionDropDownComp actionOptions={getActionOptions(sys_user)} onAction={(optVal) => callAllActions(optVal, sys_user)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden lg:block bg-white rounded-xl border border-gray-200">
                        <div className="overflow-x-auto min-h-[calc(300px)] max-h-[calc(100vh-340px)] overflow-y-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-11">
                                            <button onClick={() => setSorting(prev => prev === 'firstName,asc' ? 'firstName,desc' : 'firstName,asc')}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase">
                                                User Name {sorting === 'firstName,desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                                            </button>
                                        </th>
                                        <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                            <button onClick={() => setSorting(prev => prev === 'employeeCode,asc' ? 'employeeCode,desc' : 'employeeCode,asc')}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase">
                                                Employee Id {sorting === 'employeeCode,desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                                            </button>
                                        </th>
                                        <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                            <button onClick={() => setSorting(prev => prev === 'email,asc' ? 'email,desc' : 'email,asc')}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase">
                                                Email {sorting === 'email,desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                                            </button>
                                        </th>
                                        <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">Mobile Number</th>
                                        <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">Status</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 font-normal">
                                    {loading ? (
                                        <ListLoader colSpanSet={6} />
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center">
                                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <UserRoundXIcon className="w-6 h-6 text-red-600" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Users</h3>
                                                <p className="text-gray-600 mb-4">{error}</p>
                                                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
                                            </td>
                                        </tr>
                                    ) : noUserFound ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center relative top-15">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                                    <UserSearch className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-700 mb-2">No Users Found</h3>
                                            </td>
                                        </tr>
                                    ) : sysUsers.map((sys_user) => (
                                        <tr key={sys_user.id} onClick={() => console.log(user.userType)}>
                                            <td className={tabledataItemsStyle}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(sys_user.name)} flex items-center justify-center text-white font-semibold`}>
                                                        {sys_user.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-black">{sys_user.name}</p>
                                                        <p>{compareAndGetLabel(roleOptions, sys_user.role[0])}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={tabledataItemsStyle}>{sys_user.empCode}</td>
                                            <td className={tabledataItemsStyle}>{sys_user.email}</td>
                                            <td className={tabledataItemsStyle}>{sys_user.mobile}</td>
                                            <td className={tabledataItemsStyle}>
                                                {/* ✅ Status badge updates instantly via optimistic state */}
                                                <span className={`inline-flex size-fit items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${sys_user.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                                    {sys_user.status}
                                                </span>
                                            </td>
                                            <td className={tabledataItemsStyle}>
                                                {/* ✅ Dynamic options per row — label & color reflect current status */}
                                                <ActionDropDownComp actionOptions={getActionOptions(sys_user)} onAction={(optVal) => callAllActions(optVal, sys_user)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Desktop Pagination */}
                        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <span className="text-sm text-gray-500">
                                    Showing{' '}
                                    <span className="font-medium text-gray-700">{totalElements === 0 ? 0 : (page - 1) * rowsPerpage + 1}</span>
                                    {' '}to{' '}
                                    <span className="font-medium text-gray-700">{Math.min(page * rowsPerpage, totalElements)}</span>
                                    {' '}of{' '}
                                    <span className="font-medium text-gray-700">{totalElements}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Rows per page:</span>
                                    <select value={rowsPerpage} onChange={(e) => { setrowsPerpage(Number(e.target.value)); setpage(1); }}
                                        className="px-2.5 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
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
                    <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4 mt-4">
                        <div className="flex flex-col gap-3">
                            <div className="text-center text-sm text-gray-500">
                                Showing{' '}
                                <span className="font-medium text-gray-700">{totalElements === 0 ? 0 : (page - 1) * rowsPerpage + 1}</span>
                                {' '}–{' '}
                                <span className="font-medium text-gray-700">{Math.min(page * rowsPerpage, totalElements)}</span>
                                {' '}of{' '}
                                <span className="font-medium text-gray-700">{totalElements}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-gray-500">Rows:</span>
                                <select value={rowsPerpage} onChange={(e) => { setrowsPerpage(Number(e.target.value)); setpage(1); }}
                                    className="px-2.5 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
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

export default ManageAllUsers;