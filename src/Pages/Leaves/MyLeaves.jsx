import React, { useContext, useEffect, useState } from 'react';
import {
  Plus,
  Calendar,
  UserRoundX,
  SearchX,
  Clock3,
  FileText,
  CircleAlert,
  CircleCheckBig,
  CircleX,
  Trash2,
} from 'lucide-react';

import LeaveCardComponent from '../../Components/LeavesComponents/LeaveCardComponent';
import {
  CancelUserlLeaveReq,
  getUserLeaveRequest,
  getUsersLeaveBalance,
} from '../../Api/LeavesManagementAPI';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getListOfValues } from '../../Api/ListOfValues';
import ListLoader from '../../Components/CommonComp/ListLoader';
import { UserContext } from '../../ContextAPI/UserContext';
import CardComponent from '../../Components/CommonComp/CardComponent';

export default function LeaveDashboard() {
  const { user } = useContext(UserContext);
  const [user_id, set_user_id] = useState(null);
  const [leaveData, setLeaveData] = useState([]);

  const [statistics, setStatistics] = useState({
    totalAvailable: 0,
    totalUsed: 0,
    sickLeaveAvailable: 0,
    sickLeaveLimit: 0,
    casualLeaveAvailable: 0,
    casualLeaveLimit: 0,
    earnedLeaveAvailable: 0,
    earnedLeaveLimit: 0,
    year: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noReqFound, setNoReqFound] = useState(false);
  const [fetchleaveReqRefress, setFetchleaveReqfress] = useState(0);
  const navigate = useNavigate();

  /* ---------------- USER ---------------- */
  useEffect(() => {
    if (!user) return;
    set_user_id(user.id);
  }, [user]);

  /* ---------------- LIST OF VALUES ---------------- */
  const [listOfLeaveType, setListofLeavetype] = useState([]);

  function compareAndGetLabel(data, compareValue) {
    const found = data.find((item) => item.value === compareValue);
    return found ? found.label : '';
  }

  useEffect(() => {
    const fetchListOfValues = async () => {
      try {
        const leaveTypeRes = await getListOfValues('LEAVE_TYPE');
        const formattedLeaveType = leaveTypeRes.map((item) => ({
          id: item.id,
          value: item.value,
          label: item.label,
        }));
        setListofLeavetype(formattedLeaveType);
      } catch (e) {
        console.error('get list of values error:', e.message);
      }
    };
    fetchListOfValues();
  }, []);

  /* ---------------- STATUS STYLES ---------------- */
  const statusStyles = {
    APPROVED: 'bg-green-100 text-green-700 border border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border border-red-200',
    PENDING: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    CANCELLED: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  const statusIcons = {
    APPROVED: CircleCheckBig,
    REJECTED: CircleX,
    PENDING: CircleAlert,
    CANCELLED: Trash2,
  };

  /* ---------------- FETCH STATISTICS ---------------- */
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        if (!user_id) return;
        const statistics_res = await getUsersLeaveBalance(user_id);
        const data = statistics_res?.data?.data ?? statistics_res?.data ?? statistics_res;
        if (!data) return;
        const leaveBalances = data.leaveBalances || [];
        const getLeaveData = (type) => leaveBalances.find((item) => item.leaveType === type) || {};
        const sickLeave = getLeaveData('SICK_LEAVE');
        const casualLeave = getLeaveData('CASUAL_LEAVE');
        const earnedLeave = getLeaveData('EARNED_LEAVE');
        setStatistics({
          totalAvailable: Number(data.totalDaysAvailable) || 0,
          totalUsed: Number(data.totalDaysUsed) || 0,
          sickLeaveAvailable: Number(sickLeave.daysAvailable) || 0,
          sickLeaveLimit: Number(sickLeave.annualLimit) || 0,
          casualLeaveAvailable: Number(casualLeave.daysAvailable) || 0,
          casualLeaveLimit: Number(casualLeave.annualLimit) || 0,
          earnedLeaveAvailable: Number(earnedLeave.daysAvailable) || 0,
          earnedLeaveLimit: Number(earnedLeave.annualLimit) || 0,
          year: data.year || '',
        });
      } catch (e) {
        console.error('Get statistics error:', e.message);
      }
    };
    fetchStatistics();
  }, [user_id]);

  /* ---------------- FETCH LEAVE REQUESTS ---------------- */
  useEffect(() => {
    const fetchLeaveRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user_id) return;
        const res = await getUserLeaveRequest(user_id);
        const leaveRequests = res.data || [];
        setNoReqFound(leaveRequests.length === 0);
        const mappedRequests = leaveRequests.map((userReq) => ({
          leaveId: userReq.id,
          leaveType: userReq.leaveType,
          fromDate: userReq.fromDate,
          toDate: userReq.toDate,
          totalDays: userReq.totalDays,
          reason: userReq.reason,
          reviewRemarks: userReq.reviewRemarks,
          role: userReq.userType || 'N/A',
          currLeavestatus: userReq.status,
        }));
        setLeaveData(mappedRequests);
      } catch (err) {
        setError(err.message || 'Something went wrong');
        setLeaveData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequest();
  }, [fetchleaveReqRefress, user_id]);

  /* ---------------- CANCEL LEAVE ---------------- */
  const handleCancelLeave = async (leaveReq) => {
    if (leaveReq.currLeavestatus !== 'PENDING') return;
    try {
      if (!user_id) return;
      await CancelUserlLeaveReq(leaveReq.leaveId, user_id);
      toast.success('Leave request cancelled successfully.');
      setFetchleaveReqfress((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      toast.error('Failed to cancel leave request.');
    }
  };

  /* ---------------- HELPERS ---------------- */
  const formatDateRange = (fromDate, toDate) => {
    const formatDate = (date) =>
      new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    const formattedFrom = formatDate(fromDate);
    const formattedTo = formatDate(toDate);
    return formattedFrom === formattedTo
      ? formattedFrom
      : `${formattedFrom} – ${formattedTo}`;
  };

  /* ---------------- CARDS DATA ---------------- */
  const cardsArrayLeaves = [
    {
      IconName: Calendar,
      keyName: 'Available Leaves',
      rem_val: statistics.totalAvailable,
      total_val: statistics.totalAvailable + statistics.totalUsed,
      type: 'available',
      iconTxColor: 'text-green-600',
      iconBgColor: 'bg-green-50',
    },
    {
      IconName: Calendar,
      keyName: 'Sick Leaves',
      rem_val: statistics.sickLeaveAvailable,
      total_val: statistics.sickLeaveLimit,
      type: 'remaining',
      iconTxColor: 'text-orange-600',
      iconBgColor: 'bg-orange-50',
    },
    {
      IconName: Calendar,
      keyName: 'Casual Leaves',
      rem_val: statistics.casualLeaveAvailable,
      total_val: statistics.casualLeaveLimit,
      type: 'remaining',
      iconTxColor: 'text-pink-600',
      iconBgColor: 'bg-pink-50',
    },
    {
      IconName: Calendar,
      keyName: 'Earned Leaves',
      rem_val: statistics.earnedLeaveAvailable,
      total_val: statistics.earnedLeaveLimit,
      type: 'remaining',
      iconTxColor: 'text-purple-600',
      iconBgColor: 'bg-purple-50',
    },
  ];

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */
  return (
    /*
      PAGE ROOT
      - overflow-x: hidden on the page prevents any child from ever
        pushing the viewport wider than the screen.
      - width: 100% + box-sizing: border-box so padding never adds width.
    */
    <div
      className="min-h-screen bg-gradient-to-b from-sky-50 to-sky-100 p-3 sm:p-5 lg:p-6"
      style={{ overflowX: 'hidden', width: '100%', boxSizing: 'border-box' }}
    >
      {/*
        INNER CONTAINER
        - minWidth: 0 is critical — without it a flex/grid child will refuse
          to shrink below its content width, blowing out the layout.
      */}
      <div className="max-w-7xl mx-auto w-full" style={{ minWidth: 0 }}>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
              My Leave Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track and manage your leave requests and balance.
            </p>
          </div>

          <button
            onClick={() => navigate('/leaves/ApplyLeaves')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Request New Leave
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm mt-5 mb-6">
          {cardsArrayLeaves.map((cardData) => (
            <CardComponent
              key={cardData.keyName}
              {...cardData}
              val={`${cardData.rem_val}/${cardData.total_val}`}
            />
          ))}
        </div>

        {/* ── Leave History Card ── */}
        {/*
          The card itself must NOT have overflow-hidden at this level —
          that would clip the horizontal scrollbar of the table wrapper.
          Instead we control overflow per-section below.
        */}
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full"
          style={{ minWidth: 0, boxSizing: 'border-box' }}
        >

          {/* Card header */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              My Leave History
            </h2>
            {statistics.year && (
              <span className="text-xs sm:text-sm text-slate-500">
                Academic Year {statistics.year}
              </span>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              DESKTOP TABLE  (md and above → 768 px+)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-t-xl">
              <div
                style={{
                  overflowX: 'auto',
                  overflowY: 'auto',
                  maxHeight: 'calc(100vh - 380px)',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <table style={{ width: '100%', minWidth: '700px', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '12%' }} />
                  </colgroup>

                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      {['Leave Type', 'Period', 'Duration', 'Reason', 'Status', 'Action'].map((h) => (
                        <th
                          key={h}
                          className="px-2 lg:px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loading ? (
                      <ListLoader avatar={false} />
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <UserRoundX className="mx-auto mb-3 text-red-400 w-12 h-12" />
                          <p className="text-red-600 font-medium">{error}</p>
                        </td>
                      </tr>
                    ) : noReqFound ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <SearchX className="mx-auto mb-3 text-blue-400 w-12 h-12" />
                          <p className="text-slate-600 font-medium">No Request Found</p>
                        </td>
                      </tr>
                    ) : (
                      leaveData.map((leaveReq) => {
                        const StatusIcon = statusIcons[leaveReq.currLeavestatus];
                        return (
                          <tr key={leaveReq.leaveId} className="hover:bg-slate-50 transition-colors">

                            {/* Leave Type */}
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-1" style={{ minWidth: 0 }}>
                                <div className="w-6 h-6 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                                  <Calendar className="w-3 h-3 text-violet-600" />
                                </div>
                                <p
                                  className="text-xs font-semibold text-slate-800"
                                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0 }}
                                >
                                  {compareAndGetLabel(listOfLeaveType, leaveReq.leaveType)}
                                </p>
                              </div>
                            </td>

                            {/* Period */}
                            <td className="px-4 py-4">
                              <div className="flex items-start gap-2" style={{ minWidth: 0 }}>
                                <Clock3 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span
                                  className="text-xs text-slate-700"
                                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0 }}
                                >
                                  {formatDateRange(leaveReq.fromDate, leaveReq.toDate)}
                                </span>
                              </div>
                            </td>

                            {/* Duration */}
                            <td className="px-2 py-2 whitespace-nowrap">
                              <span className="text-xs font-semibold text-slate-800">
                                {leaveReq.totalDays} {leaveReq.totalDays === 1 ? 'day' : 'days'}
                              </span>
                            </td>

                            {/* Reason */}
                            <td className="px-2 lg:px-3 py-2">
                              <div className="flex items-start gap-2" style={{ minWidth: 0 }}>
                                <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <p
                                  className="text-xs text-slate-600 leading-relaxed"
                                  title={leaveReq.reason}
                                  style={{
                                    flex: 1,
                                    width: 0,
                                    wordBreak: 'break-word',
                                    overflowWrap: 'anywhere',
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                  {leaveReq.reason || '-'}
                                </p>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-1 py-1 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-1 py-0.5 rounded-full text-[10px] font-xs ${statusStyles[leaveReq.currLeavestatus]}`}
                              >
                                <StatusIcon className="w-3 h-3 shrink-0" />
                                {leaveReq.currLeavestatus}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-2 py-2 whitespace-nowrap items-center">
                              {leaveReq.currLeavestatus === "PENDING" ? (
                                <button
                                  onClick={() => handleCancelLeave(leaveReq)}
                                  className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span className="text-slate-400 text-xs text-center"> - </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* 
              MOBILE CARDS  (below md → up to 767 px) */}
          <div className="lg:hidden">
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="text-slate-500 text-sm">Loading requests…</span>
              </div>
            ) : error ? (
              <div className="py-16 text-center px-4">
                <UserRoundX className="mx-auto mb-3 text-red-400 w-12 h-12" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : noReqFound ? (
              <div className="py-16 text-center px-4">
                <SearchX className="mx-auto mb-3 text-blue-400 w-12 h-12" />
                <p className="text-slate-600 font-medium">No Request Found</p>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-3 w-full">
                {leaveData.map((leaveReq) => {
                  const StatusIcon = statusIcons[leaveReq.currLeavestatus];
                  return (
                    <div
                      key={leaveReq.leaveId}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      style={{ maxWidth: '100%', boxSizing: 'border-box' }}
                    >
                      {/* Top row: icon + leave name + status badge */}
                      <div
                        className="flex items-start justify-between gap-2 mb-3"
                        style={{ maxWidth: '100%' }}
                      >
                        {/* Left: icon + name + date  →  flex:1 + minWidth:0
                            so this side shrinks and gives the badge its space */}
                        <div
                          className="flex items-start gap-3"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-violet-600" />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p
                              className="text-sm font-semibold text-slate-800 leading-snug"
                              style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                whiteSpace: 'normal',
                              }}
                            >
                              {compareAndGetLabel(listOfLeaveType, leaveReq.leaveType)}
                            </p>
                            <p
                              className="text-xs text-slate-500 mt-0.5"
                              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            >
                              {formatDateRange(leaveReq.fromDate, leaveReq.toDate)}
                            </p>
                          </div>
                        </div>

                        {/* Badge — flex-shrink-0 so it never gets squashed */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${statusStyles[leaveReq.currLeavestatus]}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {leaveReq.currLeavestatus}
                        </span>
                      </div>

                      {/* Detail rows */}
                      <div
                        className="space-y-2 border-t border-slate-100 pt-3"
                        style={{ maxWidth: '100%' }}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 text-xs">Duration</span>
                          <span className="font-semibold text-slate-800 text-xs">
                            {leaveReq.totalDays}{' '}
                            {leaveReq.totalDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>

                        {leaveReq.reason && (
                          <div
                            className="flex items-start gap-2"
                            style={{ maxWidth: '100%' }}
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <p
                              className="text-xs text-slate-600 leading-relaxed"
                              style={{
                                flex: 1,
                                width: 0,
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {leaveReq.reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Cancel button */}
                      {leaveReq.currLeavestatus === 'PENDING' && (
                        <button
                          onClick={() => handleCancelLeave(leaveReq)}
                          className="mt-3 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card footer */}
          <div className="px-4 sm:px-6 py-3 border-t border-slate-100 text-xs sm:text-sm text-slate-400 italic bg-slate-50">
            Showing your recent leave activity
          </div>
        </div>

      </div>
    </div>
  );
}