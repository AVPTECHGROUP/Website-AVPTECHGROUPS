import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, ChevronLeft, GraduationCap, DollarSign, UserCheck, LogIn, Clock } from 'lucide-react';
import { getUserById } from '../../Api/StaffManagement/UserManagementAPI';
import USER_MANAGEMENT_STRINGS from '../../Constants/StringConstants/UserManagemetConstant';

const UserView = () => {
    const strings = USER_MANAGEMENT_STRINGS.USER_VIEW;
    const commonStrings = USER_MANAGEMENT_STRINGS.COMMON;
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setLoading(true);
                const data = await getUserById(id);
                setUserData(data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchUserDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">{strings.LOADING_PROFILE}</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <p className="text-gray-600 font-medium text-lg mb-4">{commonStrings.PROFILE_ERROR}</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    {commonStrings.GO_BACK}
                </button>
            </div>
        );
    }

    const initialLetter = userData.fullName?.[0]?.toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-20px)]">
            <div className="max-w-7xl mx-auto">

                {/* Header Title Section */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{strings.PAGE_TITLE}</h1>
                    <button onClick={() => navigate(-1)} className="flex items-center cursor-pointer bg-slate-700 px-4 py-2 rounded-xl text-white gap-2 hover:bg-slate-900 transition-colors shadow-sm">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">{strings.BACK_TO_LIST}</span>
                    </button>
                </div>

                {/* Profile Card Summary Banner */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shrink-0 border-2 border-blue-100 shadow-inner">
                            {userData.profileImageUrl ? (
                                <img src={userData.profileImageUrl} alt={userData.fullName} className="w-full h-full object-cover" onError={(e) => { e.target.src = ''; }} />
                            ) : (
                                initialLetter
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{userData.fullName || commonStrings.N_A}</h2>
                                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide w-fit ${userData.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {userData.status || 'INACTIVE'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-3">{strings.EMPLOYEE_ID}: {userData.employeeCode || userData.id}</p>
                            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    <span className="break-all">{userData.email || commonStrings.N_A}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    <span>{userData.mobile || commonStrings.N_A}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Modules Grid Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Section 1: Personal Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-5 border-b border-gray-50 pb-3">
                            <User className="w-5 h-5 text-blue-600" />
                            <h3 className="text-md font-bold text-gray-900">{strings.PERSONAL_DETAILS}</h3>
                        </div>
                        <div className="divide-y divide-gray-100/70 text-sm">
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500 font-medium">{strings.EMAIL_ADDRESS}</span>
                                <span className="text-gray-900 font-semibold">{userData.email || commonStrings.N_A}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500 font-medium">{strings.PHONE_NUMBER}</span>
                                <span className="text-gray-900 font-semibold">{userData.mobile || commonStrings.N_A}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500 font-medium">{strings.RESIDENTIAL_ADDRESS}</span>
                                <span className="text-gray-900 font-semibold">{userData.address || commonStrings.N_A}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500 font-medium">{strings.DATE_OF_BIRTH}</span>
                                <span className="text-gray-900 font-semibold">{userData.dateOfBirth || commonStrings.N_A}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Professional Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-5 border-b border-gray-50 pb-3">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            <h3 className="text-md font-bold text-gray-900">{strings.PROFESSIONAL_DETAILS}</h3>
                        </div>
                        <div className="divide-y divide-gray-100/70 text-sm">
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500 font-medium">{strings.HIGHEST_QUALIFICATION}</span>
                                <span className="text-gray-900 font-semibold">{userData.qualification || commonStrings.N_A}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500 font-medium">{strings.YEARS_OF_EXPERIENCE}</span>
                                <span className="text-gray-900 font-semibold">{userData.experienceYears ?? '0'}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500 font-medium">{strings.SALARY_TYPE}</span>
                                <span className="text-gray-900 font-semibold uppercase">{userData.salaryType || 'MONTHLY'}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500 font-medium">{strings.JOINED_DATE}</span>
                                <span className="text-gray-900 font-semibold">{userData.joiningDate || commonStrings.N_A}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Salary & Payroll */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-5 border-b border-gray-50 pb-3">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                            <h3 className="text-md font-bold text-gray-900">{strings.SALARY_PAYROLL}</h3>
                        </div>
                        <div className="divide-y divide-gray-100/70 text-sm">
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500 font-medium">{strings.BASIC_SALARY}</span>
                                <span className="text-gray-900 font-semibold">₹{(userData.basicSalary || 9999).toLocaleString()}</span>
                            </div>
                           
                            <div className="flex justify-between py-3 items-center">
                                <span className="text-gray-500 font-medium">{strings.PAYROLL_STATUS}</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                    {userData.payrollStatus || 'INCLUDED'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: System Eligibility Access Controls */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-5 border-b border-gray-50 pb-3">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                            <h3 className="text-md font-bold text-gray-900">{strings.SYSTEM_ELIGIBILITY}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* Login Access Subcard */}
                            <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100/50 relative">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="p-2 bg-white rounded-xl shadow-xs">
                                        <LogIn className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{strings.LOGIN_ACCESS}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{strings.LOGIN_ACCESS_DESC}</p>
                                    </div>
                                </div>
                                {userData.status === "ACTIVE" && (
                                    <div className="absolute top-3 right-3">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Attendance Access Subcard */}
                            <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100/50 relative">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="p-2 bg-white rounded-xl shadow-xs">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{strings.ATTENDANCE_ACCESS}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{strings.ATTENDANCE_ACCESS_DESC}</p>
                                    </div>
                                </div>
                                {userData.status === "ACTIVE" && (
                                    <div className="absolute top-3 right-3">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserView;