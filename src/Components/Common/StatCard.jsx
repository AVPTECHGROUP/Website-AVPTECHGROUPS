import React from 'react';
import { ArrowRight } from 'lucide-react';

const StatCard = ({ icon, title, description, showLearnMore = false }) => {
  return (
    <div
      className="
                group relative h-full rounded-2xl p-6
                bg-theme-card border 
                shadow-sm dark:shadow-none flex items-center justify-center flex-col
                transition-all duration-300 ease-out
                border-teal-400/60 dark:hover:border-teal-400/50
                hover:shadow-[0_0_0_1px_rgba(45,212,191,0.3),0_8px_30px_rgba(45,212,191,0.12)]
                hover:-translate-y-1
                overflow-hidden
            "
    >
      {/* Subtle glow blob on hover - dark mode only */}
      <div
        className="
                    pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full
                    bg-teal-400/0 group-hover:bg-teal-400/10
                    blur-2xl transition-all duration-500
                    hidden dark:block
                "
      />

      {/* Icon Wrapper Container with Premium Glow Shadow */}
      <div
        className="
                    relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-4
                    bg-teal-500/10 text-teal-500 dark:text-teal-300
                    ring-1 ring-teal-400/30
                    
                    /* Premium Static Shadow Effect */
                    shadow-[0_0_15px_rgba(45,212,191,0.2)] 
                    dark:shadow-[0_0_20px_rgba(45,212,191,0.15)]
                    
                    /* Enhanced Hover Shadow & Ring Effects */
                    group-hover:bg-teal-500/20 
                    group-hover:ring-teal-400/60
                    group-hover:shadow-[0_0_25px_rgba(45,212,191,0.45)]
                    group-hover:scale-105
                    
                    transition-all duration-300 ease-out
                    [&>svg]:w-6 [&>svg]:h-6
                "
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="relative z-10 font-heading text-base sm:text-lg font-semibold text-theme-text mb-1.5">
        {title}
      </h3>

      {/* Description */}
      <p className="relative z-10 text-sm text-theme-subtext text-center leading-relaxed">
        {description}
      </p>

      {/* Learn More - only visible on hover */}
      {showLearnMore && (
        <div
          className="
                        relative z-10 flex items-center gap-1.5 mt-4
                        text-sm font-bold text-teal-500 dark:text-teal-300
                        opacity-0 max-h-0 -translate-y-1
                        group-hover:opacity-100 group-hover:max-h-6 group-hover:translate-y-0
                        transition-all duration-300 ease-out
                    "
        >
          Learn More
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      )}
    </div>
  );
};

export default StatCard;