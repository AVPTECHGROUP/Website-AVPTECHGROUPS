import React from "react";

const DesignCard = ({ icon, title, description, features, accentColor }) => {
    const colorMap = {
        teal: {
            iconBg: "bg-teal-50",
            iconColor: "text-teal-500",
            dotColor: "bg-teal-500",
            shadow: "inset 0 -5px 0 0 #14b8a6",
            hoverShadow: "hover:[box-shadow:inset_0_-5px_0_0_#14b8a6,0_12px_32px_rgba(20,184,166,0.18)]",
        },
        amber: {
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
            dotColor: "bg-amber-500",
            shadow: "inset 0 -5px 0 0 #f59e0b",
            hoverShadow: "hover:[box-shadow:inset_0_-5px_0_0_#f59e0b,0_12px_32px_rgba(245,158,11,0.18)]",
        },
        slate: {
            iconBg: "bg-slate-100",
            iconColor: "text-slate-500",
            dotColor: "bg-teal-500",
            shadow: "inset 0 -5px 0 0 #0f766e",
            hoverShadow: "hover:[box-shadow:inset_0_-5px_0_0_#0f766e,0_12px_32px_rgba(15,118,110,0.18)]",
        },
    };

    const colors = colorMap[accentColor] || colorMap.teal;

    return (
        <div
            className={`group relative bg-white rounded-2xl p-5 sm:p-6 lg:p-7 flex flex-col gap-3 sm:gap-4
        transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${colors.hoverShadow}`}
            style={{ boxShadow: `${colors.shadow}, 0 4px 16px rgba(0,0,0,0.07)` }}
        >
            {/* Icon */}
            <div className={`w-12 h-12 sm:w-13 sm:h-13 lg:w-14 lg:h-14 rounded-2xl ${colors.iconBg} flex items-center justify-center ${colors.iconColor}`}>
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>

            {/* Description */}
            <p className="text-gray-700 text-xs sm:text-[14px] font-medium leading-relaxed">{description}</p>

            {/* Feature List */}
            <ul className="flex flex-col gap-1.5 sm:gap-2 mt-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-700">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dotColor}`} />
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DesignCard;