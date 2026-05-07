import { useState, useEffect } from 'react';
import {
    Calendar, Plus, Eye, Pencil, Trash2, Send,
    Search, ChevronDown, Settings2, BookOpen, Clock
} from 'lucide-react';
import CardComponent from '../../Components/CommonComp/CardComponent';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ScheduleConfig from './components/ScheduleConfig';
import AddTimetableModal from './components/AddTimetableModal';
import CreateSchedule from './CreateSchedule';
import {
    getTimetables,
    createTimetable,
    deleteTimetable,
    publishTimetable,
} from '../../api/ScheduleApi';

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
    const [showConfig, setShowConfig] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [timetables, setTimetables] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [classFilter, setClassFilter] = useState('All Classes');
    const [sort, setSort] = useState('Recently Added');
    const [openWorkspace, setOpenWorkspace] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [toastMsg, setToastMsg] = useState('');

    useEffect(() => {
        loadTimetables();
    }, []);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    };

    const loadTimetables = async () => {
        try {
            setLoading(true);
            const res = await getTimetables(0, 50);
            const list = res?.content || res?.data?.content || res?.data || [];
            setTimetables(list.map(normalizeApiTimetable));
        } catch (err) {
            console.error('Failed to load timetables:', err);
            showToast('Failed to load timetables');
        } finally {
            setLoading(false);
        }
    };

    // Normalize API response to local shape
    const normalizeApiTimetable = (t) => ({
        id: t.id,
        class: t.className || t.class || `Class ${t.classId}`,
        section: t.sectionName || t.section || `Section ${t.sectionId}`,
        year: t.academicYearLabel || t.year,
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
                academicYearLabel: data.academicYearLabel,
                notes: data.notes,
                ...(data.copyFromTimetableId ? { copyFromTimetableId: data.copyFromTimetableId } : {}),
            };
            const created = await createTimetable(payload);
            const newTT = normalizeApiTimetable(created);
            setTimetables(prev => [newTT, ...prev]);
            setShowAddModal(false);
            setOpenWorkspace({ timetable: newTT, mode: 'edit' });
            showToast('Timetable created ✓');
        } catch (err) {
            showToast(err.message || 'Failed to create timetable');
        }
    };

    const handlePublish = async (id) => {
        try {
            await publishTimetable(id);
            setTimetables(prev => prev.map(t => t.id === id ? { ...t, status: 'Published', lastUpdated: 'Just now' } : t));
            showToast('Published ✓');
        } catch (err) {
            showToast(err.message || 'Failed to publish');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTimetable(id);
            setTimetables(prev => prev.filter(t => t.id !== id));
            setDeleteConfirm(null);
            showToast('Deleted');
        } catch (err) {
            showToast(err.message || 'Failed to delete');
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

    // Unique filter options from loaded data
    const uniqueClasses = [...new Set(timetables.map(t => t.class))];
    const uniqueYears = [...new Set(timetables.map(t => t.year))];

    if (openWorkspace) {
        return (
            <CreateSchedule
                timetable={openWorkspace.timetable}
                mode={openWorkspace.mode}
                onBack={() => { setOpenWorkspace(null); loadTimetables(); }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f4f9] p-4 md:p-6 relative">

            {/* Toast */}
            {toastMsg && (
                <div className="fixed bottom-5 right-5 z-100 bg-[#1e293b] text-white text-sm px-4 py-2.5 rounded-xl shadow-xl">
                    {toastMsg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Timetable Directory</h1>
                    <p className="text-sm text-gray-500 mt-0.5">List of all class-section timetables. Choose view or edit.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowConfig(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                        <Settings2 size={16} />
                        School Time Config
                    </button>
                    <button onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] transition">
                        <Plus size={16} />
                        Add Timetable
                    </button>
                </div>
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
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-45">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search class or section..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                    </div>
                    {[
                        { val: statusFilter, set: setStatusFilter, opts: ['All Statuses', 'Draft', 'Published'] },
                        { val: classFilter, set: setClassFilter, opts: ['All Classes', ...uniqueClasses] },
                    ].map(({ val, set, opts }, i) => (
                        <div key={i} className="relative">
                            <select value={val} onChange={e => set(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
                                {opts.map(o => <option key={o}>{o}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    ))}
                    <button onClick={loadTimetables}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition font-medium">
                        ↻ Refresh
                    </button>
                </div>

                {/* Table Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['CLASS', 'SECTION', 'YEAR', 'STATUS', 'LAST UPDATED', 'ACTIONS'].map(h => (
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
                                    <td className="px-5 py-4 text-gray-600">{tt.year}</td>
                                    <td className="px-5 py-4"><StatusBadge status={tt.status} /></td>
                                    <td className="px-5 py-4 text-gray-500">{tt.lastUpdated}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'view' })}
                                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                                                <Eye size={13} /> View
                                            </button>
                                            <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'edit' })}
                                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                                                <Pencil size={13} /> Edit
                                            </button>
                                            {tt.status === 'Draft' && (
                                                <button onClick={() => handlePublish(tt.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#1e293b] text-white rounded-lg text-xs font-medium hover:bg-[#334155] transition">
                                                    <Send size={13} /> Publish
                                                </button>
                                            )}
                                            <button onClick={() => setDeleteConfirm(tt.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 border border-red-100 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition">
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
                                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
                                    <Eye size={13} /> View
                                </button>
                                <button onClick={() => setOpenWorkspace({ timetable: tt, mode: 'edit' })}
                                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
                                    <Pencil size={13} /> Edit
                                </button>
                                {tt.status === 'Draft' && (
                                    <button onClick={() => handlePublish(tt.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-[#1e293b] text-white rounded-lg text-xs font-medium">
                                        <Send size={13} /> Publish
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

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Timetable?</h3>
                        <p className="text-sm text-gray-500 mb-5">This action cannot be undone. All slots will be permanently removed.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}