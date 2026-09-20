import React, { useRef, useState, useEffect, useContext } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { UserContext } from '../../../ContextAPI/UserContext'

import courseTrack1 from '../../../assets/Images/Mockups/course-track-1.png'
import courseTrack2 from '../../../assets/Images/Mockups/course-track-2.png'
import certification from '../../../assets/Images/Features/certification-training.svg'
import corporateTraining from '../../../assets/Images/Features/corporate-training.svg'
import microsoft365 from '../../../assets/Images/Features/microsoft-365.svg'
import itSolutions from '../../../assets/Images/Features/it-solutions.svg'
import endpoint from '../../../assets/Images/Features/endpoint-management.svg'
import security from '../../../assets/Images/Features/security-identity.svg'
import cloud from '../../../assets/Images/Features/cloud-azure.svg'
import staffing from '../../../assets/Images/Features/staffing-services.svg'

gsap.registerPlugin(ScrollTrigger)

// ─── Data ─────────────────────────────────────────────────────────────────────

// Each tab needs exactly 5 images (1 hero + 4 in the grid on desktop).
const TRAINING_IMAGES = [
  { src: courseTrack1, label: 'Courses 1–18' },
  { src: courseTrack2, label: 'Courses 19–36' },
  { src: certification, label: 'Certification' },
  { src: corporateTraining, label: 'Corporate Training' },
  { src: microsoft365, label: 'Microsoft 365' },
]

const SOLUTION_IMAGES = [
  { src: itSolutions, label: 'IT Support' },
  { src: endpoint, label: 'Endpoints' },
  { src: security, label: 'Security' },
  { src: cloud, label: 'Cloud' },
  { src: staffing, label: 'Staffing' },
]

// ─── useIsMobile ──────────────────────────────────────────────────────────────

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < bp : false
  )
  useEffect(() => {
    const fn = () => setM(window.innerWidth < bp)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [bp])
  return m
}

// ─── DeviceCard ───────────────────────────────────────────────────────────────

