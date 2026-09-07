import { useEffect, useMemo, useState } from "react";
import { X, Printer, CheckCircle, BookOpen, Loader2 } from "lucide-react";
import { updateReportCardRemarks } from "../../Api/Academics/Exams";
import { getDefaultPrintTemplate } from "../../Api/PrintTemplate/PrintTemplatesApi";
import { EXAM_CONSTS } from "../../Constants/StringConstants/AcademicsConstants";
import { getCachedDefaultTemplate, cacheDefaultTemplate, clearCachedDefaultTemplate } from "../../utils/TemplateStorage/templateCache";
import { renderTemplate, buildReportCardMergeData } from "../../utils/TemplateStorage/Templateengine";

import { useDecodedUser } from "../../ContextAPI/UserContext";
import { getSchoolById } from "../../Api/SchoolConfiguration/Schools";
import { getStudentById } from "../../Api/Students/StudentsApi";

function getGrade(pct) {
    if (pct >= 91) return { label: "A+", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", bar: "bg-emerald-500" };
    if (pct >= 81) return { label: "A", color: "text-green-700", bg: "bg-green-50", border: "border-green-300", bar: "bg-green-500" };
    if (pct >= 71) return { label: "B+", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", bar: "bg-blue-500" };
    if (pct >= 61) return { label: "B", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", bar: "bg-blue-400" };
    if (pct >= 51) return { label: "C", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-300", bar: "bg-violet-500" };
    if (pct >= 33) return { label: "D", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300", bar: "bg-orange-500" };
    return { label: "F", color: "text-red-700", bg: "bg-red-50", border: "border-red-300", bar: "bg-red-500" };
}

export default function StudentReportCard({ student, examId, onClose, onUpdateRemarks }) {
    // Context se academic year aur schoolId le rahe hain
    const { schoolId, schoolInfo: cachedSchool, currentAcademicYear } = useDecodedUser();

    // School State (Default local storage fallback)
    const [schoolDetails, setSchoolDetails] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("school")) || null;
        } catch {
            return null;
        }
    });

    // Student Full Profile State (Photo, Father, Mother etc.)
    const [studentProfile, setStudentProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Remarks edit state
    const [editingRemarks, setEditingRemarks] = useState(false);
    const [teacherRemarks, setTeacherRemarks] = useState(student?.teacherRemarks ?? "");
    const [principalRemarks, setPrincipalRemarks] = useState(student?.principalRemarks ?? "");
    const [savingRemarks, setSavingRemarks] = useState(false);
    const [remarksError, setRemarksError] = useState(null);
    const [remarksSaved, setRemarksSaved] = useState(false);

    // Template state
    const [defaultTemplate, setDefaultTemplate] = useState(() => getCachedDefaultTemplate("REPORT_CARD"));
    const [templateLoading, setTemplateLoading] = useState(() => !getCachedDefaultTemplate("REPORT_CARD"));

    // --- 1. CALL getSchoolById ---
    useEffect(() => {
        const targetId = schoolId || cachedSchool?.id || schoolDetails?.id;
        if (!targetId) return;

        let isMounted = true;
        getSchoolById(targetId)
            .then((res) => {
                const data = res?.data || res;
                if (isMounted && data) {
                    setSchoolDetails(data);
                }
            })
            .catch((err) => {
                console.error("Failed to load school details via getSchoolById:", err);
            });

        return () => {
            isMounted = false;
        };
    }, [schoolId, cachedSchool?.id]);

    // --- 2. CALL getStudentById (Tap/Modal open hote hi) ---
    useEffect(() => {
        const studentIdentifier = student?.studentId || student?.id;
        if (!studentIdentifier) return;

        let isMounted = true;
        setProfileLoading(true);

        getStudentById(studentIdentifier)
            .then((res) => {
                const data = res?.data || res;
                if (isMounted && data) {
                    setStudentProfile(data);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch student details via getStudentById:", err);
            })
            .finally(() => {
                if (isMounted) setProfileLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [student?.studentId, student?.id]);

    // --- 3. FETCH PRINT TEMPLATE ---
    useEffect(() => {
        let cancelled = false;
        getDefaultPrintTemplate("REPORT_CARD")
            .then((data) => {
                if (cancelled) return;
                if (data) {
                    setDefaultTemplate(data);
                    cacheDefaultTemplate("REPORT_CARD", data);
                } else {
                    setDefaultTemplate(null);
                    clearCachedDefaultTemplate("REPORT_CARD");
                }
            })
            .catch(() => { })
            .finally(() => {
                if (!cancelled) setTemplateLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // School object format normalize
    const normalizedSchool = useMemo(() => {
        const effective = schoolDetails || cachedSchool || {};
        return {
            name: effective?.schoolName || effective?.name || EXAM_CONSTS?.STUDENT_REPORT?.FALLBACK_SCHOOL || "School Name",
            address: effective?.address || effective?.schoolAddress || "",
            website: effective?.website || effective?.schoolWebsite || "",
            email: effective?.email || effective?.schoolEmail || "",
            phone: effective?.phone || effective?.phoneNumber || effective?.mobile || "",
            board: effective?.board || effective?.schoolBoard || EXAM_CONSTS?.STUDENT_REPORT?.FALLBACK_BOARD || "",
            logoUrl: effective?.logoUrl || effective?.logo || effective?.schoolLogo || null,
        };
    }, [schoolDetails, cachedSchool]);

    // Academic Year String resolution from UserContext
    const academicYearStr = useMemo(() => {
        if (typeof currentAcademicYear === "string") return currentAcademicYear;
        return (
            currentAcademicYear?.name ||
            currentAcademicYear?.year ||
            currentAcademicYear?.academicYear ||
            student?.academicYear ||
            "2025-26"
        );
    }, [currentAcademicYear, student?.academicYear]);

    // Enriched student details (Student exam data + API profile data + Academic Year)
    const enrichedStudent = useMemo(() => {
        // API ke personalDetails ke andar se address nikalna
        const resolvedAddress =
            studentProfile?.personalDetails?.address ||
            studentProfile?.address ||
            studentProfile?.currentAddress ||
            studentProfile?.permanentAddress ||
            student?.address ||
            "—";

        return {
            ...student,
            profileImageUrl:
                studentProfile?.profileImageUrl ||
                studentProfile?.photo ||
                studentProfile?.avatar ||
                student?.profileImageUrl ||
                "",
            fatherName:
                studentProfile?.fatherName ||
                studentProfile?.father ||
                studentProfile?.parentName ||
                student?.fatherName ||
                student?.parentName ||
                "—",
            motherName:
                studentProfile?.motherName ||
                studentProfile?.mother ||
                student?.motherName ||
                "—",
            address: resolvedAddress,
            studentAddress: resolvedAddress, // Dono keys provide kar di
            admissionNumber:
                studentProfile?.admissionNumber ||
                studentProfile?.admissionNo ||
                student?.admissionNumber ||
                "—",
            dob:
                studentProfile?.personalDetails?.dateOfBirth ||
                studentProfile?.dob ||
                studentProfile?.dateOfBirth ||
                student?.dob ||
                "",
            academicYear: academicYearStr,
        };
    }, [student, studentProfile, academicYearStr]);

    // Template compile with all merge data
    const mergedTemplateHtml = useMemo(() => {
        if (!defaultTemplate?.templateHtml) return null;
        const data = buildReportCardMergeData(enrichedStudent, normalizedSchool, {
            teacherRemarks,
            principalRemarks,
        });
        return renderTemplate(defaultTemplate.templateHtml, data);
    }, [defaultTemplate, enrichedStudent, normalizedSchool, teacherRemarks, principalRemarks]);

    const handleSaveRemarks = async () => {
        setSavingRemarks(true);
        setRemarksError(null);
        setRemarksSaved(false);
        try {
            await updateReportCardRemarks(
                examId ?? student?.examId,
                student.studentId || student.id,
                { teacherRemarks, principalRemarks }
            );
            setRemarksSaved(true);
            setEditingRemarks(false);
            onUpdateRemarks?.(student.studentId || student.id, { teacherRemarks, principalRemarks });
        } catch (err) {
            setRemarksError(err.message ?? "Failed to save remarks.");
        } finally {
            setSavingRemarks(false);
        }
    };

    const isInitialLoading = (templateLoading && !defaultTemplate) || profileLoading;

    return (
        <>
            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 0mm !important;
                }

                @media print {
                    body * { visibility: hidden !important; }
                    .rc-print-content,
                    .rc-print-content * { visibility: visible !important; }

                    .rc-print-content {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        background: #fff !important;
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                        box-sizing: border-box !important;
                    }

                    .rc-no-print,
                    .rc-no-print * {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    .rc-scroll {
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                    }

                    tr { page-break-inside: avoid; }
                }

                .rc-custom-template { padding: 0; }
                @media print {
                    .rc-custom-template { border: none !important; padding: 0 !important; }
                }

                .rc-scroll::-webkit-scrollbar { width: 4px; }
                .rc-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 99px; }
                .rc-scroll::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 99px; }
                @keyframes rcFadeIn { from { opacity:0; transform:scale(0.96) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
                .rc-root { animation: rcFadeIn 0.22s ease-out; }
            `}</style>

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 overflow-y-auto">
                <div
                    className="rc-root bg-white w-full sm:rounded-2xl sm:shadow-2xl sm:max-w-3xl flex flex-col rounded-t-2xl"
                    style={{ maxHeight: "96vh", height: "100vh" }}
                >
                    {/* Sticky Header */}
                    <div className="rc-no-print flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 shrink-0 rounded-t-2xl bg-white z-10">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-semibold text-gray-800">
                                {EXAM_CONSTS?.STUDENT_REPORT?.TITLE || "Student Report Card"}
                            </span>
                            <span className="hidden sm:inline text-xs text-gray-400 truncate max-w-[180px]">
                                — {enrichedStudent?.studentName}
                            </span>
                            {defaultTemplate && (
                                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    {defaultTemplate.templateName}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">
                                    {EXAM_CONSTS?.STUDENT_REPORT?.BTN_PRINT || "Print"}
                                </span>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Printable Area */}
                    <div className="rc-scroll rc-print-content overflow-y-auto flex-1">
                        <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                            {isInitialLoading ? (
                                <div className="rc-no-print flex flex-col items-center justify-center gap-2 text-sm text-gray-400 py-16">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                    Loading student profile & template details…
                                </div>
                            ) : mergedTemplateHtml ? (
                                <div
                                    className="rc-custom-template rounded-xl overflow-hidden bg-white"
                                    dangerouslySetInnerHTML={{ __html: mergedTemplateHtml }}
                                />
                            ) : (
                                /* Direct fallback if no template is saved */
                                <>
                                    <div className="relative rounded-2xl border-2 border-emerald-200 p-5 text-center bg-emerald-50/50">
                                        <h1 className="text-xl font-black text-gray-900">{normalizedSchool.name}</h1>
                                        <p className="text-xs text-gray-500">{normalizedSchool.address}</p>
                                        <p className="text-xs text-gray-400">
                                            {normalizedSchool.phone && `Tel: ${normalizedSchool.phone} `}
                                            {normalizedSchool.email && `| Email: ${normalizedSchool.email} `}
                                            {normalizedSchool.website && `| Web: ${normalizedSchool.website}`}
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-xl flex items-center gap-4">
                                        {enrichedStudent.profileImageUrl ? (
                                            <img
                                                src={enrichedStudent.profileImageUrl}
                                                alt="Student"
                                                className="w-16 h-16 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                                {enrichedStudent?.studentName?.charAt(0) || "S"}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold">
                                                {enrichedStudent?.studentName} — Class: {enrichedStudent?.className} ({enrichedStudent?.sectionName})
                                            </p>
                                            <p className="text-xs text-gray-600">Father's Name: {enrichedStudent?.fatherName}</p>
                                            <p className="text-xs text-gray-600">Mother's Name: {enrichedStudent?.motherName}</p>
                                            <p className="text-xs text-gray-500">Session: {enrichedStudent?.academicYear}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Remarks Editor UI (Hidden in Print) */}
                            <div className="rc-no-print rounded-xl border border-emerald-200 overflow-hidden mt-4 bg-emerald-50/20">
                                <div className="flex items-center justify-between px-4 py-2 bg-emerald-100/50 border-b border-emerald-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-4 rounded-full bg-emerald-600" />
                                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                                            {EXAM_CONSTS?.STUDENT_REPORT?.REMARKS_TITLE || "Remarks"}
                                        </p>
                                    </div>
                                    {!editingRemarks && (
                                        <button
                                            onClick={() => {
                                                setEditingRemarks(true);
                                                setRemarksSaved(false);
                                                setRemarksError(null);
                                            }}
                                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50 transition-all"
                                        >
                                            {student?.teacherRemarks || student?.principalRemarks
                                                ? EXAM_CONSTS?.STUDENT_REPORT?.BTN_EDIT || "Edit Remarks"
                                                : EXAM_CONSTS?.STUDENT_REPORT?.BTN_ADD_REMARKS || "Add Remarks"}
                                        </button>
                                    )}
                                </div>

                                {remarksSaved && (
                                    <div className="px-4 py-2 bg-green-50 text-xs text-green-700 border-b border-green-100 flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" /> Remarks successfully updated in template!
                                    </div>
                                )}
                                {remarksError && (
                                    <div className="px-4 py-2 bg-red-50 text-xs text-red-600 border-b border-red-100">
                                        {remarksError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                                    <div className="rounded-lg border border-emerald-100 p-2.5 bg-white">
                                        <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Teacher's Remarks</p>
                                        {editingRemarks ? (
                                            <textarea
                                                value={teacherRemarks}
                                                onChange={(e) => setTeacherRemarks(e.target.value)}
                                                rows={2}
                                                placeholder="Enter teacher remarks..."
                                                className="w-full text-xs text-gray-700 border border-emerald-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                                            />
                                        ) : (
                                            <p className="text-xs text-gray-600 italic">{teacherRemarks || "No remarks added."}</p>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-emerald-100 p-2.5 bg-white">
                                        <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Principal's Remarks</p>
                                        {editingRemarks ? (
                                            <textarea
                                                value={principalRemarks}
                                                onChange={(e) => setPrincipalRemarks(e.target.value)}
                                                rows={2}
                                                placeholder="Enter principal remarks..."
                                                className="w-full text-xs text-gray-700 border border-emerald-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                                            />
                                        ) : (
                                            <p className="text-xs text-gray-600 italic">{principalRemarks || "No remarks added."}</p>
                                        )}
                                    </div>
                                </div>

                                {editingRemarks && (
                                    <div className="flex items-center justify-end gap-2 px-3 pb-3">
                                        <button
                                            onClick={() => {
                                                setTeacherRemarks(student?.teacherRemarks ?? "");
                                                setPrincipalRemarks(student?.principalRemarks ?? "");
                                                setEditingRemarks(false);
                                            }}
                                            disabled={savingRemarks}
                                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveRemarks}
                                            disabled={savingRemarks}
                                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
                                        >
                                            {savingRemarks && <Loader2 className="w-3 h-3 animate-spin" />}
                                            Save Remarks
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="rc-no-print flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-t border-gray-100 shrink-0 bg-gray-50 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Report Card
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}