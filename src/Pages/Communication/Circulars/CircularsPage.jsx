import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScrollText, CheckCircle2, Clock, XCircle,
  Search, SlidersHorizontal, Eye, Download,
  Archive, Check, X, ChevronLeft, ChevronRight,
  AlertCircle, RefreshCw,
} from 'lucide-react';
import CardComponent from '../../../Components//CommonComp/CardComponent';
import ListLoader from '../../../Components//CommonComp/ListLoader';
import { fetchCirculars, approveCircular, rejectCircular, deleteCircular } from '../../../Api/CircularApi.js';
import CircularDetailModal from '../../../Components/CircularDetailsPopup/CircularDetailModel.jsx';

// ── Static helpers ─────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  PUBLISHED: { label: 'Published', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', dot: '#16a34a' },
  PENDING_APPROVAL: { label: 'Pending Approval', bg: '#fffbeb', color: '#d97706', border: '#fde68a', dot: '#d97706' },
  DRAFT: { label: 'Draft', bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', dot: '#9ca3af' },
  REJECTED: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#dc2626' },
};

const TARGET_STYLE = {
  ALL_PARENTS: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' },
  ALL_STAFF: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  ALL_TEACHERS: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  DEFAULT: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
};

// Human-readable labels for targetType values
const TARGET_LABEL = {
  ALL_PARENTS: 'All Parents',
  ALL_STAFF: 'All Staff',
  ALL_TEACHERS: 'All Teachers',
};

// const [selectedCircularId, setSelectedCircularId] = useState(null);
const TABS = ['All', 'School-Wide', 'Class-Specific', 'Pending'];
const PAGE_SIZE = 10;

function StatusBadge({ status }) {
  const key = status?.toUpperCase();
  const s = STATUS_STYLE[key] || STATUS_STYLE.DRAFT;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function TargetChip({ targetType }) {
  const key = targetType?.toUpperCase();
  const s = TARGET_STYLE[key] || TARGET_STYLE.DEFAULT;
  const label = TARGET_LABEL[key] || targetType;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10.5, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {label}
    </span>
  );
}

