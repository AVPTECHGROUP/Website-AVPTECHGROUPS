import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeacherById, updateTeacher, updateSalary } from '../../Api/TeachersAPI';
import { ChevronLeft, GraduationCap, IndianRupee, User } from 'lucide-react';
import { toast } from 'react-toastify';
import UserPersonalDetailsTab from '../../Components/SuperAdmin/EditTabComponents/UserPersonalDetailsTab';
import ParentPersonalDetailsTab from '../../Components/SuperAdmin/EditTabComponents/ParentPersonalDetailsTab';
import { getUserById, updateUserById } from '../../Api/userManagementAPI';

function EditSysUser() {
    const { id } = useParams();
    const navigate = useNavigate(); // for navigation
    const [sysUser, setsysUser] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [activeRole, setActiveRole] = useState('PARENT');
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        mobile: '',
        email: '',
        dob: '',
        address: '',
        empId: '',
        highestQualification: '',
        experience: 0,
        joiningDate: '',
        loginEmail: '',
        dessignation: '',
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
    });

    const generateEmployeeCode = () => {
                return "EMP" + Math.floor(100 + Math.random() * 900); // EMP123
            };

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

    // Fetch sysUser
    useEffect(() => {
        const fetchsysUser = async () => {
            const data = await getUserById(id);
            setActiveRole(data.roles[0]);
            setsysUser(data);
        };
        fetchsysUser();
    }, [id]);

    // Populate form
    useEffect(() => {
        if (!sysUser) return;
        setFormData(prev => ({
            ...prev,
            //for actual data mapping uncomment below lines and remove the test data lines
            name: sysUser.fullName || '',
            gender: sysUser.gender || '',
            mobile: sysUser.mobile || '',
            email: sysUser.email || '',
            dob: formatToInputDate(sysUser.dateOfBirth),
            address: sysUser.address || '',
            empId: sysUser.employeeCode || '',
            highestQualification: sysUser.qualification || '',
            experience: sysUser.experienceYears || 0,
            joiningDate: formatToInputDate(sysUser.joiningDate),
            loginEmail: sysUser.email || '',
            dessignation: sysUser.designation || '',
            accountStatus: sysUser.accountAccessStatus === 'ALLOWED',
        }));
    }, [sysUser]);

    // Submit handler
    async function handle_updateDetails(e) {
        e.preventDefault();
        setIsLoading(true);
        // sysUser personal/professional payload
        // const sysUserPayload = {
        //     personalDetails: {
        //         fullName: formData.name,
        //         gender: formData.gender,
        //         mobile: formData.mobile,
        //         email: formData.email,
        //         dateOfBirth: formData.dob,
        //         address: formData.address,
        //     },
        //     professionalDetails: {
        //         employeeCode: formData.id,
        //         qualification: formData.highestQualification,
        //         experienceYears: Number(formData.experience),
        //         joiningDate: formData.joiningDate,
        //         designation: formData.role.toLowerCase(),
        //     },
        //     accountAccessStatus: formData.accountStatus ? "ALLOWED" : "BLOCKED"
        // };

        let sysUserPayload = {};

        if (activeRole === 'PARENT') {
            sysUserPayload = {
                email: formData.email,
                roleNames: [activeRole],
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
            sysUserPayload = {
                email: formData.email,
                roleNames: [activeRole],
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
                    employeeCode: formData.empId || generateEmployeeCode(),
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
          console.log(sysUserPayload);
        try {
            // Personal/professional details update
            await updateUserById(id, sysUserPayload);
            toast.success(`${formData.name}'s details updated successfully!`);
            navigate("/dashboard/manageUsers");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update user, Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    }


    const handleDiscard = () => {
        navigate("/dashboard/manageUsers");
    };

    if (!sysUser) {
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
                    <div className="flex items-center justify-center absolute lg:top-80">
                        <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 lg:text-xl font-medium">Loading User...</p>
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
                        Edit User: {formData.name}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        Manage personal information and account status for users.
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
                                    className={`${activeRole === 'PARENT' ? 'hidden' : 'flex'} items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <User size={20} />
                                    <span className="hidden sm:inline">Personal Details</span>
                                    <span className="sm:hidden">Personal</span>
                                </button>
                                {/* <button
                                    type="button"
                                    onClick={() => setActiveTab('salary')}
                                    className={`${formData.role.toLocaleLowerCase() === 'student' ? 'hidden' : 'flex'} items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'salary'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <IndianRupee size={18} />
                                    <span className="hidden sm:inline">Salary Structure</span>
                                    <span className="sm:hidden">Salary</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('student')}
                                    className={`${formData.role.toLocaleLowerCase() === 'student' ? 'flex' : 'hidden'} items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'student'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <User size={20} />
                                    <span className="hidden sm:inline">Student Details</span>
                                    <span className="sm:hidden">Student</span>
                                </button> */}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className={`p-4 sm:p-6 lg:p-8 ${activeTab === 'personal' && activeRole === 'PARENT' ? 'hidden' : ''}`}>
                            {activeTab === 'personal' && (
                                <UserPersonalDetailsTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                />
                            )}
                            {/* {activeTab === 'salary' && (
                                <SalaryStructureTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    sysUserId={id}
                                />
                            )} */}
                        </div>
                        <div className={`p-4 sm:p-6 lg:p-8 ${activeTab === 'personal' && activeRole !== 'PARENT' ? 'hidden' : ''}`}>
                            {activeTab === 'personal' && (
                                <ParentPersonalDetailsTab
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
                                    disabled={isLoading}
                                    type="submit"
                                    className={`mt-1 px-4 py-3 bg-blue-500  font-semibold rounded-lg transition-all${ isLoading? 'bg-blue-300 cursor-not-allowed text-white'
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

export default EditSysUser;