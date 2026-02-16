
import { User, Mail, Phone, ChevronLeft, Calendar, MapPin, Users, Home, Bus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentById } from '../../Api/StudentsApi';
import { useEffect, useState } from 'react';

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

      // 🔁 API → UI mapping
      const mappedStudent = {
        id: data.id,
        name: data.personalDetails?.fullName,
        email: data.personalDetails?.email,
        mobile: data.personalDetails?.mobile,
        gender: data.personalDetails?.gender,
        dob: data.personalDetails?.dateOfBirth,
        address: data.personalDetails?.address,

        admissionNumber: data.admissionNumber,
        admissionDate: data.admissionDate,
        status: data.status,

        fatherName: data.fatherName,
        motherName: data.motherName,
        emergencyContact: data.personalDetails?.emergencyContact,

        hostelRequired: data.hostelRequired,
        transportRequired: data.transportRequired
      };

      setStudent(mappedStudent);
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-sm sm:text-xl">Loading Student Details...</p>
      <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

if (!student) {
  return null;
}

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Profile</h1>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to List</span>
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{student.name}</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 w-fit">
                  {student.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Admission No: {student.admissionNumber}</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="break-all">{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>{student.mobile}</span>
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
                <span className="text-sm text-gray-600 font-medium">Full Name</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Gender</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.gender}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Date of Birth</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.dob}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Email Address</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Mobile Number</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.mobile}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Address</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.address}</span>
              </div>
            </div>
          </div>

          {/* Admission Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Admission Details</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Admission Number</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.admissionNumber}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Admission Date</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.admissionDate}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                  {student.status}
                </span>
              </div>
            </div>
          </div>

          {/* Parent Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Parent Details</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Father's Name</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.fatherName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Mother's Name</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.motherName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1 sm:gap-4">
                <span className="text-sm text-gray-600 font-medium">Emergency Contact</span>
                <span className="text-sm text-gray-900 font-semibold text-left sm:text-right">{student.emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Home className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Facilities</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hostel Facility Card */}
              <div className="bg-gray-50 rounded-lg p-4 relative">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-white rounded-lg">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Hostel</h4>
                    <p className="text-xs text-gray-600 mt-1">{student.hostelRequired ? 'Required' : 'Not Required'}</p>
                  </div>
                </div>
                {student.hostelRequired && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Transport Facility Card */}
              <div className="bg-gray-50 rounded-lg p-4 relative">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-white rounded-lg">
                    <Bus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Transport</h4>
                    <p className="text-xs text-gray-600 mt-1">{student.transportRequired ? 'Required' : 'Not Required'}</p>
                  </div>
                </div>
                {student.transportRequired && (
                  <div className="absolute top-2 right-2">
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

export default StudentDetails;