function DeviceCard({ src, label, isPhone, big = false, index = 0, onHover, isDark }) {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.5, ease: 'power3.out',
        delay: index * 0.06,
      }
    )
  }, [])

  useEffect(() => {
    if (big && ref.current) {
      gsap.fromTo(ref.current, { opacity: 0.6 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
    }
  }, [src, big])

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        setIsHovered(true)
        if (onHover) onHover(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        if (onHover) onHover(false)
      }}
      style={{
        opacity: 1,
        borderRadius: 16,
        background: isDark ? 'rgba(6,13,28,0.92)' : '#ffffff',
        border: isHovered
          ? '1px solid rgba(35,128,204,0.65)'
          : isDark ? '1px solid rgba(35,128,204,0.18)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: isHovered
          ? `0 20px 50px ${isDark ? 'rgba(0,0,0,0.65)' : 'rgba(148,163,184,0.25)'}, 0 0 25px rgba(35,128,204,0.25), inset 0 1px 0 rgba(255,255,255,0.04)`
          : `0 12px 48px ${isDark ? 'rgba(0,0,0,0.45)' : 'rgba(148,163,184,0.15)'}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: big ? 12 : 10,
        gap: 8,
        cursor: big ? 'default' : 'pointer',
        willChange: 'transform',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transform: isHovered && !big ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
        transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <div style={{
        width: '100%',
        borderRadius: isPhone ? 12 : 8,
        overflow: 'hidden',
        background: isDark ? '#030a17' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
      }}>
        <img
          src={src}
          alt={label}
          loading="eager"
          draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
        />
      </div>
      <span style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.13em',
        textTransform: 'uppercase',
        color: isHovered && !big ? (isDark ? '#5CD6F5' : '#2380CC') : isDark ? '#64748b' : '#475569',
        transition: 'color 0.3s ease',
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── DesktopGrid ──────────────────────────────────────────────────────────────

function DesktopGrid({ images, isPhone, isDark, autoActiveIndex, setAutoActiveIndex, isUserHovering }) {
  const [defaultHero, ...rest] = images
  const [currentHero, setCurrentHero] = useState(defaultHero)

  // Sync index rotation into view state
  useEffect(() => {
    if (!isUserHovering.current) {
      setCurrentHero(images[autoActiveIndex])
    }
  }, [autoActiveIndex, images])

  useEffect(() => {
    setCurrentHero(images[0])
  }, [images])

  if (isPhone) {
    const row1 = images.slice(0, 3)
    const row2 = images.slice(3)
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', width: '100%', maxWidth: 900 }}>
          {row1.map((img, i) => {
            const isCurrentlySelected = !isUserHovering.current && autoActiveIndex === i;
            return (
              <div key={i} style={{ flex: '0 0 calc(33.33% - 16px)', maxWidth: 280 }}>
                <div style={{ transform: isCurrentlySelected ? 'translateY(-4px)' : 'none', transition: 'transform 0.4s' }}>
                  <DeviceCard src={img.src} label={img.label} isPhone isDark={isDark} index={i} />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', width: '100%' }}>
          {row2.map((img, i) => {
            const actualIndex = i + 3;
            const isCurrentlySelected = !isUserHovering.current && autoActiveIndex === actualIndex;
            return (
              <div key={actualIndex} style={{ width: 'calc(33.33% - 16px)', maxWidth: 280, minWidth: 200 }}>
                <div style={{ transform: isCurrentlySelected ? 'translateY(-4px)' : 'none', transition: 'transform 0.4s' }}>
                  <DeviceCard src={img.src} label={img.label} isPhone isDark={isDark} index={actualIndex} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center' }}>
      <div style={{ width: '65%' }}>
        <DeviceCard src={currentHero.src} label={currentHero.label} isPhone={false} big index={0} isDark={isDark} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 26, width: '100%' }}>
        {rest.map((img, i) => {
          const actualCardIndex = i + 1;
          const isAutoplayTarget = !isUserHovering.current && autoActiveIndex === actualCardIndex;

          return (
            <div key={actualCardIndex} style={{ transform: isAutoplayTarget ? 'translateY(-6px)' : 'none', transition: 'transform 0.4s ease-out' }}>
              <DeviceCard
                src={img.src}
                label={img.label}
                isPhone={false}
                index={actualCardIndex}
                isDark={isDark}
                onHover={(hovering) => {
                  if (hovering) {
                    isUserHovering.current = true
                    setCurrentHero(img)
                  } else {
                    isUserHovering.current = false
                    setAutoActiveIndex(0)
                    setCurrentHero(defaultHero)
                  }
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MobileCarousel ───────────────────────────────────────────────────────────
function MobileCarousel({ images, isPhone, isDark, active, setActive }) {
  const trackRef = useRef(null)
  const go = (dir) => setActive(p => (p + dir + images.length) % images.length)

  useEffect(() => {
    if (trackRef.current)
      gsap.to(trackRef.current, { x: `-${active * 100}%`, duration: 0.42, ease: 'power3.out' })
  }, [active])

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div ref={trackRef} style={{ display: 'flex', willChange: 'transform' }}>
          {images.map((img, i) => (
            <div key={i} style={{ minWidth: '100%', padding: '0.5rem 1.25rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: isDark ? 'rgba(6,13,28,0.92)' : '#ffffff',
                border: `2px solid ${i === active ? 'rgba(35,128,204,0.75)' : isDark ? 'rgba(35,128,204,0.15)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: 16,
                boxShadow: i === active ? '0 0 0 4px rgba(35,128,204,0.12), 0 20px 60px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                padding: 8,
                transition: 'border 0.3s, box-shadow 0.3s',
                width: isPhone ? '65%' : '100%',
                maxWidth: isPhone ? 240 : 450,
                boxSizing: 'border-box',
              }}>
                <div style={{ borderRadius: isPhone ? 12 : 8, overflow: 'hidden', background: isDark ? '#030a17' : '#f1f5f9' }}>
                  <img src={img.src} alt={img.label} style={{ width: '100%', height: 'auto', display: 'block' }} draggable={false} />
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#475569' }}>
                {img.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            height: 8, width: i === active ? 22 : 8,
            borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer',
            background: i === active ? 'linear-gradient(90deg,#1B57A0,#2380CC 50%,#5CD6F5)' : 'rgba(148,163,184,0.3)',
            transition: 'width 0.28s, background 0.28s',
          }} />
        ))}
      </div>

      {/* Arrows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
        {[{ label: '‹', dir: -1 }, { label: '›', dir: 1 }].map(({ label, dir }, i) => (
          <button key={i} onClick={() => go(dir)} style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid rgba(35,128,204,0.45)',
            background: 'rgba(35,128,204,0.08)',
            color: isDark ? '#5CD6F5' : '#2380CC',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            lineHeight: 0,
            paddingBottom: '4px',
          }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Root Component ────────────────────────────────────────────────────────────

export default function SeeInAction() {
  const { theme } = useContext(UserContext)
  const isDark = theme === 'dark'

  const [activeTab, setActiveTab] = useState('training')
  const [autoActiveIndex, setAutoActiveIndex] = useState(0)

  const sectionRef = useRef(null)
  const headRef = useRef(null)
  const pillRef = useRef(null)
  const isUserHovering = useRef(false)
  const isMobile = useIsMobile()

  const images = activeTab === 'training' ? TRAINING_IMAGES : SOLUTION_IMAGES
  const isPhone = false // AVP has no phone-format screens; the phone layout code is kept for later use

  // ─── 3 Seconds Interval Auto Carousel Slide Logic ───
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isUserHovering.current) {
        setAutoActiveIndex((prevIndex) => (prevIndex + 1) % images.length)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [images.length])

  // Reset tab active tracker index dynamically
  useEffect(() => {
    setAutoActiveIndex(0)
  }, [activeTab])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [headRef.current, pillRef.current],
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 76%', once: true },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        ...S.section,
        background: isDark
          ? 'linear-gradient(145deg,#030712 0%,#06132b 40%,#0a2147 65%,#050b1a 100%)'
          : 'linear-gradient(145deg,#f8fafc 0%,#f1f5f9 50%,#e2e8f0 100%)',
        transition: 'background 0.3s ease-in-out'
      }}
    >
      {/* Ambient glows (Dark Mode only) */}
      {isDark && (
        <>
          <div style={S.glowA} />
          <div style={S.glowB} />
          <div style={S.glowC} />
        </>
      )}

      {/* Heading */}
      <div ref={headRef} style={{ opacity: 0, textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 1rem' }}>
        <p style={{ ...S.eyebrow, color: isDark ? '#3AA6E8' : '#1B57A0' }}>Our Work</p>
        <h2 style={{ ...S.heading, color: isDark ? '#e2e8f0' : '#0f172a' }}>
          See <span style={{ ...S.grad, background: isDark ? S.grad.background : 'linear-gradient(90deg,#0D3F7A 0%,#2380CC 60%,#3AA6E8 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>AVP Tech Group</span> in action
        </h2>
        <p style={{ ...S.sub, color: isDark ? '#94a3b8' : '#475569' }}>
          Explore the courses we teach and the solutions we deliver for businesses and professionals.
        </p>
      </div>

      {/* Tab pill container */}
      <div ref={pillRef} style={{ opacity: 0, position: 'relative', zIndex: 1 }}>
        <div style={{
          ...S.pill,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }}>
          <div style={{ ...S.slider, left: activeTab === 'training' ? 4 : 'calc(50%)' }} />
          {[
            { key: 'training', e: '', t: 'Training' },
            { key: 'solutions', e: '', t: 'IT Solutions' },
          ].map(({ key, e, t }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                ...S.pillBtn,
                color: activeTab === key ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
                fontWeight: activeTab === key ? 700 : 600,
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>{e}&nbsp;{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Device showcase container */}
      <div style={{ width: '100%', maxWidth: 1080, padding: '0 clamp(1rem,4vw,2.5rem)', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        {isMobile ? (
          <MobileCarousel
            images={images}
            isPhone={isPhone}
            isDark={isDark}
            active={autoActiveIndex}
            setActive={(idx) => {
              isUserHovering.current = true;
              setAutoActiveIndex(idx);
            }}
          />
        ) : (
          <DesktopGrid
            images={images}
            isPhone={isPhone}
            isDark={isDark}
            key={activeTab}
            autoActiveIndex={autoActiveIndex}
            setAutoActiveIndex={setAutoActiveIndex}
            isUserHovering={isUserHovering}
          />
        )}
      </div>

      {/* Hint footer note */}
      <p style={{ ...S.hint, color: isDark ? '#94a3b8' : '#64748b' }}>
        {isMobile
          ? 'Tap arrows to browse everything'
          : 'Hover over any card to preview it up close'}
      </p>

    </section>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  section: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(1.5rem,3vw,2.5rem)',
    padding: 'clamp(2rem,4vw,4rem) 0 clamp(4rem,6vw,6rem)',
    overflow: 'hidden',
    fontFamily: "'Sora','Inter',sans-serif",
    boxSizing: 'border-box',
  },
  glowA: {
    position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
    width: 'min(800px,110%)', height: 500,
    background: 'radial-gradient(ellipse,rgba(35,128,204,0.14) 0%,transparent 68%)',
    pointerEvents: 'none', zIndex: 0,
  },
  glowB: {
    position: 'absolute', top: '50%', left: '-5%',
    width: 'min(420px,50%)', height: 420,
    background: 'radial-gradient(ellipse,rgba(92,214,245,0.07) 0%,transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  glowC: {
    position: 'absolute', bottom: '10%', right: '-5%',
    width: 'min(360px,45%)', height: 360,
    background: 'radial-gradient(ellipse,rgba(35,128,204,0.09) 0%,transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  eyebrow: {
    fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase',
    fontWeight: 600, margin: '0 0 0.55rem',
  },
  heading: {
    fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 800,
    lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0,
  },
  grad: {
    background: 'linear-gradient(90deg,#3AA6E8 0%,#5CD6F5 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  sub: {
    fontSize: 'clamp(0.88rem,1.5vw,1.02rem)',
    margin: '0.85rem auto 0', maxWidth: 480, lineHeight: 1.68,
  },
  pill: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid',
    borderRadius: 999,
    padding: 4,
    width: 'clamp(310px, 55vw, 420px)', // Increased width boundaries to stop item clipping
    backdropFilter: 'blur(16px)',
    boxSizing: 'border-box',
  },
  slider: {
    position: 'absolute', top: 4,
    width: 'calc(50% - 4px)', height: 'calc(100% - 8px)',
    borderRadius: 999,
    background: 'linear-gradient(90deg,#1B57A0,#2380CC 60%,#3AA6E8)',
    transition: 'left 0.34s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 0 20px rgba(35,128,204,0.4)', zIndex: 0,
  },
  pillBtn: {
    flex: 1,
    padding: '0.65rem 0.5rem',
    borderRadius: 999,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 'clamp(0.78rem,1.3vw,0.92rem)',
    position: 'relative',
    zIndex: 1,
    transition: 'color 0.22s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: '0.73rem',
    letterSpacing: '0.04em', margin: 0, textAlign: 'center',
    position: 'relative', zIndex: 1,
  },
}

if (typeof document !== 'undefined' && !document.getElementById('sia-kf')) {
  const s = document.createElement('style')
  s.id = 'sia-kf'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
  `
  document.head.appendChild(s)
}