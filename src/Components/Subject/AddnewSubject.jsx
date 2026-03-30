import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createSubject, updateSubject } from "../../Api/subject";
import { getSubjectCategoryLov } from "../../Api/ListOfValues";

export default function AddnewSubject({ subject, onSaved, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    categoryValue: "",
    isActive: true,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = subject?.id;
  const title = isEditMode ? "Edit Subject" : "Add New Subject";

  /* Fetch categories on mount */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getSubjectCategoryLov();
        const categoryList = Array.isArray(data) ? data : data?.data || [];
        setCategories(categoryList);
      } catch (err) {
        console.error("Failed to fetch categories:", err.message);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  /* Populate form when editing */
  useEffect(() => {
    if (isEditMode && subject) {
      setFormData({
        name: subject.name || "",
        code: subject.code || "",
        description: subject.description || "",
        categoryValue: subject.categoryValue || "",
        isActive: subject.isActive !== false,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        categoryValue: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [subject]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.code?.trim()) newErrors.code = "Code is required";
    if (!formData.categoryValue) newErrors.categoryValue = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.value === "ACTIVE",
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        categoryValue: formData.categoryValue,
        isActive: formData.isActive,
      };

      if (isEditMode) {
        await updateSubject(subject.id, payload);
        toast.success("Subject updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
        });
      } else {
        await createSubject(payload);
        toast.success("Subject created successfully!", {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }

      onSaved?.();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Operation failed";
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 4000,
        closeOnClick: true,
        pauseOnHover: true,
      });
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-200 bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Mathematics"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.name
                    ? "border-red-300 focus:ring-red-300"
                    : "border-slate-200 focus:ring-indigo-300"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., MATH101"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.code
                    ? "border-red-300 focus:ring-red-300"
                    : "border-slate-200 focus:ring-indigo-300"
                }`}
              />
              {errors.code && (
                <p className="text-xs text-red-600 mt-1">{errors.code}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                name="categoryValue"
                value={formData.categoryValue}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors appearance-none bg-white ${
                  errors.categoryValue
                    ? "border-red-300 focus:ring-red-300"
                    : "border-slate-200 focus:ring-indigo-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value || cat.id} value={cat.value || cat.id}>
                    {cat.label || cat.value}
                  </option>
                ))}
              </select>
              {errors.categoryValue && (
                <p className="text-xs text-red-600 mt-1">{errors.categoryValue}</p>
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
                rows="3"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors resize-none"
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status *
              </label>
              <select
                value={formData.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors appearance-none bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Subject"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
