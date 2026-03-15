import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { getStudentById, updateStudent } from '../../Api/StudentsApi';


function EditStudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await getStudentById(id);
        const student = res.data || res;

        setFormData({
          name: student.fullName,
          gender: student.personalDetails?.gender || '',
          email: student.personalDetails?.email || '',
          mobile: student.personalDetails?.mobile || '',
          address: student.personalDetails?.address || '',
          dob: student.personalDetails?.dateOfBirth,
          admissionNumber: student.admissionNumber,
          admissionDate: student.admissionDate,
          rollNumber: student.rollNumber || '',  // ✅ Added rollNumber
          status: student.status,
          fatherName: student.fatherName || '',
          motherName: student.motherName || '',
          emergencyContact: student.personalDetails?.emergencyContact || '',
          hostelRequired: student.hostelRequired,
          transportRequired: student.transportRequired,
        });

      } catch (err) {
        toast.error('Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.mobile || !formData.gender) {
      toast.error("Please fill all required fields!");
      return false;
    }

    if (!formData.rollNumber || !formData.rollNumber.trim()) {
      toast.error("Please enter a roll number!");
      return false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      toast.error("Mobile number must be exactly 10 digits!");
      return false;
    }

    if (formData.emergencyContact && !mobileRegex.test(formData.emergencyContact)) {
      toast.error("Emergency contact must be exactly 10 digits!");
      return false;
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address!");
        return false;
      }
    }

    return true;
  };

  const buildUpdatePayload = () => {
    const nameParts = formData.name.trim().split(' ');

    return {
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),

      rollNumber: formData.rollNumber.trim() || null,  // ✅ Included in update payload

      personalDetails: {
        fullName: formData.name,
        mobile: formData.mobile,
        email: formData.email || null,
        gender: formData.gender,
        address: formData.address || null,
        emergencyContact: formData.emergencyContact || null,
      },

      status: formData.status,
      hostelRequired: formData.hostelRequired,
      transportRequired: formData.transportRequired,

      fatherName: formData.fatherName || null,
      motherName: formData.motherName || null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating student...");

    try {
      const payload = buildUpdatePayload();

      const res = await updateStudent(id, payload);

      toast.dismiss(loadingToast);
      toast.success(res.message || "Student updated successfully ✅");

      navigate("/students");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to update student ❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/students');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className='text-sm sm:text-xl'>Loading...</p>
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!formData) return null;


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
            Edit Student Details
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Update the student information below. Fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap -mb-px">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 border-blue-600 text-blue-600"
                >
                  <User size={20} />
                  <span className="hidden sm:inline">Student Details</span>
                  <span className="sm:hidden">Details</span>
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-6">
                {/* Personal Details Section */}
                <div>
                  <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-user text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Personal Details</h2>
                  </div>

                  <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="name" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Full Name<span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder='Enter full name'
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Gender<span className="text-red-600 ml-1">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dob" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Date of Birth<span className="text-gray-400 ml-1 text-xs">(Read-only)</span>
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        className='bg-gray-200 font-normal text-gray-600 border border-gray-300 p-2 px-4 w-full rounded-md cursor-not-allowed'
                        disabled
                        readOnly
                      />
                    </div>

                    <div>
                      <label htmlFor="admissionNumber" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Admission Number<span className="text-gray-400 ml-1 text-xs">(Read-only)</span>
                      </label>
                      <input
                        type="text"
                        name="admissionNumber"
                        value={formData.admissionNumber}
                        className='bg-gray-200 font-normal text-gray-600 border border-gray-300 p-2 px-4 w-full rounded-md cursor-not-allowed'
                        disabled
                        readOnly
                      />
                    </div>

                    <div>
                      <label htmlFor="rollNumber" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Roll Number<span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        placeholder="Enter roll number"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="admissionDate" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Date of Admission<span className="text-gray-400 ml-1 text-xs">(Read-only)</span>
                      </label>
                      <input
                        type="date"
                        name="admissionDate"
                        value={formData.admissionDate}
                        className='bg-gray-200 font-normal text-gray-600 border border-gray-300 p-2 px-4 w-full rounded-md cursor-not-allowed'
                        disabled
                        readOnly
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Status<span className="text-red-600 ml-1">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                          }));
                        }}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.status === 'ACTIVE' ? "bg-blue-500" : "bg-gray-300"
                          }`}
                      >
                        <div
                          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.status === 'ACTIVE' ? "translate-x-6" : "translate-x-0"
                            }`}
                        />
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.status === 'ACTIVE' ? (
                          <span className="text-green-600 font-medium">● Active</span>
                        ) : (
                          <span className="text-red-600 font-medium">● Inactive</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="mobile" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Mobile Number<span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder='10 digit mobile number'
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be exactly 10 digits
                      </p>
                    </div>

                    <div>
                      <label htmlFor="email" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder='Enter email address'
                        pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Valid email format required if provided
                      </p>
                    </div>

                    <div className="lg:col-span-2">
                      <label htmlFor="address" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Current Address
                      </label>
                      <textarea
                        rows={4}
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder='Enter residential address'
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian Details Section */}
                <div>
                  <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-users text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Parent/Guardian Details</h2>
                  </div>

                  <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="fatherName" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Father's Name
                      </label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        placeholder="Enter father's name"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label htmlFor="motherName" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Mother's Name
                      </label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleInputChange}
                        placeholder="Enter mother's name"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label htmlFor="emergencyContact" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Emergency Contact Number
                      </label>
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder='10 digit emergency contact'
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be exactly 10 digits if provided
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Requirements Section */}
                <div>
                  <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-cog text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Additional Requirements</h2>
                  </div>

                  <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="hostelRequired" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Hostel Required
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, hostelRequired: !prev.hostelRequired }));
                        }}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.hostelRequired ? "bg-blue-500" : "bg-gray-300"
                          }`}
                      >
                        <div
                          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.hostelRequired ? "translate-x-6" : "translate-x-0"
                            }`}
                        />
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.hostelRequired ? 'Hostel accommodation enabled' : 'Hostel accommodation disabled'}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="transportRequired" className='block font-semibold text-gray-600 text-sm mb-2'>
                        Transport Required
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, transportRequired: !prev.transportRequired }));
                        }}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.transportRequired ? "bg-blue-500" : "bg-gray-300"
                          }`}
                      >
                        <div
                          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.transportRequired ? "translate-x-6" : "translate-x-0"
                            }`}
                        />
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.transportRequired ? 'School transport enabled' : 'School transport disabled'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
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
                      Updating...
                    </span>
                  ) : (
                    'Update Student'
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

export default EditStudentDetails;