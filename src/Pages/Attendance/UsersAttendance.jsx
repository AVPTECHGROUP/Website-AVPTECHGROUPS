import {
  ChevronLeft, ChevronRight, Inbox, Calendar, CalendarCheck2Icon,
  UserCheck2, UserX, Clock, CheckCircle2, XCircle, X,
  AlertTriangle, ChevronDown
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { pendingApprovals, approveManualAttendance, attendanceStatistics } from '../../Api/Attendance/AttendanceApi';
import CardLoader from '../../Components/CommonComp/CardLoader';

import {
  ATTENDANCE_TABS as TABS,
  AVATAR_COLORS,
  TOAST_ENTER_APPROVAL_REMARKS, TOAST_ENTER_REJECTION_REASON,
  TOAST_APPROVED_SUCCESS_FALLBACK, TOAST_REJECTED_SUCCESS,
  TOAST_APPROVAL_FAILED, TOAST_REJECTION_FAILED, DEFAULT_USER_LABEL,
  UI_STRINGS
} from "../../Constants/StringConstants/AttendanceConstants";

const TODAY = new Date().toISOString().split('T')[0];

const getAvatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ─── Approve Modal ─── */
const ApproveModal = ({ user, onClose, onConfirm }) => {
  const [overrideStatus, setOverrideStatus] = useState('PRESENT');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!remarks.trim()) { toast.error(TOAST_ENTER_APPROVAL_REMARKS); return; }
    setLoading(true);
    await onConfirm({ attendanceId: user.id, approved: true, remarks, overrideStatus });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="text-base font-bold text-gray-900">{UI_STRINGS.PENDING_APPROVALS.MODAL_APPROVE_TITLE}</h3>
          </div>
          <button onClick={onClose} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* User Info Card */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.userName)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {user.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user.userName || UI_STRINGS.COMMON.N_A}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{UI_STRINGS.PENDING_APPROVALS.MODAL_REQ_TYPE}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200 text-xs font-semibold rounded-lg shrink-0">{UI_STRINGS.PENDING_APPROVALS.MODAL_PENDING_TAG}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" /> {UI_STRINGS.PENDING_APPROVALS.DATE_TXT} {user.attendanceDate}
              </span>
              {user.checkInTime && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> {UI_STRINGS.PENDING_APPROVALS.SUBMITTED_TXT} {user.checkInTime}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <AlertTriangle className="w-3.5 h-3.5" /> {UI_STRINGS.PENDING_APPROVALS.MANUAL_ENTRY}
              </span>
            </div>
            {user.remarks && (
              <p className="mt-2 text-xs text-gray-500 italic">{user.remarks}</p>
            )}
          </div>

          {/* Override Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{UI_STRINGS.PENDING_APPROVALS.OVERRIDE_STAT}</label>
            <div className="relative">
              <select value={overrideStatus} onChange={(e) => setOverrideStatus(e.target.value)}
                className="cursor-pointer w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-xl bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                <option value="PRESENT">{UI_STRINGS.PENDING_APPROVALS.OPT_PRESENT}</option>
                <option value="LATE">{UI_STRINGS.PENDING_APPROVALS.OPT_LATE}</option>
                <option value="HALF_DAY">{UI_STRINGS.PENDING_APPROVALS.OPT_HALF}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{UI_STRINGS.PENDING_APPROVALS.APPROVAL_REMARKS}</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
              placeholder={UI_STRINGS.PENDING_APPROVALS.APPROVAL_PH}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="cursor-pointer flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">{UI_STRINGS.COMMON.CANCEL}</button>
          <button onClick={handleConfirm} disabled={loading}
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-xl text-sm font-semibold text-white transition-all">
            <CheckCircle2 className="w-4 h-4" />
            {loading ? UI_STRINGS.PENDING_APPROVALS.CONFIRMING : UI_STRINGS.PENDING_APPROVALS.BTN_CONFIRM_APP}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Reject Modal ─── */
const RejectModal = ({ user, onClose, onConfirm }) => {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!remarks.trim()) { toast.error(TOAST_ENTER_REJECTION_REASON); return; }
    setLoading(true);
    await onConfirm({ attendanceId: user.id, approved: false, remarks });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-gray-900">{UI_STRINGS.PENDING_APPROVALS.MODAL_REJECT_TITLE}</h3>
          </div>
          <button onClick={onClose} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* User Info Card */}
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user.userName || UI_STRINGS.COMMON.N_A}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{UI_STRINGS.PENDING_APPROVALS.MODAL_REQ_TYPE}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200 text-xs font-semibold rounded-lg shrink-0">{UI_STRINGS.PENDING_APPROVALS.MODAL_PENDING_TAG}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" /> {UI_STRINGS.PENDING_APPROVALS.DATE_TXT} {user.attendanceDate}
              </span>
              {user.checkInTime && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> {UI_STRINGS.PENDING_APPROVALS.SUBMITTED_TXT} {user.checkInTime}
                </span>
              )}
            </div>
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{UI_STRINGS.PENDING_APPROVALS.REJECTION_REASON} <span className="text-red-500">*</span></label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
              placeholder={UI_STRINGS.PENDING_APPROVALS.REJECTION_PH}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none" />
            <p className="text-xs text-gray-400 mt-1">{UI_STRINGS.PENDING_APPROVALS.REJECTION_DESC}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="cursor-pointer flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">{UI_STRINGS.COMMON.CANCEL}</button>
          <button onClick={handleConfirm} disabled={loading}
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-xl text-sm font-semibold text-white transition-all">
            <XCircle className="w-4 h-4" />
            {loading ? UI_STRINGS.PENDING_APPROVALS.REJECTING : UI_STRINGS.PENDING_APPROVALS.BTN_CONFIRM_REJ}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Reason Modal ─── */
