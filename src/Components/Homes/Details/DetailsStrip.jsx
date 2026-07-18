import React, { useEffect, useRef, useContext } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { UserContext } from '../../../ContextAPI/UserContext';

gsap.registerPlugin(ScrollTrigger);

const parseStatValue = (raw) => {
    const match = raw.match(/^([\d.]+)(.*)$/);
    if (!match) return { numericTarget: 0, suffix: raw, decimals: 0 };
    const num = parseFloat(match[1]);
    const suffix = match[2] || '';
    const decimals = match[1].includes('.') ? match[1].split('.')[1].length : 0;
    return { numericTarget: num, suffix, decimals };
};

const statsData = [
    { value: "5+", label: "Schools Onboarded" },
    { value: "3000+", label: "Students Managed" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "Average Rating" },
];

const DetailsStrip = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === 'dark';

    const stripRef = useRef(null);
    const numRefs = useRef([]);

    useEffect(() => {
        const trigger = ScrollTrigger.create({
            trigger: stripRef.current,
            start: 'top 95%',
            once: true,
            onEnter: () => {
                numRefs.current.forEach((el, i) => {
                    if (!el) return;
                    const { numericTarget, suffix, decimals } = parseStatValue(statsData[i].value);
                    const proxy = { val: 0 };
                    gsap.to(proxy, {
                        val: numericTarget,
                        duration: 1.8,
                        ease: 'power2.out',
                        onUpdate() {
                            el.textContent = proxy.val.toFixed(decimals) + suffix;
                        },
                        onComplete() {
                            el.textContent = numericTarget.toFixed(decimals) + suffix;
                        },
                    });
                });
            },
        });

        return () => trigger.kill();
    }, []);

    return (
        <div ref={stripRef} className="w-full transition-colors duration-300 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Expanded to max-w-7xl to match the grids exactly */}
            <div
                className={`max-w-7xl mx-auto rounded-2xl border transition-all duration-350
                    ${isDark
                        ? 'bg-slate-900/60 border-slate-800/80 shadow-md'
                        : 'bg-slate-50 border-slate-200/60 shadow-sm'
                    }`}
            >
                <div className="grid grid-cols-2 md:grid-cols-4 items-stretch rounded-2xl overflow-hidden">
                    {statsData.map((stat, i) => {
                        const { numericTarget, suffix, decimals } = parseStatValue(stat.value);

                        return (
                            <div
                                key={i}
                                className={`flex flex-col justify-center items-center gap-1.5 px-4 py-8 text-center transition-all duration-200
                                    ${i % 2 === 0 ? 'border-r' : ''} 
                                    ${i < 2 ? 'border-b md:border-b-0' : ''} 
                                    ${i === 1 || i === 2 ? 'md:border-r' : ''} 
                                    ${isDark ? 'border-slate-800/50' : 'border-slate-200/60'}`
                                }
                            >
                                <span
                                    ref={(el) => (numRefs.current[i] = el)}
                                    className={`font-mono font-bold leading-none bg-gradient-to-r bg-clip-text text-transparent select-none tracking-tight
                                        ${isDark
                                            ? 'from-cyan-400 to-teal-400'
                                            : 'from-cyan-600 to-teal-700'
                                        }`}
                                    style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)' }}
                                >
                                    {numericTarget.toFixed(decimals) + suffix}
                                </span>

                                <span
                                    className="font-medium text-xs sm:text-sm max-w-[160px] tracking-wide leading-snug transition-colors duration-300"
                                    style={{ color: isDark ? '#94a3b8' : '#475569' }}
                                >
                                    {stat.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DetailsStrip;