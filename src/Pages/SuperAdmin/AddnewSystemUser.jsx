import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Camera, X, Image as ImageIcon, RefreshCcw, IndianRupee, Landmark } from 'lucide-react';
import { toast } from 'react-toastify';
import AddPersonalDetails from '../../Components/SuperAdmin/AddTabComponents/AddPersionslDetails';
import SalaryDetailsTab from '../../Components/Teacher/AddTabComponents/AddSalaryDetails';
import BankDetailsTab from '../../Components/SuperAdmin/AddTabComponents/AddBankDetails';
import { createUser, updateUserById, getAllUserRoles } from '../../Api/StaffManagement/UserManagementAPI';
import { upsertTeacherSalary } from '../../Api/Teachers/TeachersAPI';
import USER_MANAGEMENT_STRINGS from '../../Constants/StringConstants/UserManagemetConstant';

const VALID_GENDERS = ['MALE', 'FEMALE', 'OTHER'];
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

// ── Local-date helper (same UTC/local-safe approach used for teachers) ──
function getTodayLocalISO() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const validateFormData = (formData, validRoles = []) => {
    const fieldErrors = {};
    const isParentLike = PARENT_LIKE_ROLES.includes(formData.userRole);

    if (!formData.userRole || !validRoles.includes(formData.userRole)) fieldErrors.userRole = 'Please select a valid user role.';
    const trimmedName = (formData.name || '').trim();
    if (!trimmedName) fieldErrors.name = 'Full name is required.';
    else if (trimmedName.length < 2) fieldErrors.name = 'Full name must be at least 2 characters.';
    else if (trimmedName.length > MAX_NAME_LENGTH) fieldErrors.name = `Full name cannot exceed ${MAX_NAME_LENGTH} characters.`;
    else if (!/^[a-zA-Z\s'.,-]+$/.test(trimmedName)) fieldErrors.name = 'Full name contains invalid characters.';

    if (!formData.gender || !VALID_GENDERS.includes(formData.gender.toUpperCase())) fieldErrors.gender = 'Please select a valid gender.';
    if (!formData.email || !EMAIL_REGEX.test(formData.email.trim())) fieldErrors.email = 'Please enter a valid email address.';

    const mobileTrimmed = (formData.mobile || '').replace(/\s/g, '');
    if (!mobileTrimmed) fieldErrors.mobile = 'Mobile number is required.';
    else if (!MOBILE_REGEX.test(mobileTrimmed)) fieldErrors.mobile = 'Enter a valid 10-digit Indian mobile number (starts with 6–9).';

    if (formData.dob) {
        if (!isValidPastDate(formData.dob)) fieldErrors.dob = 'Date of birth must be a valid past date.';
        else {
            const age = Math.floor((new Date() - new Date(formData.dob)) / (1000 * 60 * 60 * 24 * 365.25));
            if (age < 18) fieldErrors.dob = 'User must be at least 18 years old.';
            if (age > 100) fieldErrors.dob = 'Date of birth seems invalid (age > 100).';
        }
    }
    if (formData.address && formData.address.trim().length > MAX_ADDRESS_LENGTH) fieldErrors.address = `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters.`;

    if (!isParentLike) {
        if (formData.employeeCode && !EMP_CODE_REGEX.test(formData.employeeCode.trim())) fieldErrors.employeeCode = 'Employee code must be 2–20 alphanumeric characters.';
        if (formData.joiningDate && !isValidJoiningDate(formData.joiningDate)) fieldErrors.joiningDate = 'Joining date must be a valid date not in the future.';
        const exp = Number(formData.experience);
        if (formData.experience !== '' && formData.experience !== undefined) {
            if (!Number.isFinite(exp) || exp < 0) fieldErrors.experience = 'Experience must be a non-negative number.';
            else if (exp > MAX_EXPERIENCE) fieldErrors.experience = `Experience cannot exceed ${MAX_EXPERIENCE} years.`;
        }
    }
    if (!formData.accountStatus) fieldErrors.accountStatus = 'Account status must be enabled to save.';

    return { valid: Object.keys(fieldErrors).length === 0, fieldErrors };
};

// Salary is optional — only enforced once the user starts filling it in
// (mirrors the Bank Details validation approach: format/completeness
// checks only kick in when there's actual data to validate).
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

function AddnewSystemUser() {
    const strings = USER_MANAGEMENT_STRINGS.ADD_USER;
    const commonStrings = USER_MANAGEMENT_STRINGS.COMMON;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [salaryErrors, setSalaryErrors] = useState({});
    const [bankErrors, setBankErrors] = useState({});
    const createdUserIdRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const salarySectionRef = useRef(null);
    const bankSectionRef = useRef(null);

    // --- CAMERA & POPUP STATE ---
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [facingMode, setFacingMode] = useState('user'); // Default front camera
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        return () => stopCamera();
    }, []);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startCamera = async (mode = 'user') => {
        stopCamera();
        setShowCamera(true); // Open camera inside the same modal
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
            streamRef.current = stream;
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 50);
        } catch (err) {
            toast.error("Camera access denied or unavailable.");
            console.error(err);
            setShowCamera(false);
        }
    };

    const toggleCamera = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newMode);
        startCamera(newMode);
    };

    const closePhotoMenu = () => {
        setShowPhotoMenu(false);
        setShowCamera(false);
        stopCamera();
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                handleImageChange({ target: { files: [file] } });
                closePhotoMenu(); // Close the modal and stop camera
            }
        }, "image/jpeg", 0.9);
    };
    // ----------------------------

    const [roleOptions, setRoleOptions] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '', gender: '', email: '', loginEmail: '', mobile: '', address: '', dob: '', employeeCode: '', highestQualification: '',
        experience: 0, joiningDate: '', payrollStatus: '', accountStatus: false, userRole: '', salaryType: 'MONTHLY', baseSalary: '',
        leaveDeductionPerDay: '', houseRentAllowance: '', travelAllowance: '', dearnessAllowance: '', specialAllowance: '',
        otherAllowances: '', providentFund: '', professionalTax: '', incomeTax: '', otherDeductions: '', assignedClass: '',
        section: '', primarySubject: '', additionalSubjects: '', isClassTeacher: false,
        // Bank Details
        accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '', branchName: '', branchAddress: '', iban: '', swiftCode: '',
    });

    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                setRolesLoading(true);
                const rolesRes = await getAllUserRoles();
                const fetchedRoles = rolesRes.data || [];
                const roleOpt = fetchedRoles.filter((val) => val.name !== 'SUPER_ADMIN' && val.name !== 'TEACHER' && val.name !== 'GLOBAL_ADMIN' && val.name !== 'PARENT')
                    .map((val) => ({ roleKey: val.id, roleVal: val.name, roleDisplay: val.displayName }));
                setRoleOptions(roleOpt);
            } catch (e) {
                console.error('Fetch roles error:', e.message);
                toast.error('Failed to load user roles. Please refresh the page.');
            } finally { setRolesLoading(false); }
        };
        fetchUserRoles();
    }, []);

    const validRoleNames = roleOptions.map((r) => r.roleVal);
    const isParentLike = PARENT_LIKE_ROLES.includes(formData.userRole);

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
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        if (salaryErrors[name]) setSalaryErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        if (bankErrors[name]) setBankErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        let sanitized = value;
        if (name === 'mobile') sanitized = value.replace(/\D/g, '').slice(0, 10);
        if (name === 'experience') sanitized = value === '' ? '' : Math.max(0, Math.min(MAX_EXPERIENCE, Number(value)));
        if (name === 'name') sanitized = value.slice(0, MAX_NAME_LENGTH);
        if (name === 'address') sanitized = value.slice(0, MAX_ADDRESS_LENGTH);
        setFormData((prev) => ({ ...prev, [name]: sanitized }));
    };

    const buildPayload = (data) => {
        const isParent = PARENT_LIKE_ROLES.includes(data.userRole);
        const personalDetails = {
            fullName: data.name.trim(), mobile: data.mobile.trim(), email: data.email.trim(), gender: data.gender.toUpperCase(),
            dateOfBirth: data.dob || null, address: data.address?.trim() || 'NA',
        };
        if (isParent) return { email: data.email.trim(), roleNames: [data.userRole], personalDetails, accountStatus: 'ACTIVE' };
        return {
            email: data.email.trim(), roleNames: [data.userRole], personalDetails,
            professionalDetails: {
                employeeCode: data.employeeCode?.trim() || generateEmployeeCode(), qualification: data.highestQualification?.trim() || 'NA',
                experienceYears: Number(data.experience) || 0, joiningDate: data.joiningDate || null,
            },
            bankDetails: {
                accountHolderName: data.accountHolderName || '',
                accountNumber: data.accountNumber || '',
                bankName: data.bankName || '',
                ifscCode: data.ifscCode || '',
                branchName: data.branchName || '',
                branchAddress: data.branchAddress || '',
                iban: data.iban || '',
                swiftCode: data.swiftCode || '',
            },
            accountStatus: 'ACTIVE',
        };
    };

    const goToTab = (targetTab) => {
        const { valid, fieldErrors: errs } = validateFormData(formData, validRoleNames);
        if (!valid) {
            setFieldErrors(errs);
            toast.error("Please fill all required personal details correctly.");
            setActiveTab('personal');
            return;
        }
        if (targetTab === 'bank' && !isParentLike) {
            const { valid: salaryValid, salaryErrors: sErrs } = validateSalaryData(formData);
            if (!salaryValid) {
                setSalaryErrors(sErrs);
                toast.error("Please correct the salary details before continuing.");
                setActiveTab('salary');
                return;
            }
        }
        setActiveTab(targetTab);
        const ref = targetTab === 'salary' ? salarySectionRef : bankSectionRef;
        setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { valid, fieldErrors: errs } = validateFormData(formData, validRoleNames);
        if (!valid) {
            setFieldErrors(errs);
            toast.error("Please fill all required personal details correctly.");
            setActiveTab('personal');
            return;
        }
        if (!isParentLike) {
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

            // Salary is a separate record, saved the same way it is for
            // teachers — only attempted when the user actually filled it in.
            if (!isParentLike && formData.salaryType && formData.baseSalary) {
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
                        salaryType: formData.salaryType, baseSalary, houseRentAllowance: hra, travelAllowance: ta,
                        dearnessAllowance: da, specialAllowance: sa, otherAllowances: oa, providentFund: pf,
                        professionalTax: profTax, incomeTax, otherDeductions: otherDed, leaveDeductionPerDay: leaveDeduction,
                        effectiveFrom: today, effectiveTo, payrollEligible: true, remarks: "Created via AddnewSystemUser",
                        grossSalary, totalDeductions, netSalary,
                    };
                    await upsertTeacherSalary(createdUserIdRef.current, salaryPayload);
                } catch (salaryErr) {
                    console.error('Salary save error:', salaryErr);
                    toast.warning('User was saved, but salary details could not be saved. You can add them from Edit.');
                }
            }

            toast.dismiss(loadingToast);
            toast.success(`${formData.name.trim()} : ${response?.message ?? 'User added successfully ✅'}`);
            if (profileImage) toast.info("Profile photo may take a few seconds to reflect.", { autoClose: 4000 });
            navigate('/manageUsers');
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err?.message || 'Failed to add user. Please try again.');
            console.error(err);
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
            <div className="mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">{strings.BACK_TO_LIST}</span>
                </button>
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{strings.PAGE_TITLE}</h1>
                    <p className="text-sm sm:text-base text-gray-500">{strings.PAGE_SUBTITLE}</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex flex-wrap -mb-px">
                                <button type="button" onClick={() => setActiveTab('personal')}
                                        className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    <User size={20} />
                                    <span className="hidden sm:inline">{strings.PERSONAL_DETAILS}</span>
                                    <span className="sm:hidden">{strings.PERSONAL_SHORT}</span>
                                </button>
                                {!isParentLike && (
                                    <button type="button" onClick={() => goToTab('salary')}
                                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'salary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                        <IndianRupee size={18} />
                                        <span className="hidden sm:inline">Salary Details</span>
                                        <span className="sm:hidden">Salary</span>
                                    </button>
                                )}
                                {!isParentLike && (
                                    <button type="button" onClick={() => goToTab('bank')}
                                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bank' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                        <Landmark size={18} />
                                        <span className="hidden sm:inline">Bank Details</span>
                                        <span className="sm:hidden">Bank</span>
                                    </button>
                                )}
                            </nav>
                        </div>
                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeTab === 'personal' && (
                                <>
                                    <div className="mb-6">
                                        <label className="block font-semibold text-gray-600 text-sm mb-3">
                                            {strings.PROFILE_PHOTO} <span className="text-gray-400 text-xs font-normal ml-1">{strings.PROFILE_PHOTO_HELP}</span>
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
                                                <button type="button" onClick={() => setShowPhotoMenu(true)}
                                                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow transition-colors">
                                                    <Camera className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                {!imagePreview ? (
                                                    <button type="button" onClick={() => setShowPhotoMenu(true)}
                                                            className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors cursor-pointer">
                                                        <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                                        <p className="text-sm font-medium text-blue-600">{strings.CLICK_TO_UPLOAD}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{strings.UPLOAD_HELP}</p>
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-green-700 truncate">{profileImage?.name}</p>
                                                            <p className="text-xs text-green-500 mt-0.5">{profileImage ? (profileImage.size / 1024).toFixed(1) + ' KB' : ''}</p>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            <button type="button" onClick={() => setShowPhotoMenu(true)}
                                                                    className="text-xs px-2.5 py-1 bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors">
                                                                Change
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
                                    <AddPersonalDetails formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} roleOptions={roleOptions} rolesLoading={rolesLoading} />
                                </>
                            )}

                            {activeTab === 'salary' && !isParentLike && (
                                <div ref={salarySectionRef}>
                                    <SalaryDetailsTab formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} errors={salaryErrors} setSalaryErrors={setSalaryErrors} />
                                </div>
                            )}

                            {activeTab === 'bank' && !isParentLike && (
                                <div ref={bankSectionRef}>
                                    <BankDetailsTab formData={formData} handleInputChange={handleInputChange} errors={bankErrors} />
                                </div>
                            )}
                        </div>
                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button type="button" onClick={() => navigate('/manageUsers')} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    {commonStrings.DISCARD}
                                </button>
                                {activeTab === 'personal' && !isParentLike && (
                                    <button type="button" onClick={() => goToTab('salary')} className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                                        Next
                                    </button>
                                )}
                                {activeTab === 'salary' && (
                                    <button type="button" onClick={() => goToTab('bank')} className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                                        Next
                                    </button>
                                )}
                                {(activeTab === 'personal' && isParentLike) || activeTab === 'bank' ? (
                                    <button disabled={isSubmitting} type="submit" className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'}`}>
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{commonStrings.ADDING}</span>
                                        ) : commonStrings.SAVE_DETAILS}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </form>

                {/* --- PHOTO SELECTION & CAMERA MODAL --- */}
                {showPhotoMenu && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <div className="bg-white w-full sm:w-[500px] rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    {showCamera && (
                                        <button
                                            type="button"
                                            onClick={() => { setShowCamera(false); stopCamera(); }}
                                            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                                        </button>
                                    )}
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {showCamera ? 'Live Camera' : 'Upload Profile Photo'}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {showCamera && (
                                        <button
                                            type="button"
                                            onClick={toggleCamera}
                                            className="text-sm font-medium text-blue-600 flex items-center gap-1.5 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                            <span className="hidden sm:inline">Switch</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={closePhotoMenu}
                                        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4">
                                {!showCamera ? (
                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => startCamera(facingMode)}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all text-left"
                                        >
                                            <div className="bg-blue-100 p-3 rounded-full">
                                                <Camera className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Open Live Camera</p>
                                                <p className="text-sm text-gray-500">Take a picture right now</p>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { closePhotoMenu(); fileInputRef.current?.click(); }}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl transition-all text-left"
                                        >
                                            <div className="bg-gray-100 p-3 rounded-full">
                                                <ImageIcon className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Upload from Device</p>
                                                <p className="text-sm text-gray-500">Choose an existing photo</p>
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shadow-inner">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                                            />
                                        </div>
                                        <div className="mt-6 mb-2">
                                            <button
                                                type="button"
                                                onClick={capturePhoto}
                                                className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 border-4 border-blue-100 shadow-lg hover:scale-105 transition-all flex items-center justify-center"
                                            >
                                                <Camera className="w-6 h-6 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddnewSystemUser;