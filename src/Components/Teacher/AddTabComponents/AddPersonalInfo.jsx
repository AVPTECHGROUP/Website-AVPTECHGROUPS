import React, { useState } from 'react';

const AddPersonalInfo = ({ formData, setFormData, handleInputChange }) => {
    const [enabled, setEnabled] = useState(false);

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
                            <label htmlFor="mobile" className='block font-semibold text-gray-600 text-sm mb-2'>
                                Mobile Number<span className="text-red-600 ml-1">*</span>
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                placeholder='Mobile number'
                                className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                required
                            />
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
                                className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
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

                {/* Professional Details Section */}
                <div>
                    <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                        <i className="fa-solid fa-briefcase text-xl lg:text-2xl text-blue-500 mr-3"></i>
                        <h2 className='text-xl font-medium text-gray-700'>Professional Details</h2>
                    </div>

                    <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="employeeCode" className='block font-semibold text-gray-600 text-sm mb-2'>
                                Employee Code
                            </label>
                            <input
                                type="text"
                                name="employeeCode"
                                value={formData.employeeCode}
                                onChange={handleInputChange}
                                placeholder='Auto-generated if empty'
                                className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="highestQualification" className='block font-semibold text-gray-600 text-sm mb-2'>
                                Highest Qualification
                            </label>
                            <input
                                type="text"
                                name="highestQualification"
                                value={formData.highestQualification}
                                onChange={handleInputChange}
                                placeholder='Highest Qualification'
                                className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>

                        <div>
                            <label htmlFor="experience" className='block font-semibold text-gray-600 text-sm mb-2'>
                                Experience (Years)
                            </label>
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={(e) => {
                                    const value = Math.max(0, parseInt(e.target.value) || 0);
                                    setFormData(prev => ({ ...prev, experience: value }));
                                }}
                                placeholder='0'
                                className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="joiningDate" className='block font-semibold text-gray-600 text-sm mb-2'>
                                Date of Joining<span className="text-red-600 ml-1">*</span>
                            </label>
                            <input
                                type="date"
                                name="joiningDate"
                                value={formData.joiningDate}
                                onChange={handleInputChange}
                                className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* System Access Section */}
                <div>
                    <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                        <i className="fa-solid fa-gear text-xl lg:text-2xl text-blue-500 mr-3"></i>
                        <h2 className='text-xl font-medium text-gray-700'>System Access</h2>
                    </div>

                    <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="loginEmail" className='block font-semibold text-gray-600 text-sm mb-2'>
                                Login Email/Username
                            </label>
                            <input
                                type="email"
                                name="loginEmail"
                                value={formData.loginEmail}
                                onChange={handleInputChange}
                                placeholder='Email/username'
                                className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className='block font-semibold text-gray-600 text-sm mb-2'>
                                Role
                            </label>
                            <input
                                readOnly
                                type="text"
                                name="role"
                                placeholder='Teacher'
                                value='Teacher'
                                className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none cursor-not-allowed'
                            />
                        </div>

                        <div>
                            <label htmlFor="accountStatus" className='block font-semibold text-gray-600 text-sm mb-2'>
                                Account Status
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setEnabled(!enabled);
                                    setFormData(prev => ({ ...prev, accountStatus: !enabled }));
                                }}
                                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? "bg-blue-500" : "bg-gray-300"
                                    }`}
                            >
                                <div
                                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default AddPersonalInfo;