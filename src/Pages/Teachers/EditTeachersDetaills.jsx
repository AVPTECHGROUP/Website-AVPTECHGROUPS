import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, IndianRupee, User, Camera, X } from 'lucide-react';
import { getTeacherById, updateTeacher, upsertTeacherSalary } from '../../Api/TeachersAPI';
import PersonalDetailsTab from '../../Components/Teacher/EditTabComponents/PersonalDetailsTab';
import SalaryStructureTab from '../../Components/Teacher/EditTabComponents/SalaryStructureTab';
import { toast } from 'react-toastify';

function EditTeachersDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const fileInputRef = useRef(null);
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

    // Utility function
    function formatToInputDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    }

    // Common handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Fetch teacher
    useEffect(() => {
        const fetchTeacher = async () => {
            const data = await getTeacherById(id);
            setTeacher(data);
        };
        fetchTeacher();
    }, [id]);

    // Populate form
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
            accountStatus: teacher.accountAccessStatus === 'ALLOWED',
        }));
        if (teacher.profileImageUrl) {
            setExistingImageUrl(teacher.profileImageUrl);
        }
    }, [teacher]);


    // Submit handler
    async function handle_updateDetails(e) {
        e.preventDefault();
        setIsLoading(true);

        const teacherPayload = {
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
            },
            accountAccessStatus: formData.accountStatus ? "ALLOWED" : "BLOCKED"
        };

        try {
            await updateTeacher(id, teacherPayload);

            if (formData.salaryType && formData.baseSalary) {
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

                const today = new Date().toISOString().split('T')[0];
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
                    remarks: "Updated via EditTeacherDetails",
                    grossSalary,
                    totalDeductions,
                    netSalary
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
            }

            toast.success("Teacher details updated successfully!");
            if (profileImage) {
                toast.info("Profile photo may take a few seconds to reflect.", {
                    autoClose: 4000,
                });
            }

            navigate("/teachers");

        } catch (err) {
            console.error(err);
            toast.error("Failed to update teacher or salary. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }
    const displayedImage = imagePreview || existingImageUrl;

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
        setExistingImageUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDiscard = () => {
        navigate("/teachers");
    };

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
                        <p className="text-gray-600 lg:text-xl font-medium">Loading teachers...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
            <div className="mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to List</span>
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        Edit Teacher: {formData.name}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        Manage personal information and employment status for faculty members.
                    </p>
                </div>

                <form onSubmit={handle_updateDetails}>
                    <div className="bg-white rounded-lg shadow">
                        {/* Tabs */}
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
                                    <span className="hidden sm:inline">Personal Details</span>
                                    <span className="sm:hidden">Personal</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('salary')}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'salary'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <IndianRupee size={18} />
                                    <span className="hidden sm:inline">Salary Structure</span>
                                    <span className="sm:hidden">Salary</span>
                                </button>
                            </nav>
                        </div>

                        {/* Content */}
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
                                                    {displayedImage ? (
                                                        <img src={displayedImage} alt="Profile" className="w-full h-full object-cover"
                                                            onError={() => setExistingImageUrl(null)} />
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
                                                        <p className="text-sm font-medium text-blue-600">Click to upload photo</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">JPEG or PNG, max 10 MB</p>
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
                                                                    <p className="text-sm font-medium text-green-700">Current profile photo</p>
                                                                    <p className="text-xs text-green-500 mt-0.5">Click "Change" to replace</p>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            <button type="button" onClick={() => fileInputRef.current?.click()}
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
                                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleImageChange} className="hidden" />
                                    </div>

                                    <PersonalDetailsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                        handleInputChange={handleInputChange}
                                    />
                                </>
                            )}
                            {activeTab === 'salary' && (
                                <SalaryStructureTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    teacherId={id}
                                />
                            )}

                        </div>

                        {/* Footer Buttons */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className={`mt-1 px-4 py-3 font-semibold rounded-lg transition-all
  ${isLoading
                                            ? 'bg-blue-300 cursor-not-allowed text-white'
                                            : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'
                                        }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                                            </svg>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>

                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTeachersDetails;