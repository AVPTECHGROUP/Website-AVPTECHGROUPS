import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    ChevronLeft,
    Edit,
    UserPlusIcon,
    UserRoundXIcon,
    Eye,
    Power,
    UserCheck2,
    SearchIcon,
    UsersIcon,
    Banknote,
    UserRoundSearchIcon,
    UserPenIcon,
    RotateCcwKey,
    LogOut,
    User,
    UserSearch,
    ShieldAlertIcon,
    ShieldBanIcon,
    KeyIcon,
    LogOutIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import { activateUserStatus, deactivateUserStatus, filterUserByRole, filterUserByStatus, getAllUserRoles, getAllUsers, getUsersStatistics, resetUserPassword, searchUsers } from '../../Api/userManagementAPI';
import ActionDropDownComp from '../../Components/CommonComp/ActionDropDownComp';
import CardComponent from '../../Components/CommonComp/CardComponent';
import QuickActions from '../../Components/CommonComp/QuickActions';

const ManageAllUsers = () => {
    // Stores text typed in search input (sys_user name / id / role)
    const [search, setsearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    // Stores selected status  filter (Active / Inactive / All)
    const [statusFilter, setStatusFilter] = useState('All Status');
    // Stores selected class filter (Class 5A, 6B etc.)
    const [roleFilter, setroleFilter] = useState('All Roles');
    // Stores current page number for pagination
    const [page, setpage] = useState(1);
    // Stores number of rows to show per page in table
    const [rowsPerpage, setrowsPerpage] = useState(10);
    //for store statistics
    const [statistics, setstatistics] = useState({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        suspendedUsers: 0,
        pendingUsers: 0
    });
    // Controls mobile search bar visibility (true = open, false = closed)
    const [error, setError] = useState(null);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sysUsers, setsysUsers] = useState([])
    const [loading, setLoading] = useState(false);
    const [isAction, setisAction] = useState('add');
    const date = new Date().toLocaleDateString();
    const navigate = useNavigate();

    //for handle no user found
    const [noUserFound, set_noUserFound] = useState(false);

    //for roleOptions in filter
    const [roleOptions, setRoleOptions] = useState([]);

    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                let roleOpt = [];
                const rolesRes = await getAllUserRoles();
                const fetchedRoles = rolesRes.data || [];
                roleOpt = fetchedRoles.map((val) => (
                    {
                        roleKey: val.id,
                        roleVal: val.name,
                        roleDisplay: val.displayName
                    }
                ))
                setRoleOptions(roleOpt);
            }
            catch (e) {
                console.error('Fetch roles error:', e.message);
                throw e;
            }
        };
        fetchUserRoles();
    }, []);
    //debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const hasActiveFilters = useMemo(() => {
        return (
            debouncedSearch.trim() !== '' ||
            statusFilter !== 'All Status' ||
            roleFilter !== 'All Roles'
        );
    }, [debouncedSearch, statusFilter, roleFilter]);

    //useEffect only for once dependency as runs or adding user statistics
     const [refressStat, setRefressStat] = useState(0);
    useEffect(() => {
        let fetchStatistics = async () => {
            try {
                const statistics_res = await getUsersStatistics(); // for total statistics
                const res = statistics_res.data;
                setstatistics(res);
            }
            catch (e) {
                console.error("get statistics error:", e.message);
                throw error;
            }
        }
        fetchStatistics();
    }, [refressStat])

    useEffect(() => {
        const fetchsysUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                let res;
                set_noUserFound(false); // for reset no user found
                if (hasActiveFilters) {
                    if (debouncedSearch.trim() !== '') {
                        const searchTerm = debouncedSearch.trim();
                        console.log(searchTerm);
                        res = await searchUsers(searchTerm, page - 1, rowsPerpage);
                    } else if (statusFilter !== 'All Status' && statusFilter !== undefined) {
                        res = await filterUserByStatus(statusFilter, page - 1, rowsPerpage);

                    } else if (roleFilter !== 'All Roles' && roleFilter !== undefined) {
                        res = await filterUserByRole(roleFilter, page - 1, rowsPerpage);
                        console.log(roleFilter, "------------->", res);
                    } else {
                        res = await getAllUsers(page - 1, rowsPerpage);
                    }

                    // const filters = { searchTerm: "", status: "", role: "", department: "", emailVerified: true };
                    // if (debouncedSearch.trim()) filters.searchTerm = debouncedSearch.trim();
                    // if (statusFilter !== 'All Status') filters.status = statusFilter.toUpperCase();
                    // if (roleFilter !== 'All Roles') filters.role = roleFilter;
                    //console.log(filters);
                    // res = await allUserFilter(filters, page - 1, rowsPerpage);
                }
                else {
                    res = await getAllUsers(page - 1, rowsPerpage);
                }

                const sys_userArray = res.data || [];

                if (sys_userArray.length === 0) {
                    set_noUserFound(true);
                } else {
                    set_noUserFound(false);
                }

                const mappedsysUsers = sys_userArray.map((sys_user) => ({
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
                }));

                setsysUsers(mappedsysUsers); // Set mapped data to state for UI rendering

                // Pagination
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
    }, [page, rowsPerpage, debouncedSearch, roleFilter, statusFilter]);

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

    // reset user password
    const resetPassword = async (id, name) => {
        const req_id = id;
        try {
            const reset_res = await resetUserPassword(req_id);
            toast.success(`${name} : ${reset_res.message}`);
        } catch (error) {
            toast.error(error.message || 'Reset password failed');
        }
    }
    //activate & deactivate user
    const handleToggleStatus = async (id, name, isStatus) => {
        try {
            // Here you would call your API to toggle status (activate/deactivate)
            const isActive = isStatus;
            console.log(isActive)
            const messageStatus = await (isActive === 'ACTIVE' ? deactivateUserStatus(id) : activateUserStatus(id));
            //  status === 'Active' ? 'Inactive' : 'Active';
            setRefressStat(prev => prev+1);
            toast.success(`${messageStatus.message} : ${name}`);
            // Update local state to reflect the change
            const newStatus = isActive === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            setsysUsers(prev => prev.map(user => user.id === id ? { ...user, status: newStatus } : user));
            
        } catch (error) {
            toast.error(error.message || 'Status update failed');
        }
    }

    //for optimize code 
    const cardsArray = [{ IconName: UsersIcon, keyName: "Total Users", val: statistics.totalUsers, iconTxColor: "text-blue-600", iconBgColor: "bg-blue-50" },
    { IconName: UserCheck2, keyName: "Active Users", val: statistics.activeUsers, iconTxColor: "text-green-600", iconBgColor: "bg-green-50" },
    { IconName: UserRoundXIcon, keyName: "Inactive Users", val: statistics.inactiveUsers, iconTxColor: "text-red-600", iconBgColor: "bg-red-50" },
    // { IconName: ShieldBanIcon, keyName: "Suspended Users", val: statistics.suspendedUsers, iconTxColor: "text-orange-600", iconBgColor: "bg-orange-50" },
    // { IconName: ShieldAlertIcon, keyName: "Pending Users", val: statistics.pendingUsers, iconTxColor: "text-yellow-600", iconBgColor: "bg-yellow-50" }
]

    const tableHeadItems = ['User Name', 'Mobile Number', 'Status'];
    let tabledataItemsStyle = 'px-6 py-3 text-left text-gray-700 text-sm';
    const actionOptions = [
        {
            value: "editUser",
            label: "Edit User",
            icon: UserPenIcon,
            text: "text-blue-600",
            bg: "bg-blue-50",
            hover: "hover:bg-blue-100",
        },
        {
            value: "resetPassword",
            label: "Reset Password",
            icon: KeyIcon,
            text: "text-green-600",
            bg: "bg-green-50",
            hover: "hover:bg-green-100",
        },
        {
            value: "toogleStatus",
            label: "Toggle Status",
            icon: Power,
            text: "text-yellow-600",
            bg: "bg-yellow-50",
            hover: "hover:bg-yellow-100",
        },
    ];
    const callAllActions = async (optVal, user) => {
        if (optVal === 'editUser') navigate(`/dashboard/editUser/${user.id}`);
        else if (optVal === 'resetPassword') resetPassword(user.id, user.name);
        else if (optVal === 'toogleStatus') handleToggleStatus(user.id, user.name, user.status);
    }

    return (
        <div className="flex h-screen overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-0">
                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 sm:p-5 lg:p-4">
                    {/* Page Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage All Users</h2>
                            <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Efficiently manage system roles, permissions and account statuses.</p>
                        </div>
                    </div>

                    {/* cards */}
                    <div className="grid sm:grid-cols-3 grid-cols-1 gap-3 mb-8 pt-6">
                        {
                            cardsArray.map((card) => (
                                <CardComponent key={card.keyName} IconName={card.IconName} keyName={card.keyName.toUpperCase()} val={card.val} iconTxColor={card.iconTxColor} iconBgColor={card.iconBgColor} />
                            ))
                        }
                    </div>

                    {/* quick actions */}
                    <QuickActions />

                    {/* filters */}
                    <div className="bg-white grid  lg:grid-cols-3 gap-2 px-4 py-2 rounded-xl border border-gray-200 mb-4">
                        <div className="flex col-span-2 items-center gap-2 border rounded-lg border-gray-200 bg-gray-100 px-2 py-1 focus-within:shadow-sm focus-within:shadow-blue-200">
                            <SearchIcon className="w-5 h-5 text-gray-500" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setsearch(e.target.value);
                                    setpage(1);
                                }}
                                placeholder='Search by name, email or ID..' className="text-base sm:text-sm font-normal focus:outline-none  appearance-none text-gray-600 w-full" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setpage(1);
                                }}
                                className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
                            >
                                <option value='All Status'>All Status</option>
                                <option value='ACTIVE'>Active</option>
                                <option value='INACTIVE'>Inactive</option>
                            </select>

                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setroleFilter(e.target.value);
                                    setpage(1);
                                }}
                                className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
                            >
                                <option value={'All Roles'}>All Roles</option>
                                {
                                    roleOptions.map((item) => (
                                        <option key={item.roleKey} value={item.roleVal}>{item.roleDisplay}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    {/* MOBILE/TABLET CARDS VIEW (visible below 1024px) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600 font-medium">Loading users...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserRoundXIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Users</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : noUserFound ? <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserSearch className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Users Found</h3>
                            <p className="text-gray-600 mb-4">There are no users to display.</p>
                        </div> : (sysUsers.map((sys_user) => (
                            // -------------------MOBILE & TABLET – CARD VIEW----------------
                            <div key={sys_user.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                {/* Header */}
                                <div className="outerHeadCard flex justify-between ">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-12 h-12 rounded-full ${getAvatarColor(sys_user.name)} flex items-center justify-center text-white font-semibold`}>
                                            {sys_user.avatar}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{sys_user.name}</p>
                                            <p
                                                className={"text-xs rounded-lg w-fit py-0.5 px-2 text-gray-700 font-medium"}
                                            >
                                                {sys_user.role[0]}
                                            </p>
                                        </div>
                                    </div>
                                    {/* <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(sys_user.id, sys_user.name, sys_user.status)}
                                            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${sys_user.status === 'ACTIVE' ? "bg-blue-500" : "bg-gray-300"
                                                } cursor-pointer`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${sys_user.status === 'ACTIVE' ? "translate-x-4" : "translate-x-0"
                                                    }`}
                                            />
                                        </button>

                                    </div> */}
                                </div>
                                {/* Details */}
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="font-medium text-gray-600">Contact:</span>
                                        <span className="text-gray-800 ml-4">{sys_user.mobile}</span>
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-600">Status:</span>
                                        <span
                                            className={`inline-flex size-fit items-center gap-1 px-3 py-1 ml-6 rounded-sm text-xs font-medium ${sys_user.status === "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-700"
                                                }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${sys_user.status === "ACTIVE"
                                                    ? "bg-green-700"
                                                    : "bg-red-700"
                                                    }`}
                                            />
                                            {sys_user.status}
                                        </span>
                                    </p>
                                    <div className='flex justify-start items-center align-middle'>
                                        <span className="font-medium text-gray-600">Actions: </span>
                                        <span className="text-gray-800 ml-4">
                                            <ActionDropDownComp actionOptions={actionOptions} onAction={(optVal) => callAllActions(optVal, sys_user)} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )))}
                    </div>

                    {/* DESKTOP TABLE (visible 1024px and above) */}
                    <div className="hidden lg:block bg-white rounded-xl border border-gray-200 ">
                        <div className="overflow-x-auto min-h-[calc(250px)] max-h-[calc(100vh-510px)] overflow-y-auto">
                            <table className="w-full ">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        {tableHeadItems.map((headings) => (
                                            <th key={headings} className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                                {headings}
                                            </th>
                                        ))}
                                        <th key='ACTIONS' className="px-6 py-3 text-start text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 font-normal">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="11" className="px-6 py-8 text-center">
                                                <div className="flex items-center justify-center flex-col">
                                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                    <p className="text-gray-600 font-medium ml-4">Loading users...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="11" className="px-6 py-8 text-center">
                                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <UserRoundXIcon className="w-6 h-6 text-red-600" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Users</h3>
                                                <p className="text-gray-600 mb-4">{error}</p>
                                                <button
                                                    onClick={() => window.location.reload()}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Retry
                                                </button>
                                            </td>
                                        </tr>
                                    ) : noUserFound ? <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                                <UserSearch className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-700 mb-2">No Users Found</h3>
                                        </td>
                                    </tr> : (sysUsers.map((sys_user) => (
                                        <tr key={sys_user.id} className="hover:bg-gray-50">
                                            <td className={tabledataItemsStyle}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(sys_user.name)} flex items-center justify-center text-white font-semibold`}>
                                                        {sys_user.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-black">{sys_user.name}</p>
                                                        <p
                                                            className={`text-sm w-fit px-1 text-gray-600`}
                                                        >
                                                            {sys_user.role[0]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={tabledataItemsStyle}>{sys_user.mobile}</td>
                                            <td className={tabledataItemsStyle}>
                                                <p>
                                                    <span
                                                        className={`inline-flex size-fit items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${sys_user.status === "ACTIVE"
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-red-50 text-red-700"
                                                            }`}
                                                    >
                                                        {sys_user.status}
                                                    </span>
                                                </p>

                                            </td>
                                            <td className={tabledataItemsStyle}>
                                                <ActionDropDownComp  actionOptions={actionOptions} onAction={(optVal) => callAllActions(optVal, sys_user)} />
                                            </td>
                                        </tr>
                                    )))
                                    }
                                </tbody>
                            </table>
                        </div>

                        {/* Desktop Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <span className="text-sm text-gray-700">
                                    {(() => {
                                        const safeTotalElements = Number(totalElements) || 0;
                                        const safeRowsPerPage = Number(rowsPerpage) || 10;
                                        const safePage = Number(page) || 1;

                                        return (
                                            <>
                                                Showing {(safePage - 1) * safeRowsPerPage + 1} to{' '}
                                                {Math.min(safePage * safeRowsPerPage, safeTotalElements)} of {safeTotalElements}
                                            </>
                                        );
                                    })()}

                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">Rows per page:</span>
                                    <select
                                        value={rowsPerpage}
                                        onChange={(e) => {
                                            setrowsPerpage(Number(e.target.value));
                                            setpage(1);
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
                                    onClick={() => setpage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1 || loading || error}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx + 1}
                                        onClick={() => setpage(idx + 1)}
                                        className={`px-3 py-1 rounded transition-all ${page === idx + 1
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    type='button'
                                    onClick={() => setpage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === 1 || loading || error}
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
                            <div className="text-center">
                                {(() => {
                                    const safeTotalElements = Number(totalElements) || 0;
                                    const safeRowsPerPage = Number(rowsPerpage) || 10;
                                    const safePage = Number(page) || 1;

                                    return (
                                        <>
                                            Showing {(safePage - 1) * safeRowsPerPage + 1} to{' '}
                                            {Math.min(safePage * safeRowsPerPage, safeTotalElements)} of {safeTotalElements}
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-gray-700">Rows:</span>
                                <select
                                    value={rowsPerpage}
                                    onChange={(e) => {
                                        setrowsPerpage(Number(e.target.value));
                                        setpage(1);
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
                                    onClick={() => setpage(prev => Math.max(1, prev - 1))}
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
                                                onClick={() => setpage(idx + 1)}
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
                                                onClick={() => setpage(1)}
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
                                                    onClick={() => setpage(page)}
                                                    className="px-3 py-1 rounded bg-blue-500 text-white"
                                                >
                                                    {page}
                                                </button>
                                            )}
                                            {page < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                                            <button
                                                onClick={() => setpage(totalPages)}
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
                                    type="button"
                                    onClick={() => setpage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === 1 || loading || error}
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
        </div >
    );
};
export default ManageAllUsers;