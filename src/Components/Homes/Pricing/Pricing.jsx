// import React, { useState, useEffect } from 'react'
// import { useLocation } from 'react-router-dom'
// import Pricing_List from './Pricing_List'

// const Pricing = () => {
//     const { hash } = useLocation()

//     useEffect(() => {
//         if (hash === '#pricing-section') {
//             const element = document.getElementById('pricing-section');
//             if (element) {
//                 setTimeout(() => {
//                     element.scrollIntoView({ behavior: 'smooth' });
//                 }, 100);
//             }
//         }
//     }, [hash]);

//     return (
//         <div id="pricing-section" className="w-full bg-theme-bg text-theme-text relative py-16 sm:py-24 overflow-hidden transition-colors duration-300">
//             {/* Top Gradient Divider */}
//             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/30 via-[#F5A623]/20 to-transparent z-10" />
//             {/* Bottom Gradient Divider */}
//             <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/30 via-[#F5A623]/20 to-transparent z-10" />

//             {/* Grid background overlay */}
//             <div className="absolute inset-0 pointer-events-none opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

//             {/* Subtle decorative blobs */}
//             <div className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-[0.2] blur-3xl"
//                 style={{ background: 'radial-gradient(circle, #00C9B1, transparent 70%)' }} />
//             <div className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-[0.2] blur-3xl"
//                 style={{ background: 'radial-gradient(circle, #F5A623, transparent 70%)' }} />

//             {/* Heading */}
//             <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-4 mb-14">
//                 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-theme-text text-center">
//                     Affordable Pricing. <span className="bg-gradient-to-r from-teal-dark to-teal bg-clip-text text-transparent">Powerful Features.</span>
//                 </h1>
//                 <p className="text-base sm:text-lg font-body font-normal text-theme-subtext text-center max-w-xl">
//                     Choose the plan that fits your school. No hidden fees, ever.
//                 </p>

//                 {/* Toggle */}
//                 <div className="mt-6 flex items-center justify-center gap-4 w-full max-w-md">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00C9B1]/50"></div>

//                     <span className="text-[#00E5D4] lg:text-xl sm:text-sm md:text-lg  font-bold uppercase tracking-[0.25em] whitespace-nowrap">
//                         Choose Your Plan
//                     </span>

//                     <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00C9B1]/50"></div>
//                 </div>
//             </div>

//             {/* Cards */}
//             <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <Pricing_List />
//             </div>
//         </div>
//     )
// }

// export default Pricing