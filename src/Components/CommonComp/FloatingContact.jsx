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

            {/* Fixed Floating Container (Always visible on scroll) */}
            <div className="fixed right-4 sm:right-6 bottom-8 sm:top-90 z-50 flex flex-col items-center gap-10 select-none">

                {/* Phone Call Button (White Circular Button with Green Icon) */}
                <a
                    href={`tel:${phoneNumber}`}
                    aria-label="Call Us"
                    className="animate-sticky-bounce w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white text-[#22c55e] flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.18)] hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-100 cursor-pointer group"
                >
                    <Phone size={22} className="fill-current group-hover:rotate-12 transition-transform duration-300" />
                </a>

                {/* WhatsApp Button (Vibrant Green Button with White Icon) */}
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="animate-sticky-bounce-delayed w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                    <FaWhatsapp size={26} className="group-hover:scale-105 transition-transform duration-300" />
                </a>

            </div>
        </>
    )
}

export default FloatingContact;