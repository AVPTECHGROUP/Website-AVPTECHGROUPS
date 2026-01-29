import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, GraduationCap, IndianRupee, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { createTeachers, updateSalary } from '../../Api/TeachersAPI';
import PersonalDetailsTab from '../../Components/Teacher/AddTabComponents/AddPersonalInfo';
import SalaryDetailsTab from '../../Components/Teacher/AddTabComponents/AddSalaryDetails';
import ClassAssignmentTab from '../../Components/Teacher/AddTabComponents/AddClassDetails';

function AddNewTeacher() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                    emergencyContact: "9999999999",
                    emergencyContactName: "NA",
                    emergencyContactRelation: "NA"
                },
                professionalDetails: {
                    employeeCode: formData.employeeCode || generateEmployeeCode(),
                    qualification: formData.highestQualification || "NA",
                    experienceYears: Number(formData.experience || 1),
                    joiningDate: formData.joiningDate,
                    department: "GENERAL",
                    designation: "TEACHER"
                },
                bankDetails: {
                    accountHolderName: "NA",
                    accountNumber: "000000000000",
                    bankName: "NA",
                    ifscCode: "HDFC0123456",
                    branchName: "NA"
                },
                accountStatus: "ACTIVE",
                payrollStatus: "INCLUDED",
                remarks: "Created from UI"
            };

            const response = await createTeachers(apiPayload);
            
            console.log("Create Teacher Response:", response);

            // Only update salary if baseSalary AND salaryType are present
            if (response && formData.salaryType && formData.baseSalary) {
                // Extract teacher ID from response - adjust based on actual response structure
                const teacherId = response.data?.id || response.id;
                
                console.log("Teacher ID for salary update:", teacherId);
                
                if (!teacherId) {
                    console.error("No teacher ID found in response:", response);
                    toast.warn("Teacher created but salary update skipped - no teacher ID");
                } else {
                    const baseSalary = Number(formData.baseSalary) || 0;
                    const allowanceTotal =
                        (Number(formData.houseRentAllowance) || 0) +
                        (Number(formData.travelAllowance) || 0) +
                        (Number(formData.dearnessAllowance) || 0) +
                        (Number(formData.specialAllowance) || 0) +
                        (Number(formData.otherAllowances) || 0) +
                        (Number(formData.providentFund) || 0);

                    const deductionTotal =
                        (Number(formData.professionalTax) || 0) +
                        (Number(formData.incomeTax) || 0) +
                        (Number(formData.otherDeductions) || 0) +
                        (Number(formData.leaveDeductionPerDay) || 0);

                    const grossSalary = baseSalary + allowanceTotal;
                    const totalDeductions = deductionTotal;
                    const netSalary = grossSalary - totalDeductions;

                    const salaryPayload = {
                        // Remove id field for new salary creation
                        salaryType: formData.salaryType,
                        baseSalary,
                        houseRentAllowance: Number(formData.houseRentAllowance) || 0,
                        travelAllowance: Number(formData.travelAllowance) || 0,
                        dearnessAllowance: Number(formData.dearnessAllowance) || 0,
                        specialAllowance: Number(formData.specialAllowance) || 0,
                        otherAllowances: Number(formData.otherAllowances) || 0,
                        providentFund: Number(formData.providentFund) || 0,
                        professionalTax: Number(formData.professionalTax) || 0,
                        incomeTax: Number(formData.incomeTax) || 0,
                        otherDeductions: Number(formData.otherDeductions) || 0,
                        leaveDeductionPerDay: Number(formData.leaveDeductionPerDay) || 0,
                        effectiveFrom: new Date().toISOString().split('T')[0],
                        effectiveTo: new Date().toISOString().split('T')[0],
                        payrollEligible: true,
                        remarks: "Created via AddNewTeacher",
                        grossSalary,
                        totalDeductions,
                        netSalary
                    };

                    console.log("Salary Payload:", salaryPayload);
                    console.log("Calling updateSalary with teacherId:", teacherId);

                    try {
                        const salaryResponse = await updateSalary(teacherId, salaryPayload);
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
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'personal'
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
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'salary'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <IndianRupee size={18} />
                                    <span className="hidden sm:inline">Salary Details</span>
                                    <span className="sm:hidden">Salary</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('classes')}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'classes'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <GraduationCap />
                                    <span className="hidden sm:inline">Class Assignment</span>
                                    <span className="sm:hidden">Classes</span>
                                </button>
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeTab === 'personal' && (
                                <PersonalDetailsTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                />
                            )}

                            {activeTab === 'salary' && (
                                <SalaryDetailsTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                />
                            )}

                            {activeTab === 'classes' && (
                                <ClassAssignmentTab
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
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                        isSubmitting
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
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddNewTeacher;