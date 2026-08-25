import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, ArrowLeft, Plus, X, Eye, Pencil, Power, PowerOff,
    School, MapPin, Phone, Mail, Globe, Sun, Moon, ServerCrash,
    ChevronLeft, ChevronRight, Loader2, ShieldAlert, Building2,
    CheckCircle2
} from "lucide-react";
import {
    getSchools, createSchool, updateSchool, getSchoolById,
    activateSchool, deactivateSchool,
} from "../../Api/SchoolConfiguration/Schools";
import dpis from "../../assets/Images/SS_logo_3.png";
import { UserContext } from "../../ContextAPI/UserContext";

/* ════════════════════════════════════════════
    Helpers & Configuration
════════════════════════════════════════════ */
const boardBadge = (board) => {
    const map = {
        CBSE: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        ICSE: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        "STATE BOARD": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    };
    return map[(board || "").toUpperCase()] ?? "bg-white/5 text-slate-400 border border-white/10";
};

const EMPTY_FORM = {
    name: "", code: "", address: "", city: "", state: "", pincode: "",
    phone: "", email: "", website: "", principalName: "", affiliationNumber: "",
    board: "", establishedYear: "", status: "ACTIVE", logoUrl: "",
};

const FORM_FIELDS = [
    { key: "name", label: "School Name", required: true, placeholder: "e.g. St. Xavier's High School", span: 2 },
    { key: "code", label: "School Code", required: true, placeholder: "e.g. SCH1024" },
    { key: "board", label: "Board", type: "select", required: true, options: ["CBSE", "ICSE", "STATE BOARD"] },
    { key: "affiliationNumber", label: "Affiliation Number", required: true, placeholder: "e.g. CBSE/AFF/2026/01" },
    { key: "phone", label: "Phone Number", type: "tel", required: true, maxLength: 10, placeholder: "10-digit number (starts with 6-9)" },
    { key: "email", label: "Email", type: "email", placeholder: "e.g. contact@school.edu" },
    { key: "principalName", label: "Principal Name", placeholder: "e.g. Dr. Arthur Pendelton" },
    { key: "establishedYear", label: "Established Year", type: "number", placeholder: "e.g. 1995" },
    { key: "address", label: "Address", placeholder: "e.g. 123 Knowledge Park Avenue", span: 2 },
    { key: "city", label: "City", placeholder: "e.g. Mumbai" },
    { key: "state", label: "State", placeholder: "e.g. Maharashtra" },
    { key: "pincode", label: "Pincode", type: "text", maxLength: 6, placeholder: "e.g. 400001" },
    { key: "website", label: "Website", placeholder: "e.g. https://schoolspine.edu" },
    { key: "status", label: "Status", type: "select", options: ["ACTIVE", "INACTIVE"] },
    { key: "logoUrl", label: "Logo URL", placeholder: "e.g. https://example.com/logo.png", span: 2 },
];

/* ════════════════════════════════════════════
    Toast Notification Component
════════════════════════════════════════════ */
const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 z-[150] flex items-center gap-3 bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-emerald-400 hover:text-white transition-colors cursor-pointer"
            >
                <X size={14} />
            </button>
        </div>
    );
};

