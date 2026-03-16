import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    ChevronLeft,
    SchoolIcon,
    Power,
    CheckCircle2,
    SearchIcon,
    BuildingIcon,
    PenIcon,
    Eye,
    ArrowDown,
    ArrowUp,
    PlusIcon,
    XCircleIcon,
    BookOpenIcon,
    MapPinIcon,
    UserIcon,
    CalendarIcon,
} from 'lucide-react';
import { toast } from 'react-toastify';
import ActionDropDownComp from '../../Components/CommonComp/ActionDropDownComp';
import CardComponent from '../../Components/CommonComp/CardComponent';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ListLoader from '../../Components/CommonComp/ListLoader';
import { UserContext } from '../../ContextAPI/UserContext';
import TooltipComponent from '../../Components/CommonComp/Tooltip_comp/TooltipComp';

// ─── Mock API Calls (replace with real imports) ───────────────────────────────
// import {
//     getAllSchools,
//     getSchoolStatistics,
//     activateSchool,
//     deactivateSchool,
//     getAllBoards,
// } from '../../Api/schoolManagementAPI';

const SchoolManagement = () => {
    const [search, setsearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [boardFilter, setBoardFilter] = useState('All Boards');
    const [page, setpage] = useState(1);
    const [rowsPerpage, setrowsPerpage] = useState(20);
    const [statistics, setstatistics] = useState({
        totalSchools: 12,
        activeSchools: 10,
        inactiveSchools: 2,
        boardTypes: 3,
    });
    const [error, setError] = useState(null);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [noSchoolFound, setNoSchoolFound] = useState(false);
    const [boardOptions, setBoardOptions] = useState([
        { key: 1, val: 'CBSE', display: 'CBSE' },
        { key: 2, val: 'ICSE', display: 'ICSE' },
        { key: 3, val: 'STATE_BOARD', display: 'State Board' },
    ]);
    const [sorting, setSorting] = useState('schoolName,asc');
    const { user } = useContext(UserContext);
    const [refressStat, setRefressStat] = useState(0);

    // ── Board badge color map ─────────────────────────────────────────────────
    const boardBadgeStyle = {
        CBSE: 'bg-blue-100 text-blue-700',
        ICSE: 'bg-purple-100 text-purple-700',
        STATE_BOARD: 'bg-yellow-100 text-yellow-700',
    };

    const getBoardBadge = (board) => {
        const style = boardBadgeStyle[board] || 'bg-gray-100 text-gray-700';
        const label = boardOptions.find(b => b.val === board)?.display || board;
        return (
            <span className={`text-xs font-medium rounded-xs px-2 py-0.5 ${style}`}>
                {label}
            </span>
        );
    };

    // ── Debounce search ───────────────────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1100);
        return () => clearTimeout(timer);
    }, [search]);

    // ── Fetch statistics ──────────────────────────────────────────────────────
    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                // const res = await getSchoolStatistics();
                // setstatistics(res.data);
                // Using mock data (already seeded in useState)
            } catch (e) {
                console.error('get statistics error:', e.message);
            }
        };
        fetchStatistics();
    }, [refressStat]);

    // ── Fetch schools ─────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchSchools = async () => {
            setLoading(true);
            setError(null);
            try {
                setNoSchoolFound(false);

                // Replace with real API call:
                // const filters = {};
                // if (debouncedSearch.trim()) filters.searchTerm = debouncedSearch.trim();
                // if (statusFilter !== 'All Status') filters.status = statusFilter.toUpperCase();
                // if (boardFilter !== 'All Boards') filters.board = boardFilter;
                // const res = await getAllSchools(filters, page - 1, rowsPerpage, sorting);

                // ── Mock data ─────────────────────────────────────────────────
                await new Promise(r => setTimeout(r, 600));
                const mockData = [
                    { id: 1, schoolName: 'Delhi Public School', email: 'dps@school.in', code: 'SCH001', board: 'CBSE', city: 'New Delhi', state: 'Delhi', principal: 'Dr. R. Sharma', estYear: 1972, status: 'ACTIVE' },
                    { id: 2, schoolName: 'Ryan International School', email: 'ryan@school.in', code: 'SCH002', board: 'ICSE', city: 'Mumbai', state: 'Maharashtra', principal: 'Mrs. P. Nair', estYear: 1995, status: 'ACTIVE' },
                    { id: 3, schoolName: 'Kendriya Vidyalaya No. 1', email: 'kv1@school.in', code: 'SCH003', board: 'CBSE', city: 'Bangalore', state: 'Karnataka', principal: 'Mr. S. Rao', estYear: 1963, status: 'INACTIVE' },
                    { id: 4, schoolName: "St. Mary's Convent School", email: 'stmarys@school.in', code: 'SCH004', board: 'STATE_BOARD', city: 'Pune', state: 'Maharashtra', principal: "Sr. A. D'Souza", estYear: 1988, status: 'ACTIVE' },
                    { id: 5, schoolName: 'Navodaya Vidyalaya', email: 'nvs@school.in', code: 'SCH005', board: 'CBSE', city: 'Jaipur', state: 'Rajasthan', principal: 'Mr. K. Mehta', estYear: 2001, status: 'ACTIVE' },
                    { id: 6, schoolName: 'The Cathedral School', email: 'cathedral@school.in', code: 'SCH006', board: 'ICSE', city: 'Chennai', state: 'Tamil Nadu', principal: 'Ms. L. Thomas', estYear: 1945, status: 'ACTIVE' },
                ];

                let filtered = mockData;
                if (debouncedSearch.trim()) {
                    const q = debouncedSearch.toLowerCase();
                    filtered = filtered.filter(s =>
                        s.schoolName.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
                    );
                }
                if (statusFilter !== 'All Status') filtered = filtered.filter(s => s.status === statusFilter);
                if (boardFilter !== 'All Boards') filtered = filtered.filter(s => s.board === boardFilter);

                // Sorting
                const [sortField, sortDir] = sorting.split(',');
                filtered.sort((a, b) => {
                    const av = String(a[sortField] || '');
                    const bv = String(b[sortField] || '');
                    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
                });

                const total = filtered.length;
                const paginated = filtered.slice((page - 1) * rowsPerpage, page * rowsPerpage);

                if (paginated.length === 0) setNoSchoolFound(true);
                setSchools(paginated);
                setTotalElements(total);
                setTotalPages(Math.ceil(total / rowsPerpage));
            } catch (err) {
                console.error('Error fetching schools:', err);
                setError(err.message || 'Something went wrong');
                setSchools([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSchools();
    }, [page, rowsPerpage, debouncedSearch, boardFilter, statusFilter, sorting]);

    // ── Toggle status ─────────────────────────────────────────────────────────
    const handleToggleStatus = async (id, name, isStatus) => {
        try {
            // await (isStatus === 'ACTIVE' ? deactivateSchool(id) : activateSchool(id));
            setRefressStat(prev => prev + 1);
            const newStatus = isStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            toast.success(`Status updated: ${name}`);
            setSchools(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        } catch (error) {
            toast.error(error.message || 'Status update failed');
        }
    };

    // ── Smart Pagination ──────────────────────────────────────────────────────
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
    // ─────────────────────────────────────────────────────────────────────────

    const cardsArray = [
        { IconName: BuildingIcon, keyName: 'Total Schools', val: statistics.totalSchools, iconTxColor: 'text-blue-600', iconBgColor: 'bg-blue-50' },
        { IconName: CheckCircle2, keyName: 'Active Schools', val: statistics.activeSchools, iconTxColor: 'text-green-600', iconBgColor: 'bg-green-50' },
        { IconName: XCircleIcon, keyName: 'Inactive Schools', val: statistics.inactiveSchools, iconTxColor: 'text-yellow-600', iconBgColor: 'bg-yellow-50' },
        { IconName: BookOpenIcon, keyName: 'Board Types', val: statistics.boardTypes, iconTxColor: 'text-indigo-600', iconBgColor: 'bg-indigo-50' },
    ];

    const tabledataItemsStyle = 'px-3 py-3 text-left text-gray-700 text-sm';

    const actionOptions = [
        { value: 'viewSchool', label: 'View', icon: Eye, text: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:bg-blue-100' },
        { value: 'editSchool', label: 'Edit', icon: PenIcon, text: 'text-yellow-600', bg: 'bg-yellow-50', hover: 'hover:bg-yellow-100' },
        { value: 'toggleStatus', label: 'Toggle Status', icon: Power, text: 'text-red-600', bg: 'bg-red-50', hover: 'hover:bg-red-100' },
    ];

    const callAllActions = async (optVal, school) => {
        if (optVal === 'viewSchool') navigate(`/school/${school.id}`);
        else if (optVal === 'editSchool') navigate(`/school/editSchool/${school.id}`);
        else if (optVal === 'toggleStatus') handleToggleStatus(school.id, school.schoolName, school.status);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
            <div className="flex-1 flex flex-col overflow-hidden w-0">
                <div className="flex-1 overflow-auto p-2 sm:p-5 lg:p-4">

                    {/* Page Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            <TooltipComponent message="Manage all registered schools, boards, and their operational status." direction="right" color="nocolor">
                                Schools Management
                            </TooltipComponent>
                        </h2>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-sm mt-5">
                        {loading
                            ? cardsArray.map((_, i) => <CardLoader key={i} />)
                            : cardsArray.map((card) => (
                                <CardComponent key={card.keyName} IconName={card.IconName} keyName={card.keyName.toUpperCase()}
                                    val={card.val} iconTxColor={card.iconTxColor} iconBgColor={card.iconBgColor} />
                            ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white grid grid-cols-2 lg:grid-cols-5 gap-3 px-4 py-3 rounded-xl border border-gray-200 mb-4 mt-4">
                        {/* Search */}
                        <div className="col-span-2 lg:col-span-2 flex items-center gap-2 border rounded-lg border-gray-200 bg-gray-100 px-2 py-1 focus-within:shadow-sm focus-within:shadow-blue-200">
                            <SearchIcon className="w-5 h-5 text-gray-500 shrink-0" />
                            <input
                                value={search}
                                onChange={(e) => { setsearch(e.target.value); setpage(1); }}
                                placeholder="Search by school name or code..."
                                className="text-base sm:text-sm font-normal focus:outline-none appearance-none text-gray-600 w-full bg-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setpage(1); }}
                            className="col-span-1 px-4 py-2 border cursor-pointer border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
                        >
                            <option value="All Status">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                        {/* Board Filter */}
                        <select
                            value={boardFilter}
                            onChange={(e) => { setBoardFilter(e.target.value); setpage(1); }}
                            className="cursor-pointer col-span-1 px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
                        >
                            <option value="All Boards">All Boards</option>
                            {boardOptions.map((item) => (
                                <option key={item.key} value={item.val}>{item.display}</option>
                            ))}
                        </select>

                        {/* Add School Button */}
                        <button
                            onClick={() => navigate('/school/addSchool')}
                            className="col-span-2 lg:col-span-1 px-4 py-2.5 w-full cursor-pointer rounded-lg font-medium flex items-center justify-center gap-2 transition-all bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <PlusIcon className="w-5 h-5" /> Add New School
                        </button>
                    </div>

                    {/* MOBILE / TABLET CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                        {loading ? (
                            <div className="text-center py-8 col-span-2">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                    <span className="text-gray-600">Loading schools...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 col-span-2">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircleIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Schools</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
                            </div>
                        ) : noSchoolFound ? (
                            <div className="text-center py-8 col-span-2">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SchoolIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Schools Found</h3>
                                <p className="text-gray-600 mb-4">There are no schools to display.</p>
                            </div>
                        ) : schools.map((school) => (
                            <div key={school.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">{school.schoolName}</p>
                                        <p className="text-xs text-gray-400">{school.email}</p>
                                        <div className="mt-1">{getBoardBadge(school.board)}</div>
                                    </div>
                                    <span className="text-xs font-medium bg-gray-100 text-gray-700 rounded px-2 py-0.5 shrink-0">{school.code}</span>
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    <p className="flex items-center gap-2 text-gray-600"><MapPinIcon className="w-3.5 h-3.5" />{school.city}, {school.state}</p>
                                    <p className="flex items-center gap-2 text-gray-600"><UserIcon className="w-3.5 h-3.5" />{school.principal}</p>
                                    <p className="flex items-center gap-2 text-gray-600"><CalendarIcon className="w-3.5 h-3.5" />Est. {school.estYear}</p>
                                    <p>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${school.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'ACTIVE' ? 'bg-green-700' : 'bg-red-700'}`} />
                                            {school.status}
                                        </span>
                                    </p>
                                    <div className="flex justify-start items-center pt-1">
                                        <ActionDropDownComp actionOptions={actionOptions} onAction={(optVal) => callAllActions(optVal, school)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden lg:block bg-white rounded-xl border border-gray-200">
                        {/* Table header label */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                            <span className="text-sm font-semibold text-gray-700">All Schools</span>
                            <span className="text-xs text-gray-500">{totalElements} schools total</span>
                        </div>

                        <div className="overflow-x-auto min-h-[calc(300px)] max-h-[calc(100vh-380px)] overflow-y-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10 w-8">#</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">
                                            <button
                                                onClick={() => setSorting(prev => prev === 'schoolName,asc' ? 'schoolName,desc' : 'schoolName,asc')}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase"
                                            >
                                                School Name {sorting === 'schoolName,desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                            </button>
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">
                                            <button
                                                onClick={() => setSorting(prev => prev === 'code,asc' ? 'code,desc' : 'code,asc')}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase"
                                            >
                                                Code {sorting === 'code,desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                            </button>
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Board</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">
                                            <button
                                                onClick={() => setSorting(prev => prev === 'city,asc' ? 'city,desc' : 'city,asc')}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase"
                                            >
                                                City / State {sorting === 'city,desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                            </button>
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Principal</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">
                                            <button
                                                onClick={() => setSorting(prev => prev === 'estYear,asc' ? 'estYear,desc' : 'estYear,asc')}
                                                className="flex items-center gap-1 hover:text-gray-700 cursor-pointer uppercase"
                                            >
                                                Est. Year {sorting === 'estYear,desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                            </button>
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Status</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 font-normal">
                                    {loading ? (
                                        <ListLoader colSpanSet={9} />
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-8 text-center">
                                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <XCircleIcon className="w-6 h-6 text-red-600" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Schools</h3>
                                                <p className="text-gray-600 mb-4">{error}</p>
                                                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
                                            </td>
                                        </tr>
                                    ) : noSchoolFound ? (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-8 text-center relative top-15">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                                    <SchoolIcon className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-700 mb-2">No Schools Found</h3>
                                            </td>
                                        </tr>
                                    ) : schools.map((school, idx) => (
                                        <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-3 text-gray-400 text-sm">{(page - 1) * rowsPerpage + idx + 1}</td>
                                            <td className={tabledataItemsStyle}>
                                                <p className="font-semibold text-gray-900">{school.schoolName}</p>
                                                <p className="text-xs text-gray-400">{school.email}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5">{school.code}</span>
                                            </td>
                                            <td className="px-3 py-3">{getBoardBadge(school.board)}</td>
                                            <td className={tabledataItemsStyle}>{school.city}, {school.state}</td>
                                            <td className={tabledataItemsStyle}>{school.principal}</td>
                                            <td className={tabledataItemsStyle}>{school.estYear}</td>
                                            <td className="px-3 py-3">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${school.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {school.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <ActionDropDownComp actionOptions={actionOptions} onAction={(optVal) => callAllActions(optVal, school)} />
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
                                    {' '}–{' '}
                                    <span className="font-medium text-gray-700">{Math.min(page * rowsPerpage, totalElements)}</span>
                                    {' '}of{' '}
                                    <span className="font-medium text-gray-700">{totalElements}</span>
                                    {' '}schools
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Rows per page:</span>
                                    <select
                                        value={rowsPerpage}
                                        onChange={(e) => { setrowsPerpage(Number(e.target.value)); setpage(1); }}
                                        className="px-2.5 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
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
                                <select
                                    value={rowsPerpage}
                                    onChange={(e) => { setrowsPerpage(Number(e.target.value)); setpage(1); }}
                                    className="px-2.5 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
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

export default SchoolManagement;