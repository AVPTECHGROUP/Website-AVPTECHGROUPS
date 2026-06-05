import { useState, useEffect } from 'react';
import {
    Calendar, Plus, Eye, Pencil, Trash2, Send,
    Search, ChevronDown, Settings2, BookOpen, Clock, UserSearch
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
} from '../../Api/ScheduleApi';
import { getListOfValues } from '../../Api/ListOfValues';
import { getActiveClasses } from '../../Api/TeachersAPI';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
    const isDraft = status === 'Draft' || status === 'DRAFT';
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
      ${isDraft
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-green-50 text-green-700 border-green-200'}`}>
            {isDraft ? '⊘' : '✓'} {isDraft ? 'Draft' : 'Published'}
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
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [classFilter, setClassFilter] = useState('All Classes');
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
            console.error('Failed to load academic years:', err);
        }
    };

    const loadActiveClasses = async () => {
        try {
            const data = await getActiveClasses();
            setActiveClasses(data || []);
        } catch (err) {
            console.error('Failed to load active classes:', err);
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
            console.error('Failed to load timetables:', err);
            toast.error('Failed to load timetables');
        } finally {
            setLoading(false);
        }
    };

    const normalizeApiTimetable = (t) => ({
        id: t.id,
        class: t.className || t.class || `Class ${t.classId}`,
        section: t.sectionName || t.section || `Section ${t.sectionId}`,
        year: t.academicYear || t.year,
        status: t.status === 'PUBLISHED' ? 'Published' : 'Draft',
        lastUpdated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'Recently',
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
            toast.success('Timetable created successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to create timetable');
        }
    };

    const handlePublish = async (id) => {
        try {
            setPublishingId(id);
            await publishTimetable(id);
            setTimetables(prev => prev.map(t => t.id === id ? { ...t, status: 'Published', lastUpdated: 'Just now' } : t));
            toast.success('Published successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to publish');
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
            toast.success('Deleted successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    // ✅ Year dropdown change handler — finds the LOV object by label, triggers API reload
    const handleYearChange = (e) => {
        const selectedLabel = e.target.value;
        if (selectedLabel === 'All Years') {
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
    const published = timetables.filter(t => t.status === 'Published').length;
    const draft = timetables.filter(t => t.status === 'Draft').length;

    const filtered = timetables.filter(t => {
        const matchSearch = t.class.toLowerCase().includes(search.toLowerCase()) ||
            t.section.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All Statuses' || t.status === statusFilter;
        const matchClass = classFilter === 'All Classes' || t.class === classFilter;
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
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Timetable Directory</h1>
                <p className="text-sm text-gray-500 mt-0.5">List of all class-section timetables. Choose view or edit.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => <CardLoader key={i} />)
                ) : (
                    <>
                        <CardComponent IconName={BookOpen} keyName="Total" val={total} iconTxColor="text-blue-600" iconBgColor="bg-blue-50" />
                        <CardComponent IconName={Send} keyName="Published" val={published} iconTxColor="text-green-600" iconBgColor="bg-green-50" />
                        <CardComponent IconName={Clock} keyName="Draft" val={draft} iconTxColor="text-yellow-600" iconBgColor="bg-yellow-50" />
                        <CardComponent IconName={Calendar} keyName="Filtered" val={filtered.length} iconTxColor="text-purple-600" iconBgColor="bg-purple-50" />
                    </>
                )}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {/* Quick Actions */}
                <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-700 mb-2.5">Quick Actions</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer">
                            <Plus size={15} />
                            Add Timetable
                        </button>
                        <button onClick={() => setShowTeacherSchedule(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer">
                            <UserSearch size={15} />
                            Teacher Schedule
                        </button>
                        <button onClick={() => setShowConfig(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer">
                            <Settings2 size={15} />
                            School Time Config
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-wrap">

                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px]">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search class ..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
                            {['All Statuses', 'Draft', 'Published'].map(o => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Class Filter */}
                    <div className="relative">
                        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
                            {['All Classes', ...uniqueClasses].map(o => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* ✅ Year Filter — uses academicYearId for API call */}
                    {/* <div className="relative">
                        <select
                            value={yearFilter ? (yearFilter.label || yearFilter.value) : 'All Years'}
                            onChange={handleYearChange}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
                            <option value="All Years">All Years</option>
                            {academicYears.map(y => (
                                <option key={y.id} value={y.label || y.value}>
                                    {y.label || y.value}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div> */}

                    {/* ✅ Refresh respects current year filter */}
                    <button onClick={() => loadTimetables(yearFilter?.id || null)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer text-gray-600 hover:bg-gray-50 transition font-medium">
                        ↻ Refresh
                    </button>
                </div>

                {/* Table Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['CLASS', 'SECTION',  'STATUS', 'LAST UPDATED', 'ACTIONS'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Loading timetables...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">
                                        <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                                        No timetables found
                                    </td>
                                </tr>
                            ) : filtered.map(tt => (
                                <tr key={tt.id} className="hover:bg-gray-50/60 transition">
                                    <td className="px-5 py-4 font-medium text-gray-900">{tt.class}</td>
                                    <td className="px-5 py-4 text-gray-600">{tt.section}</td>
                                    
                                    <td className="px-5 py-4"><StatusBadge status={tt.status} /></td>
                                    <td className="px-5 py-4 text-gray-500">{tt.lastUpdated}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'view' })}
                                                className="flex items-center gap-1 px-3 cursor-pointer py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                                                <Eye size={13} /> View
                                            </button>
                                            <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'edit' })}
                                                className="flex items-center gap-1 px-3 cursor-pointer py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                                                <Pencil size={13} /> Edit
                                            </button>
                                            {tt.status === 'Draft' && (
                                                <button onClick={() => handlePublish(tt.id)} disabled={publishingId === tt.id}
                                                    className="flex items-center gap-1 px-3 cursor-pointer py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50">
                                                    <Send size={13} /> {publishingId === tt.id ? 'Publishing...' : 'Publish'}
                                                </button>
                                            )}
                                            <button onClick={() => setDeleteConfirm(tt.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 border cursor-pointer border-red-100 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition">
                                                <Trash2 size={13} /> Delete
                                            </button>
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
                        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                            No timetables found
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
                            <div className="flex gap-2 flex-wrap mt-3">
                                <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'view' })}
                                    className="flex items-center gap-1 px-3 cursor-pointer py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
                                    <Eye size={13} /> View
                                </button>
                                <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'edit' })}
                                    className="flex items-center gap-1 px-3 cursor-pointer py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
                                    <Pencil size={13} /> Edit
                                </button>
                                {tt.status === 'Draft' && (
                                    <button onClick={() => handlePublish(tt.id)} disabled={publishingId === tt.id}
                                        className="flex items-center gap-1 px-3 cursor-pointer py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                                        <Send size={13} /> {publishingId === tt.id ? 'Publishing...' : 'Publish'}
                                    </button>
                                )}
                                <button onClick={() => setDeleteConfirm(tt.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 border border-red-100 rounded-lg text-xs font-medium text-red-500">
                                    <Trash2 size={13} /> Delete
                                </button>
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Timetable?</h3>
                        <p className="text-sm text-gray-500 mb-5">This action cannot be undone. All slots will be permanently removed.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 border cursor-pointer border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} disabled={deletingId === deleteConfirm}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer text-sm font-medium hover:bg-red-600 disabled:opacity-50">
                                {deletingId === deleteConfirm ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}