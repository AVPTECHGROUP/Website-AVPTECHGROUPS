import React from 'react';

const AddStudentOtherDetails = ({ formData, setFormData, handleInputChange, errors = {} }) => {

    const inputClass = (field) =>
        `bg-gray-100 font-normal text-gray-800 border p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`;

    const ErrorMsg = ({ field }) =>
        errors[field] ? (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span>⚠</span> {errors[field]}
            </p>
        ) : null;

    return (
        <div className="space-y-8">

            {/* Hostel & Transport */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-house-chimney text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Hostel &amp; Transport</h2>
                </div>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-6">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Hostel Required</label>
                        <button type="button"
                            onClick={() => setFormData(prev => ({ ...prev, hostelRequired: !prev.hostelRequired, hostelRoomNumber: !prev.hostelRequired ? prev.hostelRoomNumber : '' }))}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.hostelRequired ? "bg-blue-500" : "bg-gray-300"}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.hostelRequired ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">{formData.hostelRequired ? 'Hostel accommodation enabled' : 'Hostel accommodation disabled'}</p>
                    </div>

                    {formData.hostelRequired && (
                        <div>
                            <label className='block font-semibold text-gray-600 text-sm mb-2'>
                                Hostel Room Number<span className="text-red-500 ml-1">*</span>
                            </label>
                            <input type="text" name="hostelRoomNumber" value={formData.hostelRoomNumber} onChange={handleInputChange}
                                placeholder="e.g. B-204" className={inputClass('hostelRoomNumber')} />
                            <ErrorMsg field="hostelRoomNumber" />
                        </div>
                    )}

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Transport Required</label>
                        <button type="button"
                            onClick={() => setFormData(prev => ({ ...prev, transportRequired: !prev.transportRequired }))}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.transportRequired ? "bg-blue-500" : "bg-gray-300"}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.transportRequired ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">{formData.transportRequired ? 'School transport enabled' : 'School transport disabled'}</p>
                    </div>
                </div>
            </div>

            {/* Bank Details */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-building-columns text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Bank Details</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">Used for scholarship or fee-refund transfers. Optional, but if provided all three fields are required.</p>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Bank Account Number
                            <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                        </label>
                        <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange}
                            placeholder="Enter account number" inputMode="numeric" className={inputClass('bankAccountNumber')} />
                        <ErrorMsg field="bankAccountNumber" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Bank Name
                            <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                        </label>
                        <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange}
                            placeholder="Enter bank name" className={inputClass('bankName')} />
                        <ErrorMsg field="bankName" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            IFSC Code
                            <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                        </label>
                        <input type="text" name="ifscCode" value={formData.ifscCode}
                            onChange={(e) => handleInputChange({ target: { name: 'ifscCode', value: e.target.value.toUpperCase() } })}
                            placeholder="e.g. SBIN0001234" maxLength={11} className={inputClass('ifscCode')} />
                        <ErrorMsg field="ifscCode" />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AddStudentOtherDetails;