/* ════════════════════════════════════════════
    Add / Edit School Modal
════════════════════════════════════════════ */
const SchoolFormModal = ({ editSchool, onClose, onSaved }) => {
    const isEdit = !!editSchool;
    const [form, setForm] = useState(() =>
        isEdit
            ? {
                ...EMPTY_FORM, ...Object.fromEntries(
                    Object.keys(EMPTY_FORM).map((k) => [k, editSchool[k] ?? ""])
                )
            }
            : EMPTY_FORM
    );
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState(null);

    const handleChange = (key, value) => {
        if (key === "phone") {
            const digits = value.replace(/\D/g, "").slice(0, 10);
            setForm((f) => ({ ...f, phone: digits }));
            return;
        }
        if (key === "pincode") {
            const digits = value.replace(/\D/g, "").slice(0, 6);
            setForm((f) => ({ ...f, pincode: digits }));
            return;
        }
        setForm((f) => ({ ...f, [key]: value }));
    };

    const validateForm = () => {
        if (!form.name.trim()) {
            return "School Name is required.";
        }
        if (!form.code.trim()) {
            return "School Code is required.";
        }
        if (!form.board || !form.board.trim()) {
            return "Board selection is required.";
        }
        if (!form.affiliationNumber || !form.affiliationNumber.trim()) {
            return "Affiliation Number is required.";
        }
        // Phone number validation: Must start with 6, 7, 8, or 9 and be exactly 10 digits
        if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone.trim())) {
            return "Phone number must be a 10-digit number starting with 6, 7, 8, or 9.";
        }
        // Email validation if provided
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            return "Please enter a valid email address.";
        }
        // Pincode validation if provided
        if (form.pincode && form.pincode.trim().length !== 6) {
            return "Pincode must be a 6-digit number.";
        }
        // Established Year validation if provided
        if (form.establishedYear) {
            const year = Number(form.establishedYear);
            const currentYear = new Date().getFullYear();
            if (isNaN(year) || year < 1800 || year > currentYear) {
                return `Established Year must be between 1800 and ${currentYear}.`;
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setErr(validationError);
            return;
        }

        setSaving(true);
        setErr(null);
        try {
            const payload = {
                ...form,
                establishedYear: form.establishedYear ? Number(form.establishedYear) : 0,
            };
            const res = isEdit
                ? await updateSchool(editSchool.id, payload)
                : await createSchool(payload);
            onSaved(isEdit ? "Changed successfully" : "Added successfully");
        } catch (e2) {
            setErr(e2.message || "Something went wrong while saving.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-theme-card border border-theme-border rounded-2xl shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-theme-border bg-theme-card/95 backdrop-blur-md rounded-t-2xl">
                    <h2 className="text-base sm:text-lg font-extrabold text-theme-text flex items-center gap-2">
                        <Building2 size={18} className="text-[#00C9B1]" />
                        {isEdit ? "Edit School" : "Add New School"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-theme-subtext hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {err && (
                        <div className="flex items-center gap-2 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl px-4 py-3 text-xs">
                            <ServerCrash size={14} className="shrink-0" />
                            {err}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {FORM_FIELDS.map((f) => (
                            <div key={f.key} className={f.span === 2 ? "sm:col-span-2" : ""}>
                                <label className="block text-xs font-semibold text-theme-subtext mb-1.5">
                                    {f.label} {f.required && <span className="text-red-400">*</span>}
                                </label>
                                {f.type === "select" ? (
                                    <select
                                        value={form[f.key]}
                                        onChange={(e) => handleChange(f.key, e.target.value)}
                                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-sm text-theme-text focus:outline-none focus:border-[#00C9B1]/60 focus:ring-2 focus:ring-[#00C9B1]/20 transition-all duration-200 cursor-pointer"
                                    >
                                        <option value="">Select {f.label}</option>
                                        {f.options.map((opt) => (
                                            <option key={opt} value={opt} className="bg-theme-bg text-theme-text">
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={f.type || "text"}
                                        value={form[f.key]}
                                        onChange={(e) => handleChange(f.key, e.target.value)}
                                        placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                                        maxLength={f.maxLength}
                                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-sm text-theme-text placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#00C9B1]/60 focus:ring-2 focus:ring-[#00C9B1]/20 transition-all duration-200"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-theme-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-theme-subtext hover:text-theme-text hover:bg-theme-border/30 transition-all duration-200 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C9B1] to-[#F5A623] hover:from-[#00E5D4] hover:to-[#FFD166] text-[#05111D] font-bold text-xs disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all duration-200 shadow-md shadow-cyan-900/35"
                        >
                            {saving && <Loader2 size={14} className="animate-spin" />}
                            {isEdit ? "Save Changes" : "Create School"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════
    View School Modal
════════════════════════════════════════════ */
const ViewSchoolModal = ({ schoolId, onClose }) => {
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await getSchoolById(schoolId);
                if (alive) setSchool(res?.data || res);
            } catch (e) {
                if (alive) setErr(e.message || "Failed to load school details");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [schoolId]);

    const rows = school
        ? [
            ["Code", school.code],
            ["Board", school.board],
            ["Affiliation No.", school.affiliationNumber],
            ["Phone", school.phone],
            ["Email", school.email],
            ["Principal", school.principalName],
            ["Established", school.establishedYear],
            ["Address", school.address],
            ["City", school.city],
            ["State", school.state],
            ["Pincode", school.pincode],
            ["Website", school.website],
            ["Status", school.status],
        ].filter(([, v]) => v !== undefined && v !== null && v !== "")
        : [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-theme-card border border-theme-border rounded-2xl shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-theme-border bg-theme-card/95 backdrop-blur-md rounded-t-2xl">
                    <h2 className="text-base sm:text-lg font-extrabold text-theme-text flex items-center gap-2">
                        <Eye size={18} className="text-[#00C9B1]" />
                        School Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-theme-subtext hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-14">
                            <Loader2 size={24} className="animate-spin text-[#00C9B1]" />
                        </div>
                    ) : err ? (
                        <div className="flex items-center gap-2 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl px-4 py-3 text-xs">
                            <ServerCrash size={14} className="shrink-0" />
                            {err}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-theme-border">
                                <img
                                    src={school.logoUrl || dpis}
                                    alt={school.name}
                                    onError={(e) => { e.currentTarget.src = dpis; }}
                                    className="w-14 h-14 object-contain p-1 bg-white border border-theme-border rounded-xl shrink-0"
                                />
                                <div className="min-w-0">
                                    <h3 className="font-extrabold text-sm sm:text-base text-theme-text truncate">{school.name}</h3>
                                    <span className={`inline-flex mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${school.isActive ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25" : "text-red-400 bg-red-500/10 border border-red-500/25"}`}>
                                        {school.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                                {rows.map(([label, value]) => (
                                    <div key={label} className="min-w-0">
                                        <dt className="text-theme-subtext font-semibold mb-0.5">{label}</dt>
                                        <dd className="text-theme-text truncate">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════
    Pagination
════════════════════════════════════════════ */
const PaginationButtons = ({ page, totalPages, setPage }) => {
    const getVisiblePages = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
        const pages = new Set([0, totalPages - 1, page]);
        if (page > 0) pages.add(page - 1);
        if (page < totalPages - 1) pages.add(page + 1);
        return Array.from(pages).sort((a, b) => a - b);
    };
    const visiblePages = getVisiblePages();

    return (
        <div className="flex items-center justify-center gap-1.5 flex-wrap pb-2 px-2">
            <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 hover:text-[#00C9B1] hover:border-[#00C9B1]/30 hover:bg-[#00C9B1]/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronLeft size={13} /> <span className="hidden xs:inline">Prev</span>
            </button>
            {visiblePages.map((p, idx) => {
                const prev = visiblePages[idx - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                    <span key={p} className="flex items-center gap-1.5">
                        {showEllipsis && <span className="text-xs text-slate-400 px-1">…</span>}
                        <button
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${p === page
                                ? "bg-[#00C9B1] text-[#05111D]"
                                : "bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:border-[#00C9B1]/30 hover:text-[#00C9B1] hover:bg-[#00C9B1]/10"
                                }`}
                        >
                            {p + 1}
                        </button>
                    </span>
                );
            })}
            <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 hover:text-[#00C9B1] hover:border-[#00C9B1]/30 hover:bg-[#00C9B1]/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <span className="hidden xs:inline">Next</span> <ChevronRight size={13} />
            </button>
            <span className="w-full text-center sm:w-auto sm:text-left text-xs text-slate-400 sm:ml-2 mt-1 sm:mt-0">
                Page {page + 1} of {totalPages}
            </span>
        </div>
    );
};

/* ════════════════════════════════════════════
    Main Component
════════════════════════════════════════════ */
export default function ManageSchools() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(UserContext);

    const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem("user")) || null; }
        catch { return null; }
    })();
    const userRole =
        storedUser?.userType ||
        (Array.isArray(storedUser?.roles) ? storedUser.roles[0] : null) ||
        null;

    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [boardFilter, setBoardFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 10;
    const debounceRef = useRef(null);

    const [showForm, setShowForm] = useState(false);
    const [editSchool, setEditSchool] = useState(null);
    const [viewSchoolId, setViewSchoolId] = useState(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [searchInput]);

    useEffect(() => { setPage(0); }, [boardFilter, statusFilter]);

    const fetchSchools = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const isActive =
                statusFilter === "ACTIVE" ? true :
                    statusFilter === "INACTIVE" ? false :
                        undefined;
            const res = await getSchools(page, PAGE_SIZE, search, isActive, boardFilter);
            if (res?.success && res?.data) {
                const { content = [], totalElements: te = 0, totalPages: tp = 1 } = res.data;
                setSchools(content);
                setTotalElements(te);
                setTotalPages(tp || 1);
            } else {
                setSchools([]);
            }
        } catch (err) {
            setError(err.message || "Failed to load schools");
            setSchools([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, boardFilter, statusFilter]);

    useEffect(() => { fetchSchools(); }, [fetchSchools]);

    if (userRole !== "GLOBAL_ADMIN") {
        return (
            <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col items-center justify-center gap-4 px-4">
                <ShieldAlert size={40} className="text-red-400" />
                <p className="font-bold text-sm sm:text-base">You don't have access to this page.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 rounded-xl bg-theme-card border border-theme-border text-xs font-semibold hover:bg-theme-border/30 transition-colors cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const handleToggleActive = async (school) => {
        setTogglingId(school.id);
        try {
            if (school.isActive) await deactivateSchool(school.id);
            else await activateSchool(school.id);
            setSchools((prev) =>
                prev.map((s) => (s.id === school.id ? { ...s, isActive: !s.isActive } : s))
            );
            setToastMessage(`School ${school.isActive ? "deactivated" : "activated"} successfully`);
        } catch (e) {
            setError(e.message || "Failed to update school status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleSaved = (message) => {
        setShowForm(false);
        setEditSchool(null);
        setToastMessage(message);
        fetchSchools();
    };

    return (
        <div className="min-h-screen bg-theme-bg text-theme-text font-sans relative overflow-hidden transition-colors duration-300">
            {toastMessage && (
                <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
            )}

            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.22] blur-[120px]"
                style={{ background: 'radial-gradient(circle, #00C9B1, transparent 70%)' }} />
            <div className="pointer-events-none absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.18] blur-[120px]"
                style={{ background: 'radial-gradient(circle, #F5A623, transparent 70%)' }} />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-theme-nav/80 border-b border-theme-border shadow-lg transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl border border-theme-border bg-theme-card text-theme-text hover:bg-theme-border/25 transition-all duration-200 cursor-pointer shrink-0"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={15} />
                        </button>
                        <img src={dpis} alt="School Logo" className="w-8 h-8 object-cover shadow rounded shrink-0 border border-theme-border" />
                        <span className="font-extrabold text-theme-text md:text-lg tracking-wide truncate">SchoolSpine</span>
                        <span className="hidden md:inline text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border whitespace-nowrap bg-gradient-to-r from-[#00C9B1]/20 to-[#F5A623]/10 text-[#00C9B1] border-[#00C9B1]/30">
                            GLOBAL ADMIN
                        </span>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl border border-theme-border bg-theme-card text-theme-text hover:bg-theme-border/25 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={13} className="text-[#F5A623]" /> : <Moon size={13} className="text-[#00C9B1]" />}
                    </button>
                </div>
            </nav>

            <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-5 sm:space-y-6">

                {/* Header */}
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-theme-text tracking-tight">Manage Schools</h1>
                        <p className="text-xs sm:text-sm text-theme-subtext mt-1">
                            Create, update and manage every school across the platform.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditSchool(null); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00C9B1] to-[#F5A623] hover:from-[#00E5D4] hover:to-[#FFD166] text-[#05111D] font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all duration-200 shadow-md shadow-cyan-900/35 shrink-0"
                    >
                        <Plus size={15} />
                        Add School
                    </button>
                </div>

                {/* Search + Filters */}
                <div className="bg-theme-card border border-theme-border backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="relative flex-1 min-w-0">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-subtext" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by name, code or city..."
                            className="w-full bg-theme-card border border-theme-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-theme-text placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#00C9B1]/60 focus:bg-theme-bg focus:ring-2 focus:ring-[#00C9B1]/20 transition-all duration-200"
                        />
                    </div>
                    <select
                        value={boardFilter}
                        onChange={(e) => setBoardFilter(e.target.value)}
                        className="bg-theme-card border border-theme-border rounded-xl px-3 py-2.5 text-sm text-theme-text focus:outline-none focus:border-[#00C9B1]/60 focus:bg-theme-bg focus:ring-2 focus:ring-[#00C9B1]/20 transition-all duration-200 cursor-pointer"
                    >
                        <option value="" className="bg-theme-bg text-theme-text">All Boards</option>
                        <option value="CBSE" className="bg-theme-bg text-theme-text">CBSE</option>
                        <option value="ICSE" className="bg-theme-bg text-theme-text">ICSE</option>
                        <option value="STATE BOARD" className="bg-theme-bg text-theme-text">State Board</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-theme-card border border-theme-border rounded-xl px-3 py-2.5 text-sm text-theme-text focus:outline-none focus:border-[#00C9B1]/60 focus:bg-theme-bg focus:ring-2 focus:ring-[#00C9B1]/20 transition-all duration-200 cursor-pointer"
                    >
                        <option value="" className="bg-theme-bg text-theme-text">All</option>
                        <option value="ACTIVE" className="bg-theme-bg text-theme-text">Active only</option>
                        <option value="INACTIVE" className="bg-theme-bg text-theme-text">Inactive only</option>
                    </select>
                    <span className="text-xs text-slate-400 whitespace-nowrap font-semibold text-center sm:text-left">
                        {loading ? "Loading…" : `${totalElements} school${totalElements !== 1 ? "s" : ""}`}
                    </span>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-2xl px-4 sm:px-5 py-4 text-sm">
                        <ServerCrash size={18} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold">Something went wrong</p>
                            <p className="text-xs text-red-500 mt-0.5 break-words">{error}</p>
                        </div>
                        <button
                            onClick={fetchSchools}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors whitespace-nowrap cursor-pointer text-red-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Schools Table */}
                <div className="bg-theme-card border border-theme-border rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[820px]">
                            <thead>
                                <tr className="border-b border-theme-border text-left text-xs text-theme-subtext font-semibold uppercase tracking-wide">
                                    <th className="px-4 py-3">School</th>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3">Board</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Contact</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="border-b border-theme-border/60 animate-pulse">
                                            <td className="px-4 py-3" colSpan={7}>
                                                <div className="h-4 bg-white/[0.05] rounded w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : schools.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-14">
                                            <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                                                <School size={30} className="text-slate-600" />
                                                <p className="font-semibold text-slate-400 text-sm">No schools found</p>
                                                <p className="text-xs text-center">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    schools.map((school) => (
                                        <tr key={school.id} className="border-b border-theme-border/60 hover:bg-theme-border/10 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <img
                                                        src={school.logoUrl || dpis}
                                                        alt={school.name}
                                                        onError={(e) => { e.currentTarget.src = dpis; }}
                                                        className="w-8 h-8 object-contain p-0.5 bg-white border border-theme-border rounded-lg shrink-0"
                                                    />
                                                    <span className="font-semibold text-theme-text truncate max-w-[180px]">{school.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] text-theme-subtext font-mono bg-theme-bg border border-theme-border px-2 py-0.5 rounded">
                                                    {school.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {school.board ? (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${boardBadge(school.board)}`}>
                                                        {school.board}
                                                    </span>
                                                ) : <span className="text-theme-subtext text-xs">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-xs text-theme-subtext min-w-0">
                                                    <MapPin size={12} className="text-[#00C9B1] shrink-0" />
                                                    <span className="truncate max-w-[140px]">
                                                        {[school.city, school.state].filter(Boolean).join(", ") || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-theme-subtext space-y-0.5">
                                                    {school.phone && <div className="flex items-center gap-1.5"><Phone size={11} className="text-[#00C9B1] shrink-0" />{school.phone}</div>}
                                                    {school.email && <div className="flex items-center gap-1.5 truncate max-w-[160px]"><Mail size={11} className="text-[#00C9B1] shrink-0" />{school.email}</div>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`flex items-center gap-1.5 w-fit text-[10px] font-bold px-2.5 py-1 rounded-full border ${school.isActive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" : "text-red-400 bg-red-500/10 border-red-500/25"}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${school.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
                                                    {school.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setViewSchoolId(school.id)}
                                                        title="View"
                                                        className="p-2 rounded-lg text-theme-subtext hover:text-[#00C9B1] hover:bg-[#00C9B1]/10 transition-colors cursor-pointer"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditSchool(school); setShowForm(true); }}
                                                        title="Edit"
                                                        className="p-2 rounded-lg text-theme-subtext hover:text-[#F5A623] hover:bg-[#F5A623]/10 transition-colors cursor-pointer"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(school)}
                                                        disabled={togglingId === school.id}
                                                        title={school.isActive ? "Deactivate" : "Activate"}
                                                        className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${school.isActive
                                                            ? "text-emerald-400 hover:text-red-400 hover:bg-red-500/10"
                                                            : "text-red-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                            }`}
                                                    >
                                                        {togglingId === school.id
                                                            ? <Loader2 size={14} className="animate-spin" />
                                                            : school.isActive ? <Power size={14} /> : <PowerOff size={14} />}
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

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <PaginationButtons page={page} totalPages={totalPages} setPage={setPage} />
                )}
            </div>

            {/* Modals */}
            {showForm && (
                <SchoolFormModal
                    editSchool={editSchool}
                    onClose={() => { setShowForm(false); setEditSchool(null); }}
                    onSaved={handleSaved}
                />
            )}
            {viewSchoolId && (
                <ViewSchoolModal schoolId={viewSchoolId} onClose={() => setViewSchoolId(null)} />
            )}
        </div>
    );
}