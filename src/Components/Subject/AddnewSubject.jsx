import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { createSubject, updateSubject } from "../../Api/Academics/Subject";
import { getSubjectCategoryLov } from "../../Api/Lov/ListOfValues";

export default function AddnewSubject({ subject, onSaved, onClose }) {
  const isEditMode = Boolean(subject?.id);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "",
    isActive: true,
  });

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [catsReady, setCatsReady] = useState(false);

  // ── 1. Fetch categories ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const data = await getSubjectCategoryLov();
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setCategories(list);
      } catch (err) {
        console.error("Failed to fetch categories:", err.message);
        setCategories([]);
      } finally {
        setCatLoading(false);
        setCatsReady(true);
      }
    };
    fetchCategories();
  }, []);

  // ── 2. Populate form on open / when categories arrive ────────────────────
  //
  // FIX 2 — Category auto-population
  // The list API sends `subject.category` as the LOV *label* (e.g. "Social Studies"),
  // while `<option value>` uses the LOV *value* key (e.g. "SOCIAL").
  // Strategy (in priority order):
  //   a) subject.category  → already the value key (detail/save API shape)
  //   b) match categories list by label (case-insensitive)   ← catches list API shape
  //   c) match categories list by value (case-insensitive)   ← defensive fallback
  //   d) uppercase the raw string                            ← last resort
  useEffect(() => {
    if (isEditMode && subject) {
      const rawCategory = subject.category || subject.category || "";

      let resolvedCategory = "";
      if (rawCategory) {
        const needle = rawCategory.toLowerCase();
        const matched = categories.find(
          (c) =>
            (c.label ?? "").toLowerCase() === needle ||
            (c.value ?? "").toLowerCase() === needle
        );
        resolvedCategory = matched?.value ?? rawCategory.toUpperCase();
      }

      // FIX 3 — Status resolution
      // Handles both API shapes:
      //   • list API   → subject.status = "ACTIVE" | "INACTIVE"  (string)
      //   • detail API → subject.isActive = true | false          (boolean)
      const resolvedActive =
        typeof subject.isActive === "boolean"
          ? subject.isActive
          : subject.status === "ACTIVE";

      setFormData({
        name: subject.name ?? "",
        code: subject.code ?? "",
        description: subject.description ?? "",
        category: resolvedCategory,
        isActive: resolvedActive,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        category: "",
        isActive: true,
      });
    }
    setErrors({});
    // Re-run once categories have loaded so the select shows the correct value
  }, [subject, catsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = "Name is required";
    if (!formData.code?.trim()) e.code = "Code is required";
    if (!formData.category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.value === "ACTIVE" }));
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // FIX 3 — Status payload
      // Send BOTH `isActive` (boolean) AND `status` (string) so the backend
      // accepts whichever field it expects, regardless of API shape.
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        category: formData.category,
        isActive: formData.isActive,                            // boolean shape
        status: formData.isActive ? "ACTIVE" : "INACTIVE",   // string shape
      };

      if (isEditMode) {
        await updateSubject(subject.id, payload);
        toast.success("Subject updated successfully!", {
          position: "top-right", autoClose: 3000,
          closeOnClick: true, pauseOnHover: true,
        });
      } else {
        await createSubject(payload);
        toast.success("Subject created successfully!", {
          position: "top-right", autoClose: 3000,
          closeOnClick: true, pauseOnHover: true,
        });
      }

      onSaved?.();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Operation failed";
      toast.error(msg, {
        position: "top-right", autoClose: 4000,
        closeOnClick: true, pauseOnHover: true,
      });
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────

  // Use createPortal to mount the modal directly to document.body
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white rounded-t-xl z-20">
          <h2 className="text-lg font-bold text-slate-800">
            {isEditMode ? "Edit Subject" : "Add New Subject"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Mathematics"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${errors.name
                  ? "border-red-300 focus:ring-red-300"
                  : "border-slate-200 focus:ring-indigo-300"
                }`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., MATH101"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${errors.code
                  ? "border-red-300 focus:ring-red-300"
                  : "border-slate-200 focus:ring-indigo-300"
                }`}
            />
            {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={catLoading}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors appearance-none bg-white disabled:opacity-60 disabled:cursor-not-allowed ${errors.category
                    ? "border-red-300 focus:ring-red-300"
                    : "border-slate-200 focus:ring-indigo-300"
                  }`}
              >
                <option value="">
                  {catLoading ? "Loading categories…" : "Select a category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.value ?? cat.id} value={cat.value ?? cat.id}>
                    {cat.label ?? cat.value}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
            {errors.category && (
              <p className="text-xs text-red-600 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description"
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors appearance-none bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                isEditMode ? "Update Subject" : "Save Subject"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Appends the modal directly to the end of the <body>
  );
}