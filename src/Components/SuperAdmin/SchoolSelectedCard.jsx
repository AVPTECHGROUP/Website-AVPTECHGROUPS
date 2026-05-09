import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, X, Loader2 } from "lucide-react";
import { switchSchool } from "../../Api/Schools";
import { getCurrentAcademicYear } from "../../Api/AcademicYear";
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
            const result = await switchSchool(school.id);
            saveToken(result.token);
            saveSchool({
                schoolId: school.id,
                schoolName: school.name,
                schoolCode: school.code,
                logoUrl: school.logoUrl || null,
            });

            // ✅ Fetch & store academic year after school switch
            try {
                const { academicYear } = await getCurrentAcademicYear();
                saveCurrentAcademicYear(academicYear); // saves { id, label, ... } to context + localStorage
            } catch (ayErr) {
                console.warn("Could not fetch academic year:", ayErr);
                // Non-fatal — don't block navigation
            }

            navigate("/dashboard", { replace: true });

            // Extra safety — clear forward/back entries to /superAdmin
            window.history.pushState(null, "", "/dashboard");
            window.addEventListener("popstate", () => {
                window.history.pushState(null, "", "/dashboard");
            });

        } catch (err) {
            setError(err.message || "Failed to switch school. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center text-center border border-gray-100">

                {/* Close */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
                >
                    <X size={16} />
                </button>

                {/* Green Check Icon */}
                <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200">
                    <CheckCircle size={28} className="text-white" strokeWidth={2.5} />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">School Selected!</h2>

                {/* School Name */}
                <p className="text-base font-semibold text-blue-600 mb-1">
                    {school?.name || "School Name"}
                </p>

                {/* Subtitle */}
                <p className="text-sm text-gray-500 mb-6">
                    Workspace successfully updated.
                </p>

                {/* Checklist */}
                <div className="w-full bg-gray-50 text-center rounded-xl px-5 py-4 space-y-2.5 mb-6 border border-gray-100">
                    <div className="flex items-center justify-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center shrink-0">
                            <CheckCircle size={16} className="text-white" strokeWidth={3} />
                        </div>
                        <p className="text-lg font-medium">Access validated</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4 w-full text-left">
                        {error}
                    </p>
                )}

                {/* CTA */}
                <button
                    onClick={handleEnterDashboard}
                    disabled={loading}
                    className="w-full flex items-center cursor-pointer justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-md shadow-blue-100 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading
                        ? <><Loader2 size={14} className="animate-spin" /> Switching School...</>
                        : <><span>Enter Dashboard</span> <ArrowRight size={14} /></>
                    }
                </button>

            </div>
        </div>
    );
}