import { useEffect, useState } from 'react'
import { X, Check, Eye, Loader2 } from 'lucide-react'
import { defaultHtmlStub } from './templateTypesMeta'

export default function TemplateEditorPanel({ open, mode, typeMeta, initialData, saving, onClose, onSave }) {
  const [name, setName] = useState('')
  const [html, setHtml] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialData) {
      setName(initialData.templateName || '')
      setHtml(initialData.templateHtml || '')
      setIsDefault(!!initialData.isDefault)
    } else {
      setName('')
      setHtml(defaultHtmlStub(typeMeta?.key))
      setIsDefault(false)
    }
    setNameError('')
  }, [open, mode, initialData, typeMeta])

  if (!open) return null

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Please enter a template name')
      return
    }
    onSave({ templateName: name.trim(), templateHtml: html, isDefault })
  }

  return (
    <div className="absolute inset-0 z-30 bg-white rounded-2xl border border-gray-200 shadow-lg flex flex-col min-h-[750px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 bg-white shrink-0">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
            {mode === 'create' ? 'Create Template' : 'Edit Template'}
          </h3>
          <div className="text-[11px] sm:text-xs text-gray-500 font-mono mt-0.5">
            {mode === 'create' ? 'POST /v1/print-templates' : `PUT /v1/print-templates/${initialData?.id ?? ''}`}
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={saving}
          className="w-8 h-8 shrink-0 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body - Stacked on Mobile, Split 2-Column on Desktop */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-gray-50/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 h-full">
          
          {/* Left Column: Form */}
          <div className="min-w-0 flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (nameError) setNameError('') }}
                placeholder="e.g. Standard Report Card"
                className={`w-full px-3 py-2.5 border rounded-lg text-xs sm:text-sm outline-none transition-shadow
                  ${nameError ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`}
              />
              {nameError && <p className="text-[11px] text-red-600 font-medium mt-1">{nameError}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Template Type <span className="font-normal text-gray-400">(locked to module)</span>
              </label>
              <input
                disabled
                value={typeMeta?.shortLabel || ''}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm bg-gray-50 text-gray-400 font-medium"
              />
            </div>

            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-3 gap-3">
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-gray-800">Set as Default</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Active template used at print time</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isDefault}
                onClick={() => setIsDefault((v) => !v)}
                className={`relative shrink-0 w-[42px] h-6 rounded-full transition-colors cursor-pointer ${isDefault ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${isDefault ? 'translate-x-[18px]' : ''}`} />
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-[260px]">
              <label className="block text-xs font-bold text-gray-800 mb-1.5">Template HTML</label>
              <textarea
                spellCheck={false}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full flex-1 min-h-[220px] lg:min-h-[300px] resize-y font-mono text-[12px] sm:text-[12.5px] leading-relaxed bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-3.5 outline-none focus:border-blue-500"
              />
              <div className="font-mono text-[10.5px] sm:text-[11px] text-gray-400 bg-gray-50 border border-dashed border-gray-300 px-2.5 py-2 rounded-md mt-2">
                // Rendered with merge fields like {'{{studentName}}'}
              </div>
              {typeMeta?.key === 'REPORT_CARD' && (
                <div className="text-[10.5px] sm:text-[11px] text-amber-700 bg-amber-50 border border-dashed border-amber-300 px-2.5 py-2 rounded-md mt-2 leading-relaxed">
                  <b>Subjects:</b> wrap a row in {'{{#subjectMarks}} ... {{/subjectMarks}}'} to repeat it for every subject returned by the API.
                  <br />
                  <b>Note:</b> don't add a remarks or signature section here — the report card screen already shows editable Teacher/Principal remarks and signature lines below whatever template is used.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="min-w-0 flex flex-col bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-xs font-bold text-gray-800 mb-1.5">Live Preview</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex flex-col flex-1 min-h-[320px]">
              <div className="px-3 py-2 border-b border-gray-200 bg-white text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                <Eye className="w-3.5 h-3.5 text-blue-600" /> Rendered output
              </div>
              <iframe
                title="live-preview"
                srcDoc={html}
                sandbox=""
                className="flex-1 w-full border-0 bg-white"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2.5 px-4 sm:px-6 py-3.5 border-t border-gray-200 bg-white shrink-0">
        <button
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save Template
        </button>
      </div>
    </div>
  )
}