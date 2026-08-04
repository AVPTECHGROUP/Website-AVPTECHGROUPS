import { useState, useEffect } from "react";
import {
    Clock, Fingerprint, Navigation, CheckCircle, Save,
    CalendarClock, Zap, Info, Wifi, WifiOff, Loader2, AlertCircle
} from "lucide-react";
import { getAttendanceConfig, updateAttendanceConfig } from "../../Api/SchoolConfiguration/schoolconfig";
import { toast } from "react-toastify";
import SCHOOL_CONFIG_CONST from "../../Constants/StringConstants/SchoolConfigConstants";

const EMPTY_ATTENDANCE = {
    workStartTime: "",
    gracePeriodMinutes: "",
    faceConfidenceThreshold: "",
    schoolLatitude: null,
    schoolLongitude: null,
    allowedRadiusMeters: 0,
    gpsCheckEnabled: false,
    saturdayWorking: false,
    sundayWorking: false,
};

function validateAttendance(data) {
    const errors = {};
    if (!data.workStartTime) errors.workStartTime = SCHOOL_CONFIG_CONST.ERR_START_TIME_REQUIRED;
    if (data.gracePeriodMinutes < 0 || data.gracePeriodMinutes > 120)
        errors.gracePeriodMinutes = SCHOOL_CONFIG_CONST.ERR_GRACE_PERIOD_RANGE;
    if (data.faceConfidenceThreshold < 0 || data.faceConfidenceThreshold > 100)
        errors.faceConfidenceThreshold = SCHOOL_CONFIG_CONST.ERR_THRESHOLD_RANGE;
    if (data.gpsCheckEnabled) {
        if (data.schoolLatitude === null || data.schoolLatitude === "")
            errors.schoolLatitude = SCHOOL_CONFIG_CONST.ERR_LATITUDE_REQUIRED;
        else if (isNaN(data.schoolLatitude) || data.schoolLatitude < -90 || data.schoolLatitude > 90)
            errors.schoolLatitude = SCHOOL_CONFIG_CONST.ERR_LATITUDE_RANGE;
        if (data.schoolLongitude === null || data.schoolLongitude === "")
            errors.schoolLongitude = SCHOOL_CONFIG_CONST.ERR_LONGITUDE_REQUIRED;
        else if (isNaN(data.schoolLongitude) || data.schoolLongitude < -180 || data.schoolLongitude > 180)
            errors.schoolLongitude = SCHOOL_CONFIG_CONST.ERR_LONGITUDE_RANGE;
    }
    return errors;
}

function FieldError({ error }) {
    if (!error) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
    );
}

function FieldHint({ hint }) {
    if (!hint) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <Info className="w-3 h-3 shrink-0" />{hint}
        </p>
    );
}

