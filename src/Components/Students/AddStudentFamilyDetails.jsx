import React from 'react';

const AddStudentFamilyDetails = ({ formData, setFormData, handleInputChange, errors = {}, setErrors }) => {

    const inputClass = (field) =>
        `bg-gray-100 font-normal text-gray-800 border p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`;

    const ErrorMsg = ({ field }) =>
        errors[field] ? (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span>⚠</span> {errors[field]}
            </p>
        ) : null;

    return (
        <div className="space-y-8">

            {/* Father's Details */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-person text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Father's Details</h2>
                </div>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Father's Name<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange}
                            placeholder="Enter father's name" className={inputClass('fatherName')} />
                        <ErrorMsg field="fatherName" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Father's Occupation<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange}
                            placeholder="Enter father's occupation" className={inputClass('fatherOccupation')} />
                        <ErrorMsg field="fatherOccupation" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Father's Phone<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="tel" name="fatherPhone" value={formData.fatherPhone} onChange={handleInputChange}
                            placeholder='10 digit phone number' maxLength={10} className={inputClass('fatherPhone')} />
                        <ErrorMsg field="fatherPhone" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Father's Email<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="email" name="fatherEmail" value={formData.fatherEmail} onChange={handleInputChange}
                            placeholder="Enter father's email" className={inputClass('fatherEmail')} />
                        <ErrorMsg field="fatherEmail" />
                    </div>
                </div>
            </div>

            {/* Mother's Details */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-person-dress text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Mother's Details</h2>
                </div>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Mother's Name<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange}
                            placeholder="Enter mother's name" className={inputClass('motherName')} />
                        <ErrorMsg field="motherName" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Mother's Occupation<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange}
                            placeholder="Enter mother's occupation" className={inputClass('motherOccupation')} />
                        <ErrorMsg field="motherOccupation" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Mother's Phone<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="tel" name="motherPhone" value={formData.motherPhone} onChange={handleInputChange}
                            placeholder='10 digit phone number' maxLength={10} className={inputClass('motherPhone')} />
                        <ErrorMsg field="motherPhone" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Mother's Email<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="email" name="motherEmail" value={formData.motherEmail} onChange={handleInputChange}
                            placeholder="Enter mother's email" className={inputClass('motherEmail')} />
                        <ErrorMsg field="motherEmail" />
                    </div>
                </div>
            </div>

            {/* Guardian Details */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-shield-halved text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Guardian Details</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">Fill this section only if a guardian (other than parents) is responsible for the student.</p>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Guardian's Name<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="text" name="guardianName" value={formData.guardianName} onChange={handleInputChange}
                            placeholder="Enter guardian's name" className={inputClass('guardianName')} />
                        <ErrorMsg field="guardianName" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Relation to Student<span className="text-red-500 ml-1">*</span>
                        </label>
                        <select name="guardianRelation" value={formData.guardianRelation} onChange={handleInputChange}
                            className={inputClass('guardianRelation')}>
                            <option value="">Select Relation</option>
                            <option value="Uncle">Uncle</option>
                            <option value="Aunt">Aunt</option>
                            <option value="Grandfather">Grandfather</option>
                            <option value="Grandmother">Grandmother</option>
                            <option value="Elder Sibling">Elder Sibling</option>
                            <option value="Other">Other</option>
                        </select>
                        <ErrorMsg field="guardianRelation" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Guardian's Phone<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange}
                            placeholder='10 digit phone number' maxLength={10} className={inputClass('guardianPhone')} />
                        <ErrorMsg field="guardianPhone" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Guardian's Email
                            <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                        </label>
                        <input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleInputChange}
                            placeholder="Enter guardian's email" className={inputClass('guardianEmail')} />
                        <ErrorMsg field="guardianEmail" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Emergency Contact Number<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange}
                            placeholder='10 digit emergency contact' maxLength={10} className={inputClass('emergencyContact')} />
                        <ErrorMsg field="emergencyContact" />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AddStudentFamilyDetails;