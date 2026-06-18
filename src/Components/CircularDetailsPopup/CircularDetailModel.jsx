import { useState, useEffect, useCallback } from 'react';
import {
    X,
    Download,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Building2,
    Users,
    GraduationCap,
    FileText,
    FileImage,
    FileSpreadsheet,
    FileType,
    File,
    // TargetArrow,
    Clipboard,
    ArchiveIcon,
    Link2Icon,
    LucideTarget
} from 'lucide-react';
import { fetchCircularById } from '../../Api/CircularApi.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    PUBLISHED: {
        label: 'Published',
        bg: '#f0fdf4',
        color: '#16a34a',
        border: '#86efac',
        Icon: CheckCircle2,
    },

    PENDING_APPROVAL: {
        label: 'Pending Approval',
        bg: '#fffbeb',
        color: '#d97706',
        border: '#fcd34d',
        Icon: Clock,
    },

    DRAFT: {
        label: 'Draft',
        bg: '#f8fafc',
        color: '#64748b',
        border: '#cbd5e1',
        Icon: FileText,
    },

    REJECTED: {
        label: 'Rejected',
        bg: '#fef2f2',
        color: '#dc2626',
        border: '#fca5a5',
        Icon: XCircle,
    },
};

const TARGET_CONFIG = {
    ALL_PARENTS: { label: 'All Parents', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', Icon: Users },
    ALL_STAFF: { label: 'All Staff', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', Icon: Building2 },
    ALL_TEACHERS: { label: 'All Teachers', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', Icon: GraduationCap },
    DEFAULT: { label: 'Custom Group', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', Icon: Users },
};

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType) {
    if (!fileType) return File;

    const type = fileType.toLowerCase();

    if (type.includes('pdf')) {
        return FileText;
    }

    if (type.includes('image')) {
        return FileImage;
    }

    if (
        type.includes('sheet') ||
        type.includes('excel') ||
        type.includes('xls')
    ) {
        return FileSpreadsheet;
    }

    if (
        type.includes('word') ||
        type.includes('doc')
    ) {
        return FileType;
    }

    return File;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const key = status?.toUpperCase();
    const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.DRAFT;
    const { Icon } = cfg;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
            background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}`,
        }}>
            <Icon size={13} />
            {cfg.label}
        </span>
    );
}

function TargetBadge({ targetType, classId, sectionId }) {
    const key = targetType?.toUpperCase();
    const cfg = TARGET_CONFIG[key] || TARGET_CONFIG.DEFAULT;
    const { Icon } = cfg;
    const label = cfg.label !== 'Custom Group'
        ? cfg.label
        : classId ? `Class ${classId}${sectionId ? ` · Sec ${sectionId}` : ''}` : targetType;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
        }}>
            <Icon size={11} />
            {label}
        </span>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
                width: 30, height: 30, borderRadius: 8, background: '#f0f6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <Icon size={13} color="#3b82f6" />
            </div>
            <div>
                <p style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>{label}</p>
                <p style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{value}</p>
            </div>
        </div>
    );
}

// ── Skeleton loader ────────────────────────────────────────────────────────────

function Skeleton({ w = '100%', h = 14, r = 6, mb = 0 }) {
    return (
        <div style={{
            width: w, height: h, borderRadius: r, marginBottom: mb,
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
        }} />
    );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────

/**
 * CircularDetailModal
 *
 * Props:
 *  - circularId  {number|null}  — id to fetch; null = closed
 *  - onClose     {() => void}
 *
 * Usage (inline / page-level):
 *   <CircularDetailModal circularId={selectedId} onClose={() => setSelectedId(null)} />
 */
export default function CircularDetailModal({ circularId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!circularId) return;
        setLoading(true);
        setError(null);
        setData(null);
        const { data: res, error: err } = await fetchCircularById(circularId);
        if (err) setError(err);
        // API shape: { success, data: { ...circular } }
        else setData(res?.data ?? res);
        setLoading(false);
    }, [circularId]);

    useEffect(() => { load(); }, [load]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!circularId) return null;

    const c = data;

    return (
        <>
            {/* Shimmer keyframe injected once */}
            <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes modalIn { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
      `}</style>

            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    background: 'rgba(15, 30, 60, 0.35)',
                    animation: 'overlayIn .2s ease',
                }}
            />

            {/* Modal panel */}
            <div className='border-t border-t-blue-600 border-t-6'
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'fixed', top: '50%', left: '50%', zIndex: 51,
                    transform: 'translate(-50%, -50%)',
                    width: '92vw', maxWidth: 680,
                    maxHeight: '88vh', overflowY: 'auto',
                    background: 'rgba(255,255,255,0.97)',
                    borderRadius: 20,
                    boxShadow: '0 0 0 4px rgba(147,197,253,0.18), 0 24px 60px rgba(30,64,175,0.14), 0 6px 20px rgba(0,0,0,0.06)',
                    animation: 'modalIn .25s cubic-bezier(.22,1,.36,1)',
                }}
            >
                {/* Top gradient accent bar */}
                <div style={{
                    height: 4, borderRadius: '20px 20px 0 0',
                    background: 'linear-gradient(90deg, #3b82f6, #6366f1, #0ea5e9)',
                }} />

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid #e8f0fe',
                }}>
                    <div style={{ flex: 1, paddingRight: 16 }}>
                        {loading ? (
                            <>
                                <Skeleton w="60%" h={12} mb={8} />
                                <Skeleton w="85%" h={20} r={8} />
                            </>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <span style={{
                                        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                                        color: '#3b82f6', background: '#eff6ff', border: '1px solid #bfdbfe',
                                        padding: '2px 8px', borderRadius: 99,
                                    }}>
                                        {c?.type === 'SCHOOL_WIDE' ? 'School-Wide' : c?.type === 'CLASS_SPECIFIC' ? 'Class-Specific' : c?.type ?? 'Circular'}
                                    </span>
                                    {c?.status && <StatusBadge status={c.status} />}
                                </div>
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.3, margin: 0 }}>
                                    {c?.title ?? '—'}
                                </h2>
                            </>
                        )}
                    </div>

                    {/* Close btn */}
                    <button
                        onClick={onClose}
                        style={{
                            width: 34, height: 34, borderRadius: 10, border: '1.5px solid #e2e8f0',
                            background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0, color: '#64748b',
                            transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#dc2626'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px' }}>

                    {/* Error */}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                            color: '#dc2626', fontSize: 13, marginBottom: 20,
                        }}>
                            <AlertCircle size={15} /> {error}
                            <button onClick={load} style={{ marginLeft: 'auto', fontSize: 12, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: '#dc2626' }}>Retry</button>
                        </div>
                    )}

                    {/* Rejection reason banner */}
                    {!loading && c?.rejectionReason && (
                        <div style={{
                            display: 'flex', gap: 10, padding: '12px 16px', marginBottom: 20,
                            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                        }}>
                            <XCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Rejection Reason</p>
                                <p style={{ fontSize: 13, color: '#b91c1c' }}>{c.rejectionReason}</p>
                            </div>
                        </div>
                    )}

                    {/* Content section */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f8fbff 0%, #f0f6ff 100%)',
                        border: '1px solid #dbeafe', borderRadius: 14, padding: '16px 18px', marginBottom: 20,
                    }}>
                        <p  className='flex items-center gap-2' style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                            <Clipboard size={14} /> Content
                        </p>
                        {loading
                            ? <><Skeleton mb={6} /><Skeleton w="90%" mb={6} /><Skeleton w="70%" /></>
                            : <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{c?.content ?? '—'}</p>
                        }
                    </div>

                    {/* Meta grid */}
                    <div className='border-b pb-8 border-b-blue-600' style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20,
                    }}>
                        {loading ? (
                            [1, 2, 3, 4].map((k) => (
                                <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <Skeleton w={30} h={30} r={8} />
                                    <div style={{ flex: 1 }}><Skeleton w="60%" h={10} mb={4} /><Skeleton w="80%" h={13} /></div>
                                </div>
                            ))
                        ) : (
                            <>
                                <InfoRow icon={User} label="Created By" value={c?.authorName ?? `User #${c?.createdById ?? '—'}`} />
                                <InfoRow icon={User} label="Published By" value={c?.publishedById ? `User #${c.publishedById}` : '—'} />
                                <InfoRow icon={Calendar} label="Created At" value={formatDate(c?.createdAt)} />
                                <InfoRow icon={Calendar} label="Published At" value={formatDate(c?.publishedAt)} />
                            </>
                        )}
                    </div>

                    {/* Targets */}
                    <div style={{ marginBottom: 20 }}>
                        <p className='flex items-center gap-2' style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                           <LucideTarget size={16}/> Target Audience
                           
                        </p>
                        {loading ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Skeleton w={100} h={26} r={99} />
                                <Skeleton w={90} h={26} r={99} />
                            </div>
                        ) : (c?.targets?.length > 0) ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {c.targets.map((tg) => (
                                    <TargetBadge key={tg.id} targetType={tg.targetType} classId={tg.classId} sectionId={tg.sectionId} />
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: 13, color: '#94a3b8' }}>No targets defined</p>
                        )}
                    </div>

                    {/* Attachments */}
                    {(loading || (c?.attachments?.length > 0)) && (
                        <div>
                            <p  className='flex items-center gap-2' style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                                <Link2Icon size={16}/> Attachments
                            </p>
                            {loading ? (
                                <Skeleton h={52} r={12} />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {c.attachments.map((att) => {
                                        const FileIcon = getFileIcon(att.fileType);
                                        return (
                                            <a
                                                key={att.id}
                                                href={att.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 12,
                                                    padding: '10px 14px', borderRadius: 12, textDecoration: 'none',
                                                    background: '#f8fbff', border: '1px solid #dbeafe',
                                                    transition: 'all .15s',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fbff'; e.currentTarget.style.borderColor = '#dbeafe'; }}
                                            >
                                                <FileIcon
                                                    size={22}
                                                    color="#2563eb"
                                                    style={{ flexShrink: 0 }}
                                                />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.fileName}</p>
                                                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{att.fileType} {att.fileSize ? `· ${formatBytes(att.fileSize)}` : ''}</p>
                                                </div>
                                                <Download size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 24px', borderTop: '1px solid #e8f0fe',
                    background: 'linear-gradient(135deg, #f8fbff, #f0f6ff)',
                    borderRadius: '0 0 20px 20px',
                }}>
                    <p style={{ fontSize: 11.5, color: '#94a3b8' }}>
                        {!loading && c ? `ID #${c.id} · School #${c.schoolId}` : ''}
                    </p>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(37,99,235,0.3)', transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.3)'; }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
}