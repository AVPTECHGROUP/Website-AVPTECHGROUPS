import React from 'react';

// ─── Reusable input class builder ─────────────────────────────────────────────
const inputCls = (hasError) =>
    `bg-gray-100 p-2 px-4 w-full rounded-md border focus:outline-none focus:ring-2 transition-colors ${hasError
        ? 'border-red-500 focus:ring-red-400 bg-red-50'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

const ErrorText = ({ msg }) =>
    msg ? <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <span>⚠</span> {msg}
    </p> : null;

// ─────────────────────────────────────────────────────────────────────────────

const AddPersonalInfo = ({ formData, setFormData, handleInputChange, errors, setErrors, designationList }) => {
    const today = new Date().toISOString().split('T')[0];

    // Restrict mobile input to digits only, max 10
    const handleMobileChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        handleInputChange({ target: { name: 'mobile', value: digits } });
    };

    // Validate email on blur
    const handleEmailBlur = (field) => (e) => {
        const value = e.target.value.trim();
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !EMAIL_REGEX.test(value)) {
            setErrors?.(prev => ({ ...prev, [field]: 'Please enter a valid email address' }));
        }
    };

    return (
        <div className="space-y-6">

            {/* ── Personal Details ──────────────────────────────────────────────── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-user text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className="text-xl font-medium text-gray-700">Personal Details</h2>
                </div>

                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">

                    {/* Full Name */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter full name"
                            className={inputCls(errors?.name)}
                        />
                        <ErrorText msg={errors?.name} />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Gender <span className="text-red-600">*</span>
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className={inputCls(errors?.gender)}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <ErrorText msg={errors?.gender} />
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Mobile Number <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleMobileChange}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            inputMode="numeric"
                            className={inputCls(errors?.mobile)}
                        />
                        {/* Character counter */}
                        <div className="flex justify-between items-center mt-1">
                            <ErrorText msg={errors?.mobile} />
                            <span className={`text-xs ml-auto ${formData.mobile.length === 10 ? 'text-green-500' : 'text-gray-400'}`}>
                                {formData.mobile.length}/10
                            </span>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Email Address <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleEmailBlur('email')}
                            placeholder="Enter email address"
                            className={inputCls(errors?.email)}
                        />
                        <ErrorText msg={errors?.email} />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Date of Birth <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            max={today}
                            className={inputCls(errors?.dob)}
                        />
                        <ErrorText msg={errors?.dob} />
                    </div>

                    {/* Address */}
                    <div className="lg:col-span-2" >
                        <label className="block font-semibold text-gray-600 text-sm mb-2" >
                            Current Address <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            rows={4}
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter residential address"
                            className="bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* ── Professional Details ──────────────────────────────────────────── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-briefcase text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className="text-xl font-medium text-gray-700">Professional Details</h2>
                </div>

                <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-4">

                    {/* Employee Code */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Employee Code
                        </label>
                        <input
                            type="text"
                            name="employeeCode"
                            value={formData.employeeCode}
                            onChange={handleInputChange}
                            placeholder="Auto-generated if empty"
                            className="bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Qualification */}
                    <div className="col-span-2">
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Highest Qualification
                        </label>
                        <input
                            type="text"
                            name="highestQualification"
                            value={formData.highestQualification}
                            onChange={handleInputChange}
                            placeholder="e.g. B.Ed, M.Sc"
                            className="bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Experience */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
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
                            min={0}
                            placeholder="0"
                            className="bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/*Pan number */}
                    <div className="col-span-2">
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            PAN NUMBER
                        </label>
                        <input
                            type="text"
                            name="PAN NUMBER"
                            value={formData.PAN_NUMBER}
                            onChange={handleInputChange}
                            placeholder="e.g. BCIJS3193D"
                            className="bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/*UAN NUMBER */}
                    <div className="col-span-2">
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            UAN NUMBER
                        </label>
                        <input
                            type="text"
                            name="UAN NUMBER"
                            value={formData.UAN_NUMBER}
                            onChange={handleInputChange}
                            placeholder="e.g. 904593JI04959"
                            className="bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Joining Date */}
                    <div className="col-span-2">
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Date of Joining <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="date"
                            name="joiningDate"
                            value={formData.joiningDate}
                            onChange={handleInputChange}
                            className={inputCls(errors?.joiningDate)}
                            max={new Date().toISOString().split("T")[0]}
                        />
                        <ErrorText msg={errors?.joiningDate} />
                    </div>
                </div>
            </div>
            {/*designation*/}
            <div>
                <label className="block font-semibold text-gray-600 text-sm mb-2">
                    Designation
                </label>

                <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Designation</option>

                    {designationList.map((item) => (
                        <option
                            key={item.id || item.value}
                            value={item.value || item.code || item.name}
                        >
                            {item.label || item.name || item.value}
                        </option>
                    ))}
                </select>
                <ErrorText msg={errors?.designation} />
            </div>

            {/* ── System Access ─────────────────────────────────────────────────── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-gear text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className="text-xl font-medium text-gray-700">System Access</h2>
                </div>

                <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-4">

                    {/* Login Email */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Login Email  <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="email"
                            name="loginEmail"
                            value={formData.loginEmail}
                            onChange={handleInputChange}
                            onBlur={handleEmailBlur('loginEmail')}
                            placeholder="Login email "
                            className={inputCls(errors?.loginEmail)}
                        />
                        <ErrorText msg={errors?.loginEmail} />
                    </div>

                    {/* Role (read-only) */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Role <span className="text-red-600">*</span>
                        </label>
                        <input
                            readOnly
                            type="text"
                            name="role"
                            value="Teacher"
                            className="bg-gray-100 font-normal text-gray-500 border border-gray-300 p-2 px-4 w-full rounded-md cursor-not-allowed"
                        />
                    </div>

                    {/* Account Status Toggle */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Account Status <span className="text-red-600">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, accountStatus: !prev.accountStatus }));
                                    // Clear error when toggled on
                                    if (!formData.accountStatus) {
                                        setErrors?.(prev => ({ ...prev, accountStatus: '' }));
                                    }
                                }}
                                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.accountStatus ? 'bg-blue-500' : errors?.accountStatus ? 'bg-red-300' : 'bg-gray-300'
                                    }`}
                                aria-label="Toggle account status"
                            >
                                <div
                                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.accountStatus ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                            <span className={`text-sm font-medium ${formData.accountStatus ? 'text-blue-600' : 'text-gray-400'}`}>
                                {formData.accountStatus ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <ErrorText msg={errors?.accountStatus} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPersonalInfo;