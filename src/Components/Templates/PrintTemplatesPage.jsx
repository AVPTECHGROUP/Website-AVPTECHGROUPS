import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Search, Plus, Eye, Pencil, Star, Trash2, ChevronRight,
  Layers, CheckCircle2, ChevronLeft, ChevronRight as ChevronRightIcon,
  Inbox, Loader2, Database, ArrowUp
} from 'lucide-react'
import { toast } from 'react-toastify'

import CardComponent from '../CommonComp/CardComponent'
import TemplateEditorPanel from './TemplateEditorPanel'
import ViewTemplateModal from './ViewTemplateModal'
import DefaultPreviewModal from './DefaultPreviewModal'
import { TEMPLATE_TYPES, fmtDate } from './templateTypesMeta'
import { cacheDefaultTemplate, clearCachedDefaultTemplate } from '../../utils/TemplateStorage/templateCache'

import {
  getPrintTemplates,
  createPrintTemplate,
  updatePrintTemplate,
  deletePrintTemplate,
  setDefaultPrintTemplate,
  getDefaultPrintTemplate,
} from '../../Api/PrintTemplate/PrintTemplatesApi'


// Icon-only action button — used on tablet widths (md–lg) and inside the mobile card list
function IconAction({ icon: Icon, label, onClick, disabled, colorClass }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent ${colorClass}`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  )
}

// Icon + label action button — used from 1024px (lg) upward, where there's room for the full name
function TextAction({ icon: Icon, label, onClick, disabled, colorClass }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? label : undefined}
      className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs cursor-pointer font-semibold whitespace-nowrap hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent ${colorClass}`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  )
}

