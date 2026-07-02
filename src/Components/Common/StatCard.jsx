import React from "react";
import { ArrowRight } from "lucide-react";

const StatCard = ({ icon, title, description, showLearnMore = true }) => {
  return (
    <div
      className={`group relative rounded-[20px] bg-theme-card border border-theme-border p-5 sm:p-6 lg:p-7 transition-all duration-300
        [box-shadow:0_2px_10px_rgba(0,180,120,0.05),0_0px_2px_rgba(0,0,0,0.02)]
        ${showLearnMore
          ? "hover:-translate-y-1.5 hover:[box-shadow:inset_4px_0_0_0_#00C9B1,0_5px_20px_rgba(0,201,177,0.12),0_2px_5px_rgba(0,0,0,0.03)]"
          : ""
        }`}
      style={
        !showLearnMore
          ? { boxShadow: "inset 4px 0 0 0 #00C9B1, 0 5px 20px rgba(0,201,177,0.12), 0 2px 5px rgba(0,0,0,0.03)" }
          : {}
      }
    >
      {/* Icon */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-teal text-white mb-4 sm:mb-5">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-sm sm:text-base font-semibold text-theme-text mb-1.5 sm:mb-2">{title}</h3>

      {/* Description */}
      <p className="text-theme-subtext leading-relaxed text-xs sm:text-[15px]">{description}</p>

      {/* Learn More */}
      {showLearnMore && (
        <div className="mt-3 sm:mt-4 flex items-center gap-1 text-teal font-semibold text-xs sm:text-sm
          opacity-0 translate-y-1.5
          group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-250 delay-50">
          <p className="cursor-pointer">Learn more</p>
          <ArrowRight size={13} className="cursor-pointer transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      )}
    </div>
  );
};

export default StatCard;