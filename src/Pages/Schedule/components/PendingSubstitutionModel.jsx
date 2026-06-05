import { useState, useEffect } from 'react';
import { X, ArrowLeftRight, Clock } from 'lucide-react';
import {
    getSubstitutions,
    updateSubstitutionStatus,
} from '../../../Api/ScheduleApi';

export default function PendingSubstitutionsModal({ timetableId, onClose }) {
    const [substitutions, setSubstitutions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (timetableId) loadSubstitutions();
    }, [timetableId]);

    const loadSubstitutions = async () => {
        try {
            setLoading(true);
            const data = await getSubstitutions(timetableId);
            setSubstitutions(data || []);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (subId, status) => {
        try {
            await updateSubstitutionStatus(timetableId, subId, status);
            await loadSubstitutions();
        } catch {
            // silent
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-amber-500" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Pending Substitutions
                        </h2>
                        {substitutions.length > 0 && (
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                {substitutions.length}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* List */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                            Loading substitutions…
                        </div>
                    ) : substitutions.length === 0 ? (
                        <div className="text-center py-14 text-gray-400 text-sm">
                            <ArrowLeftRight size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="font-medium text-gray-500">No substitutions yet</p>
                            <p className="text-xs mt-1 text-gray-400">Arranged substitutions will appear here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {substitutions.map(sub => (
                                <div key={sub.id} className="px-5 py-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {sub.originalTeacherName}
                                                <span className="mx-1.5 text-gray-400">→</span>
                                                {sub.substituteTeacherName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {sub.substituteDate}
                                                {sub.dayOfWeek ? ` · ${sub.dayOfWeek}` : ''}
                                                {sub.periodNumber ? ` · P${sub.periodNumber}` : ''}
                                                {sub.reason ? ` · ${sub.reason}` : ''}
                                            </p>
                                            {sub.notes && (
                                                <p className="text-xs text-gray-400 mt-0.5 italic truncate">
                                                    "{sub.notes}"
                                                </p>
                                            )}
                                            <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-semibold
                                                ${sub.status === 'CONFIRMED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : sub.status === 'CANCELLED'
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-amber-100 text-amber-700'}`}>
                                                {sub.status || 'PENDING'}
                                            </span>
                                        </div>

                                        {/* Action buttons — only for PENDING */}
                                        {(!sub.status || sub.status === 'PENDING') && (
                                            <div className="flex gap-1 shrink-0 mt-0.5">
                                                <button
                                                    onClick={() => handleUpdateStatus(sub.id, 'CONFIRMED')}
                                                    className="px-2.5 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition font-medium">
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(sub.id, 'CANCELLED')}
                                                    className="px-2.5 py-1 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition font-medium">
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}