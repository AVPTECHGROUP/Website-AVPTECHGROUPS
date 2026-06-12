import {
    CircleCheckBig,
    X,
    CalendarDays,
    Clock3,
    FileText,
    MessageSquareText,
    Info
} from "lucide-react";

export default function LeavesReqInfoComponent({
    isOpen,
    onClose,
    userData,
    handleLeaveApprove,
    handleLeaveReject,
    setRemarks,
    remarks,
    listLeavetype
}) {
    if (!isOpen || !userData) return null;

    const getAvatarColor = (name) => {
        const colors = [
            "from-blue-500 to-indigo-600",
            "from-green-500 to-emerald-600",
            "from-purple-500 to-violet-600",
            "from-pink-500 to-rose-600",
            "from-cyan-500 to-sky-600",
            "from-amber-500 to-orange-600"
        ];

        return colors[name?.charCodeAt(0) % colors.length || 0];
    };

    // Status badge styles
    const statusStyles = {
        PENDING:
            "bg-yellow-100 text-yellow-700 border-yellow-300",

        APPROVED:
            "bg-green-100 text-green-700 border-green-300",

        REJECTED:
            "bg-red-100 text-red-700 border-red-300",

        CANCELLED:
            "bg-orange-100 text-orange-700 border-orange-300",

        WITHDRAWN:
            "bg-gray-100 text-gray-700 border-gray-300"
    };

    // Header gradients
    const headerGradients = {
        PENDING:
            "from-yellow-500 via-amber-500 to-orange-500",

        APPROVED:
            "from-green-700 via-green-600 to-emerald-500",

        REJECTED:
            "from-red-700 via-red-600 to-rose-500",

        CANCELLED:
            "from-orange-700 via-orange-600 to-amber-500",

        WITHDRAWN:
            "from-gray-700 via-gray-600 to-gray-500"
    };

    // Disable buttons if not pending
    const isLocked = userData.currEmpstatus !== "PENDING";

    function compareAndGetLabel(data, compareValue) {
        const found = data.find(
            item => item.value === compareValue
        );

        return found ? found.label : "";
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

            {/* Modal */}
            <div className="w-full max-w-sm max-h-[95vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col">

                {/* Header */}
                <div
                    className={`relative bg-gradient-to-r ${headerGradients[userData.currEmpstatus] ||
                        headerGradients.PENDING
                        } px-5 pt-5 pb-6 overflow-hidden`}
                >

                    {/* Top Right */}
                    <div className="absolute top-7 right-3 flex items-center gap-2 z-10">

                        {/* Status */}
                        <span
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-sm whitespace-nowrap ${statusStyles[userData.currEmpstatus]
                                }`}
                        >
                            {userData.currEmpstatus}
                        </span>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all shrink-0"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* User Row */}
                    <div className="flex items-start gap-3 pr-24">

                        {/* Avatar */}
                        <div className="relative shrink-0">

                            {/* Glow */}
                            <div className="absolute inset-0 rounded-full bg-white/30 blur-md scale-110" />

                            {/* Border */}
                            <div className="relative p-[2px] rounded-full bg-white/40 shadow-lg">

                                {/* Avatar */}
                                <div
                                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(
                                        userData.name
                                    )} flex items-center justify-center text-white font-semibold text-2xl border border-white/30`}
                                >
                                    {userData.avatar}
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">

                            {/* Name */}
                            <p className="text-white font-semibold text-[15px] truncate">
                                {userData.name}
                            </p>

                            {/* Emp ID + Role */}
                            {/* <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">

                                <span className="text-white/80 text-xs">
                                    {userData.empCode !== null
                                        ? "Emp Id: " + userData.empCode
                                        : userData.id !== null
                                            ? "Id: " + userData.id
                                            : ""}
                                </span>

                                {userData.role && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-white/50"></span>

                                        <span className="text-white/80 text-xs">
                                            {"Role : " +
                                                userData.role.toUpperCase()}
                                        </span>
                                    </>
                                )}
                            </div> */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-white/85 text-[11px] sm:text-xs">

                                {/* Employee ID */}
                                {(userData.empCode || userData.id) && (
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-medium text-white/70 whitespace-nowrap">
                                            {userData.empCode ? "Emp ID" : "ID"}
                                        </span>

                                        <span className="w-1 h-1 rounded-full bg-white/40 shrink-0"></span>

                                        <span className="font-semibold truncate">
                                            {userData.empCode || userData.id}
                                        </span>
                                    </div>
                                )}

                                {/* Divider */}
                                {userData.role && (
                                    <span className="w-1 h-1 rounded-full bg-white/40 hidden sm:block"></span>
                                )}

                                {/* Role */}
                                {userData.role && (
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-medium text-white/70 whitespace-nowrap">
                                            Role
                                        </span>

                                        <span className="w-1 h-1 rounded-full bg-white/40 shrink-0"></span>

                                        <span className="font-semibold uppercase tracking-wide truncate">
                                            {userData.role}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-4 py-4 flex flex-col gap-3 overflow-y-auto bg-slate-50">

                    {/* Leave Type + Duration */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* Leave Type */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">

                            <div className="flex items-start gap-3">

                                <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                                    <CalendarDays
                                        size={20}
                                        className="text-violet-600"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                                        Leave Type
                                    </p>

                                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                                        {compareAndGetLabel(
                                            listLeavetype,
                                            userData.leaveType
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">

                            <div className="flex items-start gap-3">

                                <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <Clock3
                                        size={20}
                                        className="text-blue-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                                        Duration
                                    </p>

                                    <p className="text-sm font-semibold text-slate-800">
                                        {userData.totalDays}{" "}
                                        {userData.totalDays === 1
                                            ? "day"
                                            : "days"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leave Period */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">

                        <div className="flex items-start gap-3">

                            {/* Icon */}
                            <div className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                                <CalendarDays
                                    size={20}
                                    className="text-green-600"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                                    Period
                                </p>

                                <div className="flex items-center gap-2">

                                    {/* From */}
                                    <p className="text-sm font-semibold text-slate-800">
                                        {userData.fromDate}
                                    </p>

                                    <span className="text-xs text-slate-400">
                                        to
                                    </span>

                                    {/* To */}
                                    <p className="text-sm font-semibold text-slate-800">
                                        {userData.toDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                            Reason
                        </p>

                        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">

                            <div className="flex items-start gap-3">

                                {/* Icon */}
                                <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                                    <FileText
                                        size={20}
                                        className="text-orange-500"
                                    />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 leading-relaxed break-words whitespace-normal">
                                        {userData.reason || 'No reason provided'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2 block">
                            Remarks
                        </label>

                        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">

                            <div className="flex items-start gap-3">

                                {/* Icon */}
                                <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <Info
                                        size={20}
                                        className="text-blue-500"
                                    />
                                </div>

                                {/* Textarea */}
                                <div className="flex-1">
                                    <textarea
                                        disabled={isLocked}
                                        value={UserData.currentEmpStatus !== 'PENDING' && remarks.trim() === '' ? "No review remark mentioned." : remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder={
                                            userData.reviewRemarks ||
                                            "Add your remarks here..."
                                        }
                                        rows={3}
                                        className="w-full bg-transparent text-sm text-slate-700 resize-none focus:outline-none disabled:bg-transparent disabled:cursor-not-allowed placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-1">

                        {/* Reject */}
                        <button
                            disabled={isLocked}
                            onClick={() => {
                                handleLeaveReject();
                                onClose();
                            }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={14} />
                            Reject
                        </button>

                        {/* Approve */}
                        <button
                            disabled={isLocked}
                            onClick={() => {
                                handleLeaveApprove();
                                onClose();
                            }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-green-700 to-emerald-500 text-white hover:opacity-90 shadow-lg shadow-green-200 transition-all disabled:opacity-50 enabled:cursor-pointer disabled:cursor-not-allowed"
                        >
                            <CircleCheckBig size={14} />
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}