const ReasonModal = ({ reason, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">{UI_STRINGS.COMMON.REASON}</h3>
        <button onClick={onClose} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-gray-700 leading-relaxed break-all">
          {reason}
        </p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <button onClick={onClose} className="cursor-pointer w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">
          {UI_STRINGS.COMMON.CLOSE}
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main Component ─── */
const UsersAttendance = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [reasonModal, setReasonModal] = useState(null);
  const itemsPerPage = 10;

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (!selectedDate) return;
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await attendanceStatistics(selectedDate);
        setStats(data);
      } catch (err) { toast.error(err.message); }
      finally { setStatsLoading(false); }
    };
    fetchStats();
  }, [selectedDate]);

  useEffect(() => {
    const load = async () => {
      try {
        setListLoading(true);
        const approvals = await pendingApprovals();
        setPendingUsers(approvals || []);
      } catch (err) { toast.error(err.message); }
      finally { setListLoading(false); }
    };
    load();
  }, []);

  const totalPages = Math.ceil(pendingUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = pendingUsers.slice(startIndex, endIndex);

  const handleApproveConfirm = async ({ attendanceId, approved, remarks, overrideStatus }) => {
    try {
      const res = await approveManualAttendance({ attendanceId, approved, remarks, overrideStatus });
      setPendingUsers(prev => prev.map(u => u.id === attendanceId ? { ...u, status: res?.data?.status || 'PRESENT' } : u));
      toast.success(`${approveModal?.userName || DEFAULT_USER_LABEL} — ${res?.message || TOAST_APPROVED_SUCCESS_FALLBACK}`);
      setApproveModal(null);
    } catch (err) {
      toast.error(err.message || TOAST_APPROVAL_FAILED);
    }
  };

  const handleRejectConfirm = async ({ attendanceId, approved, remarks }) => {
    try {
      const res = await approveManualAttendance({ attendanceId, approved: false, remarks });
      setPendingUsers(prev => prev.map(u => u.id === attendanceId ? { ...u, status: res?.data?.status || 'REJECTED' } : u));
      toast.success(`${rejectModal?.userName || DEFAULT_USER_LABEL} — ${TOAST_REJECTED_SUCCESS}`);
      setRejectModal(null);
    } catch (err) {
      toast.error(err.message || TOAST_REJECTION_FAILED);
    }
  };

  const pendingCount = pendingUsers.filter(u => u.status === 'PENDING_MANUAL_REVIEW').length;

  const pendingStatCards = [
    { icon: Clock, label: UI_STRINGS.PENDING_APPROVALS.STAT_PENDING, val: pendingCount, sub: UI_STRINGS.PENDING_APPROVALS.STAT_PENDING_SUB, subColor: 'text-yellow-600 font-semibold', iconTx: 'text-yellow-600', iconBg: 'bg-yellow-100' },
  ];

  const getStatusBadge = (status) => {
    const map = {
      PRESENT: 'bg-green-50 text-green-700 ring-1 ring-green-200',
      PENDING_MANUAL_REVIEW: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
      REJECTED: 'bg-red-50 text-red-700 ring-1 ring-red-200',
      LATE: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    };
    return map[status] || 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
  };

  const getStatusLabel = (status) => {
    const map = { PRESENT: 'Approved', PENDING_MANUAL_REVIEW: 'Pending Review', REJECTED: 'Rejected', LATE: 'Late' };
    return map[status] || status;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {approveModal && <ApproveModal user={approveModal} onClose={() => setApproveModal(null)} onConfirm={handleApproveConfirm} />}
      {rejectModal && <RejectModal user={rejectModal} onClose={() => setRejectModal(null)} onConfirm={handleRejectConfirm} />}
      {reasonModal && <ReasonModal reason={reasonModal} onClose={() => setReasonModal(null)} />}

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="flex-1 bg-gradient-to-b from-sky-50 to-sky-100 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{UI_STRINGS.PENDING_APPROVALS.HEADER}</h2>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm font-medium">{UI_STRINGS.PENDING_APPROVALS.SUBTITLE}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
              <input type="date" value={selectedDate} max={TODAY}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="cursor-pointer px-3 py-2 border border-gray-300 rounded-xl bg-white shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all" />
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs sm:text-sm font-semibold text-blue-700 shadow-sm whitespace-nowrap">
                <span className="hidden lg:inline">{formatDate(selectedDate)}</span>
                <span className="lg:hidden">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mb-5">
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon; const active = tab.id === 'pendingApprovals';
                return (
                  <button key={tab.id} onClick={() => tab.id === 'attendanceOverview' && navigate('/attendance')}
                    className={`cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all border
                      ${active ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                    <Icon className="w-4 h-4 shrink-0" /><span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="hidden sm:block">
              <div className="flex gap-1 border-b border-gray-200">
                {TABS.map((tab) => {
                  const Icon = tab.icon; const active = tab.id === 'pendingApprovals';
                  return (
                    <button key={tab.id} onClick={() => tab.id === 'attendanceOverview' && navigate('/attendance')}
                      className={`inline-flex items-center cursor-pointer gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px
                        ${active ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                      <Icon className="w-5 h-5 shrink-0" />{tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── 3 Pending Stat Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
            {statsLoading
              ? pendingStatCards.map((_, i) => <CardLoader key={i} />)
              : pendingStatCards.map((card) => (
                <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                    <card.icon className={`w-6 h-6 ${card.iconTx}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 leading-tight">{card.val}</p>
                    <p className="text-sm font-semibold text-gray-600 mt-0.5">{card.label}</p>
                    <p className={`text-xs mt-0.5 ${card.subColor}`}>{card.sub}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* ── Desktop Table ── */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {UI_STRINGS.PENDING_APPROVALS.HEADERS.map((col) => (
                      <th key={col} className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listLoading && (
                    <tr><td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">{UI_STRINGS.COMMON.LOADING}</p>
                      </div>
                    </td></tr>
                  )}
                  {!listLoading && currentUsers.length > 0 && currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-start gap-2">
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.userName)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {user.userName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{user.userName || UI_STRINGS.COMMON.N_A}</p>
                            <p className="text-xs text-gray-400">{UI_STRINGS.COMMON.ID_LABEL} {user.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">{user.userType}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-gray-600 whitespace-nowrap">{user.attendanceDate}</span>
                      </td>
                      <td className="px-4 py-4 text-center max-w-[180px]">
                        {user.remarks ? (
                          user.remarks.length > 30 ? (
                            <button
                              onClick={() => setReasonModal(user.remarks)}
                              className="cursor-pointer px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-all"
                            >
                              {UI_STRINGS.COMMON.VIEW}
                            </button>
                          ) : (
                            <span className="text-sm text-gray-600">{user.remarks}</span>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {user.status === 'PENDING_MANUAL_REVIEW' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setApproveModal(user)}
                              className="cursor-pointer px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm whitespace-nowrap">
                              {UI_STRINGS.PENDING_APPROVALS.BTN_APP}
                            </button>
                            <button onClick={() => setRejectModal(user)}
                              className="cursor-pointer px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm whitespace-nowrap">
                              {UI_STRINGS.PENDING_APPROVALS.BTN_REJ}
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${user.status === 'PRESENT' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {user.status === 'PRESENT' ? UI_STRINGS.PENDING_APPROVALS.TAG_APPROVED : UI_STRINGS.PENDING_APPROVALS.TAG_REJECTED}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!listLoading && currentUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-base font-semibold text-gray-500">{UI_STRINGS.PENDING_APPROVALS.NO_PENDING}</p>
                        <p className="text-sm text-gray-400 mt-1">{UI_STRINGS.PENDING_APPROVALS.ALL_UP_TO_DATE}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pendingUsers.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-600 font-medium">
                  {UI_STRINGS.PENDING_APPROVALS.SHOWING} {startIndex + 1}–{Math.min(endIndex, pendingUsers.length)} {UI_STRINGS.PENDING_APPROVALS.OF} {pendingUsers.length} {UI_STRINGS.PENDING_APPROVALS.RECORDS}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                    className="cursor-pointer w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                      return <button key={p} onClick={() => setCurrentPage(p)}
                        className={`cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{p}</button>;
                    if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} className="text-gray-400 text-sm">...</span>;
                    return null;
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                    className="cursor-pointer w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile Cards ── */}
          <div className="lg:hidden space-y-3">
            {listLoading && (
              <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">{UI_STRINGS.COMMON.LOADING}</p>
              </div>
            )}
            {!listLoading && currentUsers.length > 0 && currentUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.userName)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {user.userName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{user.userName || UI_STRINGS.COMMON.N_A}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{UI_STRINGS.COMMON.ID_LABEL} {user.userId}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(user.status)}`}>
                    {getStatusLabel(user.status)}
                  </span>
                </div>
                <div className="space-y-2 mb-4 bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">Department</span>
                    <span className="text-xs text-gray-900 font-semibold">{user.userType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">{UI_STRINGS.COMMON.DATE}</span>
                    <span className="text-xs text-gray-900 font-semibold">{user.attendanceDate}</span>
                  </div>
                  {user.remarks && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-400 font-medium">{UI_STRINGS.COMMON.REASON}</span>
                      {user.remarks.length > 50 ? (
                        <button
                          onClick={() => setReasonModal(user.remarks)}
                          className="cursor-pointer self-start px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-all"
                        >
                          {UI_STRINGS.COMMON.VIEW}
                        </button>
                      ) : (
                        <p className="text-xs text-gray-700">{user.remarks}</p>
                      )}
                    </div>
                  )}
                </div>
                {user.status === 'PENDING_MANUAL_REVIEW' ? (
                  <div className="flex gap-2">
                    <button onClick={() => setApproveModal(user)}
                      className="cursor-pointer flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all">
                      {UI_STRINGS.PENDING_APPROVALS.BTN_APP}
                    </button>
                    <button onClick={() => setRejectModal(user)}
                      className="cursor-pointer flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all">
                      {UI_STRINGS.PENDING_APPROVALS.BTN_REJ}
                    </button>
                  </div>
                ) : (
                  <div className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center ${user.status === 'PRESENT' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {user.status === 'PRESENT' ? UI_STRINGS.PENDING_APPROVALS.TAG_APPROVED : UI_STRINGS.PENDING_APPROVALS.TAG_REJECTED}
                  </div>
                )}
              </div>
            ))}
            {!listLoading && currentUsers.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-base font-semibold text-gray-500">{UI_STRINGS.PENDING_APPROVALS.NO_PENDING}</p>
                <p className="text-sm text-gray-400 mt-1">{UI_STRINGS.PENDING_APPROVALS.ALL_UP_TO_DATE}</p>
              </div>
            )}
            {!listLoading && currentUsers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <p className="text-xs text-gray-500 text-center mb-3">
                  {UI_STRINGS.PENDING_APPROVALS.SHOWING} {startIndex + 1}–{Math.min(endIndex, pendingUsers.length)} {UI_STRINGS.PENDING_APPROVALS.OF} {pendingUsers.length}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                    className="cursor-pointer w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                      return <button key={p} onClick={() => setCurrentPage(p)}
                        className={`cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${currentPage === p ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{p}</button>;
                    if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} className="text-gray-400">...</span>;
                    return null;
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                    className="cursor-pointer w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UsersAttendance;