import { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { TIMETABLE_CONSTS }  from '../../../Constants/StringConstants/TimetableConstants';

/**
 * PrintTimetableModal
 *
 * Props:
 *  - timetableInfo  : { class/className, section/sectionName, academicYearLabel, status }
 *  - slots          : normalized slot array from parent
 *  - workingDays    : ['Mon','Tue','Wed','Thu','Fri','Sat']
 *  - periods        : generated periods array (isBreak, id, label, time)
 *  - subjectsList   : enriched subjects with { id, code, label, color, bg, border, dot }
 *  - config         : timetableConfig { startTime, periodsPerDay, periodDurationMinutes }
 *  - onClose        : () => void
 */

const getSubjectColorHex = (code) =>
    TIMETABLE_CONSTS.COLORS.SUBJECT_MAP[(code || '').toUpperCase()]?.hex || '#64748b';

const lighten = (hex) => hex + '18'; // ~10% opacity background

const getInitials = (name) =>
    name ? name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

export default function PrintTimetableModal({
    timetableInfo,
    slots = [],
    workingDays = [],
    periods = [],
    subjectsList = [],
    config = null,
    onClose,
}) {
    const printRef = useRef(null);

    const className = timetableInfo?.className || timetableInfo?.class || '—';
    const sectionName = timetableInfo?.sectionName || timetableInfo?.section || '—';
    const yearLabel = timetableInfo?.academicYearLabel || timetableInfo?.academicYear || '—';
    const status = timetableInfo?.status || '';

    const getSlot = (day, periodId) =>
        slots.find(s => s.day === day && s.periodId === periodId);

    const totalSlots = workingDays.length * periods.filter(p => !p.isBreak).length;
    const filledSlots = slots.length;
    const pct = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Timetable — ${className} ${sectionName}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 11px;
                    color: #0f172a;
                    background: white;
                    padding: 10mm 14mm;
                }
                @page { size: A4 landscape; margin: 0; }
                @media print { body { padding: 10mm 14mm; } }
            </style>
        </head>
        <body>
            ${content.innerHTML}
        </body>
        </html>
    `);
        printWindow.document.close();
        printWindow.focus();

        // Wait for content to render then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    // Day abbreviation → full name
    const DAY_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

    return (
        <>
            {/* ── Overlay ── */}
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-auto">
                <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">

                    {/* Modal toolbar */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-700">{TIMETABLE_CONSTS.PRINT_TT.TITLE_PREVIEW}</span>
                            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">{TIMETABLE_CONSTS.PRINT_TT.LBL_A4}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-semibold hover:bg-[#334155] transition">
                                <Printer size={15} /> {TIMETABLE_CONSTS.PRINT_TT.BTN_PRINT}
                            </button>
                            <button onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-200 transition">
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable preview area */}
                    <div className="flex-1 overflow-auto bg-gray-100 p-6">

                        {/* A4 paper simulation */}
                        <div ref={printRef}
                            className="bg-white mx-auto shadow-xl"
                            style={{
                                width: '297mm',
                                minHeight: '210mm',
                                padding: '12mm 14mm',
                                fontFamily: "'Georgia', 'Times New Roman', serif",
                                fontSize: '11px',
                                color: '#0f172a',
                                boxSizing: 'border-box',
                            }}>

                            {/* ── School Header ── */}
                            <div style={{ borderBottom: '2.5px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    {/* Left: school crest placeholder + title */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px', color: '#0f172a' }}>
                                                {TIMETABLE_CONSTS.PRINT_TT.DOC_TITLE}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                                {TIMETABLE_CONSTS.PRINT_TT.LBL_YEAR} <strong style={{ color: '#0f172a' }}>{yearLabel}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: class / section / status badges */}
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                                            {className}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                                            {TIMETABLE_CONSTS.PRINT_TT.LBL_SEC} <strong>{sectionName}</strong>
                                        </div>
                                        <div style={{
                                            display: 'inline-block', marginTop: '4px',
                                            padding: '2px 10px', borderRadius: '99px',
                                            fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
                                            background: status?.toUpperCase() === TIMETABLE_CONSTS.STATUS.PUBLISHED.toUpperCase() ? '#dcfce7' : '#fef3c7',
                                            color: status?.toUpperCase() === TIMETABLE_CONSTS.STATUS.PUBLISHED.toUpperCase() ? '#15803d' : '#92400e',
                                            border: `1px solid ${status?.toUpperCase() === TIMETABLE_CONSTS.STATUS.PUBLISHED.toUpperCase() ? '#86efac' : '#fde68a'}`,
                                        }}>
                                            {status?.toUpperCase() || TIMETABLE_CONSTS.PRINT_TT.LBL_DRAFT}
                                        </div>
                                    </div>
                                </div>

                                {/* Meta row */}
                                <div style={{
                                    display: 'flex', gap: '20px', marginTop: '8px',
                                    fontSize: '10px', color: '#64748b',
                                }}>
                                    <span>📅 <strong>{workingDays.length}</strong> {TIMETABLE_CONSTS.PRINT_TT.META_DAYS}</span>
                                    <span>⏱ <strong>{periods.filter(p => !p.isBreak).length}</strong> {TIMETABLE_CONSTS.PRINT_TT.META_PERIODS}</span>
                                    <span>🕐 {TIMETABLE_CONSTS.PRINT_TT.META_START} <strong>{config?.startTime || '—'}</strong></span>
                                    <span>⏳ {TIMETABLE_CONSTS.PRINT_TT.META_DUR} <strong>{config?.periodDurationMinutes || '—'} {TIMETABLE_CONSTS.PRINT_TT.META_MIN}</strong></span>
                                    <span>✅ {TIMETABLE_CONSTS.PRINT_TT.META_FILLED} <strong>{filledSlots}/{totalSlots}</strong> ({pct}%)</span>
                                </div>
                            </div>

                            {/* ── Timetable Grid ── */}
                            <table style={{
                                width: '100%', borderCollapse: 'collapse',
                                tableLayout: 'fixed', fontSize: '10px',
                            }}>
                                <colgroup>
                                    {/* Period column */}
                                    <col style={{ width: '72px' }} />
                                    {/* Day columns */}
                                    {workingDays.map(d => <col key={d} />)}
                                </colgroup>

                                <thead>
                                    <tr>
                                        <th style={{
                                            background: '#1e293b', color: 'white',
                                            padding: '6px 8px', textAlign: 'center',
                                            border: '1px solid #1e293b', fontSize: '10px',
                                            fontWeight: 700, letterSpacing: '0.04em',
                                        }}>
                                            {TIMETABLE_CONSTS.PRINT_TT.TH_PERIOD}
                                        </th>
                                        {workingDays.map(day => (
                                            <th key={day} style={{
                                                background: '#1e293b', color: 'white',
                                                padding: '6px 4px', textAlign: 'center',
                                                border: '1px solid #1e293b',
                                                fontSize: '10px', fontWeight: 700,
                                                letterSpacing: '0.04em',
                                            }}>
                                                {DAY_FULL[day] || day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {periods.map((period, rowIdx) => {
                                        /* ── Break row ── */
                                        if (period.isBreak) {
                                            return (
                                                <tr key={period.id} style={{ background: '#fffbeb' }}>
                                                    <td style={{
                                                        border: '1px solid #d1d5db',
                                                        padding: '4px 6px', textAlign: 'center',
                                                    }}>
                                                        <div style={{ fontSize: '11px' }}>{period.emoji}</div>
                                                        <div style={{ fontSize: '8px', color: '#92400e', fontWeight: 600 }}>
                                                            {period.duration}
                                                        </div>
                                                    </td>
                                                    <td colSpan={workingDays.length} style={{
                                                        border: '1px solid #d1d5db',
                                                        padding: '4px 10px',
                                                        background: '#fef3c7',
                                                        textAlign: 'center',
                                                    }}>
                                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#92400e', letterSpacing: '0.05em' }}>
                                                            {period.emoji} {period.label.replace(/[🍎🥗]/g, '').trim()} — {period.time}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        /* ── Period row ── */
                                        const isEven = rowIdx % 2 === 0;
                                        return (
                                            <tr key={period.id}>
                                                {/* Period label cell */}
                                                <td style={{
                                                    border: '1px solid #d1d5db',
                                                    padding: '5px 6px',
                                                    background: isEven ? '#f8fafc' : '#f1f5f9',
                                                    textAlign: 'center', verticalAlign: 'middle',
                                                }}>
                                                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#1e293b' }}>
                                                        {period.id}
                                                    </div>
                                                    <div style={{ fontSize: '8px', color: '#64748b', marginTop: '1px', lineHeight: 1.3 }}>
                                                        {period.time}
                                                    </div>
                                                </td>

                                                {/* Slot cells */}
                                                {workingDays.map(day => {
                                                    const slot = getSlot(day, period.id);
                                                    const hex = slot ? getSubjectColorHex(slot.subject?.code) : null;

                                                    return (
                                                        <td key={day} style={{
                                                            border: '1px solid #d1d5db',
                                                            padding: '0',
                                                            verticalAlign: 'top',
                                                            background: slot ? lighten(hex) : (isEven ? '#ffffff' : '#fafafa'),
                                                            minHeight: '52px',
                                                        }}>
                                                            {slot ? (
                                                                <div style={{ padding: '4px 5px', height: '100%' }}>
                                                                    {/* Subject code badge */}
                                                                    <div style={{
                                                                        display: 'inline-block',
                                                                        padding: '1px 5px', borderRadius: '3px',
                                                                        background: hex, color: 'white',
                                                                        fontSize: '8px', fontWeight: 700,
                                                                        letterSpacing: '0.05em', marginBottom: '2px',
                                                                    }}>
                                                                        {slot.subject?.code}
                                                                    </div>
                                                                    {/* Subject name */}
                                                                    <div style={{
                                                                        fontSize: '9px', fontWeight: 600,
                                                                        color: '#0f172a', lineHeight: 1.2,
                                                                        marginBottom: '3px',
                                                                    }}>
                                                                        {slot.subject?.label}
                                                                    </div>
                                                                    {/* Teacher */}
                                                                    {slot.teacher?.name && (
                                                                        <div style={{
                                                                            display: 'flex', alignItems: 'center', gap: '3px',
                                                                        }}>
                                                                            <span style={{
                                                                                width: '14px', height: '14px',
                                                                                borderRadius: '50%',
                                                                                background: hex, color: 'white',
                                                                                fontSize: '7px', fontWeight: 700,
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center', justifyContent: 'center',
                                                                                flexShrink: 0,
                                                                            }}>
                                                                                {getInitials(slot.teacher.name)}
                                                                            </span>
                                                                            <span style={{ fontSize: '8px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                {slot.teacher.name}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {/* Room */}
                                                                    {slot.room && (
                                                                        <div style={{ fontSize: '7.5px', color: '#94a3b8', marginTop: '2px' }}>
                                                                            📍 {slot.room}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div style={{
                                                                    height: '52px', display: 'flex',
                                                                    alignItems: 'center', justifyContent: 'center',
                                                                    color: '#cbd5e1', fontSize: '16px',
                                                                }}>
                                                                    —
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* ── Subject Legend ── */}
                            <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                                <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', marginBottom: '5px' }}>
                                    {TIMETABLE_CONSTS.PRINT_TT.LEGEND_TITLE}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {subjectsList.map(s => {
                                        const hex = getSubjectColorHex(s.code);
                                        const count = slots.filter(sl =>
                                            sl?.subject?.code === s.code || sl?.subject?.id === s.id
                                        ).length;
                                        return (
                                            <div key={s.id || s.code} style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '2px 7px', borderRadius: '99px',
                                                border: `1px solid ${hex}40`,
                                                background: lighten(hex),
                                            }}>
                                                <span style={{
                                                    width: '8px', height: '8px', borderRadius: '50%',
                                                    background: hex, flexShrink: 0,
                                                }} />
                                                <span style={{ fontSize: '9px', fontWeight: 700, color: hex }}>
                                                    {s.code}
                                                </span>
                                                <span style={{ fontSize: '9px', color: '#475569' }}>
                                                    {s.label}
                                                </span>
                                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                                    ({count} {TIMETABLE_CONSTS.PRINT_TT.LEGEND_SLOTS})
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Footer ── */}
                            <div style={{
                                marginTop: '8px', borderTop: '1px solid #e2e8f0',
                                paddingTop: '6px', display: 'flex',
                                justifyContent: 'space-between', alignItems: 'center',
                                fontSize: '8px', color: '#94a3b8',
                            }}>
                                <span>{TIMETABLE_CONSTS.PRINT_TT.FOOTER_GEN}{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                <span style={{ fontStyle: 'italic' }}>
                                    {className} · {sectionName} · {yearLabel}
                                </span>
                                <span>{TIMETABLE_CONSTS.PRINT_TT.FOOTER_TOTAL} {filledSlots}/{totalSlots} slots ({pct}% {TIMETABLE_CONSTS.PRINT_TT.FOOTER_COMP})</span>
                            </div>
                        </div>
                        {/* end A4 paper */}

                    </div>
                    {/* end scroll area */}

                </div>
            </div>
        </>
    );
}