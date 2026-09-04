import { useState, useEffect } from 'react';
import {
    Calendar, Plus, Eye, Pencil, Trash2, Send,
    Search, ChevronDown, Settings2, BookOpen, Clock, UserSearch, RefreshCw
} from 'lucide-react';
import CardComponent from '../../Components/CommonComp/CardComponent';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ScheduleConfig from './components/ScheduleConfig';
import AddTimetableModal from './components/AddTimetableModal';
import CreateSchedule from './CreateSchedule';
import TeacherScheduleViewer from './components/TeacherScheduleViewer';
import {
    getTimetables,
    createTimetable,
    deleteTimetable,
    publishTimetable,
} from '../../Api/Academics/ScheduleApi';
import { getListOfValues } from '../../Api/Lov/ListOfValues';
import { getActiveClasses } from '../../Api/Teachers/TeachersAPI';
import { toast } from 'react-toastify';
import { TIMETABLE_CONSTS } from '../../Constants/StringConstants/TimetableConstants';

const { STATUS, DIRECTORY, MESSAGES } = TIMETABLE_CONSTS;

const StatusBadge = ({ status }) => {
    const isDraft = status === STATUS.DRAFT || status === STATUS.DRAFT_UPPER;
    return (
        <span className={`inline-flex items-center text-nowrap gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
      ${isDraft
            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
            : 'bg-green-50 text-green-700 border-green-200'}`}>
            {isDraft ? '⊘' : '✓'} {isDraft ? STATUS.DRAFT : STATUS.PUBLISHED}
        </span>
    );
};

