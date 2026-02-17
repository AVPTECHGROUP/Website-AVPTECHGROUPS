import { CircleCheckBig, X } from "lucide-react";
import { useState } from "react";

export default function LeavesReqInfoComponent({ isOpen, onClose, userData, handleLeaveApprove, handleLeaveReject, setRemarks, remarks, listLeavetype }) {
    if (!isOpen || !userData) return null;

    const getAvatarColor = (name) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-yellow-500'
        ];
        const index = name?.charCodeAt(0) % colors.length || 0;
        return colors[index];
    };

    const statusStyles = {
        PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        APPROVED: 'bg-green-50 text-green-800 border-green-200',
        REJECTED: 'bg-red-50 text-red-800 border-red-200',
        CANCELLED: 'bg-orange-50 text-orange-800 border-orange-200',
        WITHDRAWN: 'bg-gray-50 text-gray-800 border-gray-200'
    };

    //Compare and get lable function
    function compareAndGetLabel(data, compareValue) {
        const found = data.find(item => item.value === compareValue);
        return found ? <span> {found.label} </span> : "";
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-3">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[95vh] overflow-hidden relative animate-fadeIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header with Avatar */}
                <div className="flex ml-4 mr-4 sm:px-4 pt-8 sm:pt-10 pb-3 sm:pb-4 w-full justify-between border-b border-gray-100">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-lg sm:text-xl lg-text-2xl ${getAvatarColor(userData.name)} flex items-center justify-center text-white font-semibold`}>
                            {userData.avatar}
                        </div>
                        <p className="flex flex-col font-semibold text-gray-900 md:text-xl sm:text-base">
                            {userData.name}
                            <span className="font-normal text-sm text-gray-400"> {userData.empCode || userData.id}</span>
                        </p>
                    </div>
                    {/* Status Badge */}
                    <span className={`mr-8 sm:px-2.5 px-2 py-1 rounded-md text-xs font-medium h-fit w-fit border  ${statusStyles[userData.currEmpstatus]}`}>
                        {userData.currEmpstatus}
                    </span>
                </div>

                {/* Content */}
                <div className="mx-6 my-4 mt-0 sm:px-4 py-3 sm:py-4 space-y-2">
                    {/* Leave Type and Duration */}
                    <div className="grid grid-cols-2 gap-2.5  sm:gap-2">
                        <div className=" p-2 sm:p-2.5">
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Leave Type
                            </p>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                    {compareAndGetLabel(listLeavetype ,userData.leaveType)}
                                </p>
                            </div>
                        </div>
                        <div className=" p-2 sm:p-2.5 ">
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Duration
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                {userData.totalDays} {userData.totalDays === 1 ? 'day' : 'days'}
                            </p>
                        </div>
                    </div>

                    {/* Period */}
                    <div className=" p-2 sm:p-2.5">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Period
                        </p>
                        <div className="flex sm:items-center gap-0.5 sm:gap-1.5">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                {userData.fromDate}
                            </p>
                            <span className="text-xs text-gray-400 lowercase text-center pt-0 md:pt-1">to</span>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                {userData.toDate}
                            </p>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Reason
                        </p>
                        <div className="bg-gray-50 p-2 sm:p-2.5 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-700 leading-snug">
                                {userData.reason}
                            </p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label htmlFor="remarks" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Remarks
                        </label>
                        <textarea
                            disabled={userData.currEmpstatus === 'APPROVED' || userData.currEmpstatus === 'REJECTED' || userData.currEmpstatus === 'CANCELLED'}
                            id="remarks"
                            name="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder={`${userData.reviewRemarks === "" ? userData.currEmpstatus === "PENDING" ? "Add your remarks here..." : "No review remark mentioned!" : "No review remark mentioned!"}`}
                            rows="2"
                            className="w-full text-xs text-gray-700 bg-white p-2 sm:p-2.5 border border-gray-300 rounded-md leading-snug focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <button
                            disabled={userData.currEmpstatus === 'APPROVED' || userData.currEmpstatus === 'REJECTED' || userData.currEmpstatus === 'CANCELLED'}
                            onClick={() => {
                                handleLeaveReject();
                                onClose();
                            }}
                            className={`${userData.currEmpstatus === 'APPROVED' || userData.currEmpstatus === 'REJECTED' || userData.currEmpstatus === 'CANCELLED' ? 'cursor-not-allowed bg-red-300' : 'bg-red-400 hover:bg-red-500 active:bg-red-800'} w-full flex gap-2 justify-center sm:flex-1 py-1 px-4  text-white font-semibold rounded-md  transition-colors text-xs sm:text-sm`}
                        >
                            <X className="p-0.5" />
                            Reject
                        </button>
                        <button
                            disabled={userData.currEmpstatus === 'APPROVED' || userData.currEmpstatus === 'REJECTED' || userData.currEmpstatus === 'CANCELLED'}
                            onClick={() => {
                                //  alert(`Approved leave for ${userData.name}`);
                                handleLeaveApprove();
                                onClose();
                            }}
                            className={`${userData.currEmpstatus === 'APPROVED' || userData.currEmpstatus === 'REJECTED' || userData.currEmpstatus === 'CANCELLED' ? 'cursor-not-allowed bg-blue-400' : 'bg-blue-600  hover:bg-blue-700 active:bg-blue-800'} w-full flex gap-2 justify-center sm:flex-1 py-1 px-4  text-white font-semibold rounded-md transition-colors text-xs sm:text-sm`}
                        >
                            <CircleCheckBig className="p-0.5" />
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}