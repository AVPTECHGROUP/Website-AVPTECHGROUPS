import { useState, useEffect } from "react";
import {
    UserCheck, GraduationCap, Bus, BookOpen,
    Award, CalendarOff, Clock, CreditCard,
    CheckCircle, Save, Loader2, AlertCircle, Sliders
} from "lucide-react";
import { updateSchoolFeatures } from "../../Api/SchoolConfiguration/schoolconfig";
import { toast } from "react-toastify";

const DEFAULT_FEATURES = {
    staffAttendanceEnabled: true,
    studentAttendanceEnabled: true,
    transportEnabled: true,
    homeworkEnabled: true,
    examEnabled: true,
    leaveEnabled: true,
    timetableEnabled: true,
    payrollEnabled: true,
};

const FEATURE_CONFIGS = [
    {
        key: "staffAttendanceEnabled",
        title: "Staff Attendance",
        description: "Enable attendance tracking and face recognition for staff members.",
        icon: UserCheck,
        color: "bg-blue-100 text-blue-600",
    },
    {
        key: "studentAttendanceEnabled",
        title: "Student Attendance",
        description: "Enable attendance tracking, manual review, and reporting for students.",
        icon: GraduationCap,
        color: "bg-emerald-100 text-emerald-600",
    },
    {
        key: "transportEnabled",
        title: "Transport Management",
        description: "Enable vehicle tracking, route allocations, stops, and transport billing.",
        icon: Bus,
        color: "bg-amber-100 text-amber-600",
    },
    {
        key: "homeworkEnabled",
        title: "Homework & Assignments",
        description: "Enable teachers to publish homework and track student submissions.",
        icon: BookOpen,
        color: "bg-purple-100 text-purple-600",
    },
    {
        key: "examEnabled",
        title: "Examination & Report Cards",
        description: "Enable exam creation, mark entry, grade configurations, and report cards.",
        icon: Award,
        color: "bg-rose-100 text-rose-600",
    },
    {
        key: "leaveEnabled",
        title: "Leave Management",
        description: "Enable staff and student leave requests, approvals, and balances.",
        icon: CalendarOff,
        color: "bg-indigo-100 text-indigo-600",
    },
    {
        key: "timetableEnabled",
        title: "Timetable & Schedules",
        description: "Enable period slots, automated filling, and teacher substitution planning.",
        icon: Clock,
        color: "bg-teal-100 text-teal-600",
    },
    {
        key: "payrollEnabled",
        title: "Payroll & Salary",
        description: "Enable salary structures, allowances, deductions, and staff payroll generation.",
        icon: CreditCard,
        color: "bg-cyan-100 text-cyan-600",
    },
];

function SaveButton({ saveState, onClick, disabled = false }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || saveState === "saving"}
            className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
        ${saveState === "saved" ? "bg-emerald-600 text-white" :
                    saveState === "saving" ? "bg-blue-400 text-white cursor-wait" :
                        saveState === "error" ? "bg-red-500 text-white" :
                            disabled ? "bg-slate-200 text-slate-400 cursor-not-allowed" :
                                "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
            {saveState === "saved" ? <><CheckCircle className="w-4 h-4" /><span>Saved!</span></> :
                saveState === "saving" ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></> :
                    saveState === "error" ? <><AlertCircle className="w-4 h-4" /><span>Failed</span></> :
                        <><Save className="w-4 h-4" /><span>Save Feature Settings</span></>}
        </button>
    );
}

export default function FeaturesTab({ schoolId, initialFeatures, schoolName, onFeaturesUpdated }) {
    const [features, setFeatures] = useState(initialFeatures || DEFAULT_FEATURES);
    const [saveState, setSaveState] = useState("idle");

    useEffect(() => {
        if (initialFeatures) {
            setFeatures({ ...DEFAULT_FEATURES, ...initialFeatures });
        }
    }, [initialFeatures]);

    const handleToggle = (key) => {
        setFeatures(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSaveFeatures = async () => {
        if (!schoolId) return;
        setSaveState("saving");

        try {
            const res = await updateSchoolFeatures(schoolId, features);

            const updatedFeatures = res?.data?.features || features;
            setFeatures(updatedFeatures);

            const currentSchool = JSON.parse(localStorage.getItem("school") || "{}");
            localStorage.setItem("school", JSON.stringify({
                ...currentSchool,
                features: updatedFeatures
            }));
            window.dispatchEvent(new Event("storage"));

            if (onFeaturesUpdated) {
                onFeaturesUpdated(updatedFeatures);
            }

            toast.success(res?.message || "School features updated successfully!");
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2500);
        } catch (err) {
            console.error("Features save error:", err);
            toast.error(err.message || "Failed to update school features.");
            setSaveState("error");
            setTimeout(() => setSaveState("idle"), 3000);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <Sliders className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Enabled System Modules</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Toggle features on or off to control accessible modules for this school instance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Feature Toggles Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FEATURE_CONFIGS.map((item) => {
                        const Icon = item.icon;
                        const isEnabled = !!features[item.key];

                        return (
                            <div
                                key={item.key}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isEnabled
                                    ? "border-blue-200 bg-blue-50/30"
                                    : "border-slate-200 bg-slate-50/50 opacity-75"
                                    }`}
                            >
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{item.title}</p>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isEnabled
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-slate-200 text-slate-600"
                                                }`}
                                        >
                                            {isEnabled ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                                </div>

                                <button
                                    onClick={() => handleToggle(item.key)}
                                    role="switch"
                                    aria-checked={isEnabled}
                                    className="cursor-pointer shrink-0 relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    style={{
                                        width: 44,
                                        height: 24,
                                        backgroundColor: isEnabled ? "#2563eb" : "#cbd5e1",
                                        transition: "background-color 200ms ease",
                                    }}
                                >
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: 2,
                                            left: 2,
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            backgroundColor: "white",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                                            transform: isEnabled ? "translateX(20px)" : "translateX(0px)",
                                            transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
                                            display: "block",
                                        }}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="px-5 py-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400 hidden sm:block truncate">
                        {schoolName ? `Editing Features for: ${schoolName}` : "School Module Settings"}
                    </p>
                    <div className="ml-auto">
                        <SaveButton saveState={saveState} onClick={handleSaveFeatures} />
                    </div>
                </div>
            </div>
        </div>
    );
}