import React, { useState, useRef, useContext, useEffect, useMemo } from 'react';
import { Printer, X, AlertTriangle, Loader2, Settings2 } from 'lucide-react';
import { UserContext } from '../../ContextAPI/UserContext.jsx'; // TODO: confirm this path matches your project structure

// Same default logo Sidebar.jsx falls back to when a school has no logo of
// its own — keeps the fee receipt visually consistent with the rest of the
// app instead of ever showing bare text initials.
// TODO: confirm this relative path depth matches this file's actual folder
// location (Sidebar.jsx uses '../assets/Images/dpis.jpg' one level up).
import dpis from '../../assets/Images/dpis.jpg';

// TODO: confirm this import path matches where getSchoolById actually lives
// in your project (per your Schools.js file, likely something like
// '../../Api/SchoolConfiguration/Schools').
import { getSchoolById } from '../../Api/SchoolConfiguration/schoolconfig.js';

// TODO: confirm this matches wherever getDefaultPrintTemplate actually
// lives — same module PrintTemplatesPage.jsx imports it from.
import { getDefaultPrintTemplate } from '../../Api/PrintTemplate/PrintTemplatesApi';

// Same cache PrintTemplatesPage.jsx keeps warm every time an admin opens
// the Fee Receipt Templates screen — lets this print screen render
// instantly (no spinner) on repeat visits, and still work if the network
// call below fails.
import { getCachedDefaultTemplate, cacheDefaultTemplate } from '../../utils/TemplateStorage/templateCache';

// TODO: confirm this path matches where Templateengine.js actually lives
// in your project (same module used by the Report Card print screen).
import { renderTemplate, buildFeeReceiptMergeData } from '../../utils/TemplateStorage/Templateengine';

const TEMPLATE_TYPE = 'FEE_RECEIPT';

// Same localStorage read Sidebar.jsx does — the logged-in school's info
// (including logoUrl) is persisted there on login/school-switch, so it's
// available synchronously before the getSchoolById API call even resolves.
const readStoredSchool = () => {
    try { return JSON.parse(localStorage.getItem('school')) || null; }
    catch { return null; }
};

// Shown only until the real school record loads (or if it fails to load,
// so the receipt still renders instead of breaking). schoolLogo defaults
// to the same dpis placeholder Sidebar.jsx uses, so there's always a real
// image to show — never bare initials.
const FALLBACK_SCHOOL = {
    schoolName: 'School',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolLogo: dpis,
};

