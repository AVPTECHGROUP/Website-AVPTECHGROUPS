import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Camera, X } from 'lucide-react';
import { toast } from 'react-toastify';
import AddPersonalDetails from '../../Components/SuperAdmin/AddTabComponents/AddPersionslDetails';
import { createUser, updateUserById } from '../../Api/userManagementAPI';

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_GENDERS = ['MALE', 'FEMALE', 'OTHER'];

const VALID_ROLES = [
    'SUPER_ADMIN',
    'ADMIN',
    'PRINCIPAL',
    'TEACHER',
    'ACCOUNTANT',
    'PARENT',
    'RECEPTIONIST',
    'STORE_ACCOUNTANT',
    'STORE_SELLER',
];

const PARENT_LIKE_ROLES = ['PARENT'];

const MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMP_CODE_REGEX = /^[A-Za-z0-9\-_]{2,20}$/;
const MAX_NAME_LENGTH = 100;
const MAX_ADDRESS_LENGTH = 300;
const MAX_EXPERIENCE = 60;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateEmployeeCode = () => 'EMP' + Math.floor(100 + Math.random() * 900);

const isValidPastDate = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d <= new Date();
};

const isValidJoiningDate = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d <= new Date();
};

const validateFormData = (formData) => {
    const errors = [];
    const isParentLike = PARENT_LIKE_ROLES.includes(formData.userRole);

    if (!formData.userRole || !VALID_ROLES.includes(formData.userRole)) {
        errors.push('Please select a valid user role.');
    }

    const trimmedName = (formData.name || '').trim();
    if (!trimmedName) {
        errors.push('Full name is required.');
    } else if (trimmedName.length < 2) {
        errors.push('Full name must be at least 2 characters.');
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
        errors.push(`Full name cannot exceed ${MAX_NAME_LENGTH} characters.`);
    } else if (!/^[a-zA-Z\s'.,-]+$/.test(trimmedName)) {
        errors.push('Full name contains invalid characters.');
    }

    if (!formData.gender || !VALID_GENDERS.includes(formData.gender.toUpperCase())) {
        errors.push('Please select a valid gender.');
    }

    if (!formData.email || !EMAIL_REGEX.test(formData.email.trim())) {
        errors.push('Please enter a valid email address.');
    }

    const mobileTrimmed = (formData.mobile || '').replace(/\s/g, '');
    if (!mobileTrimmed) {
        errors.push('Mobile number is required.');
    } else if (!MOBILE_REGEX.test(mobileTrimmed)) {
        errors.push('Mobile number must be a valid 10-digit Indian mobile number.');
    }

    if (formData.dob) {
        if (!isValidPastDate(formData.dob)) {
            errors.push('Date of birth must be a valid past date.');
        } else {
            const age = Math.floor((new Date() - new Date(formData.dob)) / (1000 * 60 * 60 * 24 * 365.25));
            if (age < 18) errors.push('User must be at least 18 years old.');
            if (age > 100) errors.push('Date of birth seems invalid (age > 100).');
        }
    }

    if (formData.address && formData.address.trim().length > MAX_ADDRESS_LENGTH) {
        errors.push(`Address cannot exceed ${MAX_ADDRESS_LENGTH} characters.`);
    }

    if (!isParentLike) {
        if (formData.employeeCode && !EMP_CODE_REGEX.test(formData.employeeCode.trim())) {
            errors.push('Employee code must be 2–20 alphanumeric characters.');
        }
        if (formData.joiningDate && !isValidJoiningDate(formData.joiningDate)) {
            errors.push('Joining date must be a valid date not in the future.');
        }
        const exp = Number(formData.experience);
        if (formData.experience !== '' && formData.experience !== undefined) {
            if (!Number.isFinite(exp) || exp < 0) {
                errors.push('Experience must be a non-negative number.');
            } else if (exp > MAX_EXPERIENCE) {
                errors.push(`Experience cannot exceed ${MAX_EXPERIENCE} years.`);
            }
        }
    }

    if (!formData.accountStatus) {
        errors.push('Please enable account status before saving.');
    }

    return { valid: errors.length === 0, errors };
};

// ─── Component ────────────────────────────────────────────────────────────────
function AddnewSystemUser() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const createdUserIdRef = useRef(null);

    // ── Image upload state ──────────────────────────────────────────────────
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        email: '',
        loginEmail: '',
        mobile: '',
        address: '',
        dob: '',
        employeeCode: '',
        highestQualification: '',
        experience: 0,
        joiningDate: '',
        payrollStatus: '',
        accountStatus: false,
        userRole: '',
        salaryType: '',
        baseSalary: '',
        leaveDeductionPerDay: '',
        houseRentAllowance: '',
        travelAllowance: '',
        dearnessAllowance: '',
        specialAllowance: '',
        otherAllowances: '',
        providentFund: '',
        professionalTax: '',
        incomeTax: '',
        otherDeductions: '',
        assignedClass: '',
        section: '',
        primarySubject: '',
        additionalSubjects: '',
        isClassTeacher: false,
    });

    // ── Image handlers ──────────────────────────────────────────────────────
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error("Only JPEG or PNG images are allowed!");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image must be smaller than 10 MB!");
            return;
        }
        setProfileImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        }
        let sanitized = value;
        if (name === 'mobile') sanitized = value.replace(/\D/g, '').slice(0, 10);
        if (name === 'experience') sanitized = value === '' ? '' : Math.max(0, Math.min(MAX_EXPERIENCE, Number(value)));
        if (name === 'name') sanitized = value.slice(0, MAX_NAME_LENGTH);
        if (name === 'address') sanitized = value.slice(0, MAX_ADDRESS_LENGTH);
        setFormData((prev) => ({ ...prev, [name]: sanitized }));
    };

    const buildPayload = (data) => {
        const isParentLike = PARENT_LIKE_ROLES.includes(data.userRole);
        const personalDetails = {
            fullName: data.name.trim(),
            mobile: data.mobile.trim(),
            email: data.email.trim(),
            gender: data.gender.toUpperCase(),
            dateOfBirth: data.dob || null,
            address: data.address?.trim() || 'NA',
        };
        if (isParentLike) {
            return {
                email: data.email.trim(),
                roleNames: [data.userRole],
                personalDetails,
                accountStatus: 'ACTIVE',
            };
        }
        return {
            email: data.email.trim(),
            roleNames: [data.userRole],
            personalDetails,
            professionalDetails: {
                employeeCode: data.employeeCode?.trim() || generateEmployeeCode(),
                qualification: data.highestQualification?.trim() || 'NA',
                experienceYears: Number(data.experience) || 0,
                joiningDate: data.joiningDate || null,
            },
            accountStatus: 'ACTIVE',
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { valid, errors } = validateFormData(formData);
        if (!valid) {
            toast.error(errors[0]);
            const mapped = {};
            errors.forEach((msg) => {
                if (msg.toLowerCase().includes('name')) mapped.name = msg;
                else if (msg.toLowerCase().includes('gender')) mapped.gender = msg;
                else if (msg.toLowerCase().includes('email')) mapped.email = msg;
                else if (msg.toLowerCase().includes('mobile')) mapped.mobile = msg;
                else if (msg.toLowerCase().includes('dob') || msg.toLowerCase().includes('birth') || msg.toLowerCase().includes('age')) mapped.dob = msg;
                else if (msg.toLowerCase().includes('address')) mapped.address = msg;
                else if (msg.toLowerCase().includes('employee code')) mapped.employeeCode = msg;
                else if (msg.toLowerCase().includes('joining')) mapped.joiningDate = msg;
                else if (msg.toLowerCase().includes('experience')) mapped.experience = msg;
                else if (msg.toLowerCase().includes('role')) mapped.userRole = msg;
                else if (msg.toLowerCase().includes('account status')) mapped.accountStatus = msg;
            });
            setFieldErrors(mapped);
            return;
        }
        setFieldErrors({});
        setIsSubmitting(true);
        const loadingToast = toast.loading('Adding user...');
        try {
            const apiPayload = buildPayload(formData);
            let response;
            if (!createdUserIdRef.current) {
                response = await createUser(apiPayload, profileImage);
                if (!response?.data?.id) throw new Error('Invalid response: user ID not returned from server.');
                createdUserIdRef.current = response.data.id;
            } else {
                response = await updateUserById(createdUserIdRef.current, apiPayload);
            }
            toast.dismiss(loadingToast);
            toast.success(`${formData.name.trim()} : ${response?.message ?? 'User added successfully ✅'}`);
            if (profileImage) {
                toast.info("Profile photo may take a few seconds to reflect.", { autoClose: 4000 });  // ← ADD THIS
            }
            navigate('/dashboard/manageUsers');
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err?.message || 'Failed to add user. Please try again.');
            console.error('AddnewSystemUser submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
            <div className="mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to List</span>
                </button>
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Add New User</h1>
                    <p className="text-sm sm:text-base text-gray-500">Enter the details below to onboard a new user into the system.</p>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex flex-wrap -mb-px">
                                <button type="button" onClick={() => setActiveTab('personal')}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    <User size={20} />
                                    <span className="hidden sm:inline">Personal Details</span>
                                    <span className="sm:hidden">Personal</span>
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeTab === 'personal' && (
                                <>
                                    {/* ── Profile Photo ── */}
                                    <div className="mb-6">
                                        <label className="block font-semibold text-gray-600 text-sm mb-3">
                                            Profile Photo <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                        </label>
                                        <div className="flex items-center gap-5">
                                            <div className="relative shrink-0">
                                                <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                                                    {imagePreview ? (
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-8 h-8 text-blue-400" />
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow transition-colors"
                                                >
                                                    <Camera className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            </div>

                                            <div className="flex-1">
                                                {!imagePreview ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors cursor-pointer"
                                                    >
                                                        <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                                        <p className="text-sm font-medium text-blue-600">Click to upload photo</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">JPEG or PNG, max 10 MB</p>
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-green-700 truncate">{profileImage?.name}</p>
                                                            <p className="text-xs text-green-500 mt-0.5">
                                                                {profileImage ? (profileImage.size / 1024).toFixed(1) + ' KB' : ''}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="text-xs px-2.5 py-1 bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors"
                                                            >
                                                                Change
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveImage}
                                                                className="w-7 h-7 flex items-center justify-center bg-white border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>

                                    <AddPersonalDetails
                                        formData={formData}
                                        setFormData={setFormData}
                                        handleInputChange={handleInputChange}
                                        fieldErrors={fieldErrors}
                                    />
                                </>
                            )}
                        </div>

                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button type="button" onClick={() => navigate('/dashboard/manageUsers')}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    Discard
                                </button>
                                <button disabled={isSubmitting} type="submit"
                                    className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'}`}>
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Adding...
                                        </span>
                                    ) : 'Save Details'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddnewSystemUser;