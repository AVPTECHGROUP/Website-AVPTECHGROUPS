import { ChevronDownIcon, UserCheck } from "lucide-react";
import { useState } from "react";

export default function ActionDropDownComp({ onAction, actionOptions}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-50 border border-gray-300 rounded-md shadow-xs shadow-gray-200 hover:bg-gray-100 px-2 items-center align-middle rounded-smcursor-pointer">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex py-0.5 w-full items-center justify-evenly pr-2 gap-1 cursor-pointer">
        <h2>Actions</h2>
        <ChevronDownIcon className="h-4 w-4 pl-2" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-2 w-full space-y-1 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
          {actionOptions.map((item) => (
            <button
              key={item.label}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  onAction(item.value);
                  setOpen(false);
                }
              }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium
                ${item.bg} ${item.text} ${item.hover}
                disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
