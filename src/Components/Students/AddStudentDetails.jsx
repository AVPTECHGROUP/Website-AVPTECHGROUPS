import React, { useRef } from 'react';
const AddStudentDetails = ({ formData, setFormData, handleInputChange, sections = [], sectionsLoading = false }) => {
    const imageInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Only JPG, PNG, WEBP or GIF files are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be under 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            // Stores the full data-URL base64 string.
            // This same value is now sent to the API in profileImageUrl.
            setFormData(prev => ({ ...prev, profileImageUrl: reader.result }));
        };
        reader.readAsDataURL(file);

        // reset so same file can be re-selected
        e.target.value = '';
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, profileImageUrl: '' }));
    };

    // Group sections by className for the <optgroup> UX
    const groupedSections = sections.reduce((acc, section) => {
        const key = section.className;
        if (!acc[key]) acc[key] = [];
        acc[key].push(section);
        return acc;
    }, {});

    return (
        <div className="space-y-8">

            {/* ─── Profile Photo Section ─── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-image text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Profile Photo</h2>
                </div>

                <div className="flex items-center gap-6">
                    {/* Avatar Preview */}
                    <div className="relative w-24 h-24 shrink-0 group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                            {formData.profileImageUrl ? (
                                <img
                                    src={formData.profileImageUrl}
                                    alt="Profile preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <i className="fa-solid fa-user text-4xl text-gray-300" />
                            )}
                        </div>
                        {/* Hover overlay to change photo */}
                        {formData.profileImageUrl && (
                            <div
                                onClick={() => imageInputRef.current?.click()}
                                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <i className="fa-solid fa-camera text-white text-lg" />
                            </div>
                        )}
                    </div>

                    {/* Upload / Change / Remove Buttons */}
                    <div className="flex flex-col gap-2">
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        {!formData.profileImageUrl ? (
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <i className="fa-solid fa-upload" />
                                Upload Photo
                            </button>
                        ) : (
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <i className="fa-solid fa-pen" />
                                    Change
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <i className="fa-solid fa-trash" />
                                    Remove
                                </button>
                            </div>
                        )}

                        <p className="text-xs text-gray-400">JPG, PNG, WEBP or GIF &nbsp;·&nbsp; Max 5MB</p>
                    </div>
                </div>
            </div>

            {/* ─── Personal Details Section ─── */}
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
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                            placeholder='Enter full name' required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    <div>
                        <label htmlFor="gender" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Gender<span className="text-red-600 ml-1">*</span>
                        </label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="dob" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Date of Birth<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    <div>
                        <label htmlFor="bloodGroup" className='block font-semibold text-gray-600 text-sm mb-2'>Blood Group</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="admissionNumber" className='block font-semibold text-gray-600 text-sm mb-2'>Admission Number</label>
                        <input type="text" name="admissionNumber" value={formData.admissionNumber} onChange={handleInputChange}
                            placeholder='Auto-generated if left empty'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generation</p>
                    </div>

                    {/* ─── Section Dropdown ─── */}
                    <div>
                        <label htmlFor="sectionId" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Section<span className="text-red-600 ml-1">*</span>
                        </label>
                        <select
                            name="sectionId"
                            value={formData.sectionId}
                            onChange={handleInputChange}
                            required
                            disabled={sectionsLoading}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            <option value="">
                                {sectionsLoading ? 'Loading sections...' : 'Select Section'}
                            </option>
                            {Object.entries(groupedSections).map(([className, classSections]) => (
                                <optgroup key={className} label={className}>
                                    {classSections.map(section => (
                                        <option key={section.id} value={section.id}>
                                            {section.name} — Room {section.roomNumber} ({section.currentStrength}/{section.capacity})
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.sectionId
                                ? (() => {
                                    const found = sections.find(s => s.id === Number(formData.sectionId));
                                    return found
                                        ? `${found.className} · ${found.name} · ${found.currentStrength}/${found.capacity} students`
                                        : '';
                                })()
                                : 'Choose the class section for this student'}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="admissionDate" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Date of Admission<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    <div>
                        <label htmlFor="academicYear" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Academic Year<span className="text-red-600 ml-1">*</span>
                        </label>
                        <select name="academicYear" value={formData.academicYear} onChange={handleInputChange} required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                            <option value="">Select Academic Year</option>
                            <option value="2023-2024">2023-2024</option>
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                            <option value="2026-2027">2026-2027</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="previousSchool" className='block font-semibold text-gray-600 text-sm mb-2'>Previous School</label>
                        <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleInputChange}
                            placeholder='Enter previous school name'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    <div>
                        <label htmlFor="status" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Status<span className="text-red-600 ml-1">*</span>
                        </label>
                        <button type="button"
                            onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }))}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.status === 'ACTIVE' ? "bg-green-500" : "bg-red-400"}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.status === 'ACTIVE' ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.status === 'ACTIVE'
                                ? <span className="text-green-600 font-medium">● Active</span>
                                : <span className="text-red-600 font-medium">● Inactive</span>}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="mobile" className='block font-semibold text-gray-600 text-sm mb-2'>
                            Mobile Number<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange}
                            placeholder='10 digit mobile number' maxLength={10} pattern="[0-9]{10}" required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits</p>
                    </div>

                    <div>
                        <label htmlFor="email" className='block font-semibold text-gray-600 text-sm mb-2'>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                            placeholder='Enter email address'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Valid email format required if provided</p>
                    </div>

                    <div className="lg:col-span-2">
                        <label htmlFor="address" className='block font-semibold text-gray-600 text-sm mb-2'>Current Address</label>
                        <textarea rows={3} name="address" value={formData.address} onChange={handleInputChange}
                            placeholder='Enter residential address'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                </div>
            </div>

            {/* ─── Father's Details Section ─── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-person text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Father's Details</h2>
                </div>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="fatherName" className='block font-semibold text-gray-600 text-sm mb-2'>Father's Name</label>
                        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange}
                            placeholder="Enter father's name"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                    <div>
                        <label htmlFor="fatherOccupation" className='block font-semibold text-gray-600 text-sm mb-2'>Father's Occupation</label>
                        <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange}
                            placeholder="Enter father's occupation"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                    <div>
                        <label htmlFor="fatherPhone" className='block font-semibold text-gray-600 text-sm mb-2'>Father's Phone</label>
                        <input type="tel" name="fatherPhone" value={formData.fatherPhone} onChange={handleInputChange}
                            placeholder='10 digit phone number' maxLength={10} pattern="[0-9]{10}"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits if provided</p>
                    </div>
                    <div>
                        <label htmlFor="fatherEmail" className='block font-semibold text-gray-600 text-sm mb-2'>Father's Email</label>
                        <input type="email" name="fatherEmail" value={formData.fatherEmail} onChange={handleInputChange}
                            placeholder="Enter father's email"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                </div>
            </div>

            {/* ─── Mother's Details Section ─── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-person-dress text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Mother's Details</h2>
                </div>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="motherName" className='block font-semibold text-gray-600 text-sm mb-2'>Mother's Name</label>
                        <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange}
                            placeholder="Enter mother's name"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                    <div>
                        <label htmlFor="motherOccupation" className='block font-semibold text-gray-600 text-sm mb-2'>Mother's Occupation</label>
                        <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange}
                            placeholder="Enter mother's occupation"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                    <div>
                        <label htmlFor="motherPhone" className='block font-semibold text-gray-600 text-sm mb-2'>Mother's Phone</label>
                        <input type="tel" name="motherPhone" value={formData.motherPhone} onChange={handleInputChange}
                            placeholder='10 digit phone number' maxLength={10} pattern="[0-9]{10}"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits if provided</p>
                    </div>
                    <div>
                        <label htmlFor="motherEmail" className='block font-semibold text-gray-600 text-sm mb-2'>Mother's Email</label>
                        <input type="email" name="motherEmail" value={formData.motherEmail} onChange={handleInputChange}
                            placeholder="Enter mother's email"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                </div>
            </div>

            {/* ─── Guardian Details Section ─── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-shield-halved text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Guardian Details</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">Fill this section only if a guardian (other than parents) is responsible for the student.</p>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="guardianName" className='block font-semibold text-gray-600 text-sm mb-2'>Guardian's Name</label>
                        <input type="text" name="guardianName" value={formData.guardianName} onChange={handleInputChange}
                            placeholder="Enter guardian's name"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                    <div>
                        <label htmlFor="guardianRelation" className='block font-semibold text-gray-600 text-sm mb-2'>Relation to Student</label>
                        <select name="guardianRelation" value={formData.guardianRelation} onChange={handleInputChange}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                            <option value="">Select Relation</option>
                            <option value="Uncle">Uncle</option>
                            <option value="Aunt">Aunt</option>
                            <option value="Grandfather">Grandfather</option>
                            <option value="Grandmother">Grandmother</option>
                            <option value="Elder Sibling">Elder Sibling</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="guardianPhone" className='block font-semibold text-gray-600 text-sm mb-2'>Guardian's Phone</label>
                        <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange}
                            placeholder='10 digit phone number' maxLength={10} pattern="[0-9]{10}"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits if provided</p>
                    </div>
                    <div>
                        <label htmlFor="guardianEmail" className='block font-semibold text-gray-600 text-sm mb-2'>Guardian's Email</label>
                        <input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleInputChange}
                            placeholder="Enter guardian's email"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                    <div>
                        <label htmlFor="emergencyContact" className='block font-semibold text-gray-600 text-sm mb-2'>Emergency Contact Number</label>
                        <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange}
                            placeholder='10 digit emergency contact' maxLength={10} pattern="[0-9]{10}"
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits if provided</p>
                    </div>
                </div>
            </div>

            {/* ─── Additional Requirements Section ─── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-cog text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Additional Requirements</h2>
                </div>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-6">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Hostel Required</label>
                        <button type="button"
                            onClick={() => setFormData(prev => ({ ...prev, hostelRequired: !prev.hostelRequired }))}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.hostelRequired ? "bg-blue-500" : "bg-gray-300"}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.hostelRequired ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">{formData.hostelRequired ? 'Hostel accommodation enabled' : 'Hostel accommodation disabled'}</p>
                    </div>
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

        </div>
    );
};

export default AddStudentDetails;