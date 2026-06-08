import { useEffect, useRef, useState } from 'react'

const BAR_DATA = [62, 78, 55, 88, 70, 45, 92, 67, 80, 58, 75, 83, 60, 90]

const FLOAT_CARDS = [
    { id: 'attendance', emoji: '📋', label: 'Attendance', value: '94.2%', sub: '+2.1% wk', color: '#00D2B9', pos: { top: '2%', left: '-88px' }, delay: '0s', anim: 'f1' },
    { id: 'students',   emoji: '🎓', label: 'Admissions', value: '24',    sub: '↑ 8 today', color: '#7C6AF7', pos: { bottom: '12%', left: '-88px' }, delay: '0.8s', anim: 'f3' },
    { id: 'fees',       emoji: '💰', label: 'Fees',       value: '₹2.4L', sub: '92% done',  color: '#F5A623', pos: { top: '2%', right: '-88px' }, delay: '1.4s', anim: 'f2' },
    { id: 'transport',  emoji: '🚌', label: 'Buses Live', value: '12/14', sub: 'On route',  color: '#38BDF8', pos: { bottom: '12%', right: '-88px' }, delay: '2s', anim: 'f4' },
]

const SKELETON_ROWS = [
    { w1: '55%', w2: '20%', active: true },
    { w1: '70%', w2: '15%', active: false },
    { w1: '45%', w2: '25%', active: false },
]

