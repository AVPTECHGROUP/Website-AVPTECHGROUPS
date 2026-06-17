import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
            className="w-full bg-[linear-gradient(to_right,#101D2C,#0E323D,#1E282C)] px-4 sm:px-8 lg:px-20 py-12 sm:py-20"
        >
            {/* ── Single row, left-aligned items separated by vertical dividers ── */}
            <div className="flex flex-row flex-wrap justify-center items-stretch max-w-5xl mx-auto">
                {statsData.map((stat, i) => {
                    const { numericTarget, suffix, decimals } = parseStatValue(stat.value);

                    return (
                        <React.Fragment key={i}>
                            {i > 0 && (
                                <div className="w-px bg-white/20 mx-3 sm:mx-5" />
                            )}

                            <div className="flex flex-col justify-center items-center gap-2 px-4 sm:px-8 lg:px-10 py-3">
                                <span
                                    ref={(el) => (numRefs.current[i] = el)}
                                    className="font-mono font-bold leading-none text-grad-teal-gold bg-clip-text text-transparent"
                                    style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
                                >
                                    {numericTarget.toFixed(decimals) + suffix}
                                </span>

                                <span
                                    className="text-gray-400 font-medium whitespace-nowrap"
                                    style={{ fontSize: 'clamp(0.9rem, 1.2vw, 0.875rem)' }}
                                >
                                    {stat.label}
                                </span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default DetailsStrip;