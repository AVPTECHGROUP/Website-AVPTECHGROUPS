import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function Toast({ toast }) {
  if (!toast) return null

  return (
    <div
      className={`fixed bottom-5 right-4 left-4 sm:left-auto sm:right-6 z-[300]
        flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl
        text-white text-sm font-semibold
        transition-all duration-200
        ${toast.isError ? 'bg-red-900' : 'bg-gray-900'}`}
    >
      {toast.isError ? (
        <AlertCircle className="w-4.5 h-4.5 text-red-300 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
      )}
      <span className="truncate">{toast.msg}</span>
    </div>
  )
}
