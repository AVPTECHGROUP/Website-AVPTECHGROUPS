import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Search, ChevronDown, Edit2, Trash2, FileSignature, Hourglass, X, Filter, Edit, Pen, CalendarClock, SearchIcon, SearchX } from 'lucide-react';
import CardComponent from '../../../Components/CommonComp/CardComponent';
import { fetchAllHolidayStatistics, getNextHoliday, getAllHolidays, createHoliday, getHolidayById, updateHoliday, deleteHoliday } from '../../../Api/HolidayManagementAPI';
import HolidayComponentCard from '../../../Components/Holiday/HolidayComponentCard';
import { toast } from 'react-toastify';
import ListLoader from '../../../Components/CommonComp/ListLoader';

export default function HolidayManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [holidayType, setHolidayType] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [statistics, setStatistics] = useState({
        totalHolidays: 0,
        upcomingHolidays: 0,
        nextHoliday: null,
        nationalHolidays: 0,
        regionalHolidays: 0,
        religiousHolidays: 0
    });
    const [nextHoliday, setNextHoliday] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [openCreateHoliday, setOpenCreateHoliday] = useState(false);
    const [openEditHoliday, setOpenEditHoliday] = useState(false);
    const [selectedHolidayId, setSelectedHolidayId] = useState(null);
    const [editHolidayData, setEditHolidayData] = useState(null);

    const [submitLoader, setSubmitLoader] = useState(false);

    const HOLIDAY_TYPE_COLORS = {
        NATIONAL: 'bg-blue-50 text-blue-500',
        REGIONAL: 'bg-indigo-50 text-indigo-500',
        RELIGIOUS: 'bg-orange-50 text-orange-500',
        FESTIVAL: 'bg-pink-50 text-pink-500',
        SCHOOL_EVENT: 'bg-green-50 text-green-500',
        GOVERNMENT: 'bg-gray-200 text-gray-800',
        OPTIONAL: 'bg-yellow-50 text-yellow-500',
        WEEKEND: 'bg-red-50 text-red-500',
        OTHER: 'bg-slate-50 text-slate-500',
    };

    useEffect(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        let academicYearStr;
        if (currentMonth >= 7) {
            academicYearStr = `${currentYear} - ${currentYear + 1}`;
        } else {
            academicYearStr = `${currentYear - 1} - ${currentYear}`;
        }
        setAcademicYear(academicYearStr);
    }, []);

    useEffect(() => {
        const getHolidayStatistics = async () => {
            try {
                const data = await fetchAllHolidayStatistics(selectedYear);
                setStatistics({
                    totalHolidays: data.totalHolidays ?? 0,
                    upcomingHolidays: data.upcomingHolidays ?? 0,
                    nextHoliday: data.nextHoliday ?? null,
                    nationalHolidays: data.nationalHolidays,
                    regionalHolidays: data.regionalHolidays,
                    religiousHolidays: data.religiousHolidays
                });
            } catch (error) {
                console.error("Failed to load holiday statistics", error);
            }
        };
        if (selectedYear) getHolidayStatistics();
    }, [selectedYear]);

    const [holidayLoader, setHolidayLoader] = useState(false);

    useEffect(() => {
        const fetchNextHoliday = async () => {
            try {
                setHolidayLoader(true);
                const data = await getNextHoliday();
                setNextHoliday({
                    name: data.name,
                    description: data.description,
                    holidayDate: data.holidayDate,
                    holidayType: data.holidayType,
                });
            } catch (error) {
                console.error("Failed to fetch next holiday", error);
                setNextHoliday(null);
            }
            finally {
                setHolidayLoader(false)
            }
        };
        fetchNextHoliday();
    }, []);

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                setLoading(true);
                const data = await getAllHolidays(
                    selectedYear, holidayType, fromDate, toDate, searchTerm, page, size, 'holidayDate'
                );
                setHolidays(data.content || []);
                setTotalElements(data.totalElements || 0);
            } catch (error) {
                console.error('Failed to fetch holidays', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHolidays();
    }, [selectedYear, holidayType, fromDate, toDate, searchTerm, page, size]);

    const refreshHolidayList = async () => {
        const refreshedData = await getAllHolidays(
            selectedYear, holidayType, fromDate, toDate, searchTerm, page, size, 'holidayDate'
        );
        setHolidays(refreshedData.content || []);
        setTotalElements(refreshedData.totalElements || 0);
        const statsData = await fetchAllHolidayStatistics(selectedYear);
        setStatistics({
            totalHolidays: statsData.totalHolidays ?? 0,
            upcomingHolidays: statsData.upcomingHolidays ?? 0,
            nextHoliday: statsData.nextHoliday ?? null,
            nationalHolidays: 0,
            regionalHolidays: 0,
            religiousHolidays: 0
        });
    };

    const handleCreateHoliday = async (data) => {
        try {
            setSubmitLoader(true);
            const payload = {
                name: data.holidayName,
                description: data.description,
                holidayDate: data.fromDate,
                holidayType: data.type,
                isOptional: data.isOptional || false,
                isActive: data.isActive !== undefined ? data.isActive : true,
            };
            await createHoliday(payload);
            toast.success(`${data.holidayName} added successfully!`);
            setSubmitLoader(false);
            setOpenCreateHoliday(false);
            await refreshHolidayList();

        } catch (error) {
            console.error('Failed to create holiday', error);
            toast.error('Failed to create holiday');
        }
    };

    const truncateText = (text, maxLength = 40) => {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const handleEditClick = async (id) => {
        try {
            setSelectedHolidayId(id);
            const data = await getHolidayById(id);
            const holidayDate = new Date(data.holidayDate);
            const year = holidayDate.getFullYear();
            const month = holidayDate.getMonth();
            let academicYearStr;
            if (month >= 7) {
                academicYearStr = `${year} - ${year + 1}`;
            } else {
                academicYearStr = `${year - 1} - ${year}`;
            }
            setEditHolidayData({
                academicYear: academicYearStr,
                holidayName: data.name,
                description: data.description || '',
                fromDate: data.holidayDate,
                type: data.holidayType,
                isOptional: data.isOptional || false,
                isActive: data.isActive !== undefined ? data.isActive : true,
            });
            setOpenEditHoliday(true);
        } catch (err) {
            console.error("Failed to load holiday details:", err);
            toast.error("Failed to load holiday details");
        }
    };

    const handleEditHoliday = async (data) => {
        try {
            setSubmitLoader(true);
            const payload = {
                name: data.holidayName,
                description: data.description,
                holidayDate: data.fromDate,
                holidayType: data.type,
                isOptional: data.isOptional || false,
                isActive: data.isActive !== undefined ? data.isActive : true,
            };
            await updateHoliday(selectedHolidayId, payload);
            toast.success("Holiday updated successfully");
            setSubmitLoader(false);
            setOpenEditHoliday(false);
            setEditHolidayData(null);
            setSelectedHolidayId(null);
            await refreshHolidayList();
        } catch (err) {
            console.error("Failed to update holiday:", err);
            toast.error("Failed to update holiday");
        }
    };

    const handleDeleteHoliday = async (holidayId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this holiday?");
        if (!confirmDelete) return;
        try {
            await deleteHoliday(holidayId);
            toast.success("Holiday deleted successfully!");
            setHolidays(prev => prev.filter(h => h.id !== holidayId));
            setTotalElements(prev => prev - 1);
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete holiday");
        }
    };

    const cardsArray = [
        { IconName: FileSignature, keyName: "Total Holidays", val: statistics.totalHolidays, iconTxColor: "text-blue-600", iconBgColor: "bg-blue-50" },
        { IconName: CalendarClock, keyName: "National Holidays", val: statistics.nationalHolidays, iconTxColor: "text-green-600", iconBgColor: "bg-green-50" },
        { IconName: CalendarClock, keyName: "Religious Holidays", val: statistics.religiousHolidays, iconTxColor: "text-purple-600", iconBgColor: "bg-purple-50" },
        { IconName: CalendarClock, keyName: "Regional Holidays", val: statistics.regionalHolidays, iconTxColor: "text-yellow-600", iconBgColor: "bg-yellow-50" },
    ];

    const clearFilters = () => {
        setSearchTerm('');
        setHolidayType('');
        setFromDate('');
        setToDate('');
    };

    return (
        <div className="bg-blue-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                            Holiday Management
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                            Academic Session {academicYear}
                        </p>
                    </div>
                    <button
                        onClick={() => setOpenCreateHoliday(true)}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        <span>New Holiday</span>
                    </button>
                </div>

                {/* Create Modal */}
                <HolidayComponentCard
                    isOpen={openCreateHoliday}
                    setIsOpen={setOpenCreateHoliday}
                    onSubmit={handleCreateHoliday}
                    icon={<Pen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
                    title="Add New Holiday"
                    subtitle="Configure academic calendar breaks"
                    mode="create"
                    loaderIsTrue={submitLoader}
                />

                {/* Edit Modal */}
                <HolidayComponentCard
                    isOpen={openEditHoliday}
                    setIsOpen={setOpenEditHoliday}
                    onSubmit={handleEditHoliday}
                    defaultValues={editHolidayData}
                    icon={<Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
                    title="Edit Holiday"
                    subtitle="Update holiday details"
                    mode="edit"
                    loaderIsTrue={submitLoader}
                />

                {/* Year Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 mb-4 md:mb-6 w-fit">
                    <div className="flex flex-col sm:flex-row w-fit items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-base md:text-lg font-semibold text-gray-900">Select Year</h3>
                                <p className="text-xs md:text-sm text-gray-600">Choose a year to see holiday details</p>
                            </div>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full sm:w-30 md:w-28 px-2 py-2.5 md:py-3 pr-10 bg-white shadow-md border-gray-300 rounded-lg text-gray-700 text-base md:text-lg font-medium text-center outline-none appearance-none cursor-pointer"
                            >
                                {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                    {cardsArray.map((card) => (
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

                {holidayLoader ? (
                    <div className="flex justify-between flex-col lg:flex-row bg-linear-to-r from-blue-100 via-indigo-200 to-purple-200 rounded-xl border border-white shadow-md shadow-gray-50 p-4 md:p-5 mb-4 md:mb-6 animate-pulse">
                        {/* Left skeleton */}
                        <div className="flex-1">
                            {/* Badge */}
                            <div className="h-5 w-24 bg-blue-200 rounded-full mb-3" />
                            {/* Title */}
                            <div className="h-7 w-48 bg-blue-200 rounded-lg mb-2" />
                            {/* Description line 1 */}
                            <div className="h-4 w-72 bg-blue-200 rounded mb-2" />
                            {/* Description line 2 */}
                            <div className="h-4 w-56 bg-blue-200 rounded mb-4" />
                        </div>
                        {/* Right skeleton */}
                        <div className="flex lg:items-center gap-6 px-2">
                            <div>
                                <div className="h-3 w-8 bg-blue-200 rounded mb-2" />
                                <div className="h-5 w-20 bg-blue-200 rounded" />
                            </div>
                            <div>
                                <div className="h-3 w-8 bg-blue-200 rounded mb-2" />
                                <div className="h-5 w-28 bg-blue-200 rounded" />
                            </div>
                        </div>
                    </div>
                ) : nextHoliday &&  (
                    <div className="flex justify-between flex-col lg:flex-row bg-linear-to-r from-blue-100 via-indigo-200 to-purple-200 rounded-xl border border-white shadow-md shadow-gray-50 hover:shadow-md hover:shadow-gray-100 p-4 md:p-5 mb-4 md:mb-6">
                        <div className="z-4">
                            <p className="text-xs font-medium text-gray-600 bg-blue-50 w-fit py-1 px-2.5 rounded-full uppercase tracking-wide mb-3">
                                Next Holiday
                            </p>
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                                {nextHoliday.name}
                            </h2>
                            <p className="text-sm md:text-base text-gray-700 mb-4">
                                {nextHoliday.description}
                            </p>
                        </div>
                        <div className="z-4 flex xl:justify-center lg:items-center flex-wrap gap-4 md:gap-6 text-sm px-2">
                            <div>
                                <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">Type</span>
                                <p className="text-gray-900 font-semibold mt-1 text-sm md:text-base">{nextHoliday.holidayType}</p>
                            </div>
                            <div>
                                <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">Date</span>
                                <p className="text-gray-900 font-semibold mt-1 text-sm md:text-base">
                                    {new Date(nextHoliday.holidayDate).toDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                <div className="bg-white/50 rounded-xl shadow-sm border border-gray-200 p-4 mb-4 md:mb-6">

                    {/* Mobile Filter Toggle */}
                    <div className="flex justify-between items-center mb-3 lg:hidden">
                        <h3 className="text-base font-semibold text-gray-900">Filters</h3>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium"
                        >
                            <Filter className="w-4 h-4" />
                            {showFilters ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <div className={`${showFilters ? 'grid' : 'hidden lg:grid'} grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4`}>

                        {/* Row 1: Search (2/3) + Academic Year (1/3) */}
                        <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                            <div className="sm:col-span-2">
                                <label htmlFor="search" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    Search Holiday
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                                    <input
                                        id="search"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by name..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-900 placeholder-gray-500 outline-none focus:border-blue-300 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="academic-year" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    Academic Year
                                </label>
                                <div className="relative">
                                    <select
                                        id="academic-year"
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-900 outline-none focus:border-blue-300 appearance-none cursor-pointer pr-10"
                                    >
                                        <option>All Status</option>
                                        <option>2023 - 2024</option>
                                        <option>2024 - 2025</option>
                                        <option>2025 - 2026</option>
                                        <option>2026 - 2027</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Holiday Type + From Date + To Date + Clear */}
                        <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                            <div>
                                <label htmlFor="holiday-type" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    Holiday Type
                                </label>
                                <div className="relative">
                                    <select
                                        id="holiday-type"
                                        value={holidayType}
                                        onChange={(e) => setHolidayType(e.target.value)}
                                        className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-900 outline-none focus:border-blue-300 transition-all appearance-none cursor-pointer pr-10"
                                    >
                                        <option value="">All Holidays</option>
                                        <option value="NATIONAL">National</option>
                                        <option value="REGIONAL">Regional</option>
                                        <option value="RELIGIOUS">Religious</option>
                                        <option value="FESTIVAL">Festival</option>
                                        <option value="SCHOOL_EVENT">School Event</option>
                                        <option value="GOVERNMENT">Government</option>
                                        <option value="OPTIONAL">Optional</option>
                                        <option value="WEEKEND">Weekend</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="from-date" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    From Date
                                </label>
                                <input
                                    id="from-date"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-900 outline-none focus:border-blue-300 transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="to-date" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    To Date
                                </label>
                                <input
                                    id="to-date"
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-900 outline-none focus:border-blue-300 transition-all"
                                />
                            </div>
                            {(searchTerm || holidayType || fromDate || toDate) && (
                                <div className="flex items-end">
                                    <button
                                        onClick={clearFilters}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table / Cards */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* ===== DESKTOP TABLE ===== */}
                    <div className="hidden md:block overflow-y-auto max-h-130">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr className="text-sm">
                                    <th className="px-4 lg:px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">Holiday Name</th>
                                    <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                                    <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                                    <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Description</th>
                                    <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">

                                {/* ✅ Loading state inside tbody */}
                                {loading && (
                                    // <tr>
                                    //     <td colSpan={11}>
                                    //         <div className="text-center py-8">
                                    //             <div className="flex flex-col items-center">
                                    //                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                    //                 <span className="text-gray-600">Loading holidays...</span>
                                    //             </div>
                                    //         </div>
                                    //     </td>
                                    // </tr>

                                    <ListLoader avatar={false}/>
                                )}

                                {/* ✅ Empty state inside tbody */}
                                {!loading && holidays.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                    <SearchX className="w-6 h-6 text-blue-500" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-700">No Holiday Found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* ✅ Data rows */}
                                {!loading && holidays.length > 0 && holidays.map((holiday) => (
                                    <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 lg:px-6 py-4">
                                            <p className="font-semibold text-gray-900 text-xs lg:text-sm">{holiday.name}</p>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 text-center">
                                            <p className="text-gray-900 text-sm whitespace-nowrap">
                                                {new Date(holiday.holidayDate).toDateString()}
                                            </p>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${HOLIDAY_TYPE_COLORS[holiday.holidayType] || 'bg-gray-100 text-gray-700'}`}>
                                                {holiday.holidayType}
                                            </span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 text-start hidden lg:table-cell">
                                            <p className="text-gray-700 text-sm">{truncateText(holiday.description, 40)}</p>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditClick(holiday.id)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHoliday(holiday.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 lg:w-5 h-4 lg:h-5 text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>

                    {/* ===== MOBILE CARDS ===== */}
                    <div className="md:hidden">

                        {/* ✅ Loading state in mobile */}
                        {loading && (
                            <div className="text-center py-8">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                    <span className="text-gray-600">Loading holidays...</span>
                                </div>
                            </div>
                        )}

                        {/* ✅ Empty state in mobile */}
                        {!loading && holidays.length === 0 && (
                            <div className="py-16 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                        <SearchX className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">No Holiday Found</p>
                                </div>
                            </div>
                        )}

                        {/* ✅ Data cards in mobile */}
                        {!loading && holidays.length > 0 && (
                            <div className="divide-y divide-gray-200">
                                {holidays.map((holiday) => (
                                    <div key={holiday.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 pr-3">
                                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{holiday.name}</h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {new Date(holiday.holidayDate).toDateString()}
                                                </p>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${HOLIDAY_TYPE_COLORS[holiday.holidayType] || 'bg-gray-100 text-gray-700'}`}>
                                                    {holiday.holidayType}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(holiday.id)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHoliday(holiday.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        {holiday.description && (
                                            <p className="text-sm text-gray-700">{holiday.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ===== PAGINATION ===== */}
                    {!loading && holidays.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 gap-3">
                            <p className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
                                Showing {Math.min(page * size + 1, totalElements)} to {Math.min((page + 1) * size, totalElements)} of {totalElements} entries
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                                    className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-sm hover:bg-blue-600 transition-all text-xs md:text-sm">
                                    {page + 1}
                                </button>
                                <button
                                    disabled={(page + 1) * size >= totalElements}
                                    onClick={() => setPage(prev => prev + 1)}
                                    className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}