export default function TimeTable() {
    const [loading, setLoading] = useState(false);
    const [publishingId, setPublishingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [showConfig, setShowConfig] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTeacherSchedule, setShowTeacherSchedule] = useState(false);
    const [activeClasses, setActiveClasses] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(DIRECTORY.FILTER_STATUS_ALL);
    const [classFilter, setClassFilter] = useState(DIRECTORY.FILTER_CLASS_ALL);
    // yearFilter now stores the full LOV object { id, label, value } or null for "All Years"
    const [yearFilter, setYearFilter] = useState(null);
    const [sort, setSort] = useState('Recently Added');
    const [academicYears, setAcademicYears] = useState([]);
    const [openWorkspace, setOpenWorkspace] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        loadTimetables();
        loadAcademicYears();
        loadActiveClasses();
    }, []);

    const loadAcademicYears = async () => {
        try {
            const data = await getListOfValues('ACADEMIC_YEAR');
            setAcademicYears(data || []);
        } catch (err) {
            console.error(DIRECTORY.ERR_LOAD_YEARS, err);
        }
    };

    const loadActiveClasses = async () => {
        try {
            const data = await getActiveClasses();
            setActiveClasses(data || []);
        } catch (err) {
            console.error(DIRECTORY.ERR_LOAD_CLASSES, err);
        }
    };

    // ✅ Accepts optional academicYearId and passes it to the API
    // API signature: getTimetables(page, size, sort, academicYearId)
    const loadTimetables = async (academicYearId = null) => {
        try {
            setLoading(true);
            const res = await getTimetables(0, 50, 'id', academicYearId);
            const list = res?.content || res?.data?.content || res?.data || [];
            setTimetables(list.map(normalizeApiTimetable));
        } catch (err) {
            console.error(MESSAGES.ERR_LOAD_TT, err);
            toast.error(MESSAGES.ERR_LOAD_TT);
        } finally {
            setLoading(false);
        }
    };

    const normalizeApiTimetable = (t) => ({
        id: t.id,
        class: t.className || t.class || `Class ${t.classId}`,
        section: t.sectionName || t.section || `Section ${t.sectionId}`,
        year: t.academicYear || t.year,
        status: t.status === STATUS.PUBLISHED_UPPER ? STATUS.PUBLISHED : STATUS.DRAFT,
        lastUpdated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : DIRECTORY.LBL_RECENTLY,
        classId: t.classId,
        sectionId: t.sectionId,
        notes: t.notes,
    });

    const handleAddTimetable = async (data) => {
        try {
            const payload = {
                classId: data.classId,
                sectionId: data.sectionId,
                academicYear: data.academicYear,
                notes: data.notes,
                ...(data.copyFromTimetableId ? { copyFromTimetableId: data.copyFromTimetableId } : {}),
            };
            const created = await createTimetable(payload);
            const newTT = normalizeApiTimetable(created);
            setTimetables(prev => [newTT, ...prev]);
            setShowAddModal(false);
            setOpenWorkspace({ timetable: newTT, mode: 'edit' });
            toast.success(MESSAGES.SUCC_CREATE_TT);
        } catch (err) {
            toast.error(err.message || MESSAGES.ERR_CREATE_TT);
        }
    };

    const handlePublish = async (id) => {
        try {
            setPublishingId(id);
            await publishTimetable(id);
            setTimetables(prev => prev.map(t => t.id === id ? { ...t, status: STATUS.PUBLISHED, lastUpdated: DIRECTORY.LBL_JUST_NOW } : t));
            toast.success(MESSAGES.SUCC_PUBLISH_TT);
        } catch (err) {
            toast.error(err.message || MESSAGES.ERR_PUBLISH);
        } finally {
            setPublishingId(null);
        }
    };

    const handleDelete = async (id) => {
        try {
            setDeletingId(id);
            await deleteTimetable(id);
            setTimetables(prev => prev.filter(t => t.id !== id));
            setDeleteConfirm(null);
            toast.success(MESSAGES.SUCC_DEL_TT);
        } catch (err) {
            toast.error(err.message || MESSAGES.ERR_DEL_TT);
        } finally {
            setDeletingId(null);
        }
    };

    // ✅ Year dropdown change handler — finds the LOV object by label, triggers API reload
    const handleYearChange = (e) => {
        const selectedLabel = e.target.value;
        if (selectedLabel === DIRECTORY.FILTER_YEAR_ALL) {
            setYearFilter(null);
            loadTimetables(null);
        } else {
            const found = academicYears.find(
                y => (y.label || y.value) === selectedLabel
            );
            setYearFilter(found || null);
            loadTimetables(found?.id || null);
        }
    };

    const total = timetables.length;
    const published = timetables.filter(t => t.status === STATUS.PUBLISHED).length;
    const draft = timetables.filter(t => t.status === STATUS.DRAFT).length;

    const filtered = timetables.filter(t => {
        const matchSearch = t.class.toLowerCase().includes(search.toLowerCase()) ||
            t.section.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === DIRECTORY.FILTER_STATUS_ALL || t.status === statusFilter;
        const matchClass = classFilter === DIRECTORY.FILTER_CLASS_ALL || t.class === classFilter;
        return matchSearch && matchStatus && matchClass;
    });

    const uniqueClasses =
        activeClasses.length > 0
            ? activeClasses.map(c => c.name)
            : [...new Set(timetables.map(t => t.class))];

    if (openWorkspace) {
        return (
            <CreateSchedule
                timetable={openWorkspace.timetable}
                mode={openWorkspace.mode}
                onBack={() => { setOpenWorkspace(null); loadTimetables(yearFilter?.id || null); }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f4f9] p-4 md:p-6 relative">

            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{DIRECTORY.TITLE}</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{DIRECTORY.SUBTITLE}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <CardLoader key={i} />)
                ) : (
                    <>
                        <CardComponent IconName={BookOpen} keyName={DIRECTORY.CARD_TOTAL} val={total} iconTxColor="text-blue-600" iconBgColor="bg-blue-50" />
                        <CardComponent IconName={Send} keyName={DIRECTORY.CARD_PUB} val={published} iconTxColor="text-green-600" iconBgColor="bg-green-50" />
                        <CardComponent IconName={Clock} keyName={DIRECTORY.CARD_DRAFT} val={draft} iconTxColor="text-yellow-600" iconBgColor="bg-yellow-50" />
                        {/* <CardComponent IconName={Calendar} keyName="Filtered" val={filtered.length} iconTxColor="text-purple-600" iconBgColor="bg-purple-50" /> */}
                    </>
                )}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {/* Quick Actions */}
                <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-700 mb-2.5">{DIRECTORY.QUICK_ACTIONS}</p>
                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
                        <button onClick={() => setShowAddModal(true)}
                                className="flex items-center justify-center sm:justify-start gap-1.5 px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer w-full sm:w-auto">
                            <Plus size={15} />
                            {DIRECTORY.BTN_ADD_TT}
                        </button>
                        <button onClick={() => setShowTeacherSchedule(true)}
                                className="flex items-center justify-center sm:justify-start gap-1.5 px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer w-full sm:w-auto">
                            <UserSearch size={15} />
                            <span className="truncate">{DIRECTORY.BTN_TEACHER_SCH}</span>
                        </button>
                        <button onClick={() => setShowConfig(true)}
                                className="flex items-center justify-center sm:justify-start gap-1.5 px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer w-full sm:w-auto">
                            <Settings2 size={15} />
                            <span className="truncate">{DIRECTORY.BTN_CONFIG}</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row items-center gap-3">

                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={DIRECTORY.PH_SEARCH}
                                className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative w-full md:w-auto md:min-w-[180px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-11 appearance-none bg-white border border-gray-300
        rounded-lg pl-4 pr-10 text-sm text-gray-700 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            >
                                <option>{DIRECTORY.FILTER_STATUS_ALL}</option>
                                <option>{STATUS.DRAFT}</option>
                                <option>{STATUS.PUBLISHED}</option>
                            </select>

                            <ChevronDown
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>

                        {/* Class Filter */}
                        <div className="relative w-full md:w-auto md:min-w-[180px]">
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="w-full h-11 appearance-none bg-white border border-gray-300
        rounded-lg pl-4 pr-10 text-sm text-gray-700 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            >
                                <option>{DIRECTORY.FILTER_CLASS_ALL}</option>
                                {uniqueClasses.map((cls) => (
                                    <option key={cls}>{cls}</option>
                                ))}
                            </select>

                            <ChevronDown
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {DIRECTORY.TABLE_HEADERS.map(h => (
                                <th key={h} className="text-center px-5 py-3 text-xs font-semibold text-gray-500 tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">{DIRECTORY.LOADING}</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-400">
                                    <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                                    {DIRECTORY.NO_TT}
                                </td>
                            </tr>
                        ) : filtered.map(tt => (
                            <tr key={tt.id} className="hover:bg-gray-50/60 transition">
                                <td className="px-5 text-center py-4 font-medium text-gray-900">{tt.class}</td>
                                <td className="px-5 text-center py-4 text-gray-600">{tt.section}</td>

                                <td className="px-5 text-center py-4"><StatusBadge status={tt.status} /></td>
                                <td className="px-5 text-center py-4 text-gray-500">{tt.lastUpdated}</td>
                                <td className="px-5 py-4">
                                    {/* FIX: justify-center, but every row reserves the same slot for
                                        Publish (an invisible placeholder when the row is already
                                        Published). That keeps the group's total width identical on
                                        every row, so centering no longer shifts View/Edit/Delete
                                        left or right depending on whether Publish is shown — they
                                        stay in a straight column while the whole group sits centered
                                        under "Actions". */}
                                    <div className="flex items-center justify-center gap-2 flex-nowrap overflow-x-auto">
                                        <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'view' })}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition whitespace-nowrap flex-shrink-0">
                                            <Eye size={14} /> {DIRECTORY.BTN_VIEW}
                                        </button>
                                        <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'edit' })}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition whitespace-nowrap flex-shrink-0">
                                            <Pencil size={14} /> {DIRECTORY.BTN_EDIT}
                                        </button>
                                        <button onClick={() => setDeleteConfirm(tt.id)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition whitespace-nowrap cursor-pointer flex-shrink-0">
                                            <Trash2 size={14} /> {DIRECTORY.BTN_DELETE}
                                        </button>
                                        {tt.status === STATUS.DRAFT ? (
                                            <button onClick={() => handlePublish(tt.id)} disabled={publishingId === tt.id}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0">
                                                <Send size={14} /> {publishingId === tt.id ? DIRECTORY.BTN_PUBLISHING : DIRECTORY.BTN_PUBLISH}
                                            </button>
                                        ) : (
                                            <span aria-hidden="true"
                                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 invisible pointer-events-none">
                                                <Send size={14} /> {DIRECTORY.BTN_PUBLISH}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400 text-sm">{DIRECTORY.LOADING}</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                            {DIRECTORY.NO_TT}
                        </div>
                    ) : filtered.map(tt => (
                        <div key={tt.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-gray-900">{tt.class} — {tt.section}</p>
                                    <p className="text-xs text-gray-500">{tt.year} · {tt.lastUpdated}</p>
                                </div>
                                <StatusBadge status={tt.status} />
                            </div>
                            {/* FIX: same reserved-slot approach as desktop — centered, but
                                Publish's space is always reserved (invisible placeholder when
                                already Published) so View/Edit/Delete don't shift row to row. */}
                            <div className="flex justify-center gap-2 flex-nowrap overflow-x-auto mt-4">
                                <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'view' })}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 cursor-pointer whitespace-nowrap transition flex-shrink-0">
                                    <Eye size={14} /> {DIRECTORY.BTN_VIEW}
                                </button>
                                <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'edit' })}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 cursor-pointer whitespace-nowrap transition flex-shrink-0">
                                    <Pencil size={14} /> {DIRECTORY.BTN_EDIT}
                                </button>
                                <button onClick={() => setDeleteConfirm(tt.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer whitespace-nowrap transition flex-shrink-0">
                                    <Trash2 size={14} /> {DIRECTORY.BTN_DELETE}
                                </button>
                                {tt.status === STATUS.DRAFT ? (
                                    <button onClick={() => handlePublish(tt.id)} disabled={publishingId === tt.id}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap transition flex-shrink-0">
                                        <Send size={14} /> {publishingId === tt.id ? DIRECTORY.BTN_PUBLISHING : DIRECTORY.BTN_PUBLISH}
                                    </button>
                                ) : (
                                    <span aria-hidden="true"
                                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 invisible pointer-events-none">
                                        <Send size={14} /> {DIRECTORY.BTN_PUBLISH}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {showConfig && <ScheduleConfig onClose={() => setShowConfig(false)} />}
            {showAddModal && (
                <AddTimetableModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddTimetable}
                    existingTimetables={timetables}
                />
            )}

            {/* Teacher Schedule Viewer Modal */}
            {showTeacherSchedule && (
                <TeacherScheduleViewer onClose={() => setShowTeacherSchedule(false)} />
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{DIRECTORY.CONFIRM_DEL_TITLE}</h3>
                        <p className="text-sm text-gray-500 mb-5">{DIRECTORY.CONFIRM_DEL_MSG}</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border cursor-pointer border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                {DIRECTORY.BTN_CANCEL}
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} disabled={deletingId === deleteConfirm}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer text-sm font-medium hover:bg-red-600 disabled:opacity-50">
                                {deletingId === deleteConfirm ? DIRECTORY.BTN_DELETING : DIRECTORY.BTN_DELETE}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}