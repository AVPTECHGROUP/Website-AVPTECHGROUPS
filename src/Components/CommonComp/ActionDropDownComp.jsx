import React from "react";

export default function ActionDropDownComp({ onAction, actionOptions }) {
  return (
    <div className="w-full lg:w-auto flex justify-center items-center">
      {/* Mobile me wrap karega aur capsule dikhega, Laptop (lg) par transparent aur inline ho jayega */}
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-1.5 p-1 bg-gray-100 lg:bg-transparent rounded-xl lg:border-0 border border-gray-200 w-full lg:w-auto">
        {actionOptions.map((item) => (
          <button
            key={item.label}
            disabled={item.disabled}
            onClick={(e) => {
              e.stopPropagation(); // Table row click interference rokne ke liye
              if (!item.disabled) onAction(item.value);
            }}
            className={`
              flex items-center justify-center gap-1 px-1.5 py-1 lg:px-1.5 lg:py-0.5 rounded-lg 
              text-[9px] sm:text-xs font-semibold transition-all duration-150 cursor-pointer 
              flex-1 lg:flex-initial min-w-[75px] lg:min-w-0 text-center whitespace-nowrap
              ${item.bg} ${item.text} ${item.hover}
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          >
            {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0" />}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}