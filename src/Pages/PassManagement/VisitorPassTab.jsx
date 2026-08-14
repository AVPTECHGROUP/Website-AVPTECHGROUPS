import React, { useState } from 'react';
import { Search, Plus, Eye, Printer, X, Check, UserCheck, Shield, Clock } from 'lucide-react';

const AVATAR_COLORS = ['#0F6E6E', '#C9781F', '#6A4FC9', '#C6433E', '#1F8A55', '#0F2A2E'];

const getInitials = (name) => name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : 'VP';
const getColorForId = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

export default function VisitorPassTab({
    visitors,
    setVisitors,
    searchQuery,
    setSearchQuery,
    onPreview,
    onPrint,
    showToast
}) {
    const [visitorFormOpen, setVisitorFormOpen] = useState(false);
    const [visitorConfirmOpen, setVisitorConfirmOpen] = useState(false);
    const [pendingVisitor, setPendingVisitor] = useState(null);

    const [visitorForm, setVisitorForm] = useState({
        name: '',
        mobile: '',
        idType: 'Driving Licence',
        idNum: '',
        purpose: 'Meet Teacher',
        personMeet: '',
        meetType: 'student',
        classSec: '',
        dept: '',
        date: new Date().toISOString().split('T')[0],
        entry: '10:00',
        exit: '11:00',
        vehicle: '',
        remarks: '',
    });

    const filteredVisitors = visitors.filter((v) => {
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return v.name.toLowerCase().includes(q) || v.mobile.includes(q);
        }
        return true;
    });

    const handleVisitorSubmit = (e) => {
        e.preventDefault();
        if (!visitorForm.name || !visitorForm.mobile) {
            showToast('Visitor name and mobile number are required.', true);
            return;
        }

        const newV = {
            id: visitors.length + 1,
            name: visitorForm.name,
            mobile: visitorForm.mobile,
            idType: visitorForm.idType,
            idNum: visitorForm.idNum || '—',
            purpose: visitorForm.purpose,
            personMeet: visitorForm.personMeet || '—',
            meetType: visitorForm.meetType === 'student' ? 'Student' : 'Employee',
            classSecOrDept: visitorForm.meetType === 'student' ? (visitorForm.classSec || '—') : (visitorForm.dept || '—'),
            date: visitorForm.date || new Date().toISOString().split('T')[0],
            entry: visitorForm.entry || '—',
            exit: visitorForm.exit || '—',
            vehicle: visitorForm.vehicle || '—',
            remarks: visitorForm.remarks || '—',
        };

        setVisitors([newV, ...visitors]);
        setPendingVisitor(newV);
        setVisitorFormOpen(false);
        setVisitorConfirmOpen(true);
    };

    return (
        <>
            {/* ── FILTER & ACTION BAR ── */}
            <div className="bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2.5 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200 shrink-0 w-full shadow-xs">
                <div className="w-full flex-1 min-w-0 flex items-center gap-2 border border-slate-200 rounded-lg bg-slate-100 px-3 py-2 focus-within:ring-2 focus-within:ring-[#6A4FC9]/30 transition-all">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search visitor name or mobile..."
                        className="text-xs focus:outline-none text-slate-700 w-full bg-transparent placeholder:text-slate-400 font-medium"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="w-4 h-4 rounded-full bg-slate-300 hover:bg-slate-400 flex items-center justify-center shrink-0 text-slate-600 text-xs font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                    <span className="px-3 py-2 rounded-lg bg-[#FBF3DA] text-[#8A6B0F] font-bold text-xs whitespace-nowrap">
                        {visitors.length} Visitors
                    </span>

                    <button
                        onClick={() => setVisitorFormOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C9A227] hover:bg-[#b4901f] text-[#0B2126] font-bold text-xs transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 shrink-0" />
                        New Visitor
                    </button>
                </div>
            </div>

            {/* ── MOBILE, TABLET & MINI LAPTOP CARDS VIEW (<1024px) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden overflow-y-auto pb-2 flex-1">
                {filteredVisitors.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                        No visitors logged yet.
                    </div>
                ) : (
                    filteredVisitors.map((v) => (
                        <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: getColorForId(v.id + 2) }}
                                >
                                    {getInitials(v.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-900 text-xs truncate">{v.name}</p>
                                    <p className="text-[10.5px] font-mono text-slate-400 truncate">{v.mobile} · {v.idType}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-violet-50 text-[#6A4FC9] font-bold text-[10px] shrink-0">
                                    {v.purpose}
                                </span>
                            </div>

                            <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-[11px]">Meeting:</span>
                                    <span className="font-medium truncate max-w-[180px] text-right">{v.personMeet} ({v.meetType})</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-[11px]">Dept / Sec:</span>
                                    <span className="font-medium text-slate-800">{v.classSecOrDept}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-[11px]">Entry Time:</span>
                                    <span className="font-mono text-slate-700">{v.date} · {v.entry}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                <button
                                    onClick={() => onPreview(v, 'visitor')}
                                    className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Eye className="w-3.5 h-3.5 text-[#6A4FC9]" /> View
                                </button>
                                <button
                                    onClick={() => onPrint(v, 'visitor')}
                                    className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-600" /> Print
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── DESKTOP TABLE VIEW (≥1024px) ── */}
            <div className="hidden lg:flex lg:flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden min-h-0">
                <div className="flex-1 overflow-auto">
                    <table className="w-full table-fixed text-xs">
                        <colgroup>
                            <col style={{ width: '22%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '10%' }} />
                        </colgroup>
                        <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-3 py-2.5 text-left">Visitor</th>
                                <th className="px-3 py-2.5 text-left">Mobile</th>
                                <th className="px-3 py-2.5 text-left">Purpose</th>
                                <th className="px-3 py-2.5 text-left">Meeting</th>
                                <th className="px-3 py-2.5 text-left">Date / Entry</th>
                                <th className="px-3 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {filteredVisitors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">No visitors logged yet.</td>
                                </tr>
                            ) : (
                                filteredVisitors.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: getColorForId(v.id + 2) }}
                                                >
                                                    {getInitials(v.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate leading-snug">{v.name}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{v.idType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 font-mono">{v.mobile}</td>
                                        <td className="px-3 py-2">
                                            <span className="px-2 py-0.5 rounded-full bg-violet-50 text-[#6A4FC9] font-bold text-[10.5px]">
                                                {v.purpose}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 truncate">{v.personMeet} <span className="text-[10px] text-slate-400">({v.meetType})</span></td>
                                        <td className="px-3 py-2 whitespace-nowrap">{v.date} <span className="text-[10px] text-slate-400">· {v.entry}</span></td>
                                        <td className="px-3 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => onPreview(v, 'visitor')}
                                                    className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Eye className="w-3 h-3 text-[#6A4FC9]" /> View
                                                </button>
                                                <button
                                                    onClick={() => onPrint(v, 'visitor')}
                                                    className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Printer className="w-3 h-3 text-slate-600" /> Print
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── MODAL: NEW VISITOR FORM ── */}
            {visitorFormOpen && (
                <div className="fixed inset-0 z-50 bg-[#0B2126]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] my-auto shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                        {/* Modal Header */}
                        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base">New Visitor Entry</h3>
                                <p className="text-[10.5px] text-slate-400">Log entry details to issue a visitor gate pass</p>
                            </div>
                            <button
                                onClick={() => setVisitorFormOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleVisitorSubmit} className="p-3.5 sm:p-5 overflow-y-auto space-y-4 text-xs">
                            {/* Visitor Info */}
                            <div className="space-y-2.5">
                                <div className="font-bold text-blue-600 uppercase tracking-wider text-[10.5px] border-b border-dashed border-slate-200 pb-1 flex items-center gap-1">
                                    <UserCheck className="w-3.5 h-3.5" /> Visitor Information
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Visitor Name <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={visitorForm.name}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                                            placeholder="e.g. Mahesh Kumar"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="tel"
                                            value={visitorForm.mobile}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, mobile: e.target.value })}
                                            placeholder="10-digit mobile"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">ID Proof Type</label>
                                        <select
                                            value={visitorForm.idType}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, idType: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer text-xs"
                                        >
                                            <option>Driving Licence</option>
                                            <option>Voter ID</option>
                                            <option>PAN Card</option>
                                            <option>Passport</option>
                                            <option>Aadhaar Card</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">ID Proof Number</label>
                                        <input
                                            type="text"
                                            value={visitorForm.idNum}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, idNum: e.target.value })}
                                            placeholder="ID document number"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Visit Details */}
                            <div className="space-y-2.5">
                                <div className="font-bold text-blue-600 uppercase tracking-wider text-[10.5px] border-b border-dashed border-slate-200 pb-1 flex items-center gap-1">
                                    <Shield className="w-3.5 h-3.5" /> Visit Details
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                                        <select
                                            value={visitorForm.purpose}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer text-xs"
                                        >
                                            <option>Meet Teacher</option>
                                            <option>Meet Student</option>
                                            <option>Admission Enquiry</option>
                                            <option>Fee Related</option>
                                            <option>Vendor / Delivery</option>
                                            <option>Official Meeting</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Person to Meet</label>
                                        <input
                                            type="text"
                                            value={visitorForm.personMeet}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, personMeet: e.target.value })}
                                            placeholder="Name of staff / teacher"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                        />
                                    </div>

                                    {/* Meeting Type Radio Buttons */}
                                    <div className="sm:col-span-2 flex flex-wrap items-center gap-3 py-1 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                        <span className="font-semibold text-slate-700 text-xs">Meeting with:</span>
                                        <label className="inline-flex items-center gap-1.5 font-medium cursor-pointer text-xs">
                                            <input
                                                type="radio"
                                                name="meetType"
                                                value="student"
                                                checked={visitorForm.meetType === 'student'}
                                                onChange={() => setVisitorForm({ ...visitorForm, meetType: 'student' })}
                                                className="text-blue-600"
                                            /> Student
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 font-medium cursor-pointer text-xs">
                                            <input
                                                type="radio"
                                                name="meetType"
                                                value="employee"
                                                checked={visitorForm.meetType === 'employee'}
                                                onChange={() => setVisitorForm({ ...visitorForm, meetType: 'employee' })}
                                                className="text-blue-600"
                                            /> Employee / Staff
                                        </label>
                                    </div>

                                    {visitorForm.meetType === 'student' ? (
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Class / Section</label>
                                            <input
                                                type="text"
                                                value={visitorForm.classSec}
                                                onChange={(e) => setVisitorForm({ ...visitorForm, classSec: e.target.value })}
                                                placeholder="e.g. Class 10 - A"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Department</label>
                                            <input
                                                type="text"
                                                value={visitorForm.dept}
                                                onChange={(e) => setVisitorForm({ ...visitorForm, dept: e.target.value })}
                                                placeholder="e.g. Accounts / Admin"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Vehicle Number</label>
                                        <input
                                            type="text"
                                            value={visitorForm.vehicle}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, vehicle: e.target.value })}
                                            placeholder="e.g. UP32 AB 1234"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="space-y-2.5">
                                <div className="font-bold text-blue-600 uppercase tracking-wider text-[10.5px] border-b border-dashed border-slate-200 pb-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> Date & Time
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={visitorForm.date}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, date: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Entry Time</label>
                                        <input
                                            type="time"
                                            value={visitorForm.entry}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, entry: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Expected Exit</label>
                                        <input
                                            type="time"
                                            value={visitorForm.exit}
                                            onChange={(e) => setVisitorForm({ ...visitorForm, exit: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Remarks / Items Carried</label>
                                <textarea
                                    rows="2"
                                    value={visitorForm.remarks}
                                    onChange={(e) => setVisitorForm({ ...visitorForm, remarks: e.target.value })}
                                    placeholder="e.g. Carrying document bag, laptop"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
                                />
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setVisitorFormOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#C9A227] hover:bg-[#b4901f] text-[#0B2126] font-bold shadow-2xs cursor-pointer text-xs"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: VISITOR CONFIRMATION ── */}
            {visitorConfirmOpen && pendingVisitor && (
                <div className="fixed inset-0 z-50 bg-[#0B2126]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center space-y-3 shadow-2xl border border-slate-200 my-auto">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shrink-0">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Visitor Added</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {pendingVisitor.name} has been saved. View or print pass using the default template?
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 pt-1">
                            <button
                                onClick={() => {
                                    setVisitorConfirmOpen(false);
                                    showToast(`${pendingVisitor.name} added.`);
                                    setPendingVisitor(null);
                                }}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => {
                                    setVisitorConfirmOpen(false);
                                    onPreview(pendingVisitor, 'visitor');
                                }}
                                className="px-3.5 py-1.5 rounded-xl border border-blue-600 text-blue-600 font-bold text-xs hover:bg-blue-50 cursor-pointer"
                            >
                                View Details
                            </button>
                            <button
                                onClick={() => {
                                    onPrint(pendingVisitor, 'visitor');
                                    setVisitorConfirmOpen(false);
                                    showToast(`Visitor pass printed for ${pendingVisitor.name}`);
                                    setPendingVisitor(null);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#b4901f] font-bold text-xs text-[#0B2126] inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print Pass
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}