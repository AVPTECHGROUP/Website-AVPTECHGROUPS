import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Bike, Users, AlertCircle, X, Printer } from 'lucide-react';

import { useClasses } from '../../ContextAPI/ClassContext';
import { getStudents, getStudentByClass, getStudentsBySection } from '../../Api/Students/StudentsApi';

// Context & Template Engine Imports
import { useDecodedUser } from '../../ContextAPI/UserContext';
import { getCachedDefaultTemplate } from '../../utils/TemplateStorage/templateCache';
import { TEMPLATE_TYPES } from '../../Components/Templates/templateTypesMeta';
import {
    renderTemplate,
    buildVisitorPassMergeData,
    buildCyclePassMergeData,
    buildGatePassMergeData,
    buildIdCardMergeData
} from '../../utils/TemplateStorage/Templateengine';
import { getDefaultPrintTemplate } from '../../Api/PrintTemplate/PrintTemplatesApi';

// Import Child Modular Tabs
import StudentIdGatePassTab from './StudentIdGatePassTab';
import CyclePassTab from './CyclePassTab';
import VisitorPassTab from './VisitorPassTab';

export default function PassManagement() {
    const { classes } = useClasses();
    const { schoolInfo } = useDecodedUser();

    // Active Tab State ('tab1' = ID/Gate Pass, 'tab2' = Cycle Pass, 'tab3' = Visitor Pass)
    const [activeTab, setActiveTab] = useState('tab1');

    // Filter States
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [selectedSectionId, setSelectedSectionId] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Data States
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Default Template HTML States for all 4 Types
    const [visitorDefaultTemplateHtml, setVisitorDefaultTemplateHtml] = useState(null);
    const [cycleDefaultTemplateHtml, setCycleDefaultTemplateHtml] = useState(null);
    const [gateDefaultTemplateHtml, setGateDefaultTemplateHtml] = useState(null);
    const [idCardDefaultTemplateHtml, setIdCardDefaultTemplateHtml] = useState(null);

    const [visitors, setVisitors] = useState([
        {
            id: 1,
            name: 'Ramesh Verma',
            mobile: '9876543210',
            idType: 'Driving Licence',
            idNum: 'DL-908234',
            purpose: 'Meet Teacher',
            personMeet: 'Sunil Sharma',
            meetType: 'Teacher',
            classSecOrDept: 'Class 10 - A',
            date: new Date().toISOString().split('T')[0],
            entry: '10:15 AM',
            exit: '11:00 AM',
            vehicle: 'UP32 AB 4321',
            remarks: 'Submitted document bag at gate',
        },
    ]);

    const [previewModal, setPreviewModal] = useState({ open: false, data: null, type: null });
    const [toast, setToast] = useState(null);

    // Fetch All Default Print Templates On Mount
    useEffect(() => {
        const fetchDefaultTemplates = async () => {
            // Helper function to load template from Cache -> API -> Fallback Stub
            const loadTemplate = async (typeKey, setSetter) => {
                const cached = getCachedDefaultTemplate(typeKey);
                if (cached?.templateHtml) {
                    setSetter(cached.templateHtml);
                    return;
                }
                try {
                    const apiData = await getDefaultPrintTemplate(typeKey);
                    setSetter(apiData?.templateHtml || TEMPLATE_TYPES[typeKey]?.stub);
                } catch {
                    setSetter(TEMPLATE_TYPES[typeKey]?.stub || '');
                }
            };

            await Promise.all([
                loadTemplate('VISITOR_PASS', setVisitorDefaultTemplateHtml),
                loadTemplate('CYCLE_STAND_PASS', setCycleDefaultTemplateHtml),
                loadTemplate('GATE_PASS', setGateDefaultTemplateHtml),
                loadTemplate('ID_CARD', setIdCardDefaultTemplateHtml),
            ]);
        };

        fetchDefaultTemplates();
    }, []);

    const showToast = (message, isWarn = false) => {
        setToast({ message, isWarn });
        setTimeout(() => setToast(null), 3600);
    };

    const availableSections = useMemo(() => {
        if (selectedClassId === 'all') return [];
        const targetClass = classes.find((c) => String(c.id) === String(selectedClassId));
        return targetClass?.sections || [];
    }, [classes, selectedClassId]);

    // Fetch Students
    useEffect(() => {
        const fetchStudentsData = async () => {
            setLoadingStudents(true);
            try {
                let responseData = [];
                if (selectedSectionId && selectedSectionId !== 'all') {
                    responseData = await getStudentsBySection(selectedSectionId);
                } else if (selectedClassId && selectedClassId !== 'all') {
                    responseData = await getStudentByClass(selectedClassId);
                } else {
                    const res = await getStudents(0, 4000);
                    responseData = Array.isArray(res) ? res : (res?.content || res?.data || []);
                }

                const rawList = Array.isArray(responseData) ? responseData : (responseData?.data || responseData?.content || []);
                const formattedList = rawList.map((st, idx) => {
                    const sId = st.id || idx + 1;
                    const fName = st.firstName || st.first_name || '';
                    const lName = st.lastName || st.last_name || '';
                    const fullName = st.fullName || (fName || lName ? `${fName} ${lName}`.trim() : `Student ${sId}`);

                    const currentClassObj = classes.find((c) => String(c.id) === String(st.classId || selectedClassId));
                    const currentSecObj = currentClassObj?.sections?.find((sec) => String(sec.id) === String(st.sectionId || selectedSectionId));

                    return {
                        id: sId,
                        name: fullName,
                        roll: st.rollNumber || st.rollNo || st.roll || `STU-${sId}`,
                        classId: st.classId || selectedClassId,
                        className: st.className || currentClassObj?.name || '—',
                        sectionId: st.sectionId || selectedSectionId,
                        sectionName: st.sectionName || currentSecObj?.name || '—',
                        father: st.fatherName || 'N/A',
                        contact: st.fatherPhone || st.motherPhone || 'N/A',
                        cycleReg: st.cycleRegNo || st.cycleReg || `CYC-${1000 + sId}`,
                        profileImageUrl: st.profileImageUrl || null,
                    };
                });

                setStudents(formattedList);
            } catch (err) {
                console.error("Error fetching students:", err);
                setStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudentsData();
    }, [selectedClassId, selectedSectionId, classes]);

    // 🔥 STRICT SINGLE-PAGE PRINT ENGINE
    const executePrint = (htmlContent) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Pass</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    *, *:before, *:after {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        background: #ffffff !important;
                        width: 100%;
                        height: 100%;
                    }
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        padding: 8mm 0;
                    }
                    .vp-premium, .gp-premium, .cs-premium, .cyc-card, .rc-premium, .fr2-wrap, .idc-wrap {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        margin: 0 auto !important;
                        box-shadow: none !important;
                        max-width: 100% !important;
                        transform: scale(0.92);
                        transform-origin: top center;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `);
        doc.close();

        iframe.contentWindow.focus();
        setTimeout(() => {
            iframe.contentWindow.print();
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 1000);
        }, 300);
    };

    // DYNAMIC TEMPLATE RENDERER FOR ALL 4 TYPES
    const renderCardHTML = (s, type) => {
        if (type === 'visitor') {
            const activeTemplate = visitorDefaultTemplateHtml || TEMPLATE_TYPES.VISITOR_PASS?.stub;
            const mergeData = buildVisitorPassMergeData(s, schoolInfo);
            return renderTemplate(activeTemplate, mergeData);
        }

        if (type === 'cycle') {
            const activeTemplate = cycleDefaultTemplateHtml || TEMPLATE_TYPES.CYCLE_STAND_PASS?.stub;
            const mergeData = buildCyclePassMergeData(s, schoolInfo);
            return renderTemplate(activeTemplate, mergeData);
        }

        if (type === 'gate') {
            const activeTemplate = gateDefaultTemplateHtml || TEMPLATE_TYPES.GATE_PASS?.stub;
            const mergeData = buildGatePassMergeData(s, schoolInfo);
            return renderTemplate(activeTemplate, mergeData);
        }

        if (type === 'id') {
            const activeTemplate = idCardDefaultTemplateHtml || TEMPLATE_TYPES.ID_CARD?.stub;
            const mergeData = buildIdCardMergeData(s, schoolInfo);
            return renderTemplate(activeTemplate, mergeData);
        }
    };

    const handlePreview = (item, type) => {
        setPreviewModal({ open: true, data: item, type });
    };

    const handleDirectPrint = (item, type) => {
        const html = renderCardHTML(item, type);
        executePrint(html);
    };

    return (
        <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-b from-teal-50/40 to-slate-100/60 text-slate-900 font-sans">
            <div className="flex flex-col flex-1 lg:overflow-hidden p-3 sm:p-4 gap-3 min-h-0 w-full max-w-[1600px] mx-auto">

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-[#0B2126] text-white shadow-2xl border border-slate-700 animate-slide-up text-xs max-w-[90vw]">
                        <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${toast.isWarn ? 'text-amber-400' : 'text-[#C9A227]'}`} />
                        <span className="font-medium">{toast.message}</span>
                    </div>
                )}

                {/* Header */}
                <div className="shrink-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0B2126] tracking-tight">
                        Pass & ID Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-3xl">
                        Filter students by class & section to generate ID cards, gate passes, and cycle passes in bulk, and log visitor entries with printable passes.
                    </p>
                </div>

                {/* Tab Selection Bar */}
                <div className="flex flex-wrap sm:flex-nowrap p-1 bg-[#EAEEED] rounded-xl gap-1 shrink-0 border border-slate-200">
                    <button
                        onClick={() => setActiveTab('tab1')}
                        className={`flex-1 min-w-[130px] sm:min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'tab1' ? 'bg-white text-[#0B2126] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="whitespace-nowrap truncate">Student ID & Gate Pass</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tab2')}
                        className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'tab2' ? 'bg-white text-[#0B2126] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Bike className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="whitespace-nowrap truncate">Cycle Pass</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tab3')}
                        className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'tab3' ? 'bg-white text-[#0B2126] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Users className="w-3.5 h-3.5 text-[#6A4FC9] shrink-0" />
                        <span className="whitespace-nowrap truncate">Visitor's Pass</span>
                    </button>
                </div>

                {/* TAB 1: STUDENT ID & GATE PASS */}
                {activeTab === 'tab1' && (
                    <StudentIdGatePassTab
                        classes={classes}
                        selectedClassId={selectedClassId}
                        setSelectedClassId={setSelectedClassId}
                        selectedSectionId={selectedSectionId}
                        setSelectedSectionId={setSelectedSectionId}
                        availableSections={availableSections}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        students={students}
                        loadingStudents={loadingStudents}
                        onPreview={handlePreview}
                        onPrint={handleDirectPrint}
                        showToast={showToast}
                    />
                )}

                {/* TAB 2: CYCLE PASS */}
                {activeTab === 'tab2' && (
                    <CyclePassTab
                        classes={classes}
                        selectedClassId={selectedClassId}
                        setSelectedClassId={setSelectedClassId}
                        selectedSectionId={selectedSectionId}
                        setSelectedSectionId={setSelectedSectionId}
                        availableSections={availableSections}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        students={students}
                        onPreview={handlePreview}
                        onPrint={handleDirectPrint}
                        showToast={showToast}
                    />
                )}

                {/* TAB 3: VISITOR'S PASS */}
                {activeTab === 'tab3' && (
                    <VisitorPassTab
                        visitors={visitors}
                        setVisitors={setVisitors}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onPreview={handlePreview}
                        onPrint={handleDirectPrint}
                        showToast={showToast}
                    />
                )}

            </div>

            {/* SHARED PREVIEW MODAL */}
            {previewModal.open && (
                <div className="fixed inset-0 z-50 bg-[#0B2126]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
                        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Pass Preview</h3>
                                <p className="text-[10.5px] text-slate-400">Default printable template format</p>
                            </div>
                            <button onClick={() => setPreviewModal({ open: false, data: null, type: null })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 flex justify-center bg-slate-50 overflow-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderCardHTML(previewModal.data, previewModal.type) }} />
                        </div>
                        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 shrink-0">
                            <button onClick={() => setPreviewModal({ open: false, data: null, type: null })} className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
                                Close
                            </button>
                            <button onClick={() => executePrint(renderCardHTML(previewModal.data, previewModal.type))} className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-[#0B2126] inline-flex items-center gap-1.5 cursor-pointer">
                                <Printer className="w-3.5 h-3.5" /> Print Pass
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}