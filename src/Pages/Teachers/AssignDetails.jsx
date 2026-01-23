import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTeacherById, updateTeacher } from "../../utils/allTeachers";

function AssignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [formData, setFormData] = useState({
    classes: [],
    subjects: [],
    salaryType: "Monthly",
    basicSalary: "",
    totalAllowances: "",
    payroll: "Included"
  });

  useEffect(() => {
    const data = getTeacherById(id);
    if (data) {
      setTeacher(data);
      setFormData({
        classes: data.classes?.join(", ") || "",
  subjects: data.subjects?.join(", ") || "",
  salaryType: data.salaryType || "Monthly",
  basicSalary: data.basicSalary || "",
  totalAllowances: data.totalAllowances || "",
  payroll: data.payroll || "Included"
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = () => {
    const updatedTeacher = {
      ...teacher,
      classes: formData.classes.split(",").map(c => c.trim()),
      subjects: formData.subjects.split(",").map(s => s.trim()),
      salaryType: formData.salaryType,
      basicSalary: formData.basicSalary,
      totalAllowances: formData.totalAllowances,
      payroll: formData.payroll
    };
    updateTeacher(updatedTeacher);
    navigate("/teachers");
  };

  if (!teacher) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Assign Details
          </h1>
          <p className="text-sm sm:text-base text-blue-600">
            Enter the details below to assign classes and salary for {teacher.name}.
          </p>
        </div>
        <button
          onClick={() => navigate("/teachers")}
          className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 self-start sm:self-auto"
        >
          Cancel
        </button>
      </div>

      {/* Academic Details Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 pb-3 border-b border-gray-200">
          Academic Details
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Classes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classes Assigned <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="classes"
              placeholder="e.g., 1, 2, 3"
              value={formData.classes}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subjects"
              placeholder="e.g., Math, Physics, Chemistry"
              value={formData.subjects}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Salary Details Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 pb-3 border-b border-gray-200">
          Salary Details
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Salary Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary Type <span className="text-red-500">*</span>
            </label>
            <select
              name="salaryType"
              value={formData.salaryType}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 cursor-pointer text-sm sm:text-base"
            >
              <option value="Monthly">Monthly</option>
              <option value="Hourly">Hourly</option>
            </select>
          </div>

          {/* Basic Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Basic Salary <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="basicSalary"
              placeholder="Enter basic salary"
              value={formData.basicSalary}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

          {/* Total Allowances */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Allowances
            </label>
            <input
              type="number"
              name="totalAllowances"
              placeholder="Enter total allowances"
              value={formData.totalAllowances}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Payroll Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payroll Status <span className="text-red-500">*</span>
            </label>
            <select
              name="payroll"
              value={formData.payroll}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 cursor-pointer text-sm sm:text-base"
            >
              <option value="Included">Included</option>
              <option value="Not Included">Not Included</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 sm:mt-6">
        <button
          onClick={() => navigate("/teachers")}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base order-1 sm:order-2"
        >
          Save Assigned Details
        </button>
      </div>
    </div>
  );
}

export default AssignDetails;