import React, { useEffect, useState } from 'react';
import {
    Plus,
    Calendar,
    UserRoundX,
    SearchX
} from 'lucide-react';
import LeaveCardComponent from '../../Components/LeavesComponents/LeaveCardComponent';
import {
    CancelUserlLeaveReq,
    getUserLeaveRequest,
    getUsersLeaveBalance
} from '../../Api/LeavesManagementAPI';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getListOfValues } from '../../Api/ListOfValues';
import ListLoader from '../../Components/CommonComp/ListLoader';

export default function LeaveDashboard() {
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
        year: ''
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [noReqFound, setNoReqFound] = useState(false);
    const [fetchleaveReqRefress, setFetchleaveReqfress] = useState(0);

    const navigate = useNavigate();
    /* ---------------------- compare listof values ---------------------- */
    const [listOfLeaveType, setListofLeavetype] = useState([]);
    function compareAndGetLabel(data, compareValue) {
        const found = data.find(item => item.value === compareValue);
        return found ? <span className="font-medium text-gray-900 text-sm"> {found.label} </span> : "";
    }

    useEffect(() => {
        let fetchListOfValues = async () => {
          try {
            const leaveTypeRes = await getListOfValues('LEAVE_TYPE');
            const formattedLeaveType = leaveTypeRes.map(item => ({
              id: item.id,
              value: item.value,
              label: item.label
            }));
            console.log(formattedLeaveType);
            setListofLeavetype(formattedLeaveType);
    
          }
          catch (e) {
            console.error("get list of values error error:", e.message);
            throw error;
          }
        }
        fetchListOfValues();
      }, []);

    /* ---------------------- STATUS STYLES ---------------------- */
    const statusStyles = {
        APPROVED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-700',
        PENDING: 'bg-yellow-100 text-yellow-700'
    };

    /* ---------------------- FETCH STATISTICS ---------------------- */
    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const currUser = JSON.parse(localStorage.getItem('user'));
                if (!currUser?.id) return;

                const statistics_res = await getUsersLeaveBalance(currUser.id);
                setStatistics(statistics_res.data);
            } catch (e) {
                console.error('Get statistics error:', e.message);
            }
        };

        fetchStatistics();
    }, []);

    /* ---------------------- FETCH LEAVE REQUESTS ---------------------- */
    useEffect(() => {
        const fetchLeaveRequest = async () => {
            setLoading(true);
            setError(null);

            try {
                const currUser = JSON.parse(localStorage.getItem('user'));
                if (!currUser?.id) return;

                const res = await getUserLeaveRequest(currUser.id);
                const leaveRequests = res.data || [];

                if (leaveRequests.length === 0) {
                    setNoReqFound(true);
                } else {
                    setNoReqFound(false);
                }

                const mappedRequests = leaveRequests.map((userReq) => ({
                    leaveId: userReq.id,
                    leaveType: userReq.leaveType,
                    fromDate: userReq.fromDate,
                    toDate: userReq.toDate,
                    totalDays: userReq.totalDays,
                    reason: userReq.reason,
                    reviewRemarks: userReq.reviewRemarks,
                    role: userReq.userType || 'N/A',
                    currLeavestatus: userReq.status
                }));

                setLeaveData(mappedRequests);
            } catch (err) {
                console.error('Error fetching leave requests:', err);
                setError(err.message || 'Something went wrong');
                setLeaveData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaveRequest();
    }, [fetchleaveReqRefress]);

    /* ---------------------- CANCEL HANDLER ---------------------- */
    const handleCancelLeave = async (leaveReq) => {
        if (leaveReq.currLeavestatus !== 'PENDING') return;
        try {
            const currUser = JSON.parse(localStorage.getItem('user'));
            if (!currUser?.id) return;
            await CancelUserlLeaveReq(leaveReq.leaveId, currUser.id);
            toast.success('Leave request Cancelled successfully.')
            setFetchleaveReqfress((prev) => prev + 1);
        } catch (error) {
            console.log(error);
            toast.error('failed to cancel leave request.')
        }
    };

    /* ---------------------- FORMAT DATE ---------------------- */
    const formatDateRange = (fromDate, toDate) => {
        if (fromDate === toDate) {
            return fromDate;
        }
        return `${fromDate} - ${toDate}`;
    };

    /* ---------------------- TRUNCATE TEXT ---------------------- */
    const truncateText = (text, maxLength = 40) => {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    /* ---------------------- CARDS DATA ---------------------- */
    const cardsArrayLeaves = [
        {
            IconName: Calendar,
            keyName: 'Available',
            rem_val: statistics.totalAvailable,
            total_val:
                Number(statistics.totalAvailable) + Number(statistics.totalUsed),
            iconTxColor: 'text-green-600',
            iconBgColor: 'bg-green-50'
        },
        {
            IconName: Calendar,
            keyName: 'Total Used',
            rem_val: statistics.totalUsed,
            total_val:
                Number(statistics.totalAvailable) + Number(statistics.totalUsed),
            iconTxColor: 'text-blue-600',
            iconBgColor: 'bg-blue-50'
        },
        {
            IconName: Calendar,
            keyName: 'Sick Leaves',
            rem_val: statistics.sickLeaveAvailable,
            total_val: statistics.sickLeaveLimit,
            iconTxColor: 'text-orange-600',
            iconBgColor: 'bg-orange-50'
        },
        {
            IconName: Calendar,
            keyName: 'Casual Leaves',
            rem_val: statistics.casualLeaveAvailable,
            total_val: statistics.casualLeaveLimit,
            iconTxColor: 'text-pink-600',
            iconBgColor: 'bg-pink-50'
        },
        {
            IconName: Calendar,
            keyName: 'Earned Leaves',
            rem_val: statistics.earnedLeaveAvailable,
            total_val: statistics.earnedLeaveLimit,
            iconTxColor: 'text-purple-600',
            iconBgColor: 'bg-purple-50'
        }
    ];

    return (
        <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            My Leave Dashboard
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Track and manage your personal leave requests and balance.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/leaves/ApplyLeaves')}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Request New Leave
                    </button>
                </div>

                {/* Leave Balance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
                    {cardsArrayLeaves.map((cardData) => (
                        <LeaveCardComponent
                            key={cardData.keyName}
                            {...cardData}
                        />
                    ))}
                </div>

                {/* Leave History */}
                <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 sm:p-3 sm:px-4 border-b border-b-gray-500 flex justify-between items-center">
                        <h2 className="text-lg sm:text-lg text-gray-800 font-semibold ">
                            My Leave History
                        </h2>
                        <span className="text-xs sm:text-sm text-gray-500">
                            Academic Year {statistics.year}
                        </span>
                    </div>

                    {/* Desktop Table View - Hidden on mobile */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-100 border-b border-b-gray-200">
                                <tr>
                                    {['Leave Type', 'Period', 'Duration', 'Reason', 'Status', 'Action'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <ListLoader avatar={false}/>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8">
                                            <UserRoundX className="mx-auto mb-2 text-red-500 w-12 h-12" />
                                            <p className="text-red-600 font-medium">{error}</p>
                                        </td>
                                    </tr>
                                ) : noReqFound ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8">
                                            <SearchX className="mx-auto mb-2 text-blue-500 w-12 h-12" />
                                            <p className="text-gray-600 font-medium">No Request Found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    leaveData.map((leaveReq) => (
                                        <tr key={leaveReq.leaveId} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4">
                                                <span className=" text-sm text-gray-800">
                                                    {compareAndGetLabel(listOfLeaveType, leaveReq.leaveType)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                <div className="whitespace-nowrap">
                                                    {formatDateRange(leaveReq.fromDate, leaveReq.toDate)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {leaveReq.totalDays}{' '}
                                                    {leaveReq.totalDays === 1 ? 'day' : 'days'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div
                                                    className="text-sm text-gray-700 max-w-xs"
                                                    title={leaveReq.reason}>
                                                    {truncateText(leaveReq.reason, 40)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[leaveReq.currLeavestatus]}`}>
                                                    {leaveReq.currLeavestatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {leaveReq.currLeavestatus === 'PENDING' ? (
                                                    <button
                                                        title='Proceed to cancel request'
                                                        onClick={() =>
                                                            handleCancelLeave(leaveReq)
                                                        }
                                                        className="px-4 py-2 bg-blue-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition whitespace-nowrap cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View - Shown only on mobile */}
                    <div className="md:hidden">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                    <span className="text-gray-600">Loading requests...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 px-4">
                                <UserRoundX className="mx-auto mb-2 text-red-500 w-12 h-12" />
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        ) : noReqFound ? (
                            <div className="text-center py-8 px-4">
                                <SearchX className="mx-auto mb-2 text-blue-500 w-12 h-12" />
                                <p className="text-gray-600 font-medium">No Request Found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {leaveData.map((leaveReq) => (
                                    <div key={leaveReq.leaveId} className="p-4 hover:bg-gray-50 my-1 shadow-sm transition">
                                        {/* Header Row */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3>
                                                    {compareAndGetLabel(listOfLeaveType, leaveReq.leaveType)}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {formatDateRange(leaveReq.fromDate, leaveReq.toDate)}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[leaveReq.currLeavestatus]}`}>
                                                {leaveReq.currLeavestatus}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center text-sm">
                                                <span className="text-gray-500 font-medium w-24">Duration:</span>
                                                <span className="text-gray-900">
                                                    {leaveReq.totalDays}{' '}
                                                    {leaveReq.totalDays === 1 ? 'day' : 'days'}
                                                </span>
                                            </div>
                                            <div className="flex text-sm">
                                                <span className="text-gray-500 font-medium w-24 shrink-0">Reason:</span>
                                                <span
                                                    className="text-gray-700 wrap-break-words flex-1"
                                                    title={leaveReq.reason}
                                                >
                                                    {truncateText(leaveReq.reason, 80)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {leaveReq.currLeavestatus === 'PENDING' && (
                                            <button
                                                onClick={() => handleCancelLeave(leaveReq)}
                                                className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                                            >
                                                Cancel Request
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t text-sm text-gray-500 italic">
                        Showing your recent leave activity
                    </div>
                </div>
            </div>
        </div>
    );
}