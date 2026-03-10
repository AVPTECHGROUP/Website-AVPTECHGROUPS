import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, GraduationCap, IndianRupee, User } from 'lucide-react';
import { toast } from 'react-toastify';
import AddPersonalDetails from '../../Components/SuperAdmin/AddTabComponents/AddPersionslDetails';
import { createUser, updateUserById } from '../../Api/userManagementAPI';

function AddnewSystemUser() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveNext, setSaveNext] = useState(false);
    const [submitVisible, setSubmitVisible] = useState(true);
    const [current_userId, setCurrent_userId] = useState(0);
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
        userRole: '',
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


    let current_count = 0;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const checkEmptySaveNext = () => {
        if (!formData.name || !formData.gender || !formData.mobile) {
            toast.error("Please fill all required fields!");
            return;
        }

    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.gender || !formData.mobile) {
            toast.error("Please fill all required fields!");
            return;
        }

        // Check if account status is disabled
        if (!formData.accountStatus) {
            toast.error("Please enable account status to add user!", {
                duration: 3000,
                icon: "⚠️"
            });
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Adding user...");

        try {
            const generateEmployeeCode = () => {
                return "EMP" + Math.floor(100 + Math.random() * 900); // EMP123
            };
            let apiPayload = {};
            if (formData.userRole === 'PARENT') {
                apiPayload = {
                    email: formData.email,
                    roleNames: [formData.userRole],
                    personalDetails: {
                        fullName: formData.name,
                        mobile: formData.mobile,
                        email: formData.email || "test.user@school.com",
                        gender: formData.gender.toUpperCase(),
                        dateOfBirth: formData.dob,
                        address: formData.address || "NA",
                        emergencyContact: "9999999999",
                        emergencyContactName: "NA",
                        emergencyContactRelation: "NA"
                    },
                    // professionalDetails: {
                    //     employeeCode: formData.employeeCode || generateEmployeeCode(),
                    //     qualification: formData.highestQualification || "NA",
                    //     experienceYears: Number(formData.experience || 1),
                    //     joiningDate: formData.joiningDate,
                    //     department: "GENERAL",
                    //     designation: "USER"
                    // },
                    // bankDetails: {
                    //     accountHolderName: "NA",
                    //     accountNumber: "000000000000",
                    //     bankName: "NA",
                    //     ifscCode: "HDFC0123456",
                    //     branchName: "NA"
                    // },
                    accountStatus: "ACTIVE",
                    // payrollStatus: "INCLUDED",
                    remarks: "Created from UI"
                };
            } else {
                apiPayload = {
                    email: formData.email,
                    roleNames: [formData.userRole],
                    personalDetails: {
                        fullName: formData.name,
                        mobile: formData.mobile,
                        email: formData.email || "test.user@school.com",
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
                        designation: "USER"
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
            }
            let response;
            if(current_count === 0 && current_userId === 0){
             response = await createUser(apiPayload);
            const userId = response.data.id;
            setCurrent_userId(userId);
            }else{
            current_count = current_count+1;
             response = await updateUserById(current_userId, apiPayload);
            }
            console.log("Create User Response:", response.message);

            toast.dismiss(loadingToast);
            toast.success(`${formData.name} : ${response.message} `, {
                duration: 3000,
                icon: "✅"
            });
            navigate('/dashboard/manageUsers');

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
        navigate('/dashboard/manageUsers');
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
                        Add New User
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        Enter the details below to onboard a new user into system.
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
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeTab === 'personal' && (
                                <AddPersonalDetails
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
                            </div>
                        </div>  
                    </div>
                </form> 
            </div>
        </div>
    );
}

export default AddnewSystemUser;