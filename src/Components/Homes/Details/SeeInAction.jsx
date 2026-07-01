/**
 * SeeInAction.jsx  –  Final, production-ready version
 *
 * Desktop  → beautiful 5-card grid with a large "hero" card in the centre-top
 *             and 4 supporting cards below.  GSAP handles only enter animations
 *             and hover lifts — no absolute-positioned radial chaos.
 *
 * Mobile   → full-width swipe carousel with dots + arrows.
 *
 * No overflow, no overlap, fully responsive.
 */

import React, { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import {
  attendance, dashboard, student_enrolment, teachers, transport,
  holidays, login_page, parent_attendance, parent_dashboard, parent_transport,
} from '../../../assets/Images/Mockups'

gsap.registerPlugin(ScrollTrigger)

// ─── Data ─────────────────────────────────────────────────────────────────────

const LAPTOP_IMAGES = [
  { src: dashboard, label: 'Dashboard' },
  { src: attendance, label: 'Attendance' },
  { src: student_enrolment, label: 'Enrolment' },
  { src: teachers, label: 'Teachers' },
  { src: transport, label: 'Transport' },
]

const MOBILE_IMAGES = [
  { src: login_page, label: 'Login' },
  { src: parent_dashboard, label: 'Dashboard' },
  { src: parent_attendance, label: 'Attendance' },
  { src: parent_transport, label: 'Transport' },
  { src: holidays, label: 'Holidays' },
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

function DeviceCard({ src, label, isPhone, big = false, index = 0 }) {
  const ref = useRef(null)
  const init = useRef(false)

  useEffect(() => {
    if (!ref.current || init.current) return
    init.current = true
    gsap.fromTo(ref.current,
      { opacity: 0, y: 36, scale: 0.93 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, ease: 'power3.out',
        delay: index * 0.09,
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      }
    )
  }, [index])

  const onEnter = () => gsap.to(ref.current, { y: -8, scale: 1.03, duration: 0.3, ease: 'power2.out' })
  const onLeave = () => gsap.to(ref.current, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        opacity: 0,                       // GSAP will reveal
        borderRadius: 16,
        background: 'rgba(8,20,38,0.92)',
        border: '1px solid rgba(45,212,191,0.14)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: big ? 10 : 8,
        gap: 8,
        cursor: 'default',
        willChange: 'transform',
        backdropFilter: 'blur(20px)',
        transition: 'border-color 0.25s',
      }}
    >
      {/* Screen frame */}
      <div style={{
        width: '100%',
        borderRadius: isPhone ? 12 : 8,
        overflow: 'hidden',
        background: '#050f1e',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <img
          src={src}
          alt={label}
          loading="lazy"
          draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
        />
      </div>
      {/* Label */}
      <span style={{
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.13em',
        textTransform: 'uppercase',
        color: '#64748b',
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── DesktopGrid ──────────────────────────────────────────────────────────────
// Layout:   1 big hero card top-center, then 4 equal cards in a row below.
// For phone mockups: 3-across grid looks better (portrait cards are narrow).

function DesktopGrid({ images, isPhone }) {
  const [hero, ...rest] = images          // hero = first image

  if (isPhone) {
    const row1 = images.slice(0, 3)
    const row2 = images.slice(3)
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
        {/* Row 1 — 3 cards equal width, centred */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', width: '100%', maxWidth: 900 }}>
          {row1.map((img, i) => (
            <div key={i} style={{ flex: '0 0 calc(33.33% - 16px)', maxWidth: 280 }}>
              <DeviceCard src={img.src} label={img.label} isPhone index={i} />
            </div>
          ))}
        </div>
        {/* Row 2 — 2 cards same width as above, centred */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          {row2.map((img, i) => (
            <div key={i + 3} style={{ width: 'calc(33.33% - 16px)', maxWidth: 280, minWidth: 200 }}>
              <DeviceCard src={img.src} label={img.label} isPhone index={i + 3} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Laptop layout: hero on top (wider), 4 smaller below
  return (
    <div style={{ width: '100%', maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center' }}>
      {/* Hero */}
      <div style={{ width: '62%' }}>
        <DeviceCard src={hero.src} label={hero.label} isPhone={false} big index={0} />
      </div>
      {/* 4-card row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 26, width: '100%' }}>
        {rest.map((img, i) => (
          <DeviceCard key={i + 1} src={img.src} label={img.label} isPhone={false} index={i + 1} />
        ))}
      </div>
    </div>
  )
}

// ─── MobileCarousel ───────────────────────────────────────────────────────────

function MobileCarousel({ images, isPhone }) {
  const [active, setActive] = useState(0)
  const trackRef = useRef(null)

  const go = (dir) => setActive(p => (p + dir + images.length) % images.length)

  useEffect(() => { setActive(0) }, [images])

  useEffect(() => {
    if (trackRef.current)
      gsap.to(trackRef.current, { x: `-${active * 100}%`, duration: 0.42, ease: 'power3.out' })
  }, [active])

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
      {/* Slides */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div ref={trackRef} style={{ display: 'flex', willChange: 'transform' }}>
          {images.map((img, i) => (
            <div key={i} style={{ minWidth: '100%', padding: '0.5rem 1.75rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: 'rgba(8,20,38,0.92)',
                border: `2px solid ${i === active ? 'rgba(45,212,191,0.7)' : 'rgba(45,212,191,0.1)'}`,
                borderRadius: 16,
                boxShadow: i === active ? '0 0 0 4px rgba(45,212,191,0.1), 0 20px 60px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                padding: 8,
                transition: 'border 0.3s, box-shadow 0.3s',
                width: isPhone ? '62%' : '100%',
                maxWidth: isPhone ? 220 : 400,
                boxSizing: 'border-box',
              }}>
                <div style={{ borderRadius: isPhone ? 12 : 8, overflow: 'hidden', background: '#050f1e' }}>
                  <img src={img.src} alt={img.label} style={{ width: '100%', height: 'auto', display: 'block' }} draggable={false} />
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#94a3b8' }}>
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
            background: i === active ? 'linear-gradient(90deg,#2dd4bf,#fbbf24)' : 'rgba(255,255,255,0.15)',
            transition: 'width 0.28s, background 0.28s',
          }} />
        ))}
      </div>

      {/* Arrows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
        {[{ label: '‹', dir: -1 }, { label: '›', dir: 1 }].map(({ label, dir }, i) => (
          <button key={i} onClick={() => go(dir)} style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '1px solid rgba(45,212,191,0.3)',
            background: 'rgba(45,212,191,0.07)',
            color: '#2dd4bf', fontSize: '1.5rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', lineHeight: 1,
          }}>
            {label}
          </button>
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: '#475569' }}>{active + 1} / {images.length}</span>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function SeeInAction() {
  const [activeTab, setActiveTab] = useState('admin')
  const sectionRef = useRef(null)
  const headRef = useRef(null)
  const pillRef = useRef(null)
  const isMobile = useIsMobile()

  const images = activeTab === 'admin' ? LAPTOP_IMAGES : MOBILE_IMAGES
  const isPhone = activeTab === 'parent'

  // Section heading entrance
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
    <section ref={sectionRef} style={S.section}>

      {/* Ambient glows */}
      <div style={S.glowA} />
      <div style={S.glowB} />
      <div style={S.glowC} />

      {/* Heading */}
      <div ref={headRef} style={{ opacity: 0, textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 1rem' }}>
        <p style={S.eyebrow}>Live Preview</p>
        <h2 style={S.heading}>
          See <span style={S.grad}>SchoolSpine</span> in action
        </h2>
        <p style={S.sub}>
          Explore the interface that thousands of schools rely on every day.
        </p>
      </div>

      {/* Tab pill */}
      <div ref={pillRef} style={{ opacity: 0, position: 'relative', zIndex: 1 }}>
        <div style={S.pill}>
          <div style={{ ...S.slider, left: activeTab === 'admin' ? 4 : 'calc(50%)' }} />
          {[
            { key: 'admin', e: '🖥️', t: 'Admin Dashboard' },
            { key: 'parent', e: '📱', t: 'Parent App' },
          ].map(({ key, e, t }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                ...S.pillBtn,
                color: activeTab === key ? '#0f172a' : '#94a3b8',
                fontWeight: activeTab === key ? 700 : 500,
              }}
            >
              {e}&nbsp;{t}
            </button>
          ))}
        </div>
      </div>

      {/* Device showcase */}
      <div style={{ width: '100%', maxWidth: 1080, padding: '0 clamp(1rem,4vw,2.5rem)', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        {isMobile
          ? <MobileCarousel images={images} isPhone={isPhone} />
          : <DesktopGrid images={images} isPhone={isPhone} key={activeTab} />
        }
      </div>

      {/* Hint */}
      <p style={S.hint}>
        {isMobile
          ? 'Tap arrows to browse all screens'
          : 'Hover over any screen to preview it up close'}
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
    padding: 'clamp(1.5rem,3vw,1rem) 0 clamp(4rem,6vw,6rem)',
    background: 'linear-gradient(145deg,#020c18 0%,#041a2e 40%,#061e2e 65%,#051219 100%)',
    overflow: 'hidden',
    fontFamily: "'Sora','Inter',sans-serif",
    boxSizing: 'border-box',
  },
  glowA: {
    position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
    width: 'min(800px,110%)', height: 500,
    background: 'radial-gradient(ellipse,rgba(45,212,191,0.07) 0%,transparent 68%)',
    pointerEvents: 'none', zIndex: 0,
  },
  glowB: {
    position: 'absolute', top: '50%', left: '-5%',
    width: 'min(420px,50%)', height: 420,
    background: 'radial-gradient(ellipse,rgba(20,184,166,0.05) 0%,transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  glowC: {
    position: 'absolute', bottom: '10%', right: '-5%',
    width: 'min(360px,45%)', height: 360,
    background: 'radial-gradient(ellipse,rgba(245,158,11,0.05) 0%,transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  eyebrow: {
    fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase',
    color: '#2dd4bf', fontWeight: 600, margin: '0 0 0.55rem',
  },
  heading: {
    fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 800,
    color: '#e2e8f0', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0,
  },
  grad: {
    background: 'linear-gradient(90deg,#2dd4bf 0%,#34d399 30%,#fbbf24 70%,#f59e0b 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  sub: {
    fontSize: 'clamp(0.88rem,1.5vw,1.02rem)', color: '#94a3b8',
    margin: '0.85rem auto 0', maxWidth: 480, lineHeight: 1.68,
  },
  pill: {
    position: 'relative', display: 'flex',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 999, padding: 4,
    width: 'clamp(270px,54vw,370px)',
    backdropFilter: 'blur(16px)',
    boxSizing: 'border-box',
  },
  slider: {
    position: 'absolute', top: 4,
    width: 'calc(50% - 4px)', height: 'calc(100% - 8px)',
    borderRadius: 999,
    background: 'linear-gradient(90deg,#2dd4bf,#34d399 50%,#fbbf24)',
    transition: 'left 0.34s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 0 20px rgba(45,212,191,0.35)', zIndex: 0,
  },
  pillBtn: {
    flex: 1, padding: '0.55rem 0.4rem', borderRadius: 999,
    border: 'none', background: 'transparent', cursor: 'pointer',
    fontSize: 'clamp(0.74rem,1.3vw,0.9rem)',
    position: 'relative', zIndex: 1,
    transition: 'color 0.22s', whiteSpace: 'nowrap',
  },
  hint: {
    fontSize: '0.73rem', color: '#94a3b8',
    letterSpacing: '0.04em', margin: 0, textAlign: 'center',
    position: 'relative', zIndex: 1,
  },
}

// Inject font + pulse keyframe once
if (typeof document !== 'undefined' && !document.getElementById('sia-kf')) {
  const s = document.createElement('style')
  s.id = 'sia-kf'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
  `
  document.head.appendChild(s)
}