export default function Dashboard_anim() {
    const canvasRef = useRef(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const W = canvas.width, H = canvas.height
        const gap = 6
        const barW = (W - gap * (BAR_DATA.length + 1)) / BAR_DATA.length
        let progress = 0, raf

        const draw = () => {
            ctx.clearRect(0, 0, W, H)
            progress = Math.min(progress + 0.018, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            BAR_DATA.forEach((val, i) => {
                const x = gap + i * (barW + gap)
                const barH = (val / 100) * (H - 8) * ease
                const y = H - barH
                const grad = ctx.createLinearGradient(0, y, 0, H)
                grad.addColorStop(0, 'rgba(0,210,185,0.95)')
                grad.addColorStop(1, 'rgba(0,210,185,0.15)')
                ctx.fillStyle = grad
                const r = 5
                ctx.beginPath()
                ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y)
                ctx.quadraticCurveTo(x + barW, y, x + barW, y + r)
                ctx.lineTo(x + barW, H); ctx.lineTo(x, H); ctx.lineTo(x, y + r)
                ctx.quadraticCurveTo(x, y, x + r, y)
                ctx.closePath(); ctx.fill()
                if (val > 75) {
                    ctx.save()
                    ctx.shadowColor = 'rgba(0,210,185,0.55)'
                    ctx.shadowBlur = 14
                    ctx.fill()
                    ctx.restore()
                }
            })
            if (progress < 1) raf = requestAnimationFrame(draw)
        }
        raf = requestAnimationFrame(draw)
        return () => cancelAnimationFrame(raf)
    }, [])

    /* ─── shared inner card content ─── */
    const CardContent = () => (
        <div style={{ position: 'relative', zIndex: 2 }}>
            {/* TOP BAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 8.5, letterSpacing: '.13em', textTransform: 'uppercase', color: '#2e6a7a', fontWeight: 700, marginBottom: 2 }}>
                        School Dashboard
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#e0f2f8' }}>Overview</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,210,185,0.1)', border: '1px solid rgba(0,210,185,0.22)', borderRadius: 20, padding: '4px 10px', fontSize: 9, fontWeight: 700, color: '#00D2B9' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D2B9', animation: 'blink 1.6s ease-in-out infinite' }} />
                        Live
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#00D2B9,#006d62)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>A</div>
                </div>
            </div>

            {/* STAT TILES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                {[
                    { label: 'Students',   value: '2,450',  color: '#00D2B9' },
                    { label: 'Attendance', value: '94.2%',  color: '#00D2B9' },
                    { label: 'Revenue',    value: '₹12.4L', color: '#F5A623' },
                    { label: 'Staff',      value: '48',     color: 'rgba(0,210,185,0.7)' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 10px' }}>
                        <div style={{ fontSize: 8.5, color: '#2e6a7a', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* BAR CHART */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 14, padding: '12px 12px 8px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 8.5, color: '#2e6a7a', fontWeight: 700, letterSpacing: '.11em', textTransform: 'uppercase' }}>Monthly Attendance</span>
                    <span style={{ fontSize: 8.5, color: '#00D2B9' }}>This Year →</span>
                </div>
                <canvas ref={canvasRef} width={440} height={80} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            {/* ACTIVITY */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 14, padding: '12px 12px' }}>
                <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 8.5, color: '#2e6a7a', fontWeight: 700, letterSpacing: '.11em', textTransform: 'uppercase' }}>Recent Activity</span>
                </div>
                {SKELETON_ROWS.map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: i < 2 ? 8 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? '#00D2B9' : 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
                            <div style={{ height: 6, borderRadius: 3, width: row.w1, background: 'rgba(255,255,255,0.09)' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ height: 6, borderRadius: 3, width: row.w2, background: 'rgba(255,255,255,0.06)' }} />
                            {row.active && (
                                <div style={{ fontSize: 8, fontWeight: 700, color: '#00D2B9', background: 'rgba(0,210,185,0.1)', border: '1px solid rgba(0,210,185,0.22)', borderRadius: 5, padding: '2px 7px' }}>
                                    Active
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const sharedCardBg = {
        background: 'linear-gradient(150deg, #0e2836 0%, #091e2a 60%, #060f18 100%)',
        border: '1px solid rgba(0,210,185,0.18)',
        boxShadow: '0 40px 30px rgba(0,0,0,0.6), inset 0 1.5px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(0,210,185,0.06)',
    }

    /* ══════════════ MOBILE LAYOUT ══════════════ */
    if (isMobile) {
        return (
            <div style={{ position: 'relative', width: '100%', padding: '8px 0 4px' }}>
                <style>{`
                    @keyframes floatMobile { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-7px);} }
                    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.25;} }
                `}</style>

                {/* Main card — full width, simple float, no 3‑D tilt */}
                <div style={{
                    ...sharedCardBg,
                    borderRadius: '20px',
                    width: '100%',
                    padding: '14px 12px',
                    position: 'relative',
                    zIndex: 10,
                    animation: 'floatMobile 5.5s ease-in-out infinite',
                }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '20px', background: 'linear-gradient(130deg, rgba(255,255,255,0.06) 0%, transparent 42%)', pointerEvents: 'none', zIndex: 1 }} />
                    <CardContent />
                </div>

                {/* Floating cards → 2×2 grid below */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                    {FLOAT_CARDS.map(card => (
                        <div key={card.id} style={{
                            background: 'linear-gradient(145deg, rgba(14,40,54,0.92), rgba(6,15,24,0.92))',
                            border: `1px solid ${card.color}33`,
                            borderRadius: '14px',
                            padding: '10px 12px',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: `0 0 0 1px ${card.color}15, 0 4px 16px rgba(0,0,0,0.25)`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${card.color}1a`, border: `1.5px solid ${card.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                {card.emoji}
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{card.value}</div>
                                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.42)', fontWeight: 500, marginTop: 2 }}>{card.label}</div>
                                <div style={{ fontSize: 9, color: card.color, fontWeight: 600, marginTop: 1 }}>{card.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    /* ══════════════ DESKTOP LAYOUT (unchanged) ══════════════ */
    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px', margin: '0 auto', padding: '12px 96px' }}>
            <style>{`
                @keyframes floatMain {
                    0%,100% { transform: perspective(1000px) rotateX(-5deg) rotateY(-10deg) rotateZ(-1.8deg) translateY(0px);   }
                    50%      { transform: perspective(1000px) rotateX(-5deg) rotateY(13deg) rotateZ(-1.8deg) translateY(-14px); }
                }
                @keyframes f1 { 0%,100%{transform:translateY(0px) rotate(-.8deg);}  50%{transform:translateY(-11px) rotate(-.8deg);} }
                @keyframes f2 { 0%,100%{transform:translateY(-3px) rotate(1deg);}   50%{transform:translateY(-13px) rotate(1deg);} }
                @keyframes f3 { 0%,100%{transform:translateY(-1px) rotate(-1.2deg);}50%{transform:translateY(-10px) rotate(-1.2deg);} }
                @keyframes f4 { 0%,100%{transform:translateY(0px) rotate(.9deg);}   50%{transform:translateY(-12px) rotate(.9deg);} }
                @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.25;} }
            `}</style>

            {/* Floating stat cards */}
            {FLOAT_CARDS.map(card => (
                <div key={card.id} style={{ position: 'absolute', zIndex: 40, pointerEvents: 'none', ...card.pos, animation: `${card.anim} 5s ${card.delay} ease-in-out infinite`, filter: `drop-shadow(0 4px 16px ${card.color}30)` }}>
                    <div style={{ width: '178px', background: 'linear-gradient(145deg, rgba(14,40,54,0.9), rgba(6,15,24,0.9))', border: `1px solid ${card.color}33`, borderRadius: '16px', padding: '11px 10px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: `0 0 0 1px ${card.color}15, 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${card.color}1a`, border: `1.5px solid ${card.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{card.emoji}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.01em' }}>{card.value}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.42)', fontWeight: 500, lineHeight: 1.2 }}>{card.label}</div>
                        <div style={{ fontSize: 8.5, color: card.color, fontWeight: 600 }}>{card.sub}</div>
                    </div>
                </div>
            ))}

            {/* Main dashboard card */}
            <div style={{ ...sharedCardBg, borderRadius: '28px', width: '400px', boxShadow: '0 60px 30px rgba(0,0,0,0.75), inset 0 1.5px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(0,210,185,0.06)', padding: '18px 16px', position: 'relative', right: '30px', zIndex: 10, animation: 'floatMain 5.5s ease-in-out infinite' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '28px', background: 'linear-gradient(130deg, rgba(255,255,255,0.06) 0%, transparent 42%)', pointerEvents: 'none', zIndex: 1 }} />
                <CardContent />
            </div>
        </div>
    )
}