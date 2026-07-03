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
    { value: "500+", label: "Schools Onboarded" },
    { value: "2M+", label: "Students Managed" },
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
            start: 'top 90%',
            once: true,
            onEnter: () => {
                numRefs.current.forEach((el, i) => {
                    if (!el) return;
                    const { numericTarget, suffix, decimals } = parseStatValue(statsData[i].value);
                    const proxy = { val: 0 };
                    gsap.to(proxy, {
                        val: numericTarget,
                        duration: 2,
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
        <div
            ref={stripRef}
            className="w-full transition-colors duration-300 px-4 sm:px-8 lg:px-20 py-12 sm:py-20"
            style={{
                background: isDark
                    ? 'linear-gradient(to right, #101D2C, #0E323D, #1E282C)'
                    : 'linear-gradient(to right, #f8fafc, #f1f5f9, #e2e8f0)',
            }}
        >
            {/* Responsive Grid Container */}
            <div className="grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto items-stretch">
                {statsData.map((stat, i) => {
                    const { numericTarget, suffix, decimals } = parseStatValue(stat.value);

                    return (
                        <div
                            key={i}
                            className={`flex flex-col justify-center items-center gap-2 px-2 sm:px-6 py-6 text-center transition-colors duration-300
                                ${i % 2 === 0 ? 'border-r' : ''} 
                                ${i < 2 ? 'border-b md:border-b-0' : ''} 
                                ${i === 1 || i === 2 ? 'md:border-r' : ''} 
                                ${isDark ? 'border-white/10' : 'border-black/10'}`
                            }
                        >
                            <span
                                ref={(el) => (numRefs.current[i] = el)}
                                className="font-mono font-bold leading-none bg-gradient-to-r from-[#00C9B1] to-[#F5A623] bg-clip-text text-transparent"
                                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
                            >
                                {numericTarget.toFixed(decimals) + suffix}
                            </span>

                            <span
                                className="font-medium text-xs sm:text-sm max-w-[160px] leading-snug transition-colors duration-300"
                                style={{ color: isDark ? '#94a3b8' : '#475569' }}
                            >
                                {stat.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DetailsStrip;