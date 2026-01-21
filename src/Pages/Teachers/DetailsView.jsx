import { User, Mail, Phone, ChevronLeft, GraduationCap, DollarSign, UserCheck, Briefcase, LogIn, Clock } from 'lucide-react';
import {useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTeacherById } from '../../utils/allTeachers';

const DetailsView = () => {

   const { id } = useParams(); // teacher id from URL
  
  const [teacher, setTeacher] = useState(null);

useEffect(() => {
  const data = getTeacherById(id);
  setTeacher(data);
}, [id]);

  const navigate= useNavigate()

if (!teacher) {
  return <div className="p-10 text-center">Loading teacher...</div>;
}

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teacher Profile</h1>
          <button onClick={()=>navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to List</span>
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <img 
                src={teacher.image} 
                alt={teacher.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
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
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Email Address</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Phone Number</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.mobile}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Residential Address</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.address}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Date of Birth</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.dob}</span>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Professional Details</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Highest Qualification</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.highestQualification}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Years of Experience</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.experience}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Salary Type</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.salaryType}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Joined Date</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.joiningDate}</span>
              </div>
            </div>
          </div>

          {/* Salary & Payroll */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Salary & Payroll</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Basic Salary</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.basicSalary}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Total Allowances</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{teacher.totalAllowances}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Payroll Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">
                  {teacher.payroll}
                </span>
              </div>
            </div>
          </div>

          {/* System Eligibility */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">System Eligibility</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Login Access Card */}
              <div className="bg-gray-50 rounded-lg p-4 relative">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-white rounded-lg">
                    <LogIn className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Login Access</h4>
                    <p className="text-xs text-gray-600 mt-1">Authorized for web dashboard</p>
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

              {/* Attendance Access Card */}
              <div className="bg-gray-50 rounded-lg p-4 relative">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-white rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Attendance Access</h4>
                    <p className="text-xs text-gray-600 mt-1">Enabled for mobile check-in</p>
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
              <h3 className="text-lg font-bold text-gray-900">Academic Assignment</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Assigned Classes</h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.classes.map((className, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {className}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Subjects Specialized</h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((subject, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                    >
                      {subject === 'Mathematics' && ''}
                      {subject === 'Physics' && ''}
                      {subject === 'Logic' && ''}
                      {subject}
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

export default DetailsView