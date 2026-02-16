import React, { useState } from 'react';

const AddStudentDetails = ({ formData, setFormData, handleInputChange }) => {
    return (
        <div className="space-y-6">
            {/* Personal Details Section */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-user text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Personal Details</h2>
                </div>

                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="name" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Full Name<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder='Enter full name'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="gender" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Gender<span className="text-red-600 ml-1">*</span>
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="dob" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Date of Birth<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="admissionNumber" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Admission Number
                        </label>
                        <input
                            type="text"
                            name="admissionNumber"
                            value={formData.admissionNumber}
                            onChange={handleInputChange}
                            placeholder='Auto-generated if left empty'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Leave empty for auto-generation
                        </p>
                    </div>

                    <div>
                        <label htmlFor="admissionDate" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Date of Admission<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input
                            type="date"
                            name="admissionDate"
                            value={formData.admissionDate}
                            onChange={handleInputChange}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Status<span className="text-red-600 ml-1">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(prev => ({ 
                                    ...prev, 
                                    status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' 
                                }));
                            }}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                formData.status === 'ACTIVE' ? "bg-green-500" : "bg-red-400"
                            }`}
                        >
                            <div
                                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                                    formData.status === 'ACTIVE' ? "translate-x-6" : "translate-x-0"
                                }`}
                            />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.status === 'ACTIVE' ? (
                                <span className="text-green-600 font-medium">● Active</span>
                            ) : (
                                <span className="text-red-600 font-medium">● Inactive</span>
                            )}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="mobile" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Mobile Number<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            placeholder='10 digit mobile number'
                            maxLength={10}
                            pattern="[0-9]{10}"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Must be exactly 10 digits
                        </p>
                    </div>

                    <div>
                        <label htmlFor="email" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder='Enter email address'
                            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Valid email format required if provided
                        </p>
                    </div>

                    <div className="lg:col-span-2">
                        <label htmlFor="address" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Current Address
                        </label>
                        <textarea
                            rows={4}
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder='Enter residential address'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>
                </div>
            </div>

            {/* Parent/Guardian Details Section */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-users text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Parent/Guardian Details</h2>
                </div>

                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="fatherName" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Father's Name
                        </label>
                        <input
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleInputChange}
                            placeholder="Enter father's name"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>

                    <div>
                        <label htmlFor="motherName" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Mother's Name
                        </label>
                        <input
                            type="text"
                            name="motherName"
                            value={formData.motherName}
                            onChange={handleInputChange}
                            placeholder="Enter mother's name"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>

                    <div>
                        <label htmlFor="emergencyContact" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Emergency Contact Number
                        </label>
                        <input
                            type="tel"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            placeholder='10 digit emergency contact'
                            maxLength={10}
                            pattern="[0-9]{10}"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Must be exactly 10 digits if provided
                        </p>
                    </div>
                </div>
            </div>

            {/* Additional Requirements Section */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-cog text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Additional Requirements</h2>
                </div>

                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="hostelRequired" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Hostel Required
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(prev => ({ ...prev, hostelRequired: !prev.hostelRequired }));
                            }}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                formData.hostelRequired ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        >
                            <div
                                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                                    formData.hostelRequired ? "translate-x-6" : "translate-x-0"
                                }`}
                            />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.hostelRequired ? 'Hostel accommodation enabled' : 'Hostel accommodation disabled'}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="transportRequired" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Transport Required
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(prev => ({ ...prev, transportRequired: !prev.transportRequired }));
                            }}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                formData.transportRequired ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        >
                            <div
                                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                                    formData.transportRequired ? "translate-x-6" : "translate-x-0"
                                }`}
                            />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.transportRequired ? 'School transport enabled' : 'School transport disabled'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentDetails;