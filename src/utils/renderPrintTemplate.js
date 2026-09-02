import { renderTemplate } from '../utils/TemplateStorage/Templateengine'

export function renderPrintTemplate(html, data = {}) {
  if (!html) return ''
  return renderTemplate(html, data)
}