// ─── Main Component ───────────────────────────────────────────────────────────
// Renders whatever HTML template is currently set as the default FEE_RECEIPT
// template on the Fee Receipt Templates screen, merged with this receipt's
// live data — so the exact same "theme" an admin picks there is what shows
// up here AND what actually gets printed. No branding/colors/labels are
// hardcoded in this component anymore; all of that lives in the template.
export default function FeeReceiptPrint({ receipt, onClose, onManageTemplates }) {
    const { schoolId, schoolInfo } = useContext(UserContext);

    // ── School info (unchanged from before — identity fields are never
    // hardcoded or user-editable here, always sourced from the school
    // profile) ──────────────────────────────────────────────────────────
    const storedSchool = readStoredSchool();
    const [school, setSchool] = useState({
        ...FALLBACK_SCHOOL,
        schoolName: schoolInfo?.schoolName || storedSchool?.schoolName || FALLBACK_SCHOOL.schoolName,
        // Priority: live UserContext (freshest) → localStorage snapshot
        // (same one Sidebar.jsx reads, available before context hydrates)
        // → dpis placeholder. Never blank, so the receipt never falls back
        // to plain text initials.
        schoolLogo: schoolInfo?.logoUrl || storedSchool?.logoUrl || FALLBACK_SCHOOL.schoolLogo,
        logoFallback: dpis,
    });
    const [schoolLoading, setSchoolLoading] = useState(true);

    useEffect(() => {
        if (!schoolId) { setSchoolLoading(false); return; }
        let cancelled = false;
        (async () => {
            setSchoolLoading(true);
            try {
                const res = await getSchoolById(schoolId);
                const data = res?.data || res;
                if (!cancelled && data) {
                    // TODO: confirm these field names against the actual
                    // getSchoolById response shape and adjust the right-hand
                    // side keys if they differ (e.g. contactNumber vs phone).
                    setSchool({
                        schoolName: data.name || data.schoolName || schoolInfo?.schoolName || storedSchool?.schoolName || FALLBACK_SCHOOL.schoolName,
                        schoolAddress: data.address || data.schoolAddress || '',
                        schoolPhone: data.phone || data.contactNumber || data.mobileNumber || data.mobile || data.contactPhone || data.schoolPhone || '',
                        schoolEmail: data.email || data.contactEmail || data.officialEmail || data.schoolEmail || '',
                        schoolLogo: data.logoUrl || schoolInfo?.logoUrl || storedSchool?.logoUrl || FALLBACK_SCHOOL.schoolLogo,
                        logoFallback: dpis,
                    });
                }
            } catch {
                // Keep whatever we already have (context-seeded values) — a
                // failed lookup shouldn't block printing a receipt.
            } finally {
                if (!cancelled) setSchoolLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [schoolId, schoolInfo]);

    // ── Default FEE_RECEIPT template — cache-first, then refresh from the
    // API in the background so a stale cached template never blocks
    // printing, but also never stays stale for long ──────────────────────
    const [template, setTemplate] = useState(() => getCachedDefaultTemplate(TEMPLATE_TYPE));
    const [templateLoading, setTemplateLoading] = useState(!getCachedDefaultTemplate(TEMPLATE_TYPE));
    const [templateError, setTemplateError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getDefaultPrintTemplate(TEMPLATE_TYPE);
                if (cancelled) return;
                if (data) {
                    setTemplate(data);
                    cacheDefaultTemplate(TEMPLATE_TYPE, data);
                } else if (!getCachedDefaultTemplate(TEMPLATE_TYPE)) {
                    // No default set anywhere (neither API nor cache).
                    setTemplateError(true);
                }
            } catch {
                // Network/API failure — fall back silently to whatever's
                // already cached (set in useState initializer above). Only
                // surface an error if there's truly nothing to show.
                if (!cancelled && !getCachedDefaultTemplate(TEMPLATE_TYPE)) {
                    setTemplateError(true);
                }
            } finally {
                if (!cancelled) setTemplateLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // ── Merge data + rendered HTML ───────────────────────────────────────
    const mergeData = useMemo(() => buildFeeReceiptMergeData(receipt || {}, school), [receipt, school]);

    const renderedHtml = useMemo(() => {
        if (!template?.templateHtml) return '';
        return renderTemplate(template.templateHtml, mergeData);
    }, [template, mergeData]);

    const printRef = useRef(null);

    const handlePrint = () => {
        if (!renderedHtml) return;
        const win = window.open('', '_blank');
        // The template already contains a complete <!DOCTYPE html> document
        // with both copies laid out side by side, so it's written as-is —
        // no extra wrapping grid needed here (unlike the old hardcoded
        // version, since the "theme" now fully owns its own print layout).
        win.document.write(renderedHtml);
        win.document.close();
        setTimeout(() => { win.print(); }, 400);
    };

    const isLoading = templateLoading || schoolLoading;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col overflow-hidden backdrop-blur-sm">
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <h2 className="text-[14px] font-extrabold text-gray-900">Fee Receipt Preview</h2>
                    <p className="text-[11px] text-gray-400">
                        {template ? `Using default template · Office copy + Student/Parent copy` : 'No default template set'}
                    </p>
                </div>
                {onManageTemplates && (
                    <button
                        onClick={onManageTemplates}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                        <Settings2 size={13} /> Manage Templates
                    </button>
                )}
                <button
                    onClick={handlePrint}
                    disabled={isLoading || !renderedHtml}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-[12px] font-bold hover:bg-emerald-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Printer size={13} /> Print Both Copies
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                    <X size={15} />
                </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-200 p-6">
                <div className="max-w-5xl mx-auto">
                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-lg h-[520px] flex items-center justify-center text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : templateError || !template ? (
                        <div className="bg-white rounded-xl shadow-lg h-[420px] flex flex-col items-center justify-center text-center px-8 gap-3">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                            <div className="text-sm font-bold text-gray-800">No default Fee Receipt template set</div>
                            <p className="text-[12.5px] text-gray-500 max-w-sm">
                                Set a default template on the Fee Receipt Templates screen before printing receipts.
                            </p>
                            {onManageTemplates && (
                                <button
                                    onClick={onManageTemplates}
                                    className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-[12.5px] font-semibold hover:bg-emerald-800 transition"
                                >
                                    <Settings2 size={13} /> Go to Templates
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <iframe
                                ref={printRef}
                                title="fee-receipt-preview"
                                srcDoc={renderedHtml}
                                sandbox=""
                                className="w-full border-0"
                                style={{ height: '80vh', minHeight: 560 }}
                            />
                        </div>
                    )}
                    <p className="text-center text-[11px] text-gray-500 mt-3">↑ Live preview · Click "Print Both Copies" to print</p>
                </div>
            </div>
        </div>
    );
}