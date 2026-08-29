import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, IndianRupee, User, Camera, X } from 'lucide-react';
import { getTeacherById, updateTeacher, upsertTeacherSalary } from '../../Api/Teachers/TeachersAPI';
import PersonalDetailsTab from '../../Components/Teacher/EditTabComponents/PersonalDetailsTab';
import SalaryStructureTab from '../../Components/Teacher/EditTabComponents/SalaryStructureTab';
import { toast } from 'react-toastify';
import TEACHER_MODULE_STRINGS from '../../Constants/StringConstants/TeacherConstants';
import { getListOfValues } from "../../Api/Lov/ListOfValues.js";

// ── Local-date helpers ───────────────────────────────────────────────────
function getTodayLocalISO() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isFutureDate(dateStr) {
    if (!dateStr) return false;
    return dateStr > getTodayLocalISO();
}

function EditTeachersDetails() {
    const strings = TEACHER_MODULE_STRINGS;
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [designationList, setDesignationList] = useState([]);

    // Feature Flag Check for Payroll
    const isPayrollEnabled = (() => {
        try {
            const school = JSON.parse(localStorage.getItem('school'));
            return school?.features?.payrollEnabled ?? true;
        } catch {
            return true;
        }
    })();

    useEffect(() => {
        const fetchTeacherCategory = async () => {
            try {
                const data = await getListOfValues("TEACHER_CATEGORY");
                setDesignationList(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchTeacherCategory();
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        mobile: '',
        email: '',
        dob: '',
        address: '',
        id: '',
        highestQualification: '',
        experience: 0,
        joiningDate: '',
        loginEmail: '',
        role: 'Teacher',
        category: '',
        accountStatus: false,
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
        lateArrivalPenalty: '',
        salaryId: null,
    });

    function formatToInputDate(dateStr) {
        if (!dateStr) return "";

        if (dateStr.includes("-") && dateStr.length === 10) {
            return dateStr;
        }

        const date = new Date(dateStr);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const fetchTeacher = async () => {
            const data = await getTeacherById(id);
            setTeacher(data);
        };
        fetchTeacher();
    }, [id]);

    useEffect(() => {
        if (!teacher) return;
        setFormData(prev => ({
            ...prev,
            name: teacher.fullName || '',
            gender: teacher.gender || '',
            mobile: teacher.mobile || '',
            email: teacher.email || '',
            dob: formatToInputDate(teacher.dateOfBirth),
            address: teacher.address || '',
            id: teacher.employeeCode || '',
            highestQualification: teacher.qualification || '',
            experience: teacher.experienceYears || 0,
            joiningDate: formatToInputDate(teacher.joiningDate),
            loginEmail: teacher.email || '',
            role: teacher.designation || 'Teacher',
            category: teacher.category || '',
            accountStatus: teacher.accountAccessStatus === 'ALLOWED',
        }));
        if (teacher.profileImageUrl) {
            setExistingImageUrl(teacher.profileImageUrl);
        }
    }, [teacher]);

    const buildTeacherPayload = () => ({
        personalDetails: {
            fullName: formData.name,
            gender: formData.gender,
            mobile: formData.mobile,
            email: formData.email,
            dateOfBirth: formData.dob,
            address: formData.address,
        },
        professionalDetails: {
            employeeCode: formData.id,
            qualification: formData.highestQualification,
            experienceYears: Number(formData.experience),
            joiningDate: formData.joiningDate,
            designation: formData.role,
            category: formData.category,
        },
        accountAccessStatus: formData.accountStatus ? 'ALLOWED' : 'BLOCKED',
    });

    const handleSavePersonal = async () => {
        if (isFutureDate(formData.joiningDate)) {
            toast.error("Joining date cannot be in the future.");
            return;
        }
        setIsSaving(true);
        const loadingToast = toast.loading('Saving personal details...');
        try {
            await updateTeacher(id, buildTeacherPayload(), profileImage);
            toast.dismiss(loadingToast);
            toast.success(strings.EDIT_TEACHER.PERSONAL_SAVE_SUCCESS);
            if (profileImage) {
                toast.info(strings.EDIT_TEACHER.PHOTO_REFRESH_NOTICE, { autoClose: 4000 });
            }
        } catch (err) {
            console.error(err);
            toast.dismiss(loadingToast);
            toast.error('Failed to save personal details. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAndNextPersonal = async () => {
        if (isFutureDate(formData.joiningDate)) {
            toast.error("Joining date cannot be in the future.");
            return;
        }
        setIsSaving(true);
        const loadingToast = toast.loading('Saving personal details...');
        try {
            await updateTeacher(id, buildTeacherPayload(), profileImage);
            toast.dismiss(loadingToast);
            if (isPayrollEnabled) {
                setActiveTab('salary');
            } else {
                toast.success(strings.EDIT_TEACHER.PERSONAL_SAVE_SUCCESS);
                navigate('/teachers');
            }
        } catch (err) {
            console.error(err);
            toast.dismiss(loadingToast);
            toast.error('Failed to save personal details. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSalary = async () => {
        if (!formData.salaryType || !formData.baseSalary) {
            toast.warning(strings.EDIT_TEACHER.SALARY_WARNING);
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading(strings.EDIT_TEACHER.SALARY_SAVE_LOADING);
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
                salaryType: formData.salaryType,
                baseSalary,
                houseRentAllowance: hra,
                travelAllowance: ta,
                dearnessAllowance: da,
                specialAllowance: sa,
                otherAllowances: oa,
                providentFund: pf,
                professionalTax: profTax,
                incomeTax,
                otherDeductions: otherDed,
                leaveDeductionPerDay: leaveDeduction,
                effectiveFrom: today,
                effectiveTo,
                payrollEligible: true,
                remarks: 'Updated via EditTeacherDetails',
                grossSalary,
                totalDeductions,
                netSalary,
            };

            const salaryRes = await upsertTeacherSalary(id, salaryPayload);

            if (salaryRes?.data) {
                const d = salaryRes.data;
                setFormData(prev => ({
                    ...prev,
                    salaryId: d.id,
                    salaryType: d.salaryType || '',
                    baseSalary: d.baseSalary || '',
                    houseRentAllowance: d.houseRentAllowance || 0,
                    travelAllowance: d.travelAllowance || 0,
                    dearnessAllowance: d.dearnessAllowance || 0,
                    specialAllowance: d.specialAllowance || 0,
                    otherAllowances: d.otherAllowances || 0,
                    providentFund: d.providentFund || 0,
                    professionalTax: d.professionalTax || 0,
                    incomeTax: d.incomeTax || 0,
                    otherDeductions: d.otherDeductions || 0,
                    leaveDeductionPerDay: d.leaveDeductionPerDay || 0,
                }));
            }

            toast.dismiss(loadingToast);
            toast.success(strings.EDIT_TEACHER.SALARY_SAVE_SUCCESS);
            navigate('/teachers');
        } catch (err) {
            console.error("Salary Catch Error:", err);
            toast.dismiss(loadingToast);
            toast.error(err?.message || strings.EDIT_TEACHER.SALARY_SAVE_ERROR);
        } finally {
            setIsLoading(false);
        }
    };

    const displayedImage = imagePreview || existingImageUrl;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error(strings.ADD_TEACHER.ERRORS.IMG_TYPE);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error(strings.ADD_TEACHER.ERRORS.IMG_SIZE);
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
        setExistingImageUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDiscard = () => navigate('/teachers');

    if (!teacher) {
        return (
            <div className='min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8'>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to List</span>
                </button>
                <div className="flex items-center justify-center py-8 relative">
                    <div className="flex flex-col items-center justify-center absolute lg:top-75">
                        <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 lg:text-xl font-medium">{strings.EDIT_TEACHER.LOADING}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
            <div className="mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to List</span>
                </button>

                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        {strings.ADD_TEACHER.PAGE_TITLE}: {formData.name}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        {strings.ADD_TEACHER.SUBTITLE}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <nav className="flex flex-wrap -mb-px">
                            <button
                                type="button"
                                onClick={() => setActiveTab('personal')}
                                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <User size={20} />
                                <span className="hidden sm:inline">{strings.ADD_TEACHER.TABS.PERSONAL}</span>
                                <span className="sm:hidden">{strings.ADD_TEACHER.LABELS.PERSONAL}</span>
                            </button>
                            {isPayrollEnabled && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('salary')}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'salary'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <IndianRupee size={18} />
                                    <span className="hidden sm:inline">{strings.ADD_TEACHER.TABS.SALARY}</span>
                                    <span className="sm:hidden">Salary</span>
                                </button>
                            )}
                        </nav>
                    </div>

                    <div className="p-4 sm:p-6 lg:p-8">
                        {activeTab === 'personal' && (
                            <>
                                <div className="mb-6">
                                    <label className="block font-semibold text-gray-600 text-sm mb-3">
                                        {strings.EDIT_TEACHER.UPLOAD.LABEL}{' '}
                                        <span className="text-gray-400 text-xs font-normal ml-1">{strings.EDIT_TEACHER.UPLOAD.HELP}</span>
                                    </label>
                                    <div className="flex items-center gap-5">
                                        <div className="relative shrink-0">
                                            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                                                {displayedImage ? (
                                                    <img
                                                        src={displayedImage}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                        onError={() => setExistingImageUrl(null)}
                                                    />
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
                                            {!displayedImage ? (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors cursor-pointer"
                                                >
                                                    <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                                    <p className="text-sm font-medium text-blue-600">{strings.EDIT_TEACHER.UPLOAD.CTA}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{strings.EDIT_TEACHER.UPLOAD.FORMAT_HELP}</p>
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex-1 min-w-0">
                                                        {profileImage ? (
                                                            <>
                                                                <p className="text-sm font-medium text-green-700 truncate">{profileImage.name}</p>
                                                                <p className="text-xs text-green-500 mt-0.5">
                                                                    {(profileImage.size / 1024).toFixed(1)} KB — new photo selected
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="text-sm font-medium text-green-700">{strings.EDIT_TEACHER.UPLOAD.CURRENT}</p>
                                                                <p className="text-xs text-green-500 mt-0.5">{strings.EDIT_TEACHER.UPLOAD.REPLACE}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="text-xs px-2.5 py-1 bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors"
                                                        >
                                                            {strings.EDIT_TEACHER.UPLOAD.CHANGE}
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
                                <PersonalDetailsTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    designationList={designationList}
                                    onSave={handleSavePersonal}
                                    onSaveAndNext={handleSaveAndNextPersonal}
                                    isSaving={isSaving}
                                />
                            </>
                        )}

                        {activeTab === 'salary' && isPayrollEnabled && (
                            <SalaryStructureTab
                                formData={formData}
                                setFormData={setFormData}
                                handleInputChange={handleInputChange}
                                teacherId={id}
                            />
                        )}
                    </div>

                    {activeTab === 'salary' && isPayrollEnabled && (
                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    {strings.COMMON.DISCARD_CHANGES}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveSalary}
                                    disabled={isLoading}
                                    className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${isLoading
                                        ? 'bg-blue-300 cursor-not-allowed text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'
                                    }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Salary'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditTeachersDetails;