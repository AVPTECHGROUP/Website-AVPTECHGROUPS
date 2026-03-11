import React from "react";

const TooltipComponent = ({
  message,
  direction = "top",
  color = "dark",
  children
}) => {

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const colorStyles = {
    dark: "bg-gray-900 text-white",
    gray : "bg-gray-400 text-black",
    blue: "bg-blue-600 text-white",
    green: "bg-green-600 text-white",
    red: "bg-red-600 text-white",
    yellow: "bg-yellow-500 text-black",
    nocolor: "text-black",
  };

  const arrowColors = {
    dark: "border-gray-900",
    gray : "border-gray-800",
    blue: "border-blue-600",
    green: "border-green-600",
    red: "border-red-600",
    yellow: "border-yellow-500",
    nocolor: "border-black-100",
  };

  const arrowDirection = {
    top: `top-full left-1/2 -translate-x-1/2 border-t ${arrowColors[color]}`,
    bottom: `bottom-full left-1/2 -translate-x-1/2 border-b ${arrowColors[color]}`,
    left: `left-full top-1/2 -translate-y-1/2 border-l ${arrowColors[color]}`,
    right: `right-full top-1/2 -translate-y-1/2 border-r ${arrowColors[color]}`,
  };

  return (
    <div className="relative inline-block group">

      {children}

      <div
        className={`absolute ${positionStyles[direction]}
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        ${colorStyles[color]}
        text-sm font-normal rounded-md px-3 py-2 shadow-lg
        w-max max-w-xs pointer-events-none`}
      >
        {message}

        <div
          className={`absolute border-[6px] border-transparent ${arrowDirection[direction]}`}
        />

      </div>
    </div>
  );
};

export default TooltipComponent;