function Label({ children, required, icon }) {
    return (
        <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            {icon && <span className="text-slate-400">{icon}</span>}
            {children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

function TextInput({ value, onChange, disabled, type = "text", placeholder, hasError }) {
    return (
        <input
            type={type}
            value={value ?? ""}
            disabled={disabled}
            placeholder={placeholder}
            onChange={e => onChange?.(e.target.value)}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent
        ${disabled
                    ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                    : hasError
                        ? "bg-red-50 border-red-300 text-slate-800 focus:ring-red-400"
                        : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 focus:ring-blue-500"
                }`}
        />
    );
}

function SaveButton({ saveState, onClick, label = "Save Changes", disabled = false }) {
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
                        <><Save className="w-4 h-4" /><span>{label}</span></>}
        </button>
    );
}

export default function AttendanceTab({ schoolId, schoolName }) {
    const [attendanceData, setAttData] = useState(EMPTY_ATTENDANCE);
    const [attErrors, setAttErrors] = useState({});
    const [attSaveState, setAttSaveState] = useState("idle");
    const [attLoading, setAttLoading] = useState(false);
    const [attFetchError, setAttFetchError] = useState(null);

    useEffect(() => {
        if (!schoolId) return;

        const loadAttendance = async () => {
            try {
                setAttLoading(true);
                setAttFetchError(null);

                const res = await getAttendanceConfig(schoolId);
                const ac = res?.data;

                if (ac) {
                    setAttData({
                        workStartTime: ac.workStartTime || "",
                        gracePeriodMinutes: ac.gracePeriodMinutes ?? "",
                        faceConfidenceThreshold: ac.faceConfidenceThreshold ?? "",
                        schoolLatitude: ac.schoolLatitude ?? null,
                        schoolLongitude: ac.schoolLongitude ?? null,
                        allowedRadiusMeters: ac.allowedRadiusMeters ?? 0,
                        gpsCheckEnabled: ac.gpsCheckEnabled ?? false,
                        saturdayWorking: ac.saturdayWorking ?? false,
                        sundayWorking: ac.sundayWorking ?? false,
                    });
                    localStorage.setItem("attendanceConfig", JSON.stringify({
                        schoolLatitude: ac.schoolLatitude,
                        schoolLongitude: ac.schoolLongitude,
                    }));
                } else {
                    setAttData(EMPTY_ATTENDANCE);
                }
            } catch (err) {
                console.error("Attendance config fetch error:", err);
                const errText = err?.message || "";
                const isNotFound =
                    err?.response?.status === 404 ||
                    err?.status === 404 ||
                    errText.toLowerCase().includes("not found") ||
                    errText.toLowerCase().includes("use put to create one");

                if (isNotFound) {
                    setAttData(EMPTY_ATTENDANCE);
                    setAttFetchError(null);
                } else {
                    setAttFetchError(errText || "Failed to load attendance config.");
                    setAttData(EMPTY_ATTENDANCE);
                }
            } finally {
                setAttLoading(false);
            }
        };
        loadAttendance();
    }, [schoolId]);

    const handleAttendanceChange = (k, v) => {
        setAttData(p => ({ ...p, [k]: v }));
        if (attErrors[k]) setAttErrors(prev => ({ ...prev, [k]: undefined }));
    };

    const handleSaveAttendance = async () => {
        if (!schoolId) return;
        const errors = validateAttendance(attendanceData);
        if (Object.keys(errors).length > 0) { setAttErrors(errors); return; }
        setAttErrors({});
        setAttSaveState("saving");
        try {
            const payload = {
                workStartTime: attendanceData.workStartTime,
                gracePeriodMinutes: attendanceData.gracePeriodMinutes,
                faceConfidenceThreshold: attendanceData.faceConfidenceThreshold,
                gpsCheckEnabled: attendanceData.gpsCheckEnabled,
                schoolLatitude: attendanceData.gpsCheckEnabled ? attendanceData.schoolLatitude : null,
                schoolLongitude: attendanceData.gpsCheckEnabled ? attendanceData.schoolLongitude : null,
                allowedRadiusMeters: attendanceData.gpsCheckEnabled ? attendanceData.allowedRadiusMeters : 0,
                saturdayWorking: attendanceData.saturdayWorking ?? false,
                sundayWorking: attendanceData.sundayWorking ?? false,
            };
            await updateAttendanceConfig(schoolId, payload);

            try {
                const fresh = await getAttendanceConfig(schoolId);
                const ac = fresh?.data;
                if (ac) {
                    setAttData({
                        workStartTime: ac.workStartTime || "",
                        gracePeriodMinutes: ac.gracePeriodMinutes ?? "",
                        faceConfidenceThreshold: ac.faceConfidenceThreshold ?? "",
                        schoolLatitude: ac.schoolLatitude ?? null,
                        schoolLongitude: ac.schoolLongitude ?? null,
                        allowedRadiusMeters: ac.allowedRadiusMeters ?? 0,
                        gpsCheckEnabled: ac.gpsCheckEnabled ?? false,
                        saturdayWorking: ac.saturdayWorking ?? false,
                        sundayWorking: ac.sundayWorking ?? false,
                    });
                }
            } catch (_) { /* silent */ }

            setAttSaveState("saved");
            setTimeout(() => setAttSaveState("idle"), 2500);
        } catch (err) {
            console.error("Attendance save error:", err);
            setAttSaveState("error");
            setTimeout(() => setAttSaveState("idle"), 3000);
        }
    };

    if (attLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3.5 border-b bg-slate-50">
                            <div className="h-3 bg-slate-200 rounded w-36" />
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-4">
                            {[1, 2].map(j => (
                                <div key={j} className="space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-24" />
                                    <div className="h-10 bg-slate-100 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (attFetchError) {
        return (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{SCHOOL_CONFIG_CONST.ERR_LOAD_CONFIG}</p>
                    <p className="text-xs text-slate-500 mt-1">{attFetchError}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="shrink-0 text-xs font-semibold text-blue-600 hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Time Window */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                    <Clock className="w-4 h-4 text-red-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Time Window</h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label icon={<Clock className="w-3.5 h-3.5" />}>Start Time</Label>
                        <input
                            type="time"
                            value={attendanceData.workStartTime}
                            onChange={e => handleAttendanceChange("workStartTime", e.target.value)}
                            className={`cursor-pointer w-full border rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition hover:border-slate-300
                ${attErrors.workStartTime ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                        />
                        <FieldError error={attErrors.workStartTime} />
                        {!attErrors.workStartTime && <FieldHint hint="24-hour HH:mm" />}
                    </div>

                    <div>
                        <Label icon={<Zap className="w-3.5 h-3.5" />}>Grace Period</Label>
                        <div className="flex items-center gap-2">
                            <TextInput
                                type="number"
                                value={attendanceData.gracePeriodMinutes}
                                onChange={v => handleAttendanceChange("gracePeriodMinutes", Math.min(120, Math.max(0, parseInt(v) || 0)))}
                                hasError={!!attErrors.gracePeriodMinutes}
                            />
                            <div className="shrink-0 w-12 h-10 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                                <span className="text-sm font-extrabold text-blue-600 leading-none">{attendanceData.gracePeriodMinutes || 0}</span>
                                <span className="text-xs text-blue-400 leading-none">min</span>
                            </div>
                        </div>
                        <FieldError error={attErrors.gracePeriodMinutes} />
                        {!attErrors.gracePeriodMinutes && <FieldHint hint="0–120 minutes" />}
                    </div>
                </div>
            </div>

            {/* Working Days */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                    <CalendarClock className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Working Days</h3>
                </div>
                <div className="p-5 space-y-3">
                    {/* Saturday */}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${attendanceData.saturdayWorking ? "bg-amber-100" : "bg-slate-200"}`}>
                            <CalendarClock className={`w-4 h-4 ${attendanceData.saturdayWorking ? "text-amber-600" : "text-slate-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm">Saturday Working</p>
                            <p className="text-xs text-slate-500 mt-0.5">{SCHOOL_CONFIG_CONST.SATURDAY_WORKING_REMARK}</p>
                        </div>
                        <button
                            onClick={() => handleAttendanceChange("saturdayWorking", !attendanceData.saturdayWorking)}
                            role="switch"
                            aria-checked={attendanceData.saturdayWorking}
                            className="cursor-pointer shrink-0 relative rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            style={{
                                width: 44, height: 24,
                                backgroundColor: attendanceData.saturdayWorking ? "#d97706" : "#cbd5e1",
                                transition: "background-color 200ms ease",
                            }}
                        >
                            <span style={{
                                position: "absolute", top: 2, left: 2, width: 20, height: 20,
                                borderRadius: "50%", backgroundColor: "white",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                                transform: attendanceData.saturdayWorking ? "translateX(20px)" : "translateX(0px)",
                                transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)", display: "block",
                            }} />
                        </button>
                    </div>

                    {/* Sunday */}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${attendanceData.sundayWorking ? "bg-rose-100" : "bg-slate-200"}`}>
                            <CalendarClock className={`w-4 h-4 ${attendanceData.sundayWorking ? "text-rose-600" : "text-slate-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm">Sunday Working</p>
                            <p className="text-xs text-slate-500 mt-0.5">{SCHOOL_CONFIG_CONST.SUNDAY_WORKING_REMARK}</p>
                        </div>
                        <button
                            onClick={() => handleAttendanceChange("sundayWorking", !attendanceData.sundayWorking)}
                            role="switch"
                            aria-checked={attendanceData.sundayWorking}
                            className="cursor-pointer shrink-0 relative rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                            style={{
                                width: 44, height: 24,
                                backgroundColor: attendanceData.sundayWorking ? "#e11d48" : "#cbd5e1",
                                transition: "background-color 200ms ease",
                            }}
                        >
                            <span style={{
                                position: "absolute", top: 2, left: 2, width: 20, height: 20,
                                borderRadius: "50%", backgroundColor: "white",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                                transform: attendanceData.sundayWorking ? "translateX(20px)" : "translateX(0px)",
                                transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)", display: "block",
                            }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Face Recognition */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                    <Fingerprint className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Face Recognition</h3>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <Label icon={<Fingerprint className="w-3.5 h-3.5" />}>Face Confidence Threshold (%)</Label>
                        <TextInput
                            type="number"
                            value={attendanceData.faceConfidenceThreshold}
                            onChange={v => handleAttendanceChange("faceConfidenceThreshold", Math.min(100, Math.max(0, parseInt(v) || 0)))}
                            hasError={!!attErrors.faceConfidenceThreshold}
                        />
                        <FieldError error={attErrors.faceConfidenceThreshold} />
                        {!attErrors.faceConfidenceThreshold && <FieldHint hint="Recommended: 70–85%" />}
                    </div>

                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>0%</span>
                            <span className="text-emerald-600 font-semibold">70–85% optimal</span>
                            <span>100%</span>
                        </div>
                        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                                style={{
                                    width: `${attendanceData.faceConfidenceThreshold || 0}%`,
                                    background:
                                        attendanceData.faceConfidenceThreshold >= 70 && attendanceData.faceConfidenceThreshold <= 85
                                            ? "#10b981"
                                            : attendanceData.faceConfidenceThreshold < 70
                                                ? "#f59e0b"
                                                : "#ef4444",
                                }}
                            />
                            <div className="absolute inset-y-0 bg-emerald-300/30 border-x-2 border-emerald-400/60" style={{ left: "70%", width: "15%" }} />
                        </div>
                        <p
                            className="text-xs mt-2 font-semibold"
                            style={{
                                color:
                                    attendanceData.faceConfidenceThreshold >= 70 && attendanceData.faceConfidenceThreshold <= 85
                                        ? "#10b981"
                                        : attendanceData.faceConfidenceThreshold < 70
                                            ? "#f59e0b"
                                            : "#ef4444",
                            }}
                        >
                            {attendanceData.faceConfidenceThreshold >= 70 && attendanceData.faceConfidenceThreshold <= 85
                                ? "✓ Optimal range"
                                : attendanceData.faceConfidenceThreshold < 70
                                    ? "⚠ Below recommended"
                                    : "⚠ Above recommended"}
                        </p>
                    </div>
                </div>
            </div>

            {/* GPS Geo-Fence */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                    <Navigation className="w-4 h-4 text-violet-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">GPS Geo-Fence</h3>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${attendanceData.gpsCheckEnabled ? "bg-blue-100" : "bg-slate-200"}`}>
                            {attendanceData.gpsCheckEnabled
                                ? <Wifi className="w-4 h-4 text-blue-600" />
                                : <WifiOff className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm">Enable GPS Check</p>
                            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                                {SCHOOL_CONFIG_CONST.ATTENDANCE_RADIUS_REMARK}
                            </p>
                        </div>
                        <button
                            onClick={() => handleAttendanceChange("gpsCheckEnabled", !attendanceData.gpsCheckEnabled)}
                            role="switch"
                            aria-checked={attendanceData.gpsCheckEnabled}
                            className="cursor-pointer shrink-0 relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            style={{
                                width: 44, height: 24,
                                backgroundColor: attendanceData.gpsCheckEnabled ? "#2563eb" : "#cbd5e1",
                                transition: "background-color 200ms ease",
                            }}
                        >
                            <span style={{
                                position: "absolute", top: 2, left: 2, width: 20, height: 20,
                                borderRadius: "50%", backgroundColor: "white",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                                transform: attendanceData.gpsCheckEnabled ? "translateX(20px)" : "translateX(0px)",
                                transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)", display: "block",
                            }} />
                        </button>
                    </div>

                    {attendanceData.gpsCheckEnabled && (
                        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/40 space-y-3">
                            <div className="flex items-center gap-2">
                                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <p className="text-xs text-blue-600 font-medium">{SCHOOL_CONFIG_CONST.DEFINE_ZONE_ATTENDANCE_CORD}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label>Latitude</Label>
                                    <TextInput
                                        type="number"
                                        value={attendanceData.schoolLatitude ?? ""}
                                        onChange={() => { }}
                                        placeholder="28.61"
                                        hasError={!!attErrors.schoolLatitude}
                                        disabled={true}
                                    />
                                    <FieldError error={attErrors.schoolLatitude} />
                                </div>
                                <div>
                                    <Label>Longitude</Label>
                                    <TextInput
                                        type="number"
                                        value={attendanceData.schoolLongitude ?? ""}
                                        onChange={() => { }}
                                        placeholder="77.20"
                                        hasError={!!attErrors.schoolLongitude}
                                        disabled={true}
                                    />
                                    <FieldError error={attErrors.schoolLongitude} />
                                </div>
                                <div>
                                    <Label>Radius (m)</Label>
                                    <TextInput
                                        type="number"
                                        value={attendanceData.allowedRadiusMeters}
                                        onChange={v => handleAttendanceChange("allowedRadiusMeters", parseInt(v) || 0)}
                                        placeholder="200"
                                        hasError={!!attErrors.allowedRadiusMeters}
                                    />
                                    <FieldError error={attErrors.allowedRadiusMeters} />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (!navigator.geolocation) {
                                        toast.error("Geolocation is not supported by your browser.");
                                        return;
                                    }
                                    toast.info("Fetching your location…");
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => {
                                            handleAttendanceChange("schoolLatitude", parseFloat(pos.coords.latitude.toFixed(6)));
                                            handleAttendanceChange("schoolLongitude", parseFloat(pos.coords.longitude.toFixed(6)));
                                            if (!attendanceData.allowedRadiusMeters || attendanceData.allowedRadiusMeters === 0) {
                                                handleAttendanceChange("allowedRadiusMeters", 200);
                                            }
                                            toast.success("Location captured successfully!");
                                        },
                                        (err) => {
                                            const messages = {
                                                1: "Location permission denied. Please allow access in browser settings.",
                                                2: "Location unavailable. Try again.",
                                                3: "Location request timed out. Try again.",
                                            };
                                            toast.error(messages[err.code] || "Failed to get location.");
                                        },
                                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                                    );
                                }}
                                className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm mt-1"
                            >
                                <Navigation className="w-4 h-4" />
                                Capture Current Location
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="px-5 py-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400 hidden sm:block truncate">
                        {schoolName ? `Editing Attendance Config for: ${schoolName}` : "Attendance Configuration"}
                    </p>
                    <div className="ml-auto">
                        <SaveButton
                            saveState={attLoading ? "saving" : attFetchError ? "error" : attSaveState}
                            onClick={handleSaveAttendance}
                            disabled={attLoading || !!attFetchError}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}