import React, { useEffect, useState } from 'react';
import { getAllUserRoles } from '../../../Api/userManagementAPI';

// ─── Reusable helpers ─────────────────────────────────────────────────────────
const inputCls = (hasError) =>
    `bg-gray-100 p-2 px-4 w-full rounded-md border focus:outline-none focus:ring-2 transition-colors font-normal text-gray-800 ${hasError
        ? 'border-red-500 bg-red-50 focus:ring-red-400'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

const ErrorText = ({ msg }) =>
    msg ? (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <span>⚠</span> {msg}
        </p>
    ) : null;

// ─────────────────────────────────────────────────────────────────────────────

const AddPersonalDetails = ({
    formData,
    setFormData,
    handleInputChange,
    fieldErrors = {},
    setFieldErrors,
}) => {
    const [roleSelection, setRoleSelection] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const today = new Date().toISOString().split('T')[0];

    const PARENT_VAL = 'PARENT';

    // Fetch roles on mount
    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const rolesRes = await getAllUserRoles();
                const fetchedRoles = rolesRes.data || [];
                const roleOpt = fetchedRoles
                    .filter(val =>
                        val.name !== 'SUPER_ADMIN' &&
                        val.name !== 'TEACHER' &&
                        val.name !== 'GLOBAL_ADMIN' &&
                        val.name !== 'PARENT'
                    )
                    .map(val => ({
                        key: val.id,
                        value: val.name,
                        displayRole: val.displayName,
                    }));
                setRoleSelection(roleOpt);
            } catch (e) {
                console.error('Fetch roles error:', e.message);
            }
        };
        fetchUserRoles();
    }, []);

    // Email format blur validator
    const handleEmailBlur = (fieldName) => (e) => {
        const value = e.target.value.trim();
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !EMAIL_REGEX.test(value)) {
            setFieldErrors?.((prev) => ({
                ...prev,
                [fieldName]: 'Please enter a valid email address.',
            }));
        }
    };

    const isParentLike = selectedRole === PARENT_VAL || selectedRole === '';

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
                            className={inputCls(fieldErrors?.name)}
                        />
                        <ErrorText msg={fieldErrors?.name} />
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
                            className={inputCls(fieldErrors?.gender)}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <ErrorText msg={fieldErrors?.gender} />
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
                            onChange={handleInputChange}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            inputMode="numeric"
                            className={inputCls(fieldErrors?.mobile)}
                        />
                        {/* Digit counter */}
                        <div className="flex justify-between items-start mt-1">
                            <ErrorText msg={fieldErrors?.mobile} />
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
                            className={inputCls(fieldErrors?.email)}
                        />
                        <ErrorText msg={fieldErrors?.email} />
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
                            className={inputCls(fieldErrors?.dob)}
                        />
                        <ErrorText msg={fieldErrors?.dob} />
                    </div>

                    {/* Address */}
                    <div className="lg:col-span-2">
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Current Address
                        </label>
                        <textarea
                            rows={4}
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter residential address"
                            className={`resize-none ${inputCls(fieldErrors?.address)}`}
                        />
                        <div className="flex justify-between items-start mt-1">
                            <ErrorText msg={fieldErrors?.address} />
                            <span className="text-xs ml-auto text-gray-400">
                                {formData.address?.length || 0}/300
                            </span>
                        </div>
                    </div>
                </div>
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
                            Login Email / Username
                        </label>
                        <input
                            type="email"
                            name="loginEmail"
                            value={formData.loginEmail}
                            onChange={handleInputChange}
                            onBlur={handleEmailBlur('loginEmail')}
                            placeholder="Login email or username"
                            className={inputCls(fieldErrors?.loginEmail)}
                        />
                        <ErrorText msg={fieldErrors?.loginEmail} />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block font-semibold text-gray-600 text-sm mb-2">
                            Select Role <span className="text-red-600">*</span>
                        </label>
                        <select
                            name="userRole"
                            value={formData.userRole}
                            onChange={(e) => {
                                handleInputChange(e);
                                setSelectedRole(e.target.value);
                            }}
                            className={inputCls(fieldErrors?.userRole)}
                        >
                            <option value="" disabled>Select User Role</option>
                            {roleSelection.map((ele) => (
                                <option value={ele.value} key={ele.key}>
                                    {ele.displayRole}
                                </option>
                            ))}
                        </select>
                        <ErrorText msg={fieldErrors?.userRole} />
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
                                    const next = !formData.accountStatus;
                                    setFormData((prev) => ({ ...prev, accountStatus: next }));
                                    // Clear error when enabled
                                    if (next) {
                                        setFieldErrors?.((prev) => ({ ...prev, accountStatus: '' }));
                                    }
                                }}
                                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${formData.accountStatus
                                    ? 'bg-blue-500'
                                    : fieldErrors?.accountStatus
                                        ? 'bg-red-300'
                                        : 'bg-gray-300'
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
                        <ErrorText msg={fieldErrors?.accountStatus} />
                    </div>
                </div>
            </div>

            {/* ── Professional Details (hidden for parent/no-role) ──────────────── */}
            <div className={selectedRole === '' || selectedRole === PARENT_VAL ? 'hidden' : ''}>
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
                            className={inputCls(fieldErrors?.employeeCode)}
                        />
                        <ErrorText msg={fieldErrors?.employeeCode} />
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
                                const value = Math.max(0, Math.min(60, parseInt(e.target.value) || 0));
                                setFormData((prev) => ({ ...prev, experience: value }));
                            }}
                            min={0}
                            max={60}
                            placeholder="0"
                            className={inputCls(fieldErrors?.experience)}
                        />
                        <ErrorText msg={fieldErrors?.experience} />
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
                            max={today}
                            className={inputCls(fieldErrors?.joiningDate)}
                        />
                        <ErrorText msg={fieldErrors?.joiningDate} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPersonalDetails;