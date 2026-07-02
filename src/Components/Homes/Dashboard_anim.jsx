import { useEffect, useRef, useState } from 'react'

const BAR_DATA = [62, 78, 55, 88, 70, 45, 92, 67, 80, 58, 75, 83, 60, 90]
const LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']

const FLOAT_CARDS = [
    { id: 'attendance', emoji: '📋', label: 'Attendance', value: '94.2%', sub: '+2.1% wk', color: '#00D2B9', pos: { top: '2%', left: '-88px' }, delay: '0s', anim: 'f1' },
    { id: 'students', emoji: '🎓', label: 'Admissions', value: '24', sub: '↑ 8 today', color: '#7C6AF7', pos: { bottom: '12%', left: '-88px' }, delay: '0.8s', anim: 'f3' },
    { id: 'fees', emoji: '💰', label: 'Fees', value: '₹2.4L', sub: '92% done', color: '#F5A623', pos: { top: '2%', right: '-88px' }, delay: '1.4s', anim: 'f2' },
    { id: 'transport', emoji: '🚌', label: 'Buses Live', value: '12/14', sub: 'On route', color: '#38BDF8', pos: { bottom: '12%', right: '-88px' }, delay: '2s', anim: 'f4' },
]

const ACTIVITY_DATA = [
    { id: 1, title: 'Grade 10 Attendance Roll', desc: 'Completed by Admin', time: '2m ago', color: '#00D2B9', icon: '⚡' },
    { id: 2, title: 'Fee Payment Received', desc: 'ID #89420 • ₹12,500', time: '14m ago', color: '#F5A623', icon: '🪙' },
    { id: 3, title: 'Route 4 Bus Delayed', desc: 'Heavy traffic near bypass', time: '1h ago', color: '#FF5E7E', icon: '⚠️' },
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
        
        const paddingBottom = 16 
        const chartH = H - paddingBottom
        const gap = 8
        const barW = (W - gap * (BAR_DATA.length + 1)) / BAR_DATA.length
        let progress = 0, raf

        const draw = () => {
            ctx.clearRect(0, 0, W, H)
            progress = Math.min(progress + 0.02, 1)
            const ease = 1 - Math.pow(1 - progress, 3)

            // Graphical Visual: Background Grid Lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
            ctx.lineWidth = 1
            for (let i = 1; i <= 3; i++) {
                const gridY = (chartH / 4) * i
                ctx.beginPath()
                ctx.moveTo(0, gridY)
                ctx.lineTo(W, gridY)
                ctx.stroke()
            }

            // Draw Bars and Labels
            BAR_DATA.forEach((val, i) => {
                const x = gap + i * (barW + gap)
                const barH = (val / 100) * (chartH - 12) * ease
                const y = chartH - barH

                // Gradient Fill
                const grad = ctx.createLinearGradient(0, y, 0, chartH)
                grad.addColorStop(0, 'rgba(0,210,185,0.95)')
                grad.addColorStop(1, 'rgba(0,210,185,0.08)')
                ctx.fillStyle = grad

                // Rounded Corners Top Only
                const r = Math.min(4, barW / 2)
                ctx.beginPath()
                ctx.moveTo(x + r, y)
                ctx.lineTo(x + barW - r, y)
                ctx.quadraticCurveTo(x + barW, y, x + barW, y + r)
                ctx.lineTo(x + barW, chartH)
                ctx.lineTo(x, chartH)
                ctx.lineTo(x, y + r)
                ctx.quadraticCurveTo(x, y, x + r, y)
                ctx.closePath()
                ctx.fill()

                // Neon Cyber Glow Overlay for high data values
                if (val > 75) {
                    ctx.save()
                    ctx.shadowColor = 'rgba(0,210,185,0.6)'
                    ctx.shadowBlur = 10
                    ctx.fill()
                    ctx.restore()
                }

                // Graphical Visual: X-Axis Text Labels
                if (LABELS[i]) {
                    ctx.fillStyle = 'rgba(256, 256, 256, 0.3)'
                    ctx.font = '700 8px sans-serif'
                    ctx.textAlign = 'center'
                    ctx.fillText(LABELS[i], x + barW / 2, H - 4)
                }
            })

            if (progress < 1) raf = requestAnimationFrame(draw)
        }
        
        // Timeout ensures execution happens cleanly after layout stabilization
        const timer = setTimeout(() => {
            raf = requestAnimationFrame(draw)
        }, 50)

        return () => {
            clearTimeout(timer)
            cancelAnimationFrame(raf)
        }
    }, [isMobile]) // Redraws perfectly when scaling layout viewports

    const sharedCardBg = {
        background: 'linear-gradient(150deg, #0e2836 0%, #091e2a 60%, #060f18 100%)',
        border: '1px solid rgba(0,210,185,0.18)',
        boxShadow: '0 40px 30px rgba(0,0,0,0.6), inset 0 1.5px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(0,210,185,0.06)',
    }

    // Consolidated layout element to guarantee DOM node persistence
    const dashboardLayoutContent = (
        <>
            {/* TOP BAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
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
                    { label: 'Students', value: '2,450', color: '#00D2B9' },
                    { label: 'Attendance', value: '94.2%', color: '#00D2B9' },
                    { label: 'Revenue', value: '₹12.4L', color: '#F5A623' },
                    { label: 'Staff', value: '48', color: 'rgba(0,210,185,0.7)' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 10px' }}>
                        <div style={{ fontSize: 8.5, color: '#2e6a7a', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* BAR CHART SECTION */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 14, padding: '12px 12px 8px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 8.5, color: '#2e6a7a', fontWeight: 700, letterSpacing: '.11em', textTransform: 'uppercase' }}>Monthly Attendance</span>
                    <span style={{ fontSize: 8.5, color: '#00D2B9' }}>This Year →</span>
                </div>
                {/* The Canvas now features persistent rendering and integrated structural grid line assets */}
                <canvas ref={canvasRef} width={440} height={100} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            {/* RECENT ACTIVITY */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 14, padding: '12px 14px' }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 8.5, color: '#2e6a7a', fontWeight: 700, letterSpacing: '.11em', textTransform: 'uppercase' }}>Recent Activity</span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Real-time Feed</span>
                </div>
                
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '1px', background: 'linear-gradient(to bottom, rgba(0,210,185,0.3), rgba(255,255,255,0.05))', zIndex: 1 }} />
                    {ACTIVITY_DATA.map((item, i) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(6,15,24,0.9)', border: `1.5px solid ${item.color}`, boxShadow: i === 0 ? `0 0 10px ${item.color}80` : 'none', display: 'flex', alignItems: 'center', justifyBox: 'center', justifyContent: 'center', fontSize: 8, flexShrink: 0 }}>
                                    <span style={{ transform: 'scale(0.85)', color: item.color }}>{item.icon}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10.5, fontWeight: 600, color: '#e0f2f8', lineHeight: 1.2 }}>{item.title}</div>
                                    <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{item.desc}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 8, fontWeight: 500, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                                {item.time}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )

    /* ══════════════ MOBILE LAYOUT ══════════════ */
    if (isMobile) {
        return (
            <div style={{ position: 'relative', width: '100%', padding: '8px 0 4px' }}>
                <style>{`
                    @keyframes floatMobile { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-7px);} }
                    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.25;} }
                `}</style>

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
                    {dashboardLayoutContent}
                </div>

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

    /* ══════════════ DESKTOP LAYOUT ══════════════ */
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

            <div style={{ ...sharedCardBg, borderRadius: '28px', width: '400px', boxShadow: '0 60px 30px rgba(0,0,0,0.75), inset 0 1.5px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(0,210,185,0.06)', padding: '18px 16px', position: 'relative', right: '30px', zIndex: 10, animation: 'floatMain 5.5s ease-in-out infinite' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '28px', background: 'linear-gradient(130deg, rgba(255,255,255,0.06) 0%, transparent 42%)', pointerEvents: 'none', zIndex: 1 }} />
                {dashboardLayoutContent}
            </div>
        </div>
    )
}