import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Camera, X, IndianRupee, Landmark } from 'lucide-react';
import { toast } from 'react-toastify';
import UserPersonalDetailsTab from '../../Components/SuperAdmin/EditTabComponents/UserPersonalDetailsTab';
import ParentPersonalDetailsTab from '../../Components/SuperAdmin/EditTabComponents/ParentPersonalDetailsTab';
import SalaryDetailsTab from '../../Components/Teacher/AddTabComponents/AddSalaryDetails';
import BankDetailsTab from '../../Components/SuperAdmin/EditTabComponents/BankDetailsTab';
import { getUserById, updateUserById } from '../../Api/StaffManagement/UserManagementAPI';
import { getTeacherSalary, upsertTeacherSalary } from '../../Api/Teachers/TeachersAPI';
import USER_MANAGEMENT_STRINGS from '../../Constants/StringConstants/UserManagemetConstant';

const VALID_GENDERS = ['MALE', 'FEMALE', 'OTHER'];
// Known roles — used only for the console-warning/validation hint below.
// IMPORTANT: an unrecognized-but-real role must NOT be treated as PARENT.
// Only the literal 'PARENT' role should ever hide Salary/Bank tabs.
// NOTE: backend's actual sales/support role string is GLOBAL_SALES_AND_SUPPORT
// (confirmed from live API response) — NOT GLOBAL_SALES_SUPPORT.
const VALID_ROLES = [
    'SUPER_ADMIN', 'GLOBAL_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT',
    'PARENT', 'RECEPTIONIST', 'STORE_ACCOUNTANT', 'STORE_SELLER', 'GLOBAL_SALES_AND_SUPPORT',
];
const PARENT_LIKE_ROLES = ['PARENT'];
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMP_CODE_REGEX = /^[A-Za-z0-9\-_]{2,20}$/;
const IFSC_REGEX = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^\d{6,20}$/;
const MAX_NAME_LENGTH = 100;
const MAX_ADDRESS_LENGTH = 300;
const MAX_EXPERIENCE = 60;

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

// ── Local-date helper (same UTC/local-safe approach used for teachers) ──
function getTodayLocalISO() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const validateFormData = (formData, activeRole) => {
    const errors = [];
    const fieldMap = {};
    const isParentLike = PARENT_LIKE_ROLES.includes(activeRole);
    const addError = (field, msg) => { errors.push(msg); fieldMap[field] = msg; };
    const trimmedName = (formData.name || '').trim();
    if (!trimmedName) addError('name', 'Full name is required.');
    else if (trimmedName.length < 2) addError('name', 'Full name must be at least 2 characters.');
    else if (trimmedName.length > MAX_NAME_LENGTH) addError('name', `Full name cannot exceed ${MAX_NAME_LENGTH} characters.`);
    else if (!/^[a-zA-Z\s'.,-]+$/.test(trimmedName)) addError('name', 'Full name contains invalid characters.');
    if (!formData.gender || !VALID_GENDERS.includes(formData.gender.toUpperCase())) {
        addError('gender', 'Please select a valid gender.');
    }
    if (!formData.email || !EMAIL_REGEX.test(formData.email.trim())) {
        addError('email', 'Please enter a valid email address.');
    }
    const mobileTrimmed = (formData.mobile || '').replace(/\s/g, '');
    if (!mobileTrimmed) addError('mobile', 'Mobile number is required.');
    else if (!MOBILE_REGEX.test(mobileTrimmed)) addError('mobile', 'Mobile must be a valid 10-digit Indian number.');
    if (formData.dob) {
        if (!isValidPastDate(formData.dob)) {
            addError('dob', 'Date of birth must be a valid past date.');
        } else {
            const age = Math.floor((new Date() - new Date(formData.dob)) / (1000 * 60 * 60 * 24 * 365.25));
            if (age < 18) addError('dob', 'User must be at least 18 years old.');
            if (age > 100) addError('dob', 'Date of birth seems invalid (age > 100).');
        }
    }
    if (formData.address && formData.address.trim().length > MAX_ADDRESS_LENGTH) {
        addError('address', `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters.`);
    }
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

// Salary is optional — only enforced once the user starts filling it in.
const validateSalaryData = (formData) => {
    const salaryErrors = {};
    const touchedSalary = formData.salaryType || formData.baseSalary;
    if (touchedSalary) {
        if (!formData.salaryType) salaryErrors.salaryType = 'Please select a salary type.';
        if (!formData.baseSalary || Number(formData.baseSalary) <= 0) salaryErrors.baseSalary = 'Base salary must be greater than 0.';
    }
    return { valid: Object.keys(salaryErrors).length === 0, salaryErrors };
};

// Bank Details are optional — only format-checked when filled in.
// Account number: skip regex check if the field still holds the masked
// placeholder (untouched by the user) — that's handled separately in
// handle_updateDetails, not here.
const validateBankData = (formData) => {
    const bankErrors = {};
    if (formData.ifscCode && !IFSC_REGEX.test(formData.ifscCode.trim())) {
        bankErrors.ifscCode = 'Enter a valid 11-character IFSC code.';
    }
    if (formData.accountNumber && !ACCOUNT_NUMBER_REGEX.test(formData.accountNumber.trim())) {
        bankErrors.accountNumber = 'Account number should be 6-20 digits.';
    }
    return { valid: Object.keys(bankErrors).length === 0, bankErrors };
};

function EditSysUser() {
    const strings = USER_MANAGEMENT_STRINGS.EDIT_USER;
    const commonStrings = USER_MANAGEMENT_STRINGS.COMMON;
    const { id } = useParams();
    const navigate = useNavigate();
    const [sysUser, setsysUser] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingSalary, setIsSavingSalary] = useState(false);
    const [activeRole, setActiveRole] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [salaryErrors, setSalaryErrors] = useState({});
    const [bankErrors, setBankErrors] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    // Backend only ever returns a MASKED account number (e.g. "****4937").
    // We never put that into the editable field — instead we show it as a
    // placeholder/hint, and only send a new accountNumber in the payload if
    // the user actually types a fresh one.
    const [maskedAccountNumber, setMaskedAccountNumber] = useState('');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', gender: '', mobile: '', email: '', dob: '', address: '',
        empId: '', highestQualification: '', experience: 0, joiningDate: '',
        loginEmail: '', userRole: '', dessignation: '', accountStatus: false,
        salaryType: '', baseSalary: '', leaveDeductionPerDay: '',
        houseRentAllowance: '', travelAllowance: '', dearnessAllowance: '',
        specialAllowance: '', otherAllowances: '', providentFund: '',
        professionalTax: '', incomeTax: '', otherDeductions: '',
        salaryId: null,
        // Bank Details
        accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '', branchName: '', branchAddress: '', iban: '', swiftCode: '',
    });

    const isParentRole = PARENT_LIKE_ROLES.includes(activeRole);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) { toast.error("Only JPEG or PNG images are allowed!"); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error("Image must be smaller than 10 MB!"); return; }
        setProfileImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const displayedImage = imagePreview || existingImageUrl;

    useEffect(() => {
        if (!id || isNaN(Number(id)) || Number(id) <= 0) {
            toast.error('Invalid user ID in URL.');
            navigate('/manageUsers');
        }
    }, [id, navigate]);

    useEffect(() => {
        if (!id || isNaN(Number(id))) return;
        const fetchsysUser = async () => {
            setFetchError(null);
            try {
                const data = await getUserById(id);
                if (!data || typeof data !== 'object') throw new Error('Unexpected response format from server.');
                const rawRoles = Array.isArray(data.roles) ? data.roles : [];
                const firstRole = rawRoles[0];

                // FIX: only the literal 'PARENT' role should hide Salary/Bank
                // tabs. Any other real role (known or not) keeps its tabs —
                // we never silently relabel an unrecognized role as PARENT.
                if (!firstRole) {
                    console.warn('EditSysUser: no role found on user, defaulting to PARENT.');
                    setActiveRole('PARENT');
                } else {
                    if (!VALID_ROLES.includes(firstRole)) {
                        console.warn(`EditSysUser: role "${firstRole}" is not in the known VALID_ROLES list — showing staff tabs (Salary/Bank) by default since it isn't PARENT.`);
                    }
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

    useEffect(() => {
        if (!sysUser) return;

        // Bank fields — backend sends these as flat top-level fields with
        // DIFFERENT names than the form uses, and the account number is
        // always masked (e.g. "****4937"). We map field-by-field rather
        // than assuming a nested `bankDetails` object exists.
        const rawMaskedAcct = sysUser.bankAccountNumberMasked || sysUser.bankDetails?.accountNumber || '';
        setMaskedAccountNumber(rawMaskedAcct);

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
            userRole: sysUser.roles?.[0] || null,
            dessignation: sysUser.designation || '',
            accountStatus: sysUser.status === 'ACTIVE',
            // Bank Details — mapped from the actual backend field names.
            // Account number is intentionally left blank (never populated
            // from the masked value) — see maskedAccountNumber above, shown
            // as a placeholder hint in the input instead.
            accountHolderName: sysUser.bankDetails?.accountHolderName ?? sysUser.accountHolderName ?? '',
            accountNumber: '',
            bankName: sysUser.bankDetails?.bankName ?? sysUser.bankName ?? '',
            ifscCode: sysUser.bankDetails?.ifscCode ?? sysUser.bankIfsc ?? '',
            branchName: sysUser.bankDetails?.branchName ?? sysUser.bankBranch ?? '',
            branchAddress: sysUser.bankDetails?.branchAddress ?? sysUser.bankBranchAddress ?? '',
            iban: sysUser.bankDetails?.iban ?? sysUser.iban ?? '',
            swiftCode: sysUser.bankDetails?.swiftCode ?? sysUser.swiftCode ?? '',
        }));
        if (sysUser.profileImageUrl) {
            setExistingImageUrl(sysUser.profileImageUrl);
        }
    }, [sysUser]);

    // Salary is a separate record (same endpoint used for teachers), so it's
    // fetched independently once we know the user isn't parent-like. A
    // missing salary record (new user, nothing saved yet) is expected and
    // silently ignored rather than surfaced as an error.
    useEffect(() => {
        if (!id || isNaN(Number(id)) || isParentRole) return;
        const fetchSalary = async () => {
            try {
                const salary = await getTeacherSalary(id);
                if (!salary) return;
                setFormData((prev) => ({
                    ...prev,
                    salaryId: salary.id ?? null,
                    salaryType: salary.salaryType || '',
                    baseSalary: salary.baseSalary ?? '',
                    houseRentAllowance: salary.houseRentAllowance ?? '',
                    travelAllowance: salary.travelAllowance ?? '',
                    dearnessAllowance: salary.dearnessAllowance ?? '',
                    specialAllowance: salary.specialAllowance ?? '',
                    otherAllowances: salary.otherAllowances ?? '',
                    providentFund: salary.providentFund ?? '',
                    professionalTax: salary.professionalTax ?? '',
                    incomeTax: salary.incomeTax ?? '',
                    otherDeductions: salary.otherDeductions ?? '',
                    leaveDeductionPerDay: salary.leaveDeductionPerDay ?? '',
                }));
            } catch (err) {
                // No existing salary record yet — not an error state.
                console.info('No existing salary record for this user yet.');
            }
        };
        fetchSalary();
    }, [id, isParentRole]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        }
        if (salaryErrors[name]) {
            setSalaryErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        }
        if (bankErrors[name]) {
            setBankErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        }
        let sanitized = value;
        if (name === 'mobile') sanitized = value.replace(/\D/g, '').slice(0, 10);
        if (name === 'experience') sanitized = value === '' ? '' : Math.max(0, Math.min(MAX_EXPERIENCE, Number(value)));
        if (name === 'name') sanitized = value.slice(0, MAX_NAME_LENGTH);
        if (name === 'address') sanitized = value.slice(0, MAX_ADDRESS_LENGTH);
        setFormData((prev) => ({ ...prev, [name]: sanitized }));
    }, [fieldErrors, salaryErrors, bankErrors]);

    const buildPayload = (data, role) => {
        const isParentLike = PARENT_LIKE_ROLES.includes(role);
        const personalDetails = {
            fullName: data.name.trim(),
            mobile: data.mobile.trim(),
            email: data.email.trim(),
            gender: data.gender.toUpperCase(),
            dateOfBirth: data.dob || null,
            address: data.address?.trim() || 'NA',
        };
        if (isParentLike) {
            return { email: data.email.trim(), roleNames: [data.userRole], personalDetails, accountStatus: 'ACTIVE' };
        }

        // Only send accountNumber if the user actually typed a new value —
        // never re-send the masked placeholder, and never overwrite an
        // existing saved number with an empty string.
        const bankDetails = {
            accountHolderName: data.accountHolderName || '',
            bankName: data.bankName || '',
            ifscCode: data.ifscCode || '',
            branchName: data.branchName || '',
            branchAddress: data.branchAddress || '',
            iban: data.iban || '',
            swiftCode: data.swiftCode || '',
        };
        if (data.accountNumber && data.accountNumber.trim()) {
            bankDetails.accountNumber = data.accountNumber.trim();
        }

        return {
            email: data.email.trim(),
            roleNames: [data.userRole],
            personalDetails,
            professionalDetails: {
                employeeCode: data.empId?.trim() || generateEmployeeCode(),
                qualification: data.highestQualification?.trim() || 'NA',
                experienceYears: Number(data.experience) || 0,
                joiningDate: data.joiningDate || null,
                designation: data.dessignation,
            },
            bankDetails,
            accountStatus: 'ACTIVE',
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
            setActiveTab('personal');
            return;
        }
        if (!isParentRole) {
            const { valid: salaryValid, salaryErrors: sErrs } = validateSalaryData(formData);
            if (!salaryValid) {
                setSalaryErrors(sErrs);
                toast.error("Please correct the salary details.");
                setActiveTab('salary');
                return;
            }
            const { valid: bankValid, bankErrors: bErrs } = validateBankData(formData);
            if (!bankValid) {
                setBankErrors(bErrs);
                toast.error("Please correct the bank details.");
                setActiveTab('bank');
                return;
            }
        }
        setFieldErrors({});
        setSalaryErrors({});
        setBankErrors({});
        setIsLoading(true);
        const loadingToast = toast.loading("Updating user...");
        let salarySaved = false;
        let salaryAttempted = false;
        try {
            const sysUserPayload = buildPayload(formData, activeRole);
            await updateUserById(id, sysUserPayload, profileImage);

            // Salary is a separate record — saved alongside, only when the
            // user has actually entered salary details.
            if (!isParentRole && formData.salaryType && formData.baseSalary) {
                salaryAttempted = true;
                try {
                    const baseSalary = Number(formData.baseSalary) || 0;
                    const hra = Number(formData.houseRentAllowance) || 0;
                    const ta = Number(formData.travelAllowance) || 0;
                    const da = Number(formData.dearnessAllowance) || 0;
                    const sa = Number(formData.specialAllowance) || 0;
                    const oa = Number(formData.otherAllowances) || 0;
                    const pf = Number(formData.providentFund) || 0;
                    const profTax = Number(formData.professionalTax) || 0;
                    const incomeTax = Number(formData.incomeTax) || 0;
                    const otherDed = Number(formData.otherDeductions) || 0;
                    const leaveDeduction = Number(formData.leaveDeductionPerDay) || 0;

                    const grossSalary = baseSalary + hra + ta + da + sa + oa + pf;
                    const totalDeductions = profTax + incomeTax + otherDed + leaveDeduction;
                    const netSalary = grossSalary - totalDeductions;
                    const today = getTodayLocalISO();
                    const effectiveTo = `${new Date().getFullYear()}-12-31`;

                    const salaryPayload = {
                        ...(formData.salaryId && { id: formData.salaryId }),
                        salaryType: formData.salaryType, baseSalary, houseRentAllowance: hra, travelAllowance: ta,
                        dearnessAllowance: da, specialAllowance: sa, otherAllowances: oa, providentFund: pf,
                        professionalTax: profTax, incomeTax, otherDeductions: otherDed, leaveDeductionPerDay: leaveDeduction,
                        effectiveFrom: today, effectiveTo, payrollEligible: true, remarks: "Updated via EditSysUser",
                        grossSalary, totalDeductions, netSalary,
                    };
                    await upsertTeacherSalary(id, salaryPayload);
                    salarySaved = true;
                } catch (salaryErr) {
                    console.error('Salary save error:', salaryErr);
                    toast.warning('User details were updated, but salary details could not be saved.');
                }
            }

            toast.dismiss(loadingToast);
            const parts = [`${formData.name.trim()}'s details updated successfully!`];
            if (salaryAttempted && salarySaved) parts.push('Salary details saved.');
            if (!isParentRole && (formData.accountNumber || formData.ifscCode || formData.bankName)) parts.push('Bank details saved.');
            toast.success(`${parts.join(' ')} ✅`);
            if (profileImage) {
                toast.info("Profile photo may take a few seconds to reflect.", { autoClose: 4000 });
            }
            navigate('/manageUsers');
        } catch (err) {
            toast.dismiss(loadingToast);
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
                    <button onClick={() => navigate('/manageUsers')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {commonStrings.BACK_TO_USERS}
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
                        <p className="text-gray-600 lg:text-xl font-medium">{strings.LOADING}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
            <div className="mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4">
                    <ChevronLeft className="w-5 h-5" /><span className="hidden sm:inline">Back to List</span>
                </button>
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{strings.PAGE_TITLE.replace('{name}', formData.name || '—')}</h1>
                    <p className="text-sm sm:text-base text-gray-500">{strings.PAGE_SUBTITLE}</p>
                </div>
                <form onSubmit={handle_updateDetails} noValidate>
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex flex-wrap -mb-px">
                                <button type="button" onClick={() => setActiveTab('personal')}
                                        className={`${isParentRole ? 'hidden' : 'flex'} items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    <User size={20} />
                                    <span className="hidden sm:inline">{strings.PERSONAL_DETAILS}</span>
                                    <span className="sm:hidden">{strings.PERSONAL_SHORT}</span>
                                </button>
                                {!isParentRole && (
                                    <button type="button" onClick={() => setActiveTab('salary')}
                                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'salary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                        <IndianRupee size={18} />
                                        <span className="hidden sm:inline">Salary Details</span>
                                        <span className="sm:hidden">Salary</span>
                                    </button>
                                )}
                                {!isParentRole && (
                                    <button type="button" onClick={() => setActiveTab('bank')}
                                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bank' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                        <Landmark size={18} />
                                        <span className="hidden sm:inline">Bank Details</span>
                                        <span className="sm:hidden">Bank</span>
                                    </button>
                                )}
                            </nav>
                        </div>

                        {activeTab === 'personal' && (
                            <div className="px-4 sm:px-6 lg:px-8 pt-6">
                                <label className="block font-semibold text-gray-600 text-sm mb-3">
                                    {strings.PROFILE_PHOTO} <span className="text-gray-400 text-xs font-normal ml-1">{strings.PROFILE_PHOTO_HELP}</span>
                                </label>
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                                            {displayedImage ? (
                                                <img src={displayedImage} alt="Profile" className="w-full h-full object-cover" onError={() => setExistingImageUrl(null)} />
                                            ) : (
                                                <User className="w-8 h-8 text-blue-400" />
                                            )}
                                        </div>
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow transition-colors">
                                            <Camera className="w-3.5 h-3.5 text-white" />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        {!displayedImage ? (
                                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                                    className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors cursor-pointer">
                                                <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                                <p className="text-sm font-medium text-blue-600">{strings.CLICK_TO_UPLOAD}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{strings.UPLOAD_HELP}</p>
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex-1 min-w-0">
                                                    {profileImage ? (
                                                        <>
                                                            <p className="text-sm font-medium text-green-700 truncate">{profileImage.name}</p>
                                                            <p className="text-xs text-green-500 mt-0.5">{(profileImage.size / 1024).toFixed(1)} KB — new photo selected</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm font-medium text-green-700">{strings.CURRENT_PROFILE}</p>
                                                            <p className="text-xs text-green-500 mt-0.5">Click "{strings.CHANGE}" to replace</p>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                                            className="text-xs px-2.5 py-1 bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors">
                                                        {strings.CHANGE}
                                                    </button>
                                                    <button type="button" onClick={handleRemoveImage}
                                                            className="w-7 h-7 flex items-center justify-center bg-white border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleImageChange} className="hidden" />
                            </div>
                        )}

                        {activeTab === 'personal' && !isParentRole && (
                            <div className="px-4 sm:px-6 lg:px-8 pb-6">
                                <UserPersonalDetailsTab formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} fieldErrors={fieldErrors} />
                            </div>
                        )}

                        {activeTab === 'personal' && isParentRole && (
                            <div className="px-4 sm:px-6 lg:px-8 pb-6">
                                <ParentPersonalDetailsTab formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} fieldErrors={fieldErrors} />
                            </div>
                        )}

                        {activeTab === 'salary' && !isParentRole && (
                            <div className="px-4 sm:px-6 lg:px-8 pb-6">
                                <SalaryDetailsTab formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} errors={salaryErrors} setSalaryErrors={setSalaryErrors} />
                            </div>
                        )}

                        {activeTab === 'bank' && !isParentRole && (
                            <div className="px-4 sm:px-6 lg:px-8 pb-6">
                                <BankDetailsTab
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    errors={bankErrors}
                                    accountNumberPlaceholder={maskedAccountNumber ? `Current: ${maskedAccountNumber} — enter to change` : 'Bank account number'}
                                />
                            </div>
                        )}

                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button type="button" onClick={() => navigate('/manageUsers')}
                                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                    {strings.DISCARD_CHANGES}
                                </button>
                                <button disabled={isLoading} type="submit"
                                        className={`mt-1 px-4 py-3 font-semibold rounded-lg transition-all ${isLoading ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'}`}>
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {commonStrings.SAVING}
                                        </span>
                                    ) : strings.SAVE_CHANGES}
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