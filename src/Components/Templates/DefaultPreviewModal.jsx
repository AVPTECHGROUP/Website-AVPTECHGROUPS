import { X, Star, Database, Loader2 } from 'lucide-react'

export default function DefaultPreviewModal({ open, loading, template, typeMeta, onClose }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-gray-900/45 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full sm:w-[92vw] lg:w-[820px] max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-200 sticky top-0 bg-white z-10 shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {template ? `Default ${typeMeta?.shortLabel} Template` : 'No Default Template Set'}
            </h3>
            <div className="text-[10.5px] sm:text-xs text-gray-500 font-mono mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="truncate">GET /v1/print-templates/default?type={typeMeta?.key}</span>
              <span className="inline-flex items-center gap-1 text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-full font-sans text-[10px]">
                <Database className="w-2.5 h-2.5" /> cached
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 shrink-0 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-[340px] sm:h-[440px] flex flex-col">
            <div className="px-3 py-2 border-b border-gray-200 bg-white text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-purple-500" /> Active default template
            </div>
            <div className="flex-1 relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : template ? (
                <iframe title="default-preview" srcDoc={template.templateHtml} sandbox="" className="w-full h-full border-0 bg-white" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-center text-gray-400 text-xs sm:text-sm px-6">
                  No default template has been set for this type yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}