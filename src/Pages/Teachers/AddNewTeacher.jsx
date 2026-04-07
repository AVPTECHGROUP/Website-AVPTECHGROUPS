import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, IndianRupee, User, Camera, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { createTeachers, upsertTeacherSalary } from '../../Api/TeachersAPI';
import PersonalDetailsTab from '../../Components/Teacher/AddTabComponents/AddPersonalInfo';
import SalaryDetailsTab from '../../Components/Teacher/AddTabComponents/AddSalaryDetails';

function AddNewTeacher() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        email: "",
        loginEmail: "",
        mobile: "",
        address: "",
        dob: "",
        employeeCode: "",
        highestQualification: "",
        experience: 0,
        joiningDate: "",
        payrollStatus: "ACTIVE",
        accountStatus: false,
        // Salary fields
        salaryType: '',
        baseSalary: '',
        leaveDeductionPerDay: '',
        lateArrivalPenalty: '',
        houseRentAllowance: '',
        travelAllowance: '',
        dearnessAllowance: '',
        specialAllowance: '',
        otherAllowances: '',
        providentFund: '',
        professionalTax: '',
        incomeTax: '',
        otherDeductions: '',
        // Class assignment fields
        assignedClass: '',
        section: '',
        primarySubject: '',
        additionalSubjects: '',
        isClassTeacher: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "mobile") {
            if (!/^\d*$/.test(value)) return; // allow only digits
            if (value.length > 10) return; // max 10 digits
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.gender || !formData.mobile) {
            toast.error("Please fill all required fields!");
            return;
        }

        // Check if account status is disabled
        if (!formData.accountStatus) {
            toast.error("Please enable account status to add teacher!", {
                duration: 3000,
                icon: "⚠️"
            });
            return;
        }

        if (!/^\d{10}$/.test(formData.mobile)) {
            toast.error("Mobile number must be exactly 10 digits!");
            return;
        }
        setIsSubmitting(true);
        const loadingToast = toast.loading("Adding teacher...");

        try {
            const generateEmployeeCode = () => {
                return "EMP" + Math.floor(100 + Math.random() * 900); // EMP123
            };

            const apiPayload = {
                personalDetails: {
                    fullName: formData.name,
                    mobile: formData.mobile,
                    email: formData.email || "test.teacher@school.com",
                    gender: formData.gender.toUpperCase(),
                    dateOfBirth: formData.dob,
                    address: formData.address || "NA",
                    // emergencyContact: "9999999999",
                    // emergencyContactName: "NA",
                    // emergencyContactRelation: "NA"
                },
                professionalDetails: {
                    employeeCode: formData.employeeCode || generateEmployeeCode(),
                    qualification: formData.highestQualification || "NA",
                    experienceYears: Number(formData.experience || 1),
                    joiningDate: formData.joiningDate,
                    // department: "GENERAL",
                    // designation: "TEACHER"
                },
                // bankDetails: {
                //     accountHolderName: "NA",
                //     accountNumber: "000000000000",
                //     bankName: "NA",
                //     ifscCode: "HDFC0123456",
                //     branchName: "NA"
                // },
                accountStatus: "ACTIVE",
                // payrollStatus: "INCLUDED",
                // remarks: "Created from UI"
            };

            const response = await createTeachers(apiPayload);

            console.log("Create Teacher Response:", response);

            // Only update salary if baseSalary AND salaryType are present
            if (response && formData.salaryType && formData.baseSalary) {
                const teacherId = response.data?.id || response.id;

                if (!teacherId) {
                    toast.warn("Teacher created but salary update skipped - no teacher ID");
                } else {
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
                        remarks: "Created via AddNewTeacher",
                        grossSalary,
                        totalDeductions,
                        netSalary
                    };

                    try {
                        const salaryResponse = await upsertTeacherSalary(teacherId, salaryPayload);
                        console.log("Salary Update Response:", salaryResponse);
                    } catch (salaryError) {
                        console.error("Salary update failed:", salaryError);
                        toast.warn("Teacher created but salary update failed");
                    }
                }
            } else {
                console.log("Skipping salary update - missing data:", {
                    hasResponse: !!response,
                    hasSalaryType: !!formData.salaryType,
                    hasBaseSalary: !!formData.baseSalary
                });
            }

            toast.dismiss(loadingToast);
            toast.success("Teacher added successfully!", {
                duration: 3000,
                icon: "✅"
            });

            // Navigate after a short delay to show the toast
            setTimeout(() => {
                navigate('/teachers');
            }, 500);

        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.message || "Failed to add teacher. Please try again.", {
                duration: 4000,
                icon: "❌"
            });
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDiscard = () => {
        navigate('/teachers');
    };

    const handleNext = () => {
        setActiveTab('salary')
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
                        Add New Teacher
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        Enter the details below to onboard a new teacher into the payroll system.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
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
                                    <span className="hidden sm:inline">Salary Details</span>
                                    <span className="sm:hidden">Salary</span>
                                </button>

                            </nav>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeTab === 'personal' && (
                                <>
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

                                    <PersonalDetailsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                        handleInputChange={handleInputChange}
                                    />
                                </>
                            )}

                            {activeTab === 'salary' && (
                                <SalaryDetailsTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
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
                                {/* Showing next button */}
                                {activeTab === 'personal' && (
                                    <button type='submit' onClick={handleNext} className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white">Next</button>
                                )}
                                {/* Show save button after reaching salaryTab...*/}
                                {activeTab === 'salary' && (
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${isSubmitting
                                            ? 'bg-blue-300 cursor-not-allowed text-white'
                                            : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Adding...
                                            </span>
                                        ) : (
                                            'Save Details'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddNewTeacher;