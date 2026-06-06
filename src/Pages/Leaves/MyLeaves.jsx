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

        const data =
          statistics_res?.data?.data ?? statistics_res?.data ?? statistics_res;

        if (!data) return;

        const leaveBalances = data.leaveBalances || [];

        const getLeaveData = (type) =>
          leaveBalances.find((item) => item.leaveType === type) || {};

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
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formattedFrom = formatDate(fromDate);
  const formattedTo = formatDate(toDate);

  if (formattedFrom === formattedTo) {
    return formattedFrom;
  }

  return `${formattedFrom} to ${formattedTo}`;
};

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '-';

    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + '...';
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
    // {
    //   IconName: Calendar,
    //   keyName: 'Used Leaves',
    //   rem_val: statistics.totalUsed,
    //   total_val: statistics.totalAvailable + statistics.totalUsed,
    //   type: 'used',
    //   iconTxColor: 'text-blue-600',
    //   iconBgColor: 'bg-blue-50',
    // },
    {
      IconName: Calendar,
      keyName: 'Sick Leaves Remaining',
      rem_val: statistics.sickLeaveAvailable,
      total_val: statistics.sickLeaveLimit,
      type: 'remaining',
      iconTxColor: 'text-orange-600',
      iconBgColor: 'bg-orange-50',
    },
    {
      IconName: Calendar,
      keyName: 'Casual Leaves Remaining',
      rem_val: statistics.casualLeaveAvailable,
      total_val: statistics.casualLeaveLimit,
      type: 'remaining',
      iconTxColor: 'text-pink-600',
      iconBgColor: 'bg-pink-50',
    },
    {
      IconName: Calendar,
      keyName: 'Earned Leaves Remaining',
      rem_val: statistics.earnedLeaveAvailable,
      total_val: statistics.earnedLeaveLimit,
      type: 'remaining',
      iconTxColor: 'text-purple-600',
      iconBgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-7">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              My Leave Dashboard
            </h1>

            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Track and manage your leave requests and balance.
            </p>
          </div>

          <button
            onClick={() => navigate('/leaves/ApplyLeaves')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Request New Leave
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
          {cardsArrayLeaves.map((cardData) => (
            <CardComponent key={cardData.keyName} {...cardData} val={cardData.rem_val + '/'+ cardData.total_val} />
          ))}
        </div>

        {/* Leave History */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
            <h2 className="text-lg font-semibold text-slate-800">
              My Leave History
            </h2>

            <span className="text-sm text-slate-500">
              Academic Year {statistics.year}
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    'Leave Type',
                    'Period',
                    'Duration',
                    'Reason',
                    'Status',
                    'Action',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <ListLoader avatar={false} />
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <UserRoundX className="mx-auto mb-3 text-red-400 w-12 h-12" />

                      <p className="text-red-600 font-medium">{error}</p>
                    </td>
                  </tr>
                ) : noReqFound ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <SearchX className="mx-auto mb-3 text-blue-400 w-12 h-12" />

                      <p className="text-slate-600 font-medium">
                        No Request Found
                      </p>
                    </td>
                  </tr>
                ) : (
                  leaveData.map((leaveReq) => {
                    const StatusIcon = statusIcons[leaveReq.currLeavestatus];

                    return (
                      <tr
                        key={leaveReq.leaveId}
                        className="hover:bg-slate-50 transition-all"
                      >
                        {/* Leave Type */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-violet-600" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {compareAndGetLabel(
                                  listOfLeaveType,
                                  leaveReq.leaveType
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Period */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Clock3 className="w-4 h-4 text-slate-400" />

                            <span>
                              {formatDateRange(
                                leaveReq.fromDate,
                                leaveReq.toDate
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-slate-800">
                            {leaveReq.totalDays}{' '}
                            {leaveReq.totalDays === 1 ? 'day' : 'days'}
                          </span>
                        </td>


                        {/* Reason  field*/}
                        <td className="px-5 py-4 max-w-xs">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                            <p
                              className="text-sm text-slate-600 leading-relaxed"
                              title={leaveReq.reason}
                            >
                              {truncateText(leaveReq.reason, 20)}
                            </p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              statusStyles[leaveReq.currLeavestatus]
                            }`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />

                            {leaveReq.currLeavestatus}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          {leaveReq.currLeavestatus === 'PENDING' ? (
                            <button
                              onClick={() => handleCancelLeave(leaveReq)}
                              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold transition-all"
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            {loading ? (
              <div className="py-16 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>

                <span className="text-slate-500">Loading requests...</span>
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
              <div className="p-4 space-y-4">
                {leaveData.map((leaveReq) => {
                  const StatusIcon = statusIcons[leaveReq.currLeavestatus];

                  return (
                    <div
                      key={leaveReq.leaveId}
                      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      {/* Top */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-violet-600" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {compareAndGetLabel(
                                listOfLeaveType,
                                leaveReq.leaveType
                              )}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {formatDateRange(
                                leaveReq.fromDate,
                                leaveReq.toDate
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            statusStyles[leaveReq.currLeavestatus]
                          }`}
                        >
                          <StatusIcon className="w-3 h-3" />

                          {leaveReq.currLeavestatus}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Duration</span>

                          <span className="font-semibold text-slate-800">
                            {leaveReq.totalDays}{' '}
                            {leaveReq.totalDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                          <p className="text-sm text-slate-600 leading-relaxed">
                            {truncateText(leaveReq.reason, 90)}
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      {leaveReq.currLeavestatus === 'PENDING' && (
                        <button
                          onClick={() => handleCancelLeave(leaveReq)}
                          className="mt-4 w-full py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold transition-all"
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

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-200 text-sm text-slate-500 italic bg-slate-50">
            Showing your recent leave activity
          </div>
        </div>
      </div>
    </div>
  );
}
