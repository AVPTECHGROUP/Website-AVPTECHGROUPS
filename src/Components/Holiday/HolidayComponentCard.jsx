import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function HolidayComponentCard({ 
  isOpen, 
  setIsOpen, 
  onSubmit,
  defaultValues = null, // For edit mode
  icon,
  title = "Add New Holiday",
  subtitle = "Configure academic calendar breaks",
  mode = "create", // 'create' or 'edit'
  loaderIsTrue
}) {
  const [formData, setFormData] = useState({
    academicYear: '',
    holidayName: '',
    fromDate: '',
    type: '',
    description: '',
    isOptional: false,
    isActive: true
  });

  const [errors, setErrors] = useState({});

  // Load default values when in edit mode
  useEffect(() => {
    if (defaultValues && isOpen) {
      setFormData({
        academicYear: defaultValues.academicYear || '',
        holidayName: defaultValues.holidayName || '',
        fromDate: defaultValues.fromDate || '',
        type: defaultValues.type || '',
        description: defaultValues.description || '',
        isOptional: defaultValues.isOptional || false,
        isActive: defaultValues.isActive !== undefined ? defaultValues.isActive : true
      });
    }
  }, [defaultValues, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Academic year is required';
    }

    if (!formData.holidayName.trim()) {
      newErrors.holidayName = 'Holiday name is required';
    }

    if (!formData.fromDate) {
      newErrors.fromDate = 'Date is required';
    }

    if (!formData.type) {
      newErrors.type = 'Holiday type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFormData({
      academicYear: '',
      holidayName: '',
      fromDate: '',
      type: '',
      description: '',
      isOptional: false,
      isActive: true
    });
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    }

    // Reset form only if in create mode
    if (mode === 'create') {
      setFormData({
        academicYear: '',
        holidayName: '',
        fromDate: '',
        type: '',
        description: '',
        isOptional: false,
        isActive: true
      });
      setErrors({});
    }
  };

  // Default icon if none provided
  const defaultIcon = (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              {icon || defaultIcon}
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 shrink-0"
            type="button"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 md:space-y-5 overflow-y-auto grow">

          {/* Academic Year */}
          <div>
            <label htmlFor="academicYear" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              id="academicYear"
              type="text"
              name="academicYear"
              placeholder="e.g., 2024-2025"
              value={formData.academicYear}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base placeholder:text-gray-400 ${
                errors.academicYear ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.academicYear && (
              <p className="text-red-500 text-xs mt-1">{errors.academicYear}</p>
            )}
          </div>

          {/* Holiday Name */}
          <div>
            <label htmlFor="holidayName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Holiday Name <span className="text-red-500">*</span>
            </label>
            <input
              id="holidayName"
              type="text"
              name="holidayName"
              placeholder="e.g., Winter Break"
              value={formData.holidayName}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base placeholder:text-gray-400 ${
                errors.holidayName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.holidayName && (
              <p className="text-red-500 text-xs mt-1">{errors.holidayName}</p>
            )}
          </div>

          {/* Date of holiday */}
          <div>
            <label htmlFor="fromDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Holiday Date <span className="text-red-500">*</span>
            </label>
            <input
              id="fromDate"
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base ${
                errors.fromDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fromDate && (
              <p className="text-red-500 text-xs mt-1">{errors.fromDate}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Holiday Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white text-gray-700 text-sm sm:text-base ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="">Select Type</option>
              <option value="NATIONAL">National</option>
              <option value="REGIONAL">Regional</option>
              <option value="RELIGIOUS">Religious</option>
              <option value="FESTIVAL">Festival</option>
              <option value="SCHOOL_EVENT">School Event</option>
              <option value="GOVERNMENT">Government</option>
              <option value="OPTIONAL">Optional</option>
              <option value="WEEKEND">Weekend</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter holiday details..."
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm sm:text-base placeholder:text-gray-400"
            />
          </div>

          {/* Optional Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="isOptional"
              type="checkbox"
              name="isOptional"
              checked={formData.isOptional}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isOptional" className="text-xs sm:text-sm font-medium text-gray-700">
              Optional Holiday
            </label>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-xs sm:text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t bg-gray-50 rounded-b-lg shrink-0">
          <button
            onClick={handleCancel}
            type="button"
            className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={loaderIsTrue}
            onClick={handleSubmit}
            type="button"
            className={`${loaderIsTrue ? "cursor-not-allowed bg-blue-400 hover:bg-blue-500":"bg-blue-600 hover:bg-blue-700"} w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white  rounded-lg transition-colors shadow-sm`}
          >
            {mode === 'edit' ? loaderIsTrue? 'Updating holiday...':'Update Holiday' : loaderIsTrue? 'Creating holiday ...':'Create Holiday'}
          </button>
        </div>
      </div>
    </div>
  );
}