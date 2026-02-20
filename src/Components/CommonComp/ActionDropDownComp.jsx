import { ChevronDownIcon, UserCheck } from "lucide-react";

export default function ActionDropDownComp({ onAction, actionOptions }) {
  return (
 <div className="flex justify-center w-full">
  <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg border border-gray-200">
    {actionOptions.map((item, index) => (
      <button
        key={item.label}
        disabled={item.disabled}
        onClick={() => {
          if (!item.disabled) onAction(item.value);
        }}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
          transition-all duration-150 cursor-pointer
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
