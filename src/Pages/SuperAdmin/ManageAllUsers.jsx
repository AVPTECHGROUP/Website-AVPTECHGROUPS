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
import QuickActions from '../../Components/CommonComp/QuickActions';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ListLoader from '../../Components/CommonComp/ListLoader';
import { UserContext } from '../../ContextAPI/UserContext';
import PasswordResetModal from '../../Components/PopupResetPassword/ResetPasswordComponent';
import TooltipComponent from '../../Components/CommonComp/Tooltip_comp/TooltipComp';

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
    const navigate = useNavigate();

    //for handle no user found
    const [noUserFound, set_noUserFound] = useState(false);

    //for roleOptions in filter
    const [roleOptions, setRoleOptions] = useState([]);

    const [sorting, setSorting] = useState('firstName,asc');

    // const [assignId, setAssgnedUserId] = useState(null); //for select user
    const { user } = useContext(UserContext);

    //for open and close popup
    const [isResetOpen, setisResetOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    function compareAndGetLabel(data, compareValue) {
        const found = data.find(item => item.roleVal === compareValue);
        return found ? <span className="text-xs font-medium text-gray-800 bg-gray-100 w-fit rounded-xs px-1 py-0.5"> {found.roleDisplay} </span> : "";
    }

    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                let roleOpt = [];
                const rolesRes = await getAllUserRoles();
                const fetchedRoles = rolesRes.data || [];
                roleOpt = fetchedRoles
                    .filter(val => val.id !== 6 && val.id !== 9)
                    .map(val => ({
                        roleKey: val.id,
                        roleVal: val.name,
                        roleDisplay: val.displayName
                    }));
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
        }, 1100);
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
                set_noUserFound(false);
                const filters = {};
                if (debouncedSearch.trim()) filters.searchTerm = debouncedSearch.trim();
                if (statusFilter !== 'All Status') filters.status = statusFilter.toUpperCase();
                if (roleFilter !== 'All Roles') filters.role = roleFilter;
                console.log(filters);
                res = await allUserFilter(filters, page - 1, rowsPerpage, sorting);

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
    }, [page, rowsPerpage, debouncedSearch, roleFilter, statusFilter, sorting]);

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
    const resetPassword = async (id) => {
        const req_id = id;
        try {
            const reset_res = await resetUserPassword(req_id);
            // toast.success(`${name} : ${reset_res.message}`);
            return reset_res;
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
            setRefressStat(prev => prev + 1);
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
    ]

    let tabledataItemsStyle = 'px-2 py-2 text-left text-gray-700 text-sm';
    const actionOptions = [
        {
            value: "editUser",
            label: "Edit",
            icon: UserPenIcon,
            text: "text-blue-600",
            bg: "bg-blue-50",
            hover: "hover:bg-blue-100",
        },
        {
            value: "toogleStatus",
            label: "Toggle Status",
            icon: Power,
            text: "text-yellow-600",
            bg: "bg-yellow-50",
            hover: "hover:bg-yellow-100",
        },
        {
            value: "resetPassword",
            label: "Password Reset",
            icon: KeyIcon,
            text: "text-green-600",
            bg: "bg-green-50",
            hover: "hover:bg-green-100",
        }
    ];

    //for filter options only for super admin
    const filteredOptions = actionOptions.filter(option => {
        if (user.userType === 'SUPER_ADMIN') {
            // SUPER_ADMIN sees all options
            return true;
        } else {
            // Other users: remove "resetPassword"
            return option.value !== "resetPassword";
        }
    });

    console.log(filteredOptions);


    const callAllActions = async (optVal, user) => {
        if (optVal === 'editUser') navigate(`/dashboard/editUser/${user.id}`);
        else if (optVal === 'resetPassword') {
            setSelectedUser(user);
            setisResetOpen(true);
        }
        // resetPassword(user.id, user.name);
        else if (optVal === 'toogleStatus') handleToggleStatus(user.id, user.name, user.status);
    }

    return (
        <div className="flex h-screen overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-0">
                {/* Page Content */}
                <div className="flex-1 overflow-auto p-2 sm:p-5 lg:p-4">
                    {/* Page Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                <TooltipComponent message="Efficiently manage system roles, permissions and account status." direction='right' color='nocolor'>
                                    Manage All Users
                                </TooltipComponent>
                            </h2>
                        </div>
                    </div>
                    {/* cards */}
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

                    {/* quick actions
                    <QuickActions buttonText='Add new User' navigateTo='/dashboard/addUser' /> */}

                    {/* popup */}
                    <PasswordResetModal isOpen={isResetOpen} onClose={() => { setisResetOpen(!isResetOpen); }} userName={selectedUser?.name}
                        onReset={() => resetPassword(selectedUser?.id, selectedUser?.name)} currUserId={selectedUser?.id} />

                    {/* filters */}
                    <div className="bg-white grid grid-cols-2 lg:grid-cols-5 gap-3 px-4 py-3 rounded-xl border border-gray-200 mb-4 mt-4">

                        {/* Add User Button */}
                        <button
                            onClick={() => navigate('/dashboard/adduser')}
                            className="col-span-2 lg:col-span-1 px-4 py-2.5 w-full cursor-pointer rounded-lg font-medium flex items-center justify-center gap-2 transition-all bg-blue-600 text-white"
                        >
                            <UserPlusIcon className="w-5 h-5" />
                            Add User
                        </button>

                        {/* Search */}
                        <div className="col-span-2 flex items-center gap-2 border rounded-lg border-gray-200 bg-gray-100 px-2 py-1 focus-within:shadow-sm focus-within:shadow-blue-200">
                            <SearchIcon className="w-5 h-5 text-gray-500" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setsearch(e.target.value);
                                    setpage(1);
                                }}
                                placeholder="Search by name, email or ID.."
                                className="text-base sm:text-sm font-normal focus:outline-none appearance-none text-gray-600 w-full bg-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setpage(1);
                            }}
                            className="col-span-1 px-4 py-2 border cursor-pointer border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
                        >
                            <option value="All Status">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setroleFilter(e.target.value);
                                setpage(1);
                            }}
                            className="cursor-pointer col-span-1 px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
                        >
                            <option value={"All Roles"}>All Roles</option>
                            {roleOptions.map((item) => (
                                <option key={item.roleKey} value={item.roleVal}>
                                    {item.roleDisplay}
                                </option>
                            ))}
                        </select>

                    </div>
                    {/* MOBILE/TABLET CARDS VIEW (visible below 1024px) */}
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
                                            <p>
                                                {compareAndGetLabel(roleOptions, sys_user.role[0])}
                                            </p>
                                        </div>
                                    </div>
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
                                        <ActionDropDownComp actionOptions={filteredOptions} onAction={(optVal) => callAllActions(optVal, sys_user)} />
                                    </div>
                                </div>
                            </div>
                        )))}
                    </div>

                    {/* DESKTOP TABLE (visible 1024px and above) */}
                    <div className="hidden lg:block bg-white rounded-xl border border-gray-200 ">
                        <div className="overflow-x-auto min-h-[calc(300px)] max-h-[calc(100vh-340px)] overflow-y-auto">
                            <table className="w-full ">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        <th key={'User_Name'} className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-11">
                                            <button
                                                onClick={() => setSorting(prev =>
                                                    prev === 'firstName,asc'
                                                        ? 'firstName,desc'
                                                        : 'firstName,asc'
                                                )}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase"
                                            >
                                                User Name
                                                {sorting === 'firstName,desc' ? < ArrowDown size={16} className='text-xs' /> : < ArrowUp size={16} className='text-xs' />}
                                            </button>
                                        </th>
                                        <th key={'Employee_Id'} className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                            <button
                                                onClick={() => setSorting(prev =>
                                                    prev === 'employeeCode,asc'
                                                        ? 'employeeCode,desc'
                                                        : 'employeeCode,asc'
                                                )}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase"
                                            >
                                                Employee Id
                                                {sorting === 'employeeCode,desc' ? < ArrowDown size={16} className='text-xs' /> : < ArrowUp size={16} className='text-xs' />}
                                            </button>
                                        </th>
                                        <th key={'Email'} className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                            <button
                                                onClick={() => setSorting(prev =>
                                                    prev === 'email,asc'
                                                        ? 'email,desc'
                                                        : 'email,asc'
                                                )}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase"
                                            >
                                                Email
                                                {sorting === 'email,desc' ? < ArrowDown size={16} className='text-xs' /> : < ArrowUp size={16} className='text-xs' />}
                                            </button>
                                        </th>
                                        <th key={'Mobile_Number'} className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                            Mobile Number
                                        </th>
                                        <th key={'Status'} className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                            Status
                                        </th>

                                        <th key='ACTIONS' className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-50">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 font-normal">
                                    {loading ? (
                                        <ListLoader colSpanSet={6} />
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
                                        <tr key={sys_user.id} onClick={() => {
                                            console.log(user.userType);
                                        }}>
                                            <td className={tabledataItemsStyle}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(sys_user.name)} flex items-center justify-center text-white font-semibold`}>
                                                        {sys_user.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-black">{sys_user.name}</p>
                                                        <p>
                                                            {compareAndGetLabel(roleOptions, sys_user.role[0])}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/*-------------------------------------------- employee id-------------------------------------------- */}
                                            <td className={tabledataItemsStyle}>
                                                {sys_user.empCode}
                                            </td>
                                            {/*------------------------------------------------ email ------------------------------------------------*/}
                                            <td className={tabledataItemsStyle}>
                                                {sys_user.email}
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
                                                <ActionDropDownComp actionOptions={filteredOptions} onAction={(optVal) => callAllActions(optVal, sys_user)} />
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
                                        className="cursor-pointer px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    disabled={page === totalPages || loading || error}
                                    className="cursor-pointer px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx + 1}
                                        onClick={() => setpage(idx + 1)}
                                        className={`px-3 py-1 rounded transition-all ${page === idx + 1
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    type='button'
                                    onClick={() => setpage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages || loading || error}
                                    className="cursor-pointer px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                    className="cursor-pointer px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setpage(prev => Math.max(1, prev - 1))}
                                    disabled={page === totalPages || loading || error}
                                    className="cursor-pointer px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                                    : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
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
                                    type='button'
                                    onClick={() => setpage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages || loading || error}
                                    className="cursor-pointer px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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