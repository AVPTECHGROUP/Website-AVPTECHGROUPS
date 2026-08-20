import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, User, Camera, X, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { getStudentById, updateStudent } from '../../Api/Students/StudentsApi';
import { getAllSections } from '../../Api/Teachers/TeachersAPI';
import STUDENT_MODULE_STRINGS from '../../Constants/StringConstants/StudentsConst';

const ES = STUDENT_MODULE_STRINGS.EDIT_STUDENT;
const C = STUDENT_MODULE_STRINGS.COMMON;
const PF = STUDENT_MODULE_STRINGS.PERSONAL_FORM;
const FF = STUDENT_MODULE_STRINGS.FAMILY_FORM;
const G = STUDENT_MODULE_STRINGS.GENDER;

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

  // --- CAMERA & POPUP STATE ---
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (mode = 'user') => {
    stopCamera();
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      toast.error("Camera access denied or unavailable.");
      console.error(err);
      setShowCamera(false);
    }
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const closePhotoMenu = () => {
    setShowPhotoMenu(false);
    setShowCamera(false);
    stopCamera();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        handleImageChange({ target: { files: [file] } });
        closePhotoMenu();
      }
    }, "image/jpeg", 0.9);
  };
  // ----------------------------

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error(ES.ERRORS?.PHOTO_TYPE || 'Only JPG/PNG images allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(ES.ERRORS?.PHOTO_SIZE || 'File size must be under 10MB');
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

  const displayedImage = imagePreview || existingImageUrl;

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await getAllSections();
        if (res?.success && Array.isArray(res.data)) {
          const activeSections = res.data.filter(sec => sec.status === 'ACTIVE');
          setSections(activeSections);
        } else {
          toast.error(ES.ERRORS?.SECTION_LOAD_FAILED || "Failed to load sections");
        }
      } catch (err) {
        console.error('fetchSections error:', err);
        toast.error(ES.ERRORS?.SECTION_LOAD_RETRY || "Failed to load sections");
      } finally {
        setSectionsLoading(false);
      }
    };
    fetchSections();
  }, []);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const student = await getStudentById(id);

        if (student?.profileImageUrl) setExistingImageUrl(student.profileImageUrl);

        const pd = student?.personalDetails || {};

        let firstName = student?.firstName || pd.firstName || '';
        let lastName = student?.lastName || pd.lastName || '';
        if (!firstName && !lastName) {
          const fullName = student?.fullName || pd.fullName || '';
          const parts = fullName.trim().split(' ');
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ').trim();
        }

        const sectionId = student?.sectionId ?? student?.section?.id ?? '';

        setFormData({
          firstName,
          lastName,
          gender: (pd.gender || student?.gender || '').toString().toUpperCase(),
          email: pd.email || student?.email || '',
          mobile: pd.mobile || student?.mobile || '',
          address: student?.currentAddress || pd.address || '',
          dob: pd.dateOfBirth || student?.dob || '',
          admissionNumber: student?.admissionNumber || '',
          admissionDate: student?.admissionDate || '',
          rollNumber: student?.rollNumber || '',
          sectionId,
          status: student?.status || 'ACTIVE',
          category: student?.category || 'GENERAL',
          studentHouse: student?.studentHouse || '',
          fatherName: student?.fatherName || '',
          fatherPhone: student?.fatherPhone || '',
          motherName: student?.motherName || '',
          emergencyContact: pd.emergencyContact || student?.guardianPhone || '',
          hostelRequired: Boolean(student?.hostelRequired),
          hostelRoomDescription: student?.hostelRoomDescription || '',
          transportRequired: Boolean(student?.transportRequired),
          aadhaarNumber: student?.aadhaarNumber || '',
          aparId: student?.aparId || '',
          penNumber: student?.penNumber || '',
          bankName: student?.bankName || '',
          bankAccountNumber: student?.bankAccountNumber || '',
          bankIfscCode: student?.bankIfscCode || '',
        });
      } catch (err) {
        toast.error(ES.ERRORS?.LOAD_FAILED || "Failed to load student details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const mobileRegex = /^[0-9]{10}$/;

    if (!formData.rollNumber?.trim()) {
      toast.error(ES.ERRORS?.ROLL_REQUIRED || "Roll Number is required");
      return false;
    }
    if (!formData.sectionId) {
      toast.error(ES.ERRORS?.SECTION_REQUIRED || "Section is required");
      return false;
    }
    if (formData.hostelRequired && !formData.hostelRoomDescription?.trim()) {
      toast.error("Hostel Room Number is required when hostel accommodation is enabled");
      return false;
    }
    if (!mobileRegex.test(formData.mobile)) {
      toast.error(ES.ERRORS?.MOBILE_INVALID || "Mobile number must be 10 digits");
      return false;
    }
    if (formData.emergencyContact && !mobileRegex.test(formData.emergencyContact)) {
      toast.error(ES.ERRORS?.EMERGENCY_INVALID || "Emergency contact must be 10 digits");
      return false;
    }
    if (formData.fatherPhone && !mobileRegex.test(formData.fatherPhone)) {
      toast.error(ES.ERRORS?.FATHER_PHONE_INVALID || "Father phone must be 10 digits");
      return false;
    }
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error(ES.ERRORS?.EMAIL_INVALID || "Invalid email address");
        return false;
      }
    }
    return true;
  };

  const buildUpdatePayload = () => {
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      firstName,
      lastName,
      fullName,
      rollNumber: formData.rollNumber.trim() || null,
      sectionId: Number(formData.sectionId),
      status: formData.status,
      category: formData.category || 'GENERAL',
      studentHouse: formData.studentHouse.trim() || null,
      hostelRequired: Boolean(formData.hostelRequired),
      hostelRoomDescription: formData.hostelRequired ? (formData.hostelRoomDescription.trim() || null) : null,
      transportRequired: Boolean(formData.transportRequired),
      fatherName: formData.fatherName.trim() || null,
      fatherPhone: formData.fatherPhone || null,
      motherName: formData.motherName.trim() || null,
      currentAddress: formData.address.trim() || null,
      permanentAddress: formData.address.trim() || null,
      aadhaarNumber: formData.aadhaarNumber.trim() || null,
      aparId: formData.aparId.trim() || null,
      penNumber: formData.penNumber.trim() || null,
      bankName: formData.bankName.trim() || null,
      bankAccountNumber: formData.bankAccountNumber.trim() || null,
      bankIfscCode: formData.bankIfscCode.trim() || null,
      personalDetails: {
        firstName,
        lastName,
        fullName,
        mobile: formData.mobile,
        email: formData.email.trim() || null,
        gender: formData.gender,
        dateOfBirth: formData.dob,
        address: formData.address.trim() || null,
        emergencyContact: formData.emergencyContact || null,
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading(ES.LOADING || "Updating student...");
    try {
      const payload = buildUpdatePayload();
      const res = await updateStudent(id, payload, profileImage);
      toast.dismiss(loadingToast);
      toast.success(res?.message || ES.SUCCESS || "Student updated successfully!");
      if (profileImage) toast.info(ES.PROFILE_PHOTO?.REFRESH_NOTICE || "Photo updated", { autoClose: 4000 });
      navigate('/students');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to update student ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/students');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-sm sm:text-xl">{C.LOADING}</p>
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mt-2" />
      </div>
    );
  }

  if (!formData) return null;

  const inputClass = 'bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
  const readOnlyClass = 'bg-gray-200 font-normal text-gray-600 border border-gray-300 p-2 px-4 w-full rounded-md cursor-not-allowed';
  const labelClass = 'block font-semibold text-gray-600 text-sm mb-2';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
      <div className="mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{C.BACK_TO_LIST}</span>
        </button>

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{ES.PAGE_TITLE}</h1>
          <p className="text-sm sm:text-base text-gray-500">{ES.SUBTITLE}</p>
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
                  <span className="hidden sm:inline">{ES.TAB}</span>
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
                    <h2 className="text-xl font-medium text-gray-700">{ES.PROFILE_PHOTO?.TITLE || "Profile Photo"}</h2>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                        {displayedImage ? (
                          <img
                            src={displayedImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; setExistingImageUrl(null); }}
                          />
                        ) : (
                          <User className="w-8 h-8 text-blue-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPhotoMenu(true)}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    <div className="flex-1">
                      {!displayedImage ? (
                        <button
                          type="button"
                          onClick={() => setShowPhotoMenu(true)}
                          className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors cursor-pointer"
                        >
                          <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                          <p className="text-sm font-medium text-blue-600">{ES.PROFILE_PHOTO?.CTA || "Upload Photo"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{ES.PROFILE_PHOTO?.FORMAT_HELP || "PNG/JPG under 10MB"}</p>
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex-1 min-w-0">
                            {profileImage ? (
                              <>
                                <p className="text-sm font-medium text-green-700 truncate">{profileImage.name}</p>
                                <p className="text-xs text-green-500 mt-0.5">
                                  {(profileImage.size / 1024).toFixed(1)} KB — New Selected
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-green-700 truncate">Current Profile Photo</p>
                                <p className="text-xs text-green-500 mt-0.5">Click change to update</p>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setShowPhotoMenu(true)}
                              className="text-xs px-2.5 py-1 bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors"
                            >
                              {C.CHANGE || "Change"}
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                    <i className="fa-solid fa-user text-xl lg:text-2xl text-blue-500 mr-3" />
                    <h2 className="text-xl font-medium text-gray-700">{PF.SECTION_TITLE}</h2>
                  </div>
                  <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                      <label className={labelClass}>First Name<span className="text-red-600 ml-1">*</span></label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        placeholder="Enter first name" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        placeholder="Enter last name" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{PF.GENDER}<span className="text-red-600 ml-1">*</span></label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass} required>
                        <option value="">{G.SELECT}</option>
                        <option value="MALE">{G.MALE}</option>
                        <option value="FEMALE">{G.FEMALE}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{PF.DOB}<span className="text-gray-400 ml-1 text-xs">{C.READ_ONLY}</span></label>
                      <input type="date" name="dob" value={formData.dob} className={readOnlyClass} disabled readOnly />
                    </div>
                    <div>
                      <label className={labelClass}>{PF.ADMISSION_NUMBER}<span className="text-gray-400 ml-1 text-xs">{C.READ_ONLY}</span></label>
                      <input type="text" name="admissionNumber" value={formData.admissionNumber} className={readOnlyClass} disabled readOnly />
                    </div>
                    <div>
                      <label className={labelClass}>{PF.ROLL_NUMBER}<span className="text-red-600 ml-1">*</span></label>
                      <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange}
                        placeholder={PF.ROLL_PLACEHOLDER} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>{PF.SECTION}<span className="text-red-600 ml-1">*</span></label>
                      {sectionsLoading ? (
                        <div className="bg-gray-100 border border-gray-300 p-2 px-4 w-full rounded-md text-gray-400 text-sm">
                          {ES.SECTION_LOADING || "Loading sections..."}
                        </div>
                      ) : (
                        <select name="sectionId" value={formData.sectionId} onChange={handleInputChange} className={inputClass} required>
                          <option value="">{PF.SELECT_SECTION}</option>
                          {sections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name} {sec.className ? `(${sec.className})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>{PF.ADMISSION_DATE}<span className="text-gray-400 ml-1 text-xs">{C.READ_ONLY}</span></label>
                      <input type="date" name="admissionDate" value={formData.admissionDate} className={readOnlyClass} disabled readOnly />
                    </div>
                    <div>
                      <label className={labelClass}>{PF.STATUS}<span className="text-red-600 ml-1">*</span></label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }))}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.status === 'ACTIVE'
                          ? <span className="text-green-600 font-medium">● {PF.ACTIVE}</span>
                          : <span className="text-red-600 font-medium">● {PF.INACTIVE}</span>}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>{PF.MOBILE}<span className="text-red-600 ml-1">*</span></label>
                      <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange}
                        placeholder="10 digit mobile number" maxLength={10} pattern="[0-9]{10}" className={inputClass} required />
                      <p className="text-xs text-gray-500 mt-1">{PF.MOBILE_HELP}</p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        {PF.EMAIL}
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                        placeholder="Enter email address" className={inputClass} />
                      <p className="text-xs text-gray-500 mt-1">{PF.EMAIL_HELP}</p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Category
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className={inputClass}>
                        <option value="GENERAL">GENERAL</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Student House
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="text" name="studentHouse" value={formData.studentHouse} onChange={handleInputChange}
                        placeholder="e.g. Red House" className={inputClass} />
                    </div>
                    <div className="lg:col-span-2">
                      <label className={labelClass}>
                        {PF.ADDRESS}
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <textarea rows={3} name="address" value={formData.address} onChange={handleInputChange}
                        placeholder="Enter residential address" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Identity & Banking Section */}
                <div>
                  <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-id-card text-xl lg:text-2xl text-blue-500 mr-3" />
                    <h2 className="text-xl font-medium text-gray-700">Identity &amp; Bank Details</h2>
                  </div>
                  <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                      <label className={labelClass}>
                        APAR ID
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="text" name="aparId" value={formData.aparId} onChange={handleInputChange}
                        placeholder="Automated Permanent Academic Registry ID" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>
                        PEN Number
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="text" name="penNumber" value={formData.penNumber} onChange={handleInputChange}
                        placeholder="Permanent Enrollment Number" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Bank Name
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange}
                        placeholder="Enter bank name" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Bank Account Number
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange}
                        placeholder="Enter bank account number" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>
                        IFSC Code
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="text" name="bankIfscCode" value={formData.bankIfscCode} onChange={(e) => setFormData(p => ({ ...p, bankIfscCode: e.target.value.toUpperCase() }))}
                        placeholder="e.g. SBIN0001234" maxLength={11} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian Details Section */}
                <div>
                  <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-users text-xl lg:text-2xl text-blue-500 mr-3" />
                    <h2 className="text-xl font-medium text-gray-700">{FF.SECTION_TITLE}</h2>
                  </div>
                  <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                      <label className={labelClass}>
                        {FF.FATHER_NAME}
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange}
                        placeholder="Enter father's name" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>
                        {FF.FATHER_PHONE_NUMBER}
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="tel" name="fatherPhone" value={formData.fatherPhone} onChange={handleInputChange}
                        placeholder="10 digit phone number" maxLength={10} pattern="[0-9]{10}" className={inputClass} />
                      <p className="text-xs text-gray-500 mt-1">{PF.MOBILE_HELP_OPTIONAL}</p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        {FF.MOTHER_NAME}
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange}
                        placeholder="Enter mother's name" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>
                        {FF.EMERGENCY_CONTACT}
                        <span className="text-gray-400 text-xs font-normal ml-2">({C.OPTIONAL})</span>
                      </label>
                      <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange}
                        placeholder="10 digit emergency contact" maxLength={10} pattern="[0-9]{10}" className={inputClass} />
                      <p className="text-xs text-gray-500 mt-1">{PF.MOBILE_HELP_OPTIONAL}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Requirements Section */}
                <div>
                  <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-cog text-xl lg:text-2xl text-blue-500 mr-3" />
                    <h2 className="text-xl font-medium text-gray-700">{PF.ADDITIONAL_REQUIREMENTS}</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Hostel Block */}
                    <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-6">
                      <div>
                        <label className={labelClass}>{PF.HOSTEL_REQUIRED}</label>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            hostelRequired: !prev.hostelRequired,
                            hostelRoomDescription: !prev.hostelRequired ? prev.hostelRoomDescription : ''
                          }))}
                          className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.hostelRequired ? 'bg-blue-500' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.hostelRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.hostelRequired ? 'Hostel accommodation enabled' : 'Hostel accommodation disabled'}
                        </p>
                      </div>

                      {formData.hostelRequired && (
                        <div>
                          <label className={labelClass}>
                            Hostel Room Number<span className="text-red-600 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            name="hostelRoomDescription"
                            value={formData.hostelRoomDescription}
                            onChange={handleInputChange}
                            placeholder="e.g. B-204"
                            className={inputClass}
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Transport Block */}
                    <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-6">
                      <div>
                        <label className={labelClass}>{PF.TRANSPORT_REQUIRED}</label>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, transportRequired: !prev.transportRequired }))}
                          className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.transportRequired ? 'bg-blue-500' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.transportRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.transportRequired ? 'School transport enabled' : 'School transport disabled'}
                        </p>
                      </div>
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
                  {C.CANCEL}
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {ES.LOADING || "Updating..."}
                    </span>
                  ) : ES.SUBMIT || "Update"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* --- PHOTO SELECTION & CAMERA MODAL --- */}
        {showPhotoMenu && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full sm:w-[500px] rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  {showCamera && (
                    <button
                      type="button"
                      onClick={() => { setShowCamera(false); stopCamera(); }}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {showCamera ? 'Live Camera' : 'Upload Profile Photo'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {showCamera && (
                    <button
                      type="button"
                      onClick={toggleCamera}
                      className="text-sm font-medium text-blue-600 flex items-center gap-1.5 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Switch</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closePhotoMenu}
                    className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                {!showCamera ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all text-left"
                    >
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Camera className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Open Live Camera</p>
                        <p className="text-sm text-gray-500">Take a picture right now</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { closePhotoMenu(); fileInputRef.current?.click(); }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl transition-all text-left"
                    >
                      <div className="bg-gray-100 p-3 rounded-full">
                        <ImageIcon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Upload from Device</p>
                        <p className="text-sm text-gray-500">Choose an existing photo</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shadow-inner">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                      />
                    </div>
                    <div className="mt-6 mb-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 border-4 border-blue-100 shadow-lg hover:scale-105 transition-all flex items-center justify-center"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditStudentDetails;