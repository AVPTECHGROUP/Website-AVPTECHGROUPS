import React from 'react';
import { GraduationCap } from 'lucide-react';

const AddClassDetails = ({ formData, setFormData, handleInputChange }) => {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Class Assignment</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class
                    </label>
                    <input
                        type="text"
                        name="class"
                        value={formData.class || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter class"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section
                    </label>
                    <input
                        type="text"
                        name="section"
                        value={formData.section || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter section"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                    </label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter subject"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year
                    </label>
                    <input
                        type="text"
                        name="academicYear"
                        value={formData.academicYear || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 2024-2025"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                </label>
                <textarea
                    name="classNotes"
                    value={formData.classNotes || ''}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter any additional notes about class assignment"
                />
            </div>
        </div>
    );
};

export default AddClassDetails;
