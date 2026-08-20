// Lightweight Mustache-style merge-field renderer for print templates
// (the same convention TemplateEditorPanel already documents/uses for
// REPORT_CARD's {{#subjectMarks}} loop).
//
// Supported syntax:
//   {{field}}            -> simple value substitution (dot paths supported,
//                            e.g. {{teacher.name}})
//   {{#listKey}} ... {{/listKey}}
//                         -> repeats the block once per item in
//                            data[listKey]. Fields inside the block resolve
//                            against the current item first, falling back
//                            to the outer/root data if not found on the
//                            item itself.
//
// Unknown or missing tokens render as an empty string rather than throwing,
// so a template referencing a field the caller hasn't supplied yet doesn't
// break the whole document.

const SECTION_RE = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
const FIELD_RE = /{{\s*([\w.]+)\s*}}/g;

const resolveField = (key, scope, root) => {
    const source = scope && Object.prototype.hasOwnProperty.call(scope, key.split('.')[0]) ? scope : root;
    const value = key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), source);
    return value === undefined || value === null ? '' : String(value);
};

const renderFields = (str, scope, root) =>
    str.replace(FIELD_RE, (_, key) => resolveField(key, scope, root));

/**
 * Merge `data` into a print template's raw HTML.
 * @param {string} html - the template's templateHtml
 * @param {Record<string, any>} data - flat fields + array fields for loops
 * @returns {string} merged HTML, safe to drop into an iframe srcDoc or a
 *                    new print window's document.
 */
export const renderMergeTemplate = (html, data = {}) => {
    if (!html) return '';

    // Repeating sections first, so their inner {{field}} tokens don't get
    // accidentally resolved against the root scope before the loop runs.
    let out = html.replace(SECTION_RE, (_, listKey, block) => {
        const list = Array.isArray(data[listKey]) ? data[listKey] : [];
        return list.map((item) => renderFields(block, item, data)).join('');
    });

    out = renderFields(out, data, data);
    return out;
};

export default renderMergeTemplate;