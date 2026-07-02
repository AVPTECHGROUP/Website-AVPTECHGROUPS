import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // 1. Pehle standard window aur body ko top par reset karo
        window.scrollTo(0, 0);
        if (document.documentElement) document.documentElement.scrollTo(0, 0);
        if (document.body) document.body.scrollTo(0, 0);

        // 2. Saare potential scrollable containers ko DOM se nikalo
        const scrollContainers = document.querySelectorAll('main, .overflow-y-auto, [class*="overflow-y-auto"]');
        
        scrollContainers.forEach(container => {
            // 🚨 SIDEBAR PROTECTION GUARD:
            // .closest() check karega ki kya ye element kisi <aside>, '.sidebar' class, 
            // ya kisi aise class ke andar hai jisme 'sidebar' text aata ho.
            if (
                container.closest('aside') || 
                container.closest('.sidebar') || 
                container.closest('[class*="sidebar"]')
            ) {
                return; // Agar sidebar ke andar hai, toh yahin se skip kardo (Kuch mat karo)
            }
            
            // Baki saare containers (jaise main content area) ko top par scroll kar do
            container.scrollTo({ top: 0, behavior: 'instant' });
        });
        
    }, [pathname]);

    return null; 
}