export default function PrintTemplatesPage({ type }) {
  const typeMeta = TEMPLATE_TYPES[type]
  const TypeIcon = typeMeta?.icon || Layers

  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState('create')
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [saving, setSaving] = useState(false)

  const [viewingTemplate, setViewingTemplate] = useState(null)
  const [rowBusyId, setRowBusyId] = useState(null)

  const [defaultPreviewOpen, setDefaultPreviewOpen] = useState(false)
  const [defaultPreviewLoading, setDefaultPreviewLoading] = useState(false)
  const [defaultPreviewTemplate, setDefaultPreviewTemplate] = useState(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await getPrintTemplates(type)
      setTemplates(Array.isArray(data) ? data : [])
    } catch (err) {
      setLoadError(err.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchTemplates()
    setSearch('')
    setStatusFilter('ALL')
    setPage(1)
  }, [fetchTemplates])

  const defaultTemplate = useMemo(() => templates.find((t) => t.isDefault) || null, [templates])

  // Keep the localStorage cache in sync with whichever template the backend
  // currently considers "default" for this type — this runs on first load,
  // after Set Default, after editing the default template's HTML, etc.
  useEffect(() => {
    if (!type) return
    if (defaultTemplate) {
      cacheDefaultTemplate(type, defaultTemplate)
    } else {
      clearCachedDefaultTemplate(type)
    }
  }, [type, defaultTemplate])

  const stats = useMemo(() => ({
    total: templates.length,
    active: templates.filter((t) => t.isActive).length,
    defaultSet: !!defaultTemplate,
  }), [templates, defaultTemplate])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return templates.filter((t) => {
      const matchesSearch = !q || t.templateName?.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' ? t.isActive : !t.isActive)
      return matchesSearch && matchesStatus
    })
  }, [templates, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // ---------------- Create / Edit ----------------
  const openCreate = () => {
    setEditorMode('create')
    setEditingTemplate(null)
    setEditorOpen(true)
  }

  const openEdit = (t) => {
    setEditorMode('edit')
    setEditingTemplate(t)
    setViewingTemplate(null)
    setEditorOpen(true)
  }

  const handleSaveEditor = async ({ templateName, templateHtml, isDefault }) => {
    setSaving(true)
    try {
      if (editorMode === 'create') {
        await createPrintTemplate({
          templateType: type,
          templateName,
          templateHtml,
          isDefault,
        })
        toast.success('Template created successfully')
      } else {
        await updatePrintTemplate(editingTemplate.id, {
          templateType: type,
          templateName,
          templateHtml,
          isDefault,
        })
        toast.success('Template updated successfully')
      }
      setEditorOpen(false)
      await fetchTemplates()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // ---------------- View ----------------
  const openView = (t) => setViewingTemplate(t)
  const closeView = () => setViewingTemplate(null)

  // ---------------- Set default / delete ----------------
  const handleSetDefault = async (t) => {
    setRowBusyId(t.id)
    try {
      await setDefaultPrintTemplate(t.id)
      toast.success(`"${t.templateName}" set as default`)
      await fetchTemplates()
      if (viewingTemplate?.id === t.id) {
        setViewingTemplate((prev) => (prev ? { ...prev, isDefault: true } : prev))
      }
    } catch (err) {
      toast.error(err.message || 'Failed to set default template')
    } finally {
      setRowBusyId(null)
    }
  }

  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null)

  const requestDelete = (t) => {
    if (t.isDefault) {
      toast.error('Cannot delete the current default template.')
      return
    }
    setConfirmDeleteTarget(t)
  }

  const handleDelete = async () => {
    const t = confirmDeleteTarget
    if (!t) return
    setConfirmDeleteTarget(null)
    setRowBusyId(t.id)
    try {
      await deletePrintTemplate(t.id)
      toast.success('Template deleted')
      closeView()
      await fetchTemplates()
    } catch (err) {
      toast.error(err.message || 'Failed to delete template')
    } finally {
      setRowBusyId(null)
    }
  }

  // ---------------- Default preview ----------------
  const openDefaultPreview = async () => {
    setDefaultPreviewOpen(true)
    setDefaultPreviewLoading(true)
    try {
      const data = await getDefaultPrintTemplate(type)
      setDefaultPreviewTemplate(data || defaultTemplate)
    } catch {
      // fall back to whatever we already have locally (cache-friendly)
      setDefaultPreviewTemplate(defaultTemplate)
    } finally {
      setDefaultPreviewLoading(false)
    }
  }

  // Tablet & mini-laptop (md–xl, up to 1279px): icons only, name shows on hover via title.
  // Large laptop and up (xl, 1280px+ — covers 1440px): icon + label.
  const rowActions = (t) => (
    <>
      <div className="hidden md:flex xl:hidden items-center justify-center gap-0.5">
        <IconAction icon={Eye} label="View" onClick={() => openView(t)} colorClass="text-gray-500" />
        <IconAction icon={Pencil} label="Edit" onClick={() => openEdit(t)} colorClass="text-blue-600" />
        <IconAction
          icon={Star}
          label="Set Default"
          onClick={() => handleSetDefault(t)}
          disabled={t.isDefault || rowBusyId === t.id}
          colorClass="text-purple-600"
        />
        <IconAction
          icon={Trash2}
          label={t.isDefault ? 'Cannot delete the current default template.' : 'Delete'}
          onClick={() => requestDelete(t)}
          disabled={t.isDefault || rowBusyId === t.id}
          colorClass="text-red-600"
        />
      </div>
      <div className="hidden xl:flex items-center justify-center gap-0.5">
        <TextAction icon={Eye} label="View" onClick={() => openView(t)} colorClass="text-gray-500" />
        <TextAction icon={Pencil} label="Edit" onClick={() => openEdit(t)} colorClass="text-blue-600" />
        <TextAction
          icon={Star}
          label="Set Default"
          onClick={() => handleSetDefault(t)}
          disabled={t.isDefault || rowBusyId === t.id}
          colorClass="text-purple-600"
        />
        <TextAction
          icon={Trash2}
          label="Delete"
          onClick={() => requestDelete(t)}
          disabled={t.isDefault || rowBusyId === t.id}
          colorClass="text-red-600"
        />
      </div>
    </>
  )

  return (
    <div className="w-full min-w-0 px-2 sm:px-3 relative min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs sm:text-[12.5px] text-gray-500 mb-1.5">
      </div>
      <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-[26px] font-extrabold text-gray-900 tracking-tight mb-4 sm:mb-6">
        {typeMeta?.label}
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 w-full lg:max-w-2xl xl:max-w-4xl">
        <CardComponent
          IconName={Layers}
          keyName="total templates"
          val={loading ? '—' : stats.total}
          iconTxColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <CardComponent
          IconName={CheckCircle2}
          keyName="active templates"
          val={loading ? '—' : stats.active}
          iconTxColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <CardComponent
          IconName={Star}
          keyName="default set?"
          val={loading ? '—' : (stats.defaultSet ? 'Yes' : 'No')}
          iconTxColor={stats.defaultSet ? 'text-purple-600' : 'text-red-600'}
          iconBgColor={stats.defaultSet ? 'bg-purple-50' : 'bg-red-50'}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 mb-4">
        <div className="relative flex-1 min-w-0 sm:min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by template name..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
          />
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            onClick={openCreate}
            className="flex-1 sm:flex-none inline-flex items-center cursor-pointer justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> <span className="hidden xs:inline">Create Template</span><span className="xs:hidden">Create Template</span>
          </button>
          <button
            onClick={openDefaultPreview}
            className="flex-1 sm:flex-none inline-flex items-center justify-center cursor-pointer gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <Eye className="w-4 h-4" /> <span className="hidden xs:inline">Preview Default</span><span className="xs:hidden">Preview</span>
          </button>
        </div>
      </div>

      {/* ===================== MOBILE / TABLET-NARROW: CARD LIST (below md) ===================== */}
      <div className="md:hidden bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            Loading templates…
          </div>
        ) : loadError ? (
          <div className="px-5 py-12 text-center text-red-500 text-sm">{loadError}</div>
        ) : paginated.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">
            <Inbox className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            No templates match your search.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {paginated.map((t) => (
              <li key={t.id} className="p-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-[9px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <TypeIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 font-semibold text-gray-900 text-[13.5px]">
                      <span className="truncate">{t.templateName}</span>
                      {t.isDefault && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0">
                          <Star className="w-2.5 h-2.5" /> Default
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-gray-400 mt-0.5">ID #{t.id}</div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11.5px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md whitespace-nowrap">
                        {typeMeta?.shortLabel}
                      </span>
                      <span className={`text-[10.5px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${t.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="text-[11.5px] text-gray-500 mt-2">
                      Updated {fmtDate(t.updatedAt)} · by {t.updatedBy || '—'}
                    </div>

                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                      <IconAction icon={Eye} label="View" onClick={() => openView(t)} colorClass="text-gray-500" />
                      <IconAction icon={Pencil} label="Edit" onClick={() => openEdit(t)} colorClass="text-blue-600" />
                      <IconAction
                        icon={Star}
                        label="Set Default"
                        onClick={() => handleSetDefault(t)}
                        disabled={t.isDefault || rowBusyId === t.id}
                        colorClass="text-purple-600"
                      />
                      <IconAction
                        icon={Trash2}
                        label={t.isDefault ? 'Cannot delete the current default template.' : 'Delete'}
                        onClick={() => requestDelete(t)}
                        disabled={t.isDefault || rowBusyId === t.id}
                        colorClass="text-red-600"
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination (mobile) */}
        <div className="flex flex-col items-stretch gap-3 px-4 py-3.5 border-t border-gray-200 text-[12.5px] text-gray-500">
          <span>Showing {filtered.length ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              Rows:
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                className="border border-gray-300 rounded-md px-2 py-1 text-[12.5px] outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="w-7 h-7 rounded-md border border-gray-300 cursor-pointer flex items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-md border border-blue-600 bg-blue-600 text-white font-semibold flex items-center justify-center">
                {currentPage}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="w-7 h-7 rounded-md border border-gray-300 cursor-pointer flex items-center justify-center disabled:opacity-40"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== TABLET / LAPTOP / DESKTOP: TABLE (md and up) ===================== */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[560px] table-fixed">
            <colgroup>
              <col className="w-[38%] sm:w-[34%] lg:w-[30%]" />
              <col className="hidden lg:table-column lg:w-[14%]" />
              <col className="w-[16%] sm:w-[14%] lg:w-[12%]" />
              <col className="hidden sm:table-column sm:w-[22%] lg:w-[20%]" />
              <col className="w-auto" />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left align-middle text-[11px] font-bold uppercase tracking-wide text-gray-400 px-4 lg:px-5 py-3">
                  <span className="inline-flex items-center gap-1">Template Name <ArrowUp className="w-2.5 h-2.5 text-gray-300" /></span>
                </th>
                <th className="hidden lg:table-cell text-left align-middle text-[11px] font-bold uppercase tracking-wide text-gray-400 px-4 lg:px-5 py-3">Type</th>
                <th className="text-left align-middle text-[11px] font-bold uppercase tracking-wide text-gray-400 px-4 lg:px-5 py-3">Status</th>
                <th className="hidden sm:table-cell text-left align-middle text-[11px] font-bold uppercase tracking-wide text-gray-400 px-4 lg:px-5 py-3">Last Updated</th>
                <th className="text-center align-middle text-[11px] font-bold uppercase tracking-wide text-gray-400 px-4 lg:px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading templates…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-red-500 text-sm">{loadError}</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <Inbox className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                    No templates match your search.
                  </td>
                </tr>
              ) : (
                paginated.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70">
                    <td className="align-middle px-4 lg:px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-[9px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-[13.5px]">
                            <span className="truncate">{t.templateName}</span>
                            {t.isDefault && (
                              <span className="hidden lg:inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0">
                                <Star className="w-2.5 h-2.5" /> Default
                              </span>
                            )}
                          </div>
                          <div className="text-[11.5px] text-gray-400 mt-0.5">ID #{t.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell align-middle px-4 lg:px-5 py-3.5">
                      <span className="text-[11.5px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md whitespace-nowrap">
                        {typeMeta?.shortLabel}
                      </span>
                    </td>
                    <td className="align-middle px-4 lg:px-5 py-3.5">
                      <span className={`text-[10.5px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${t.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell align-middle px-4 lg:px-5 py-3.5 whitespace-nowrap">
                      <div className="text-gray-800 font-medium text-[13px]">{fmtDate(t.updatedAt)}</div>
                      <div className="hidden lg:block text-gray-400 text-[11.5px] mt-0.5">by {t.updatedBy || '—'}</div>
                    </td>
                    <td className="align-middle px-4 lg:px-5 py-3.5 text-center">
                      {rowActions(t)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (table) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 lg:px-5 py-3.5 border-t border-gray-200 text-[12.5px] text-gray-500">
          <span>Showing {filtered.length ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              Rows per page:
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                className="border border-gray-300 rounded-md px-2 py-1 text-[12.5px] outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-md border cursor-pointer border-blue-600 bg-blue-600 text-white font-semibold flex items-center justify-center">
                {currentPage}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center disabled:opacity-40"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Default template quick banner */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl shadow-sm px-4 sm:px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <Star className="w-4 h-4 text-purple-600 shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[13.5px] text-gray-900">Current default template</span>
              <span className="inline-flex items-center gap-1 text-gray-400 text-[11px] font-semibold border border-gray-200 px-1.5 py-0.5 rounded-full">
                <Database className="w-3 h-3" /> cached
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5 truncate">
              {loading ? '—' : (defaultTemplate ? `${defaultTemplate.templateName} · ${typeMeta?.shortLabel}` : `No default template set for this type`)}
            </div>
          </div>
        </div>
        <button
          onClick={openDefaultPreview}
          className="inline-flex items-center cursor-pointer justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0 w-full sm:w-auto"
        >
          <Eye className="w-4 h-4" /> View full preview
        </button>
      </div>

      {/* Panels / modals */}
      <TemplateEditorPanel
        open={editorOpen}
        mode={editorMode}
        typeMeta={typeMeta}
        initialData={editingTemplate}
        saving={saving}
        onClose={() => !saving && setEditorOpen(false)}
        onSave={handleSaveEditor}
      />

      <ViewTemplateModal
        open={!!viewingTemplate}
        template={viewingTemplate}
        typeMeta={typeMeta}
        busy={rowBusyId === viewingTemplate?.id}
        onClose={closeView}
        onEdit={() => openEdit(viewingTemplate)}
        onSetDefault={() => handleSetDefault(viewingTemplate)}
        onDelete={() => requestDelete(viewingTemplate)}
      />

      <DefaultPreviewModal
        open={defaultPreviewOpen}
        loading={defaultPreviewLoading}
        template={defaultPreviewTemplate}
        typeMeta={typeMeta}
        onClose={() => setDefaultPreviewOpen(false)}
      />

      {/* Delete confirmation popup (replaces native browser confirm) */}
      {confirmDeleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900">Delete template?</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                  You're about to delete <span className="font-semibold text-gray-700">"{confirmDeleteTarget.templateName}"</span>. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                onClick={() => setConfirmDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm cursor-pointer font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm cursor-pointer font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}