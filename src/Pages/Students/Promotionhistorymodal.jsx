import { useEffect, useState } from 'react';
import { X, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { getStudentPromotionHistory } from '../../Api/Academics/StudentPromotion';

const OUTCOME_BADGE = {
    PASS: 'bg-green-100 text-green-700',
    FAIL: 'bg-red-100 text-red-700',
    HELD_BACK: 'bg-amber-100 text-amber-700',
    GRADUATED: 'bg-purple-100 text-purple-700',
};

const PromotionHistoryModal = ({ student, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const data = await getStudentPromotionHistory(student.studentId);
                if (active) setHistory(data);
            } catch (err) {
                if (active) setError(err.message || 'Failed to load promotion history');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [student.studentId]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg max-h-[80vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Promotion History</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{student.studentName} · Roll {student.rollNumber}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1">
                    {loading && (
                        <div className="flex items-center justify-center py-10 text-gray-400 gap-2 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading history…
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}

                    {!loading && !error && history.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-10">No promotion history found for this student yet.</p>
                    )}

                    {!loading && !error && history.length > 0 && (
                        <ol className="relative border-l-2 border-gray-100 pl-5 space-y-4">
                            {history.map((h) => (
                                <li key={h.historyId} className="relative">
                                    <span className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-white border-2 border-blue-600" />
                                    <p className="text-[11px] font-bold text-gray-400 mb-1">
                                        {h.fromAcademicYearLabel} → {h.toAcademicYearLabel}
                                    </p>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5">
                                        <p className="text-sm font-bold text-gray-900">
                                            {h.fromClassName}{h.fromSectionName ? ` ${h.fromSectionName}` : ''}
                                            <span className="mx-1.5 text-gray-300">→</span>
                                            {h.toClassName}{h.toSectionName ? ` ${h.toSectionName}` : ''}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${OUTCOME_BADGE[h.outcome] || 'bg-gray-100 text-gray-600'}`}>
                                                {h.outcome?.replace('_', ' ')}
                                            </span>
                                            {h.remarks && <span className="text-xs text-gray-500">{h.remarks}</span>}
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {h.promotedAt ? new Date(h.promotedAt).toLocaleString() : '—'}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromotionHistoryModal;