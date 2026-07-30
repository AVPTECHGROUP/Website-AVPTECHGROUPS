// ─────────────────────────────────────────────────────────────────────────
// Caches the "default" print template (per template type) in localStorage
// so screens like the Student Report Card can render instantly without
// hitting the API every time, and still work even if the network call
// to fetch the default template fails.
//
// Cache key pattern: schoolspine_default_template_<TYPE>
//   e.g. schoolspine_default_template_REPORT_CARD
// ─────────────────────────────────────────────────────────────────────────

const CACHE_PREFIX = 'schoolspine_default_template_'

/**
 * Save/overwrite the cached default template for a given template type.
 * Call this right after a "Set as Default" action succeeds, and also
 * whenever the templates list is (re)loaded so the cache stays in sync
 * with whatever the backend currently considers default.
 */
export function cacheDefaultTemplate(type, template) {
  if (!type || !template) return
  try {
    const payload = {
      id: template.id,
      templateType: template.templateType || type,
      templateName: template.templateName,
      templateHtml: template.templateHtml,
      isDefault: true,
      updatedAt: template.updatedAt,
      cachedAt: new Date().toISOString(),
    }
    localStorage.setItem(CACHE_PREFIX + type, JSON.stringify(payload))
  } catch (err) {
    console.error('Failed to cache default template:', err)
  }
}

/**
 * Read the cached default template for a given template type.
 * Returns null if nothing has been cached yet (e.g. no default set,
 * or this browser has never loaded the Templates screen).
 */
export function getCachedDefaultTemplate(type) {
  if (!type) return null
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + type)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Failed to read cached default template:', err)
    return null
  }
}

/** Remove the cached default template for a given type (e.g. no default left). */
export function clearCachedDefaultTemplate(type) {
  if (!type) return
  try {
    localStorage.removeItem(CACHE_PREFIX + type)
  } catch (err) {
    console.error('Failed to clear cached default template:', err)
  }
}