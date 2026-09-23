import { Printer, X } from "lucide-react";

export default function PrintConfirmCard({ isOpen, orderId, onPrint, onSkip }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onSkip}
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 pcm-anim">
        <style>{`
          @keyframes pcmIn {
            from { opacity: 0; transform: scale(.93) translateY(10px); }
            to   { opacity: 1; transform: scale(1)   translateY(0);    }
          }
          .pcm-anim { animation: pcmIn .18s ease-out forwards; }
        `}</style>

        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + text */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <Printer className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-1.5 pr-4">
            <h3 className="text-base font-bold text-gray-800">Order Confirmed!</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Order{" "}
              {orderId && (
                <span className="font-semibold text-gray-700">#{orderId}</span>
              )}{" "}
              has been confirmed and stock has been issued.
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Do you want to print the order slip now?
            </p>
            <p className="text-xs text-gray-400">
              Prints 3 copies — Accountant · Admin · Parent
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onPrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Yes, Print
          </button>
        </div>
      </div>
    </div>
  );
}