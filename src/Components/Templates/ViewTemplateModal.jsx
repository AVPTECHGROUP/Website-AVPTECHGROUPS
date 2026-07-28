import { X, Trash2, Star, Pencil } from 'lucide-react'
import { fmtDate } from './templateTypesMeta'

export default function ViewTemplateModal({ open, template, typeMeta, busy, onClose, onEdit, onSetDefault, onDelete }) {
  if (!open || !template) return null

  return (
    <div
      className="fixed inset-0 bg-gray-900/45 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full sm:w-[92vw] lg:w-[760px] max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-200 sticky top-0 bg-white z-10 shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{template.templateName}</h3>
            <div className="text-[11px] sm:text-xs text-gray-500 font-mono mt-0.5">GET /v1/print-templates/{template.id}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 shrink-0 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
            <MetaItem label="Type" value={typeMeta?.shortLabel} pillClass="bg-gray-100 text-gray-600" />
            <MetaItem
              label="Status"
              value={template.isActive ? 'Active' : 'Inactive'}
              pillClass={template.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}
            />
            <MetaItem
              label="Default"
              value={template.isDefault ? 'Default' : 'No'}
              pillClass={template.isDefault ? 'bg-purple-50 text-purple-700' : undefined}
            />
            <MetaItem label="Last Updated" value={`${fmtDate(template.updatedAt)} · ${template.updatedBy || '—'}`} />
            <MetaItem label="Created By" value={template.createdBy || '—'} />
            <MetaItem label="Created At" value={fmtDate(template.createdAt)} />
          </div>

          <label className="block text-xs font-bold text-gray-800 mb-1.5">Rendered Preview</label>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-[280px] sm:h-[340px]">
            <iframe title="template-preview" srcDoc={template.templateHtml} sandbox="" className="w-full h-full border-0 bg-white" />
          </div>
        </div>

        {/* Footer Buttons - Flex-wrap for small mobile screens */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-2.5 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-gray-200 bg-white shrink-0">
          <button
            onClick={onDelete}
            disabled={template.isDefault || busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border border-gray-300 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={onSetDefault}
            disabled={template.isDefault || busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border border-gray-300 text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Star className="w-4 h-4" /> Set Default
          </button>
          <button
            onClick={onEdit}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>
    </div>
  )
}

function MetaItem({ label, value, pillClass }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">{label}</div>
      {pillClass ? (
        <span className={`inline-block text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${pillClass}`}>{value}</span>
      ) : (
        <div className="text-xs sm:text-[13px] font-semibold text-gray-900 truncate">{value}</div>
      )}
    </div>
  )
}