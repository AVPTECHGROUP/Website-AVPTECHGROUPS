import { User, Mail, Phone, ChevronLeft, GraduationCap, DollarSign, UserCheck, Briefcase, LogIn, Clock, IndianRupee } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTeacherById } from '../../Api/Teachers/TeachersAPI';
import TEACHER_MODULE_STRINGS from '../../Constants/StringConstants/TeacherConstants';

const DetailsView = () => {
  const strings = TEACHER_MODULE_STRINGS;
  const { id } = useParams();

  const [teacher, setTeacher] = useState(null);

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
    const fetchTeacher = async () => {
      try {
        const res = await getTeacherById(id);
        const t = res;
        if (!t) return;

        const filteredTeacher = {
          id: t.id,
          name: t.fullName,
          profileImageUrl: t.profileImageUrl || null,
          email: t.email,
          mobile: t.mobile,
          gender: t.gender,
          dob: t.dateOfBirth,
          address: t.address,
          highestQualification: t.qualification,
          experience: t.experienceYears,
          joiningDate: t.joiningDate,
          salaryType: t.salaryStructure?.salaryType,
          baseSalary: t.salaryStructure?.baseSalary,
          totalAllowances: t.salaryStructure ? t.salaryStructure.grossSalary - t.salaryStructure.baseSalary : 0,
          payroll: t.payrollStatus,
          status: t.status,
          loginAccess: t.attendanceAccessStatus === "ALLOWED",
          attendanceAccess: t.attendanceAccessStatus === "ALLOWED",
          classes: t.assignments?.map(a => ({
            className: a.className,
            sectionName: a.sectionName,
            subjectName: a.subjectName,
            isClassTeacher: a.isClassTeacher,
          })) || [],
        };

        setTeacher(filteredTeacher);
      } catch (error) {
        console.error("Failed to fetch teacher:", error);
      }
    };
    if (id) fetchTeacher();
  }, [id]);

  const AvatarContent = () => {
    const [imgError, setImgError] = useState(false);
    const initial = teacher.name?.[0]?.toUpperCase() || 'T';

    if (teacher.profileImageUrl && !imgError) {
      return (
        <img
          src={teacher.profileImageUrl}
          alt={teacher.name}
          className="w-full h-full object-cover object-center"
          onError={() => setImgError(true)}
        />
      );
    }

    return (
      <span className="text-white text-2xl font-bold flex items-center justify-center w-full h-full">
        {initial}
      </span>
    );
  };

  const navigate = useNavigate();

  if (!teacher) {
    return (
      <div className='min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8'>
        <div className="flex items-center justify-center py-8 relative">
          <div className="flex flex-col items-center justify-center absolute lg:top-75">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 lg:text-xl font-medium">{strings.COMMON.LOADING}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{strings.DETAILS.PROFILE}</h1>
          <button onClick={() => navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{strings.COMMON.BACK_TO_LIST}</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 border-2 border-blue-200">
              <AvatarContent />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{teacher.name}</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 w-fit">
                  {teacher.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Employee ID: {teacher.id}</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="break-all">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>{teacher.mobile}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{strings.DETAILS.PERSONAL_TAB}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.EMAIL}</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.PHONE}</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.mobile}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.ADDRESS}</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.address}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.DOB}</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.dob}</span>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{strings.DETAILS.PROFESSIONAL_TAB}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.QUALIFICATION}</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.highestQualification}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.EXPERIENCE}</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.experience}</span>
              </div>
              {isPayrollEnabled && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                  <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.SALARY_TYPE}</span>
                  <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.salaryType}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.JOINED}</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.joiningDate}</span>
              </div>
            </div>
          </div>

          {/* Salary & Payroll (Hidden when payrollEnabled is false) */}
          {isPayrollEnabled && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <IndianRupee className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">{strings.DETAILS.SALARY_TAB}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                  <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.BASIC_SALARY}</span>
                  <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">
                    ₹{teacher.baseSalary?.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                  <span className="text-sm text-gray-600 font-medium">{strings.DETAILS.FIELDS.TOTAL_ALLOWANCES}</span>
                  <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.totalAllowances}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">{strings.DETAILS.FIELDS.PAYROLL_STATUS}</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">
                    {teacher.payroll}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* System Eligibility */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{strings.DETAILS.SYSTEM_TAB}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 relative">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-white rounded-lg">
                    <LogIn className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{strings.DETAILS.LABELS.LOGIN_ACCESS_TITLE}</h4>
                    <p className="text-xs text-gray-600 mt-1">{strings.DETAILS.LABELS.AUTHORIZED_WEB_TITLE}</p>
                  </div>
                </div>
                {teacher.loginAccess && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 relative">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-white rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{strings.DETAILS.LABELS.ATTENDANCE_ACCESS}</h4>
                    <p className="text-xs text-gray-600 mt-1">{strings.DETAILS.LABELS.MOBILE_CHECK_IN_TITLE}</p>
                  </div>
                </div>
                {teacher.attendanceAccess && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic Assignment */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{strings.DETAILS.ACADEMIC_TAB}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{strings.DETAILS.LABELS.ASSIGNED_CLASSES}</h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.classes.map((cls, index) => (
                    <span
                      key={index}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${cls.isClassTeacher
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {cls.className} - {cls.sectionName} ({cls.subjectName})

                      {cls.isClassTeacher && (
                        <span className="ml-2 text-xs font-bold">
                          Class Teacher
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsView;