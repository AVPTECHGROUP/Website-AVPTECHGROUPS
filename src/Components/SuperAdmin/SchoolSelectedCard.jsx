import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, X, Loader2 } from "lucide-react";
import { switchSchool } from "../../Api/SchoolConfiguration/Schools";
import { getCurrentAcademicYear } from "../../Api/AcademicYears/AcademicYear";
import { UserContext } from "../../ContextAPI/UserContext";

export default function SchoolSelectedCard({ school, onClose }) {
    const navigate = useNavigate();
    const { saveToken, saveSchool, saveCurrentAcademicYear } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleEnterDashboard = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Switch school
            const result = await switchSchool(school.id);
            saveToken(result.token);
            saveSchool({
                schoolId:  school.id,
                schoolName: school.name,
                schoolCode: school.code,
                logoUrl:   school.logoUrl || null,
            });

            // 2. Fetch current academic year
            // ─────────────────────────────────────────────────────────────────
            // getCurrentAcademicYear() calls authFetch and returns:
            //   data.data || {}
            // which is already the unwrapped object: { id, label, startDate, ... }
            //
            // API response shape:
            //   { success: true, data: { id: 3, label: "2025-26", ... } }
            //
            // getCurrentAcademicYear() does `return data.data || {}`
            // so the return value IS { id: 3, label: "2025-26", ... }
            //
            // ✅ Use the return value directly — do NOT do response?.data?.data
            // ─────────────────────────────────────────────────────────────────
            try {
                const ay = await getCurrentAcademicYear();
                // ay = { id: 3, label: "2025-26", schoolId: 1, ... }

                console.log("✅ AY fetched:", ay);

                if (ay?.id) {
                    const academicYear = {
                        id:    ay.id,
                        label: ay.label,
                    };

                    // Save to context (in-memory, available immediately)
                    saveCurrentAcademicYear(academicYear);

                    // Save to localStorage (survives page refresh)
                    localStorage.setItem(
                        "currentAcademicYear",
                        JSON.stringify(academicYear)
                    );

                    console.log("✅ Academic year saved:", academicYear);
                } else {
                    console.warn("⚠️ AY response missing id:", ay);
                }
            } catch (ayErr) {
                // Non-fatal — don't block navigation
                console.warn("⚠️ AY fetch failed:", ayErr.message);
            }

            // 3. Navigate to dashboard
            navigate("/dashboard", { replace: true });

        } catch (err) {
            setError(err.message || "Failed to switch school. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative bg-[#0A1828]/95 border border-white/[0.08] backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center text-center">

                <button onClick={onClose} disabled={loading}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 p-1 rounded-lg hover:bg-white/5 cursor-pointer">
                    <X size={16} />
                </button>

                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#00C9B1] to-[#00E5D4] flex items-center justify-center mb-5 shadow-lg shadow-emerald-950/40">
                    <CheckCircle size={28} className="text-[#05111D]" strokeWidth={2.5} />
                </div>

                <h2 className="text-xl font-black text-white mb-1">School Selected!</h2>
                <p className="text-base font-extrabold text-[#00C9B1] mb-1">{school?.name || "School Name"}</p>
                <p className="text-xs text-slate-400 mb-6">Workspace successfully updated.</p>

                <div className="w-full bg-white/[0.02] text-center rounded-xl px-5 py-4 space-y-2.5 mb-6 border border-white/[0.06]">
                    <div className="flex items-center justify-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                            <CheckCircle size={15} className="text-emerald-400" strokeWidth={3} />
                        </div>
                        <p className="text-sm font-semibold text-slate-200">Access validated</p>
                    </div>
                </div>

                {error && (
                    <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2 mb-4 w-full text-left">
                        {error}
                    </p>
                )}

                <button onClick={handleEnterDashboard} disabled={loading}
                    className="w-full flex items-center cursor-pointer justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00C9B1] to-[#F5A623] hover:from-[#00E5D4] hover:to-[#FFD166] text-[#05111D] font-extrabold text-sm transition-all duration-200 shadow-md shadow-cyan-950/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading
                        ? <><Loader2 size={14} className="animate-spin" /> Switching School...</>
                        : <><span>Enter Dashboard</span> <ArrowRight size={14} /></>
                    }
                </button>
            </div>
        </div>
    );
}