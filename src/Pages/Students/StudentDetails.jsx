import { User, Mail, Phone, ChevronLeft, Users, Home, Bus, BookOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentById } from '../../Api/Students/StudentsApi';
import { useEffect, useState } from 'react';
import STUDENT_MODULE_STRINGS from '../../Constants/StringConstants/StudentsConst';

const SD = STUDENT_MODULE_STRINGS.STUDENT_DETAILS;
const FL = SD.FIELD_LABELS;
const C = STUDENT_MODULE_STRINGS.COMMON;

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const data = await getStudentById(id);
        const pd = data.personalDetails || {};
        setStudent({
          id: data.id,
          name: data.fullName?.trim() || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'N/A',
          email: pd.email || data.fatherEmail || 'N/A',
          mobile: pd.mobile || data.fatherPhone || 'N/A',
          gender: pd.gender || 'N/A',
          dob: pd.dateOfBirth || 'N/A',
          address: pd.address || 'N/A',
          bloodGroup: data.bloodGroup || 'N/A',
          profileImageUrl: data.profileImageUrl || null,
          admissionNumber: data.admissionNumber || 'N/A',
          rollNumber: data.rollNumber || 'N/A',
          admissionDate: data.admissionDate || 'N/A',
          academicYear: data.academicYear || 'N/A',
          status: data.status || 'N/A',
          className: data.className || 'N/A',
          sectionName: data.sectionName || 'N/A',
          previousSchool: data.previousSchool || 'N/A',
          fatherName: data.fatherName || 'N/A',
          fatherPhone: data.fatherPhone || 'N/A',
          fatherOccupation: data.fatherOccupation || 'N/A',
          motherName: data.motherName || 'N/A',
          motherPhone: data.motherPhone || 'N/A',
          motherOccupation: data.motherOccupation || 'N/A',
          guardianName: data.guardianName || 'N/A',
          guardianPhone: data.guardianPhone || 'N/A',
          guardianRelation: data.guardianRelation || 'N/A',
          emergencyContact: pd.emergencyContact || data.guardianPhone || 'N/A',
          hostelRequired: data.hostelRequired || false,
          transportRequired: data.transportRequired || false,
          remarks: data.remarks || '',
        });
      } catch (err) {
        console.error('Failed to load student', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">{SD.LOADING}</p>
      </div>
    );
  }

  if (!student) return null;

  const Row = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 border-b border-gray-50 last:border-0 gap-1 sm:gap-4">
      <span className="text-sm text-gray-500 font-medium shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-semibold text-left sm:text-right break-all">{value}</span>
    </div>
  );

  const statusColor = student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

  const AvatarContent = () => {
    const [imgError, setImgError] = useState(false);
    const initial = student.name?.[0]?.toUpperCase() || 'S';
    if (student.profileImageUrl && !imgError) {
      return (
        <img src={student.profileImageUrl} alt={student.name}
          className="w-full h-full object-cover object-center"
          onError={() => setImgError(true)} />
      );
    }
    return (
      <span className="text-white text-2xl font-bold flex items-center justify-center w-full h-full">
        {initial}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{SD.PAGE_TITLE}</h1>
          <button onClick={() => navigate(-1)}
            className="flex items-center cursor-pointer bg-gray-600 hover:bg-gray-800 active:scale-95 transition-all p-2 pr-3 rounded-xl text-white gap-1.5 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{C.BACK_TO_LIST}</span>
          </button>
        </div>

        {/* ── Profile Hero Card ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 border-2 border-blue-200">
              <AvatarContent />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{student.name}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                  {student.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {SD.ADMISSION_PREFIX} <span className="font-medium text-gray-700">{student.admissionNumber}</span>
                {student.rollNumber !== 'N/A' && (
                  <> &nbsp;·&nbsp; {SD.ROLL_PREFIX} <span className="font-medium text-gray-700">{student.rollNumber}</span></>
                )}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium text-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                  Class {student.className} — {student.sectionName}
                </span>
                {student.email !== 'N/A' && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="break-all">{student.email}</span>
                  </span>
                )}
                {student.mobile !== 'N/A' && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                    {student.mobile}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Personal Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{SD.SECTIONS.PERSONAL}</h3>
            </div>
            <div>
              <Row label={FL.FULL_NAME} value={student.name} />
              <Row label={FL.GENDER} value={student.gender} />
              <Row label={FL.DOB} value={student.dob} />
              <Row label={FL.BLOOD_GROUP} value={student.bloodGroup} />
              <Row label={FL.EMAIL} value={student.email} />
              <Row label={FL.MOBILE} value={student.mobile} />
              <Row label={FL.ADDRESS} value={student.address} />
            </div>
          </div>

          {/* Academic Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{SD.SECTIONS.ACADEMIC}</h3>
            </div>
            <div>
              <Row label={FL.ADMISSION_NUMBER} value={student.admissionNumber} />
              <Row label={FL.ROLL_NUMBER} value={student.rollNumber} />
              <Row label={FL.ADMISSION_DATE} value={student.admissionDate} />
              <Row label={FL.ACADEMIC_YEAR} value={student.academicYear} />
              <Row label={FL.PREVIOUS_SCHOOL} value={student.previousSchool} />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 border-b border-gray-50 gap-1 sm:gap-4">
                <span className="text-sm text-gray-500 font-medium">{FL.CLASS_SECTION}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold text-sm">
                  <BookOpen className="w-3.5 h-3.5" />
                  {student.className} — {student.sectionName}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 gap-1 sm:gap-4">
                <span className="text-sm text-gray-500 font-medium">{FL.STATUS}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                  {student.status}
                </span>
              </div>
            </div>
          </div>

          {/* Parent / Guardian Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{SD.SECTIONS.PARENT_GUARDIAN}</h3>
            </div>
            <div>
              <Row label={FL.FATHER_NAME} value={student.fatherName} />
              <Row label={FL.FATHER_PHONE} value={student.fatherPhone} />
              <Row label={FL.FATHER_OCCUPATION} value={student.fatherOccupation} />
              <Row label={FL.MOTHER_NAME} value={student.motherName} />
              <Row label={FL.MOTHER_PHONE} value={student.motherPhone} />
              <Row label={FL.MOTHER_OCCUPATION} value={student.motherOccupation} />
              <Row label={FL.GUARDIAN_NAME} value={student.guardianName} />
              <Row label={FL.GUARDIAN_RELATION} value={student.guardianRelation} />
              <Row label={FL.EMERGENCY_CONTACT} value={student.emergencyContact} />
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{SD.SECTIONS.FACILITIES}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hostel */}
              <div className={`relative rounded-xl p-4 border ${student.hostelRequired ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${student.hostelRequired ? 'bg-green-100' : 'bg-white'}`}>
                    <Home className={`w-5 h-5 ${student.hostelRequired ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{SD.BADGES.HOSTEL}</h4>
                    <p className={`text-xs mt-0.5 font-medium ${student.hostelRequired ? 'text-green-600' : 'text-gray-400'}`}>
                      {student.hostelRequired ? SD.BADGES.REQUIRED : SD.BADGES.NOT_REQUIRED}
                    </p>
                  </div>
                </div>
                {student.hostelRequired && (
                  <div className="absolute top-2.5 right-2.5">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Transport */}
              <div className={`relative rounded-xl p-4 border ${student.transportRequired ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${student.transportRequired ? 'bg-blue-100' : 'bg-white'}`}>
                    <Bus className={`w-5 h-5 ${student.transportRequired ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{SD.BADGES.TRANSPORT}</h4>
                    <p className={`text-xs mt-0.5 font-medium ${student.transportRequired ? 'text-blue-600' : 'text-gray-400'}`}>
                      {student.transportRequired ? SD.BADGES.REQUIRED : SD.BADGES.NOT_REQUIRED}
                    </p>
                  </div>
                </div>
                {student.transportRequired && (
                  <div className="absolute top-2.5 right-2.5">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {student.remarks && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                <p className="text-xs font-semibold text-yellow-700 mb-1">{SD.REMARKS}</p>
                <p className="text-sm text-yellow-800">{student.remarks}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
