import React from 'react'
import { Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const FloatingContact = () => {
    const phoneNumber = "+919511117450"
    const whatsappUrl = "https://wa.me/919511117450?text=Hi%2C%20I%20want%20to%20know%20more%20about%20SchoolSpine"

    return (
        <>
            <style>{`
                @keyframes floatBounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                .animate-sticky-bounce {
                    animation: floatBounce 2.6s ease-in-out infinite;
                }
                .animate-sticky-bounce-delayed {
                    animation: floatBounce 2.6s ease-in-out infinite;
                    animation-delay: 1.3s;
                }
            `}</style>

            {/* Sticky Floating Container - Exactly in Vertical Middle of the viewport */}
            <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3.5 sm:gap-4 select-none pointer-events-auto">

                {/* Phone Call Button (White Circle with Green Icon) */}
                <a
                    href={`tel:${phoneNumber}`}
                    aria-label="Call Us"
                    className="animate-sticky-bounce w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white text-[#22c55e] flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.22)] hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-100 cursor-pointer group"
                >
                    <Phone size={20} className="sm:w-[22px] sm:h-[22px] fill-current group-hover:rotate-12 transition-transform duration-300" />
                </a>

                {/* WhatsApp Button (Brand Green Circle with White Icon) */}
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="animate-sticky-bounce-delayed w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                    <FaWhatsapp size={24} className="sm:w-[26px] sm:h-[26px] group-hover:scale-105 transition-transform duration-300" />
                </a>

            </div>
        </>
    )
}

export default FloatingContact