import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { toast } from 'react-toastify';
import UserPersonalDetailsTab from '../../Components/SuperAdmin/EditTabComponents/UserPersonalDetailsTab';
import ParentPersonalDetailsTab from '../../Components/SuperAdmin/EditTabComponents/ParentPersonalDetailsTab';
import { getUserById, updateUserById } from '../../Api/userManagementAPI';

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_GENDERS = ['MALE', 'FEMALE', 'OTHER'];

// ✅ All 9 roles from the API — was previously missing PRINCIPAL, RECEPTIONIST, STORE_ACCOUNTANT, STORE_SELLER
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

const formatToInputDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const isValidPastDate = (dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d <= new Date();
};

const isValidJoiningDate = (dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d <= new Date();
};

const validateFormData = (formData, activeRole) => {
    const errors = [];
    const fieldMap = {};
    const isParentLike = PARENT_LIKE_ROLES.includes(activeRole);

    const addError = (field, msg) => { errors.push(msg); fieldMap[field] = msg; };

    // Name
    const trimmedName = (formData.name || '').trim();
    if (!trimmedName) addError('name', 'Full name is required.');
    else if (trimmedName.length < 2) addError('name', 'Full name must be at least 2 characters.');
    else if (trimmedName.length > MAX_NAME_LENGTH) addError('name', `Full name cannot exceed ${MAX_NAME_LENGTH} characters.`);
    else if (!/^[a-zA-Z\s'.,-]+$/.test(trimmedName)) addError('name', 'Full name contains invalid characters.');

    // Gender
    if (!formData.gender || !VALID_GENDERS.includes(formData.gender.toUpperCase())) {
        addError('gender', 'Please select a valid gender.');
    }

    // Email
    if (!formData.email || !EMAIL_REGEX.test(formData.email.trim())) {
        addError('email', 'Please enter a valid email address.');
    }

    // Mobile
    const mobileTrimmed = (formData.mobile || '').replace(/\s/g, '');
    if (!mobileTrimmed) addError('mobile', 'Mobile number is required.');
    else if (!MOBILE_REGEX.test(mobileTrimmed)) addError('mobile', 'Mobile must be a valid 10-digit Indian number.');

    // DOB
    if (formData.dob) {
        if (!isValidPastDate(formData.dob)) {
            addError('dob', 'Date of birth must be a valid past date.');
        } else {
            const age = Math.floor((new Date() - new Date(formData.dob)) / (1000 * 60 * 60 * 24 * 365.25));
            if (age < 18) addError('dob', 'User must be at least 18 years old.');
            if (age > 100) addError('dob', 'Date of birth seems invalid (age > 100).');
        }
    }

    // Address
    if (formData.address && formData.address.trim().length > MAX_ADDRESS_LENGTH) {
        addError('address', `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters.`);
    }

    // Non-PARENT fields
    if (!isParentLike) {
        if (formData.empId && !EMP_CODE_REGEX.test(formData.empId.trim())) {
            addError('empId', 'Employee code must be 2–20 alphanumeric characters.');
        }
        if (formData.joiningDate && !isValidJoiningDate(formData.joiningDate)) {
            addError('joiningDate', 'Joining date cannot be in the future.');
        }
        if (formData.experience !== '' && formData.experience !== undefined) {
            const exp = Number(formData.experience);
            if (!Number.isFinite(exp) || exp < 0) addError('experience', 'Experience must be a non-negative number.');
            else if (exp > MAX_EXPERIENCE) addError('experience', `Experience cannot exceed ${MAX_EXPERIENCE} years.`);
        }
    }

    return { valid: errors.length === 0, errors, fieldMap };
};

// ─── Component ────────────────────────────────────────────────────────────────
function EditSysUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sysUser, setsysUser] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [activeRole, setActiveRole] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '', gender: '', mobile: '', email: '', dob: '', address: '',
        empId: '', highestQualification: '', experience: 0, joiningDate: '',
        loginEmail: '', dessignation: '', accountStatus: false,
        salaryType: '', baseSalary: '', leaveDeductionPerDay: '',
        houseRentAllowance: '', travelAllowance: '', dearnessAllowance: '',
        specialAllowance: '', otherAllowances: '', providentFund: '',
        professionalTax: '', incomeTax: '', otherDeductions: '',
    });

    // Validate id param
    useEffect(() => {
        if (!id || isNaN(Number(id)) || Number(id) <= 0) {
            toast.error('Invalid user ID in URL.');
            navigate('/dashboard/manageUsers');
        }
    }, [id, navigate]);

    // Fetch user
    useEffect(() => {
        if (!id || isNaN(Number(id))) return;
        const fetchsysUser = async () => {
            setFetchError(null);
            try {
                const data = await getUserById(id);
                if (!data || typeof data !== 'object') throw new Error('Unexpected response format from server.');
                const rawRoles = Array.isArray(data.roles) ? data.roles : [];
                const firstRole = rawRoles[0];
                // ✅ Fixed: Now checks against the full VALID_ROLES list including STORE_ACCOUNTANT, STORE_SELLER etc.
                if (!firstRole || !VALID_ROLES.includes(firstRole)) {
                    console.warn(`EditSysUser: unknown role "${firstRole}", defaulting to PARENT.`);
                    setActiveRole('PARENT');
                } else {
                    setActiveRole(firstRole);
                }
                setsysUser(data);
            } catch (err) {
                console.error('EditSysUser fetch error:', err);
                const msg = err?.message || 'Failed to load user details.';
                setFetchError(msg);
                toast.error(msg);
            }
        };
        fetchsysUser();
    }, [id]);

    // Populate form
    useEffect(() => {
        if (!sysUser) return;
        setFormData((prev) => ({
            ...prev,
            name: (sysUser.fullName || '').slice(0, MAX_NAME_LENGTH),
            gender: VALID_GENDERS.includes((sysUser.gender || '').toUpperCase()) ? sysUser.gender : '',
            mobile: typeof sysUser.mobile === 'string' ? sysUser.mobile.replace(/\D/g, '').slice(0, 10) : '',
            email: EMAIL_REGEX.test(sysUser.email || '') ? sysUser.email : '',
            dob: formatToInputDate(sysUser.dateOfBirth),
            address: (sysUser.address || '').slice(0, MAX_ADDRESS_LENGTH),
            empId: sysUser.employeeCode || '',
            highestQualification: sysUser.qualification || '',
            experience: Number.isFinite(Number(sysUser.experienceYears))
                ? Math.min(MAX_EXPERIENCE, Math.max(0, Number(sysUser.experienceYears))) : 0,
            joiningDate: formatToInputDate(sysUser.joiningDate),
            loginEmail: EMAIL_REGEX.test(sysUser.email || '') ? sysUser.email : '',
            dessignation: sysUser.designation || '',
            accountStatus: sysUser.accountAccessStatus === 'ALLOWED',
        }));
    }, [sysUser]);

    const handleInputChange = useCallback((e) => {
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
    }, [fieldErrors]);

    const buildPayload = (data, role) => {
        const isParentLike = PARENT_LIKE_ROLES.includes(role);
        const personalDetails = {
            fullName: data.name.trim(),
            mobile: data.mobile.trim(),
            email: data.email.trim(),
            gender: data.gender.toUpperCase(),
            dateOfBirth: data.dob || null,
            address: data.address?.trim() || 'NA',
            emergencyContact: '9999999999',
            emergencyContactName: 'NA',
            emergencyContactRelation: 'NA',
        };
        if (isParentLike) {
            return {
                email: data.email.trim(),
                roleNames: [role],
                personalDetails,
                accountStatus: 'ACTIVE',
                remarks: 'Updated from UI',
            };
        }
        return {
            email: data.email.trim(),
            roleNames: [role],
            personalDetails,
            professionalDetails: {
                employeeCode: data.empId?.trim() || generateEmployeeCode(),
                qualification: data.highestQualification?.trim() || 'NA',
                experienceYears: Number(data.experience) || 0,
                joiningDate: data.joiningDate || null,
                department: 'GENERAL',
                designation: 'USER',
            },
            bankDetails: {
                accountHolderName: 'NA',
                accountNumber: '000000000000',
                bankName: 'NA',
                ifscCode: 'HDFC0123456',
                branchName: 'NA',
            },
            accountStatus: 'ACTIVE',
            payrollStatus: 'INCLUDED',
            remarks: 'Updated from UI',
        };
    };

    const handle_updateDetails = async (e) => {
        e.preventDefault();
        if (!id || isNaN(Number(id)) || Number(id) <= 0) {
            toast.error('Cannot update: invalid user ID.');
            return;
        }
        const { valid, errors, fieldMap } = validateFormData(formData, activeRole);
        if (!valid) {
            toast.error(errors[0]);
            setFieldErrors(fieldMap);
            return;
        }
        setFieldErrors({});
        setIsLoading(true);
        try {
            const sysUserPayload = buildPayload(formData, activeRole);
            await updateUserById(id, sysUserPayload);
            toast.success(`${formData.name.trim()}'s details updated successfully!`);
            navigate('/dashboard/manageUsers');
        } catch (err) {
            console.error('EditSysUser update error:', err);
            toast.error(err?.message || 'Failed to update user. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (fetchError) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <button onClick={() => navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4">
                    <ChevronLeft className="w-5 h-5" /><span className="hidden sm:inline">Back to List</span>
                </button>
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <User className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-gray-700 font-medium mb-4">{fetchError}</p>
                    <button onClick={() => navigate('/dashboard/manageUsers')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    if (!sysUser) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <button onClick={() => navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4">
                    <ChevronLeft className="w-5 h-5" /><span className="hidden sm:inline">Back to List</span>
                </button>
                <div className="flex items-center justify-center py-8 relative">
                    <div className="flex items-center gap-3 absolute lg:top-80">
                        <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-600 lg:text-xl font-medium">Loading User...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Fixed: isParentRole now correctly evaluates STORE_ACCOUNTANT, STORE_SELLER etc. as non-PARENT
    const isParentRole = PARENT_LIKE_ROLES.includes(activeRole);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
            <div className="mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4">
                    <ChevronLeft className="w-5 h-5" /><span className="hidden sm:inline">Back to List</span>
                </button>
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Edit User: {formData.name || '—'}</h1>
                    <p className="text-sm sm:text-base text-gray-500">Manage personal information and account status for users.</p>
                </div>
                <form onSubmit={handle_updateDetails} noValidate>
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex flex-wrap -mb-px">
                                <button type="button" onClick={() => setActiveTab('personal')}
                                    className={`${isParentRole ? 'hidden' : 'flex'} items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    <User size={20} />
                                    <span className="hidden sm:inline">Personal Details</span>
                                    <span className="sm:hidden">Personal</span>
                                </button>
                            </nav>
                        </div>

                        {/* Non-PARENT content */}
                        <div className={`p-4 sm:p-6 lg:p-8 ${activeTab === 'personal' && isParentRole ? 'hidden' : ''}`}>
                            {activeTab === 'personal' && (
                                <UserPersonalDetailsTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    fieldErrors={fieldErrors}
                                />
                            )}
                        </div>

                        {/* PARENT content */}
                        <div className={`p-4 sm:p-6 lg:p-8 ${activeTab === 'personal' && !isParentRole ? 'hidden' : ''}`}>
                            {activeTab === 'personal' && (
                                <ParentPersonalDetailsTab
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
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                    Discard Changes
                                </button>
                                <button disabled={isLoading} type="submit"
                                    className={`mt-1 px-4 py-3 font-semibold rounded-lg transition-all ${isLoading ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'}`}>
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditSysUser;