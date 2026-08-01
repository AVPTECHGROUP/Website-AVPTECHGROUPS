import { useSearchParams } from 'react-router-dom'
import { Award } from 'lucide-react'
import PrintTemplatesPage from '../../Components/Templates/PrintTemplatesPage'
import { CERTIFICATE_SUB_TYPES, TEMPLATE_TYPES } from '../../Components/Templates/templateTypesMeta'

const VALID_KEYS = CERTIFICATE_SUB_TYPES.map((c) => c.key)
const DEFAULT_KEY = 'CERTIFICATE'

export default function CertificateTemplates() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('type')
  const activeType = VALID_KEYS.includes(requested) ? requested : DEFAULT_KEY

  const handleSelect = (key) => {
    setSearchParams(key === DEFAULT_KEY ? {} : { type: key }, { replace: true })
  }

  return (
    <>
      {/* Certificate type selector — switches which certificate's templates
          (list, create/edit, default, preview) are shown below, all powered
          by the same PrintTemplatesPage used by the other template modules. */}
      <div className="w-full min-w-0 px-2 sm:px-3">
        <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Certificate Type
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mb-3.5">
            Pick which certificate you want to manage templates for.
          </p>

          {/* Scrolls horizontally on mobile (no wrap), wraps to multiple
              rows from sm and up once there's room to breathe. */}
          <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible -mx-1 px-1 pb-1 sm:pb-0">
            {CERTIFICATE_SUB_TYPES.map((c) => {
              const meta = TEMPLATE_TYPES[c.key]
              const Icon = meta?.icon || Award
              const isActive = c.key === activeType
              return (
                <button
                  key={c.key}
                  onClick={() => handleSelect(c.key)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-lg border text-xs sm:text-[12.5px] font-semibold whitespace-nowrap cursor-pointer transition-colors
                    ${isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {c.dropdownLabel}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* key={activeType} forces a full remount on switch, so each
          certificate type gets its own fresh list/editor/modal state
          instead of leaking state from the previously selected type. */}
      <PrintTemplatesPage key={activeType} type={activeType} />
    </>
  )
}