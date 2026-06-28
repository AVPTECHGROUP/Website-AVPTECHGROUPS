import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Calendar,
  Search,
  ChevronDown,
  Edit2,
  FileSignature,
  Hourglass,
  X,
  Filter,
  Edit,
  Pen,
  CalendarClock,
  SearchIcon,
  SearchX,
  ToggleLeft,
} from 'lucide-react';
import CardComponent from '../../../Components/CommonComp/CardComponent';
import {
  fetchAllHolidayStatistics,
  getNextHoliday,
  getAllHolidays,
  createHoliday,
  getHolidayById,
  updateHoliday,
  getCurrentAcademicYear,
  getAcademicYearsLov,
} from '../../../Api/HolidayManagementAPI';
import HolidayComponentCard from '../../../Components/Holiday/HolidayComponentCard';
import { toast } from 'react-toastify';
import CardLoader from '../../../Components/CommonComp/CardLoader';
import ListLoader from '../../../Components/CommonComp/ListLoader';

// ── Custom hook: debounced value ──────────────────────────────────────────────
function useDebounce(value, delay = 900) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function HolidayManagement() {
  // Raw input state (updates on every keystroke)
  const [searchInput, setSearchInput] = useState('');
  // Debounced value used for the API call (only changes 500 ms after typing stops)
  const debouncedSearch = useDebounce(searchInput, 500);

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
    religiousHolidays: 0,
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
  const [togglingId, setTogglingId] = useState(null);

  const [lovAcademicYears, setLovAcademicYears] = useState([]);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState(null);

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

  // ── Current academic year label ──────────────────────────────────────────
  useEffect(() => {
    const fetchCurrentAcademicYear = async () => {
      try {
        const response = await getCurrentAcademicYear();
        const data = response?.data?.data ?? response?.data ?? response;
        setAcademicYear(data?.label || '');
        if (data?.id != null) setCurrentAcademicYearId(data.id);
      } catch (error) {
        console.error('Failed to fetch academic year', error);
        const d = new Date();
        const y = d.getFullYear();
        const m = d.getMonth();
        setAcademicYear(m >= 7 ? `${y} - ${y + 1}` : `${y - 1} - ${y}`);
      }
    };
    fetchCurrentAcademicYear();
  }, []);

  // ── Academic years LOV ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchAcademicYearsLov = async () => {
      setAcademicYearsLoading(true);
      try {
        const response = await getAcademicYearsLov();
        const unwrap = (r) =>
          Array.isArray(r) ? r :
            Array.isArray(r?.years) ? r.years :
              Array.isArray(r?.data) ? r.data :
                Array.isArray(r?.content) ? r.content :
                  Array.isArray(r?.data?.years) ? r.data.years :
                    Array.isArray(r?.data?.data) ? r.data.data :
                      Array.isArray(r?.data?.content) ? r.data.content : [];
        const list = unwrap(response);
        const sorted = [...list].sort((a, b) => {
          if (a.isCurrent) return -1;
          if (b.isCurrent) return 1;
          return (b.id ?? 0) - (a.id ?? 0);
        });
        setLovAcademicYears(sorted);
        const current = sorted.find((y) => y.isCurrent);
        if (current?.id != null) setCurrentAcademicYearId(current.id);
      } catch (error) {
        console.error('Failed to fetch academic years', error);
        setLovAcademicYears([]);
      } finally {
        setAcademicYearsLoading(false);
      }
    };
    fetchAcademicYearsLov();
  }, []);

  // ── Statistics ───────────────────────────────────────────────────────────
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
          religiousHolidays: data.religiousHolidays,
        });
      } catch (error) {
        console.error('Failed to load holiday statistics', error);
      }
    };
    if (selectedYear) getHolidayStatistics();
  }, [selectedYear]);

  const [holidayLoader, setHolidayLoader] = useState(false);

  // ── Next holiday ─────────────────────────────────────────────────────────
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
        console.error('Failed to fetch next holiday', error);
        setNextHoliday(null);
      } finally {
        setHolidayLoader(false);
      }
    };
    fetchNextHoliday();
  }, []);

  // ── Holiday list — uses debouncedSearch instead of raw searchInput ────────
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const data = await getAllHolidays(
          selectedYear,
          holidayType,
          fromDate,
          toDate,
          debouncedSearch,   // ← debounced
          page,
          size,
          'holidayDate'
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
  }, [selectedYear, holidayType, fromDate, toDate, debouncedSearch, page, size]);

  // Reset page to 0 whenever search/filter changes
  useEffect(() => { setPage(0); }, [debouncedSearch, holidayType, fromDate, toDate]);

  const refreshHolidayList = async () => {
    const refreshedData = await getAllHolidays(
      selectedYear, holidayType, fromDate, toDate, debouncedSearch, page, size, 'holidayDate'
    );
    setHolidays(refreshedData.content || []);
    setTotalElements(refreshedData.totalElements || 0);
    const statsData = await fetchAllHolidayStatistics(selectedYear);
    setStatistics({
      totalHolidays: statsData.totalHolidays ?? 0,
      upcomingHolidays: statsData.upcomingHolidays ?? 0,
      nextHoliday: statsData.nextHoliday ?? null,
      nationalHolidays: statsData.nationalHolidays ?? 0,
      regionalHolidays: statsData.regionalHolidays ?? 0,
      religiousHolidays: statsData.religiousHolidays ?? 0,
    });
  };

  const parseApiError = (err, fallback) => {
    try {
      const parsed = JSON.parse(err?.message || '');
      if (parsed?.message) return parsed.message;
    } catch (_) { }
    return err?.response?.data?.message || err?.data?.message || err?.message || fallback;
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
      setOpenCreateHoliday(false);
      await refreshHolidayList();
    } catch (error) {
      console.error('Failed to create holiday', error);
      toast.error(parseApiError(error, 'Failed to create holiday'));
    } finally {
      setSubmitLoader(false);
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
      setEditHolidayData({
        academicYear: currentAcademicYearId,
        holidayName: data.name,
        description: data.description || '',
        fromDate: data.holidayDate,
        type: data.holidayType,
        isOptional: data.isOptional || false,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
      setOpenEditHoliday(true);
    } catch (err) {
      console.error('Failed to load holiday details:', err);
      toast.error('Failed to load holiday details');
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
      toast.success('Holiday updated successfully');
      setOpenEditHoliday(false);
      setEditHolidayData(null);
      setSelectedHolidayId(null);
      await refreshHolidayList();
    } catch (err) {
      console.error('Failed to update holiday:', err);
      toast.error(parseApiError(err, 'Failed to update holiday'));
    } finally {
      setSubmitLoader(false);
    }
  };

  const handleDeactivate = async (holidayId) => {
    try {
      setTogglingId(holidayId);
      const holiday = holidays.find((h) => h.id === holidayId);
      if (!holiday) return;
      const payload = {
        name: holiday.name,
        description: holiday.description,
        holidayDate: holiday.holidayDate,
        holidayType: holiday.holidayType,
        isOptional: holiday.isOptional || false,
        isActive: false,
      };
      await updateHoliday(holidayId, payload);
      await refreshHolidayList();
      toast.success('Holiday deactivated successfully!');
    } catch (error) {
      console.error('Failed to deactivate holiday', error);
      toast.error('Failed to deactivate holiday');
    } finally {
      setTogglingId(null);
    }
  };

  const cardsArray = [
    {
      IconName: FileSignature,
      keyName: 'Total Active Holidays',
      val: statistics.totalHolidays,
      iconTxColor: 'text-blue-600',
      iconBgColor: 'bg-blue-50',
    },
    {
      IconName: CalendarClock,
      keyName: 'National Active Holidays',
      val: statistics.nationalHolidays,
      iconTxColor: 'text-green-600',
      iconBgColor: 'bg-green-50',
    },
    {
      IconName: CalendarClock,
      keyName: 'Religious Active Holidays',
      val: statistics.religiousHolidays,
      iconTxColor: 'text-purple-600',
      iconBgColor: 'bg-purple-50',
    },
    {
      IconName: CalendarClock,
      keyName: 'Regional Active Holidays',
      val: statistics.regionalHolidays,
      iconTxColor: 'text-yellow-600',
      iconBgColor: 'bg-yellow-50',
    },
  ];

  const hasActiveFilters = searchInput || holidayType || fromDate || toDate;

  const clearFilters = () => {
    setSearchInput('');
    setHolidayType('');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="bg-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        {/* Layout matches the screenshot: title+subtitle on left, academic-year pill + button on right */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
          {/* Left: title + subtitle */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Holiday Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage national, regional and religious holidays for Academic Year {academicYear}
            </p>
          </div>

          {/* Right: Academic Year selector + Add Holiday button */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Academic Year pill — styled like the screenshot */}
            <div className="flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 font-medium shadow-sm flex-1 sm:flex-none">
              <span className="text-gray-500 font-normal whitespace-nowrap">Academic Year</span>
              <span className="font-semibold text-gray-900">{academicYear}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            </div>

            {/* Add Holiday button */}
            <button
              onClick={() => setOpenCreateHoliday(true)}
              className="whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Holiday</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* ── MODALS ───────────────────────────────────────────────────────── */}
        <HolidayComponentCard
          isOpen={openCreateHoliday}
          setIsOpen={setOpenCreateHoliday}
          onSubmit={handleCreateHoliday}
          icon={<Pen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
          title="Add New Holiday"
          subtitle="Configure academic calendar breaks"
          mode="create"
          loaderIsTrue={submitLoader}
          academicYears={lovAcademicYears}
          academicYearsLoading={academicYearsLoading}
          currentAcademicYearId={currentAcademicYearId}
        />

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
          academicYears={lovAcademicYears}
          academicYearsLoading={academicYearsLoading}
          currentAcademicYearId={currentAcademicYearId}
        />

        {/* ── STATISTICS CARDS ─────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm mt-5 mb-6">
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

        {/* ── NEXT HOLIDAY CARD ─────────────────────────────────────────────── */}
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
        ) : (
          nextHoliday && (
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
                  <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">
                    Type
                  </span>
                  <p className="text-gray-900 font-semibold mt-1 text-sm md:text-base">
                    {nextHoliday.holidayType}
                  </p>
                </div>
                <div>
                  <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">
                    Date
                  </span>
                  <p className="text-gray-900 font-semibold mt-1 text-sm md:text-base">
                    {new Date(nextHoliday.holidayDate).toDateString()}
                  </p>
                </div>
              </div>
            </div>
          )
        )}


        {/* ── FILTERS — single row, all controls inline ────────────────────── */}
        <div className="bg-white/50 rounded-xl shadow-sm border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
          {/* Mobile toggle */}
          <div className="flex justify-between items-center lg:hidden mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"
            >
              <Filter className="w-3.5 h-3.5" />
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Filter row — single line on lg+, stacked on mobile */}
          <div className={`${showFilters ? 'flex' : 'hidden lg:flex'} flex-col lg:flex-row items-end gap-3`}>
            {/* Search */}
            <div className="w-full lg:flex-[2]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Search Holiday
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-300 transition-all"
                />
              </div>
            </div>

            {/* Holiday Type */}
            <div className="w-full lg:flex-[1.5]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Holiday Type
              </label>
              <div className="relative">
                <select
                  value={holidayType}
                  onChange={(e) => setHolidayType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-300 transition-all appearance-none cursor-pointer pr-8"
                >
                  <option value="">All Types</option>
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
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* From Date */}
            <div className="w-full lg:flex-[1.2]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-300 transition-all"
              />
            </div>

            {/* To Date */}
            <div className="w-full lg:flex-[1.2]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-300 transition-all"
              />
            </div>

            {/* Clear button — always reserve space so layout doesn't jump */}
            <div className="w-full lg:w-auto flex-shrink-0">
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="w-full lg:w-auto flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              ) : (
                /* Invisible placeholder to keep row height consistent */
                <div className="py-2 px-3 opacity-0 pointer-events-none select-none text-sm">
                  Clear
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TABLE / CARDS ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* DESKTOP TABLE */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table
              className="w-full border-collapse"
              style={{ minWidth: '680px', tableLayout: 'fixed' }}
            >
              {/* Fixed column widths — sum fits 768px+ without overflow */}
              <colgroup>
                <col style={{ width: '30%' }} />  {/* Name + Status */}
                <col style={{ width: '18%' }} />  {/* Date */}
                <col style={{ width: '16%' }} />  {/* Type */}
                <col style={{ width: '20%' }} />  {/* Description — hidden below lg */}
                <col style={{ width: '16%' }} />  {/* Actions */}
              </colgroup>

              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Holiday Name
                    <span className="ml-1.5 normal-case text-[10px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">
                      Status
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading && <ListLoader avatar={false} />}

                {!loading && holidays.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                          <SearchX className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No holidays found</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50/80 transition-colors">

                    {/* Name + Status */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-gray-900 truncate leading-snug">
                          {holiday.name}
                        </span>
                        <span
                          className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${holiday.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                          {holiday.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 align-middle">
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {new Date(holiday.holidayDate).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3.5 align-middle">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold truncate max-w-full ${HOLIDAY_TYPE_COLORS[holiday.holidayType] || 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {holiday.holidayType}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3.5 align-middle hidden lg:table-cell">
                      <div className="relative group">
                        <p className="text-sm text-gray-500 truncate cursor-default leading-snug">
                          {truncateText(holiday.description, 35)}
                        </p>
                        {holiday.description && holiday.description.length > 35 && (
                          <div className="absolute bottom-full left-0 mb-1.5 w-64 bg-gray-900 text-white
                                text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100
                                transition-opacity duration-150 pointer-events-none z-40
                                shadow-lg leading-relaxed">
                            {holiday.description}
                            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(holiday.id)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors shrink-0"
                          title="Edit holiday"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>

                        {holiday.isActive && (
                          <button
                            onClick={() => handleDeactivate(holiday.id)}
                            disabled={togglingId === holiday.id}
                            title="Mark as Inactive"
                            className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg
                    text-[11px] font-semibold border transition-all ${togglingId === holiday.id
                                ? 'opacity-50 cursor-not-allowed bg-orange-50 border-orange-200 text-orange-400'
                                : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                              }`}
                          >
                            {togglingId === holiday.id ? (
                              <svg className="w-3 h-3 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                  stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            ) : (
                              <ToggleLeft className="w-3 h-3 shrink-0" />
                            )}
                            <span className="whitespace-nowrap">
                              {togglingId === holiday.id ? 'Saving…' : 'Inactive'}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden">
            {loading && (
              <div className="text-start py-8">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <span className="text-gray-600 text-sm">Loading holidays...</span>
                </div>
              </div>
            )}

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

            {!loading && holidays.length > 0 && (
              <div className="divide-y divide-gray-200">
                {holidays.map((holiday) => (
                  <div key={holiday.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{holiday.name}</h3>
                          <span className={`text-[11px] ${holiday.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} px-2 py-0.5 rounded-full`}>
                            {holiday.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(holiday.holidayDate).toDateString()}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${HOLIDAY_TYPE_COLORS[holiday.holidayType] || 'bg-gray-100 text-gray-700'}`}>
                          {holiday.holidayType}
                        </span>
                        {holiday.description && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{holiday.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 items-end flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(holiday.id)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit holiday"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        {holiday.isActive && (
                          <button
                            onClick={() => handleDeactivate(holiday.id)}
                            disabled={togglingId === holiday.id}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all border ${togglingId === holiday.id
                              ? 'opacity-50 cursor-not-allowed bg-orange-50 border-orange-200 text-orange-400'
                              : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                              }`}
                          >
                            {togglingId === holiday.id ? (
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            ) : (
                              <ToggleLeft className="w-3.5 h-3.5" />
                            )}
                            <span>{togglingId === holiday.id ? '...' : 'Inactive'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {!loading && holidays.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-4 md:px-6 py-3 border-t border-gray-200 gap-3">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                Showing {Math.min(page * size + 1, totalElements)} – {Math.min((page + 1) * size, totalElements)} of {totalElements} entries
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg font-medium text-xs shadow-sm">
                  {page + 1}
                </button>
                <button
                  disabled={(page + 1) * size >= totalElements}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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