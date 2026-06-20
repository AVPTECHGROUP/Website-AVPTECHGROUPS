import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, User, Camera, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { getStudentById, updateStudent } from '../../Api/StudentsApi';
import { getAllSections } from '../../Api/TeachersAPI';


function EditStudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  // ── Image handlers ─────────────────────────────────────────────────────────
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
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Displayed src: new local preview takes priority, then existing server URL
  const displayedImage = imagePreview || existingImageUrl;

  // ── Fetch sections ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await getAllSections();
        if (res?.success && Array.isArray(res.data)) {
          setSections(res.data);
        } else {
          toast.error("Failed to load sections.");
        }
      } catch (err) {
        console.error("fetchSections error:", err);
        toast.error("Could not fetch sections. Please refresh.");
      } finally {
        setSectionsLoading(false);
      }
    };
    fetchSections();
  }, []);

  // ── Fetch student ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const student = await getStudentById(id);

        // ── Pre-fill image preview from existing URL ──
        if (student.profileImageUrl) {
          setExistingImageUrl(student.profileImageUrl);
        }

        setFormData({
          name: student.fullName,
          gender: student.personalDetails?.gender || '',
          email: student.personalDetails?.email || '',
          mobile: student.personalDetails?.mobile || '',
          address: student.personalDetails?.address || '',
          dob: student.personalDetails?.dateOfBirth,
          admissionNumber: student.admissionNumber,
          admissionDate: student.admissionDate,
          rollNumber: student.rollNumber || '',
          sectionId: student.sectionId || '',
          status: student.status,
          fatherName: student.fatherName || '',
          fatherPhone: student.fatherPhone || '',       // ✅ NEW
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const mobileRegex = /^[0-9]{10}$/;

    if (!formData.name || !formData.mobile || !formData.gender) {
      toast.error("Please fill all required fields!");
      return false;
    }
    if (!formData.rollNumber || !formData.rollNumber.trim()) {
      toast.error("Please enter a roll number!");
      return false;
    }
    if (!formData.sectionId) {
      toast.error("Please select a section!");
      return false;
    }
    if (!mobileRegex.test(formData.mobile)) {
      toast.error("Mobile number must be exactly 10 digits!");
      return false;
    }
    if (formData.emergencyContact && !mobileRegex.test(formData.emergencyContact)) {
      toast.error("Emergency contact must be exactly 10 digits!");
      return false;
    }
    // ✅ Father phone validation
    if (formData.fatherPhone && !mobileRegex.test(formData.fatherPhone)) {
      toast.error("Father's phone number must be exactly 10 digits!");
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
      rollNumber: formData.rollNumber.trim() || null,
      sectionId: Number(formData.sectionId),
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
      fatherPhone: formData.fatherPhone || null,       // ✅ NEW
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
      const res = await updateStudent(id, payload, profileImage);
      toast.dismiss(loadingToast);
      toast.success(res.message || "Student updated successfully ✅");
      
      if (profileImage) {
        toast.info("Profile photo may take a few seconds to reflect.", {
          autoClose: 4000,
        });
      }

      navigate("/students");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to update student ❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/students');

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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to List</span>
        </button>

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Edit Student Details</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Update the student information below. Fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow">
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

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-6">

                {/* ── Profile Photo Upload ── */}
                <div>
                  <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <Camera className="text-blue-500 mr-3 w-6 h-6" />
                    <h2 className='text-xl font-medium text-gray-700'>Profile Photo</h2>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Avatar preview */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                        {displayedImage ? (
                          <img
                            src={displayedImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              setExistingImageUrl(null);
                            }}
                          />
                        ) : (
                          <User className="w-8 h-8 text-blue-400" />
                        )}
                      </div>
                      {/* Camera overlay */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>

                    {/* Upload area */}
                    <div className="flex-1">
                      {!displayedImage ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors cursor-pointer"
                        >
                          <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                          <p className="text-sm font-medium text-blue-600">Click to upload new photo</p>
                          <p className="text-xs text-gray-400 mt-0.5">JPEG or PNG, max 10 MB</p>
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex-1 min-w-0">
                            {profileImage ? (
                              <>
                                <p className="text-sm font-medium text-green-700 truncate">{profileImage.name}</p>
                                <p className="text-xs text-green-500 mt-0.5">
                                  {(profileImage.size / 1024).toFixed(1)} KB — new photo selected
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-green-700 truncate">Current profile photo</p>
                                <p className="text-xs text-green-500 mt-0.5">Click "Change" to replace</p>
                              </>
                            )}
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
                              title="Remove photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Personal Details Section */}
                <div>
                  <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-user text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Personal Details</h2>
                  </div>

                  <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Full Name<span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="text" name="name" value={formData.name}
                        onChange={handleInputChange} placeholder='Enter full name'
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      />
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Gender<span className="text-red-600 ml-1">*</span>
                      </label>
                      <select
                        name="gender" value={formData.gender} onChange={handleInputChange}
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Date of Birth<span className="text-gray-400 ml-1 text-xs">(Read-only)</span>
                      </label>
                      <input
                        type="date" name="dob" value={formData.dob}
                        className='bg-gray-200 font-normal text-gray-600 border border-gray-300 p-2 px-4 w-full rounded-md cursor-not-allowed'
                        disabled readOnly
                      />
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Admission Number<span className="text-gray-400 ml-1 text-xs">(Read-only)</span>
                      </label>
                      <input
                        type="text" name="admissionNumber" value={formData.admissionNumber}
                        className='bg-gray-200 font-normal text-gray-600 border border-gray-300 p-2 px-4 w-full rounded-md cursor-not-allowed'
                        disabled readOnly
                      />
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Roll Number<span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="text" name="rollNumber" value={formData.rollNumber}
                        onChange={handleInputChange} placeholder="Enter roll number"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      />
                    </div>

                    {/* Section Field */}
                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Section<span className="text-red-600 ml-1">*</span>
                      </label>
                      {sectionsLoading ? (
                        <div className="bg-gray-100 border border-gray-300 p-2 px-4 w-full rounded-md text-gray-400 text-sm">
                          Loading sections...
                        </div>
                      ) : (
                        <select
                          name="sectionId" value={formData.sectionId} onChange={handleInputChange}
                          className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          required
                        >
                          <option value="">Select Section</option>
                          {sections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name} {sec.className ? `(${sec.className})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Date of Admission<span className="text-gray-400 ml-1 text-xs">(Read-only)</span>
                      </label>
                      <input
                        type="date" name="admissionDate" value={formData.admissionDate}
                        className='bg-gray-200 font-normal text-gray-600 border border-gray-300 p-2 px-4 w-full rounded-md cursor-not-allowed'
                        disabled readOnly
                      />
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Status<span className="text-red-600 ml-1">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                        }))}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.status === 'ACTIVE' ? "bg-blue-500" : "bg-gray-300"}`}
                      >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.status === 'ACTIVE' ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.status === 'ACTIVE'
                          ? <span className="text-green-600 font-medium">● Active</span>
                          : <span className="text-red-600 font-medium">● Inactive</span>}
                      </p>
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Mobile Number<span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="tel" name="mobile" value={formData.mobile}
                        onChange={handleInputChange} placeholder='10 digit mobile number'
                        maxLength={10} pattern="[0-9]{10}"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits</p>
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Email Address
                        <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                      </label>
                      <input
                        type="email" name="email" value={formData.email}
                        onChange={handleInputChange} placeholder='Enter email address'
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                      <p className="text-xs text-gray-500 mt-1">Valid email format required if provided</p>
                    </div>

                    <div className="lg:col-span-2">
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Current Address
                        <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                      </label>
                      <textarea
                        rows={4} name="address" value={formData.address}
                        onChange={handleInputChange} placeholder='Enter residential address'
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
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Father's Name
                        <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                      </label>
                      <input
                        type="text" name="fatherName" value={formData.fatherName}
                        onChange={handleInputChange} placeholder="Enter father's name"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    {/* ✅ NEW: Father's Phone Number */}
                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Father's Phone Number
                        <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                      </label>
                      <input
                        type="tel" name="fatherPhone" value={formData.fatherPhone}
                        onChange={handleInputChange} placeholder="10 digit phone number"
                        maxLength={10} pattern="[0-9]{10}"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits if provided</p>
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Mother's Name
                        <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                      </label>
                      <input
                        type="text" name="motherName" value={formData.motherName}
                        onChange={handleInputChange} placeholder="Enter mother's name"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Emergency Contact Number
                        <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                      </label>
                      <input
                        type="tel" name="emergencyContact" value={formData.emergencyContact}
                        onChange={handleInputChange} placeholder='10 digit emergency contact'
                        maxLength={10} pattern="[0-9]{10}"
                        className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits if provided</p>
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
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>Hostel Required</label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, hostelRequired: !prev.hostelRequired }))}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.hostelRequired ? "bg-blue-500" : "bg-gray-300"}`}
                      >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.hostelRequired ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.hostelRequired ? 'Hostel accommodation enabled' : 'Hostel accommodation disabled'}
                      </p>
                    </div>

                    <div>
                      <label className='block font-semibold text-gray-600 text-sm mb-2'>Transport Required</label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, transportRequired: !prev.transportRequired }))}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.transportRequired ? "bg-blue-500" : "bg-gray-300"}`}
                      >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.transportRequired ? "translate-x-6" : "translate-x-0"}`} />
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
                  type="button" onClick={handleCancel}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting} type="submit"
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Updating...
                    </span>
                  ) : 'Update Student'}
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