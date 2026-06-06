import React, { useEffect, useRef } from 'react'
import { Cloud, Lock, UserCheck, ShieldCheck } from 'lucide-react'
import security from '../../../assets/Images/security_img.png'

// ── inline keyframes via a <style> tag ──────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Sans:ital,wght@0,300;0,400;1,300&display=swap');

  .sec-root * { box-sizing: border-box; }

  /* floating image */
  @keyframes floatImg {
    0%,100% { transform: translateY(0px) rotate(-1deg); }
    50%      { transform: translateY(-18px) rotate(1deg); }
  }
  .img-float { animation: floatImg 7s ease-in-out infinite; }

  /* background orbs */
  @keyframes orbDrift {
    0%,100% { transform: translate(0,0) scale(1); opacity:.45; }
    50%      { transform: translate(30px,-25px) scale(1.08); opacity:.6; }
  }

  /* SVG icons scattered */
  @keyframes svgFloat1 {
    0%,100% { transform: translateY(0) rotate(0deg); opacity:.13; }
    50%      { transform: translateY(-14px) rotate(8deg); opacity:.22; }
  }
  @keyframes svgFloat2 {
    0%,100% { transform: translateY(0) rotate(0deg); opacity:.10; }
    50%      { transform: translateY(10px) rotate(-6deg); opacity:.18; }
  }
  @keyframes svgFloat3 {
    0%,100% { transform: translateY(0) rotate(0deg); opacity:.08; }
    50%      { transform: translateY(-8px) rotate(12deg); opacity:.16; }
  }

  /* shimmer line on badge */
  @keyframes shimmer {
    0%   { left:-60%; }
    100% { left:130%; }
  }

  /* card slide-in stagger */
  @keyframes cardIn {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .card-anim-1 { animation: cardIn .6s .15s both ease-out; }
  .card-anim-2 { animation: cardIn .6s .30s both ease-out; }
  .card-anim-3 { animation: cardIn .6s .45s both ease-out; }

  /* heading fade-up */
  @keyframes headIn {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .head-anim { animation: headIn .7s .05s both ease-out; }

  /* glow pulse on icon wrapper */
  @keyframes glowPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(45,212,191,.0); }
    50%      { box-shadow: 0 0 14px 4px rgba(45,212,191,.25); }
  }

  /* card hover */
  .feature-card {
    transition: background .25s, border-color .25s, transform .25s;
    cursor: default;
  }
  .feature-card:hover {
    background: rgba(255,255,255,.09) !important;
    border-color: rgba(45,212,191,.38) !important;
    transform: translateX(5px);
  }
  .feature-card:hover .icon-box {
    animation: glowPulse 1.8s ease-in-out infinite;
  }
  .feature-card:hover .icon-box svg {
    color: #5eead4 !important;
  }

  /* badge shimmer */
  .badge-wrap { position:relative; overflow:hidden; display:inline-flex; }
  .badge-wrap::after {
    content:'';
    position:absolute; top:0; bottom:0;
    width:40%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);
    animation: shimmer 3s 1s infinite;
  }

  /* noise grain overlay */
  .grain::before {
    content:'';
    position:absolute; inset:0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity:.025; pointer-events:none; z-index:0;
  }