function IconBtn({ icon: Icon, title, color = '#6b7280', hoverBg = '#f3f4f6', onClick }) {
  const [h, setH] = useState(false);
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb', background: h ? hoverBg : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .15s', color: h ? color : '#9ca3af' }}>
      <Icon size={13} />
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CircularsPage() {
  const navigate = useNavigate();

  // ── State ──
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statLoading, setStatLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);

  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState('');
  const [typeFilter, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0, draftRejected: 0 });

  const [selectedCircularId, setSelectedCircularId] = useState(null);

  // ── Load circulars ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // API uses 0-based page index
    const params = { page: page - 1, size: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;
    if (search.trim()) params.search = search.trim();
    if (tab === 'School-Wide') params.type = 'SCHOOL_WIDE';
    if (tab === 'Class-Specific') params.type = 'CLASS_SPECIFIC';
    if (tab === 'Pending') params.status = 'PENDING_APPROVAL';

    const { data, error: err } = await fetchCirculars(params);

    if (err) {
      setError(err);
    } else {
      // Response shape: { success, data: [...], pagination: { totalPages, totalElements, ... } }
      const list = Array.isArray(data?.data) ? data.data : [];
      const pagination = data?.pagination ?? {};

      setCirculars(list);
      setTotalPages(pagination.totalPages ?? 1);

      // Stats: total from pagination (accurate across all pages); other counts from current page
      // For accurate per-status counts across all pages you'd need a dedicated /stats endpoint
      setStats({
        total: pagination.totalElements ?? list.length,
        published: list.filter((c) => c.status?.toUpperCase() === 'PUBLISHED').length,
        pending: list.filter((c) => c.status?.toUpperCase() === 'PENDING_APPROVAL').length,
        draftRejected: list.filter((c) => ['DRAFT', 'REJECTED'].includes(c.status?.toUpperCase())).length,
      });
    }

    setLoading(false);
    setStatLoading(false);
  }, [page, statusFilter, typeFilter, search, tab]);

  useEffect(() => { load(); }, [load]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionId(id);
    const { error: err } = await approveCircular(id);
    if (!err) load();
    else alert(err);
    setActionId(null);
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason === null) return;
    setActionId(id);
    const { error: err } = await rejectCircular(id, reason);
    if (!err) load();
    else alert(err);
    setActionId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this circular?')) return;
    setActionId(id);
    const { error: err } = await deleteCircular(id);
    if (!err) load();
    else alert(err);
    setActionId(null);
  };

  // ── Cards config ─────────────────────────────────────────────────────────────
  const cardsArray = [
    { keyName: 'Total Circulars', val: stats.total, IconName: ScrollText, iconTxColor: 'text-blue-600', iconBgColor: 'bg-blue-50' },
    { keyName: 'Published', val: stats.published, IconName: CheckCircle2, iconTxColor: 'text-green-600', iconBgColor: 'bg-green-50' },
    { keyName: 'Pending Approval', val: stats.pending, IconName: Clock, iconTxColor: 'text-amber-600', iconBgColor: 'bg-amber-50' },
    { keyName: 'Draft / Rejected', val: stats.draftRejected, IconName: XCircle, iconTxColor: 'text-red-500', iconBgColor: 'bg-red-50' },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Circulars</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and publish school circulars for staff, parents and students.</p>
        </div>
        <button
          onClick={() => navigate('/communication/circulars/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + New Circular
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {cardsArray.map((card) => (
          <CardComponent
            key={card.keyName}
            IconName={card.IconName}
            keyName={card.keyName.toUpperCase()}
            val={statLoading ? '—' : card.val}
            iconTxColor={card.iconTxColor}
            iconBgColor={card.iconBgColor}
          />
        ))}
      </div>

      {/* Filters + tabs card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 pt-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => { setTab(t); setPage(1); }}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors mr-1 ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
              {t === 'Pending' && stats.pending > 0 && (
                <span className="ml-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending}</span>
              )}
            </button>
          ))}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2.5 items-center p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search circulars…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
            />
          </div>

          <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select value={typeFilter} onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="">All Types</option>
            <option value="SCHOOL_WIDE">School-Wide</option>
            <option value="CLASS_SPECIFIC">Class-Specific</option>
          </select>

          <button onClick={load} title="Refresh"
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
            <AlertCircle size={15} /> {error}
            <button onClick={load} className="ml-auto text-red-600 underline text-xs">Retry</button>
          </div>
        )}

        {/* Col headers */}
        <div className="grid text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-2.5 bg-gray-50 border-b border-gray-100"
          style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 130px 90px' }}>
          {['Circular', 'Type', 'Date', 'Author', 'Status', 'Action'].map((h) => <div key={h}>{h}</div>)}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="p-6"><ListLoader /></div>
        ) : circulars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ScrollText size={36} strokeWidth={1.2} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium">No circulars found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          circulars.map((c) => (
            <div key={c.id}
              className="grid items-start px-5 py-3.5 border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
              style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 130px 90px', opacity: actionId === c.id ? 0.5 : 1 }}>

              {/* Title + preview + targets */}
              <div className="pr-4">
                <p className="text-sm font-semibold text-gray-900 leading-snug mb-0.5">{c.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-1.5">{c.content}</p>
                {/* targets: [{ id, targetType, classId, sectionId }] */}
                <div className="flex flex-wrap gap-1">
                  {(c.targets ?? []).map((tg) => (
                    <TargetChip key={tg.id ?? tg.targetType} targetType={tg.targetType} />
                  ))}
                </div>
                {c.attachments?.length > 0 && (
                  <p className="text-[10.5px] text-violet-600 mt-1.5">
                    📎 {c.attachments.length} attachment{c.attachments.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                  {c.type === 'SCHOOL_WIDE' ? 'School-Wide' : c.type === 'CLASS_SPECIFIC' ? 'Class-Specific' : c.type}
                </span>
              </div>

              {/* Date — prefer publishedAt, fallback to createdAt */}
              <div className="text-xs text-gray-500 leading-relaxed">
                {(c.publishedAt || c.createdAt)
                  ? new Date(c.publishedAt ?? c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </div>

              {/* Author — API returns createdById; show ID until you have a name */}
              <div>
                <p className="text-xs font-medium text-gray-700 leading-snug">
                  {c.authorName ?? c.author ?? `User #${c.createdById}` ?? '—'}
                </p>
                <p className="text-[11px] text-gray-400">{c.authorRole ?? ''}</p>
              </div>

              {/* Status */}
              <div>
                <StatusBadge status={c.status} />
                {c.notifiedCount > 0 && (
                  <p className="text-[10.5px] text-gray-400 mt-1">🔔 {c.notifiedCount} notified</p>
                )}
                {c.rejectionReason && (
                  <p className="text-[10.5px] text-red-500 mt-0.5 leading-snug">{c.rejectionReason}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                {/* FIX: was checking 'PENDING', API returns 'PENDING_APPROVAL' */}
                {c.status?.toUpperCase() === 'PENDING_APPROVAL' && (
                  <>
                    <IconBtn icon={Check} title="Approve" color="#16a34a" hoverBg="#f0fdf4" onClick={() => handleApprove(c.id)} />
                    <IconBtn icon={X} title="Reject" color="#dc2626" hoverBg="#fef2f2" onClick={() => handleReject(c.id)} />
                  </>
                )}
                <IconBtn
                  icon={Eye}
                  title="View"
                  color="#2563eb"
                  hoverBg="#eff6ff"
                  onClick={() => setSelectedCircularId(c.id)}
                />
                {c.status?.toUpperCase() === 'PUBLISHED' && (
                  <IconBtn icon={Archive} title="Archive" color="#6b7280" hoverBg="#f3f4f6" onClick={() => handleDelete(c.id)} />
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {!loading && circulars.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-1.5">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={12} /> Prev
              </button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        <CircularDetailModal
          circularId={selectedCircularId}
          onClose={() => setSelectedCircularId(null)}
        />
      </div>
    </div>
  );
}