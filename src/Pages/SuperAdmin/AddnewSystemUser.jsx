import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { toast } from 'react-toastify';
import AddPersonalDetails from '../../Components/SuperAdmin/AddTabComponents/AddPersionslDetails';
import { createUser, updateUserById } from '../../Api/userManagementAPI';

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_GENDERS = ['MALE', 'FEMALE', 'OTHER'];

//  All 9 roles from the API — was previously missing PRINCIPAL, RECEPTIONIST, STORE_ACCOUNTANT, STORE_SELLER
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

// Roles that don't need professional / bank details in the payload
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

    // Role
    if (!formData.userRole || !VALID_ROLES.includes(formData.userRole)) {
        errors.push('Please select a valid user role.');
    }

    // Name
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

    // Gender
    if (!formData.gender || !VALID_GENDERS.includes(formData.gender.toUpperCase())) {
        errors.push('Please select a valid gender.');
    }

    // Email
    if (!formData.email || !EMAIL_REGEX.test(formData.email.trim())) {
        errors.push('Please enter a valid email address.');
    }

    // Mobile
    const mobileTrimmed = (formData.mobile || '').replace(/\s/g, '');
    if (!mobileTrimmed) {
        errors.push('Mobile number is required.');
    } else if (!MOBILE_REGEX.test(mobileTrimmed)) {
        errors.push('Mobile number must be a valid 10-digit Indian mobile number.');
    }

    // DOB
    if (formData.dob) {
        if (!isValidPastDate(formData.dob)) {
            errors.push('Date of birth must be a valid past date.');
        } else {
            const age = Math.floor((new Date() - new Date(formData.dob)) / (1000 * 60 * 60 * 24 * 365.25));
            if (age < 18) errors.push('User must be at least 18 years old.');
            if (age > 100) errors.push('Date of birth seems invalid (age > 100).');
        }
    }

    // Address
    if (formData.address && formData.address.trim().length > MAX_ADDRESS_LENGTH) {
        errors.push(`Address cannot exceed ${MAX_ADDRESS_LENGTH} characters.`);
    }

    // Non-PARENT fields
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

    // Account status
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
            // emergencyContact: '9999999999',
            // emergencyContactName: 'NA',
            // emergencyContactRelation: 'NA',
        };
        if (isParentLike) {
            return {
                email: data.email.trim(),
                roleNames: [data.userRole],
                personalDetails,
                accountStatus: 'ACTIVE',
                // remarks: 'Created from UI',
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
                // department: 'GENERAL',
                // designation: 'USER',
            },
            // bankDetails: {
            //     accountHolderName: 'NA',
            //     accountNumber: '000000000000',
            //     bankName: 'NA',
            //     ifscCode: 'HDFC0123456',
            //     branchName: 'NA',
            // },
            accountStatus: 'ACTIVE',
            // payrollStatus: 'INCLUDED',
            // remarks: 'Created from UI',
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
                response = await createUser(apiPayload);
                if (!response?.data?.id) throw new Error('Invalid response: user ID not returned from server.');
                createdUserIdRef.current = response.data.id;
            } else {
                response = await updateUserById(createdUserIdRef.current, apiPayload);
            }
            toast.dismiss(loadingToast);
            toast.success(`${formData.name.trim()} : ${response?.message ?? 'User added successfully'}`);
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
                                <AddPersonalDetails
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    fieldErrors={fieldErrors}
                                />
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