`

// ── floating background SVG elements ────────────────────────────────────────
const BgSVGs = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>

    {/* large shield — left mid */}
    <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', left: '2%', top: '20%', width: 140, animation: 'svgFloat1 9s ease-in-out infinite' }}>
      <path d="M40 4L8 16V42C8 59 22 74 40 82C58 74 72 59 72 42V16L40 4Z"
        stroke="#2dd4bf" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M28 43l8 8 16-16" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

    {/* fingerprint — top right */}
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', right: '4%', top: '8%', width: 110, animation: 'svgFloat2 11s ease-in-out infinite' }}>
      <ellipse cx="40" cy="40" rx="10" ry="14" stroke="#2dd4bf" strokeWidth="1.2" />
      <ellipse cx="40" cy="40" rx="18" ry="23" stroke="#2dd4bf" strokeWidth="1.2" />
      <ellipse cx="40" cy="40" rx="26" ry="32" stroke="#2dd4bf" strokeWidth="1.2" />
      <ellipse cx="40" cy="40" rx="34" ry="38" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="4 3" />
    </svg>

    {/* lock — bottom left */}
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', left: '6%', bottom: '10%', width: 80, animation: 'svgFloat3 8s 2s ease-in-out infinite' }}>
      <rect x="6" y="32" width="52" height="40" rx="6" stroke="#2dd4bf" strokeWidth="1.5" />
      <path d="M18 32V22a14 14 0 0128 0v10" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="52" r="5" stroke="#2dd4bf" strokeWidth="1.5" />
      <line x1="32" y1="57" x2="32" y2="64" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" />
    </svg>

    {/* key — top left corner */}
    <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', left: '28%', top: '5%', width: 90, animation: 'svgFloat1 13s 1s ease-in-out infinite' }}>
      <circle cx="20" cy="20" r="14" stroke="#2dd4bf" strokeWidth="1.2" />
      <line x1="34" y1="20" x2="74" y2="20" stroke="#2dd4bf" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="66" y1="20" x2="66" y2="28" stroke="#2dd4bf" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="58" y1="20" x2="58" y2="26" stroke="#2dd4bf" strokeWidth="1.2" strokeLinecap="round" />
    </svg>

    {/* cloud + check — bottom right */}
    <svg viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', right: '3%', bottom: '14%', width: 100, animation: 'svgFloat2 10s 3s ease-in-out infinite' }}>
      <path d="M22 44a16 16 0 010-32 22 22 0 0142 8 14 14 0 010 24H22Z"
        stroke="#2dd4bf" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M32 34l8 8 16-14" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

    {/* hexagon grid dots — right center */}
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', right: '18%', top: '35%', width: 90, animation: 'svgFloat3 14s 0.5s ease-in-out infinite' }}>
      {[20, 50, 80].map(cx => [20, 50, 80].map(cy => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="#2dd4bf" opacity=".35" />
      )))}
    </svg>

    {/* wifi / signal rings — mid left */}
    <svg viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', left: '20%', bottom: '20%', width: 75, animation: 'svgFloat1 12s 4s ease-in-out infinite' }}>
      <path d="M10 40 Q40 5 70 40" stroke="#2dd4bf" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M20 40 Q40 18 60 40" stroke="#2dd4bf" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M30 40 Q40 30 50 40" stroke="#2dd4bf" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="44" r="3" fill="#2dd4bf" opacity=".6" />
    </svg>
  </div>
)

// ── orb glows ────────────────────────────────────────────────────────────────
const Orbs = () => (
  <>
    <div style={{
      position: 'absolute', width: 500, height: 500,
      borderRadius: '50%', left: '-100px', top: '50%', transform: 'translateY(-50%)',
      background: 'radial-gradient(circle, rgba(20,100,100,.35) 0%, transparent 70%)',
      animation: 'orbDrift 12s ease-in-out infinite', zIndex: 0,
    }} />
    <div style={{
      position: 'absolute', width: 400, height: 400,
      borderRadius: '50%', right: '-60px', top: '10%',
      background: 'radial-gradient(circle, rgba(15,70,90,.45) 0%, transparent 70%)',
      animation: 'orbDrift 15s 2s ease-in-out infinite', zIndex: 0,
    }} />
    <div style={{
      position: 'absolute', width: 260, height: 260,
      borderRadius: '50%', right: '35%', bottom: '-60px',
      background: 'radial-gradient(circle, rgba(45,212,191,.10) 0%, transparent 70%)',
      animation: 'orbDrift 10s 4s ease-in-out infinite', zIndex: 0,
    }} />
  </>
)

// ── feature data ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: <Lock size={18} />,
    title: 'End-to-End Encryption',
    desc: 'All data is encrypted in transit and at rest using AES-256 military-grade standards.',
    animClass: 'card-anim-1',
  },
  {
    icon: <Cloud size={18} />,
    title: 'Automated Cloud Backup',
    desc: 'Daily backups with 99.99% data durability distributed across multiple global regions.',
    animClass: 'card-anim-2',
  },
  {
    icon: <UserCheck size={18} />,
    title: 'Role-Based Access Control',
    desc: 'Granular permissions ensure every user accesses only what they are authorised for.',
    animClass: 'card-anim-3',
  },
]

// ── component ────────────────────────────────────────────────────────────────
const Security_Section = () => {
  return (
    <>
      <style>{styles}</style>

      <section
        className="sec-root grain"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0d1e2b 0%, #102130 30%, #132939 60%, #152f3f 80%, #173343 100%)',
          display: 'flex',
          alignItems: 'center',
          fontFamily: "'Sora', sans-serif",
          overflow: 'hidden',
        }}
      >
        <Orbs />
        <BgSVGs />

        {/* subtle horizontal rule lines */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(45,212,191,.03) 80px)',
        }} />

        {/* content */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 1200,
          margin: '0 auto',
          padding: '64px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 56,
        }}>

          {/* ── top badge ── */}
          <div className="badge-wrap head-anim" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px',
            borderRadius: 999,
            border: '1px solid rgba(45,212,191,.3)',
            background: 'rgba(45,212,191,.07)',
            backdropFilter: 'blur(8px)',
          }}>
            <ShieldCheck size={14} color="#2dd4bf" />
            <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5eead4', fontWeight: 600 }}>
              Trusted Security Infrastructure
            </span>
          </div>

          {/* ── two-column layout ── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 48,
            width: '100%',
          }}
            className="lg-row"
          >

            {/* LEFT — floating image */}
            <div style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {/* glow behind image */}
              <div style={{
                position: 'absolute',
                width: '80%', height: '80%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(45,212,191,.18) 0%, transparent 70%)',
                filter: 'blur(30px)',
                zIndex: 0,
              }} />
              {/* ring decoration */}
              <div style={{
                position: 'absolute',
                width: '110%', height: '110%',
                borderRadius: '50%',
                border: '1px dashed rgba(45,212,191,.15)',
                zIndex: 0,
                animation: 'orbDrift 8s ease-in-out infinite',
              }} />
              <img
                src={security}
                alt="Security Illustration"
                className="img-float"
                style={{
                  position: 'relative', zIndex: 1,
                  width: 'min(450px, 80vw)',
                  filter: 'drop-shadow(0 20px 60px rgba(45,212,191,.20)) drop-shadow(0 4px 20px rgba(0,0,0,.5))',
                  opacity: .92,
                }}
                onError={e => {
                  // graceful fallback to inline SVG shield
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>

            {/* RIGHT — copy + cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', maxWidth: 580 }}>

              {/* heading block */}
              <div className="head-anim" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* accent line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 2, background: 'linear-gradient(90deg,#2dd4bf,transparent)', borderRadius: 2 }} />
                  <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2dd4bf', fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                    Protection First
                  </span>
                </div>

                <h1 style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.6rem)',
                  color: '#fff',
                  lineHeight: 1.18,
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}>
                  Enterprise-grade<br />
                  <span style={{
                    background: 'linear-gradient(90deg,#5eead4,#2dd4bf,#99f6e4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    security at its core
                  </span>
                </h1>

                <p style={{
                  fontFamily: "'DM Sans',sans-serif",
                  color: 'rgba(180,210,220,.70)',
                  fontSize: 'clamp(.9rem,1.5vw,1.05rem)',
                  lineHeight: 1.7,
                  fontWeight: 300,
                  margin: 0,
                }}>
                  Your data security is our top priority. We deploy industry-leading
                  practices and zero-trust architecture to keep every byte safe.
                </p>
              </div>

              {/* feature cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {features.map((f, i) => (
                  <div
                    key={i}
                    className={`feature-card ${f.animClass}`}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 16,
                      padding: '18px 20px',
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,.08)',
                      background: 'rgba(255,255,255,.04)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {/* icon */}
                    <div className="icon-box" style={{
                      flexShrink: 0, marginTop: 2,
                      width: 38, height: 38, borderRadius: 10,
                      background: 'linear-gradient(135deg,rgba(45,212,191,.15),rgba(45,212,191,.05))',
                      border: '1px solid rgba(45,212,191,.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#2dd4bf',
                      transition: 'all .25s',
                    }}>
                      {f.icon}
                    </div>

                    {/* text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <h2 style={{
                        margin: 0,
                        fontFamily: "'Sora',sans-serif",
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#e8f4f6',
                        letterSpacing: '-0.01em',
                      }}>
                        {f.title}
                      </h2>
                      <p style={{
                        margin: 0,
                        fontFamily: "'DM Sans',sans-serif",
                        color: 'rgba(160,200,210,.60)',
                        fontSize: '0.845rem',
                        lineHeight: 1.65,
                        fontWeight: 300,
                      }}>
                        {f.desc}
                      </p>
                    </div>

                    {/* right arrow accent */}
                    <div style={{
                      marginLeft: 'auto', flexShrink: 0, alignSelf: 'center',
                      color: 'rgba(45,212,191,.25)', fontSize: 18, fontWeight: 300,
                    }}>›</div>
                  </div>
                ))}
              </div>

              {/* CTA row */}
              <div className="card-anim-3" style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 4 }}>
                <button style={{
                  padding: '11px 28px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#2dd4bf,#14b8a6)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.02em',
                  color: '#0d1e2b',
                  boxShadow: '0 4px 24px rgba(45,212,191,.35)',
                  transition: 'transform .2s, box-shadow .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(45,212,191,.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(45,212,191,.35)'; }}
                >
                  View Security Docs
                </button>
                <span style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: '0.83rem',
                  color: 'rgba(45,212,191,.65)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  SOC 2 Type II Certified
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* responsive two-col when wide enough */}
        <style>{`
          @media(min-width:960px){
            .lg-row {
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-between !important;
            }
          }
        `}</style>
      </section>
    </>
  )
}

export default Security_Section