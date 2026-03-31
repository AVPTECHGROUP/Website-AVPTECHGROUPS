import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Users, Camera, X } from 'lucide-react';
import { toast } from 'react-toastify';
import AddStudentPersonalDetails from '../../Components/Students/AddStudentPersonalDetails';
import AddStudentFamilyDetails from '../../Components/Students/AddStudentFamilyDetails';
import { createStudents } from '../../Api/StudentsApi';
import { getAllSections } from '../../Api/TeachersAPI';

function AddNewStudent() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [familyErrors, setFamilyErrors] = useState({});
    const [sections, setSections] = useState([]);
    const [sectionsLoading, setSectionsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [guardianSource, setGuardianSource] = useState(null);

    // ── Image state ──────────────────────────────────────────────────────────
    const [profileImage, setProfileImage] = useState(null);      // File object
    const [imagePreview, setImagePreview] = useState(null);      // data-URL
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "", gender: "", email: "", mobile: "", address: "", dob: "",
        admissionNumber: "", admissionDate: "", academicYear: "2025-2026",
        rollNumber: "",
        status: "ACTIVE", bloodGroup: "", previousSchool: "", profileImageUrl: "",
        sectionId: "", fatherName: "", fatherOccupation: "", fatherPhone: "",
        fatherEmail: "", motherName: "", motherOccupation: "", motherPhone: "",
        motherEmail: "", guardianName: "", guardianRelation: "", guardianPhone: "",
        guardianEmail: "", emergencyContact: "", hostelRequired: false, transportRequired: false,
    });

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

    // ── Image handlers ───────────────────────────────────────────────────────
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
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (familyErrors[name]) {
            setFamilyErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const handleGuardianSource = (source) => {
        const newSource = guardianSource === source ? null : source;
        setGuardianSource(newSource);

        if (newSource === 'father') {
            setFormData(prev => ({
                ...prev,
                guardianName: prev.fatherName,
                guardianRelation: 'Father',
                guardianPhone: prev.fatherPhone,
                guardianEmail: prev.fatherEmail,
            }));
        } else if (newSource === 'mother') {
            setFormData(prev => ({
                ...prev,
                guardianName: prev.motherName,
                guardianRelation: 'Mother',
                guardianPhone: prev.motherPhone,
                guardianEmail: prev.motherEmail,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                guardianName: '', guardianRelation: '', guardianPhone: '', guardianEmail: '',
            }));
        }
        setFamilyErrors(prev => {
            const n = { ...prev };
            delete n.guardianName; delete n.guardianRelation;
            delete n.guardianPhone; delete n.guardianEmail;
            return n;
        });
    };

    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validatePersonalDetails = () => {
        if (!profileImage) {
            toast.error("Please upload a student profile photo!");
            return false;
        }
        if (!formData.name.trim() || !formData.gender || !formData.mobile || !formData.dob || !formData.admissionDate || !formData.academicYear) {
            toast.error("Please fill all required fields!"); return false;
        }
        if (!formData.rollNumber.trim()) { toast.error("Please enter a roll number!"); return false; }
        if (!formData.sectionId) { toast.error("Please select a section!"); return false; }
        if (!phoneRegex.test(formData.mobile)) { toast.error("Mobile number must be exactly 10 digits!"); return false; }
        if (formData.email && !emailRegex.test(formData.email)) { toast.error("Please enter a valid student email address!"); return false; }
        if (formData.status !== 'ACTIVE') { toast.error("Student status must be ACTIVE to add a new student!"); return false; }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const dobDate = new Date(formData.dob);
        if (dobDate >= today) { toast.error("Date of birth cannot be today or in the future!"); return false; }
        if (new Date(formData.admissionDate) > today) { toast.error("Admission date cannot be in the future!"); return false; }
        return true;
    };

    const buildFamilyErrors = (data) => {
        const e = {};
        if (!data.fatherName.trim()) e.fatherName = "Father's name is required";
        if (!data.fatherOccupation.trim()) e.fatherOccupation = "Father's occupation is required";
        if (!data.fatherPhone) e.fatherPhone = "Father's phone is required";
        else if (!phoneRegex.test(data.fatherPhone)) e.fatherPhone = "Must be exactly 10 digits";
        if (data.fatherEmail && !emailRegex.test(data.fatherEmail)) e.fatherEmail = "Invalid email format";
        if (!data.motherName.trim()) e.motherName = "Mother's name is required";
        if (data.motherPhone && !phoneRegex.test(data.motherPhone)) e.motherPhone = "Must be exactly 10 digits";
        if (data.motherEmail && !emailRegex.test(data.motherEmail)) e.motherEmail = "Invalid email format";
        if (data.guardianPhone && !phoneRegex.test(data.guardianPhone)) e.guardianPhone = "Must be exactly 10 digits";
        if (data.guardianEmail && !emailRegex.test(data.guardianEmail)) e.guardianEmail = "Invalid email format";
        if (data.emergencyContact && !phoneRegex.test(data.emergencyContact)) e.emergencyContact = "Must be exactly 10 digits";
        return e;
    };

    const validateFamilyDetails = () => {
        const errors = buildFamilyErrors(formData);
        if (Object.keys(errors).length > 0) { setFamilyErrors(errors); return false; }
        setFamilyErrors({});
        return true;
    };

    const handleNextTab = () => { if (!validatePersonalDetails()) return; setActiveTab('family'); };
    const handleTabClick = (tab) => { if (tab === 'family' && !validatePersonalDetails()) return; setActiveTab(tab); };
    const handleSubmit = (e) => e.preventDefault();

    const handleSaveDetails = async () => {
        if (!validatePersonalDetails()) { setActiveTab('personal'); return; }
        if (!validateFamilyDetails()) return;
        setIsSubmitting(true);
        const loadingToast = toast.loading("Adding student...");
        try {
            const nameParts = formData.name.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ").trim() || firstName;
            const generatedAdmissionNumber = formData.admissionNumber.trim()
                ? formData.admissionNumber.trim()
                : `DPIS-${Math.floor(10000 + Math.random() * 90000)}`;

            // ── Build payload — do NOT include profileImageUrl so the backend
            //    sets it automatically from the uploaded image file. ─────────
            const apiPayload = {
                admissionNumber: generatedAdmissionNumber,
                rollNumber: formData.rollNumber.trim() || null,
                firstName,
                lastName,
                personalDetails: {
                    fullName: formData.name.trim(),
                    mobile: formData.mobile,
                    email: formData.email.trim() || null,
                    gender: formData.gender.toUpperCase(),
                    dateOfBirth: formData.dob,
                    address: formData.address.trim() || null,
                    emergencyContact: formData.emergencyContact || null,
                    emergencyContactName: formData.guardianName.trim() || null,
                    emergencyContactRelation: formData.guardianRelation || null,
                },
                sectionId: Number(formData.sectionId),
                admissionDate: formData.admissionDate,
                academicYear: formData.academicYear,
                status: formData.status,
                bloodGroup: formData.bloodGroup || null,
                previousSchool: formData.previousSchool.trim() || null,
                hostelRequired: formData.hostelRequired,
                transportRequired: formData.transportRequired,
                fatherName: formData.fatherName.trim() || null,
                fatherOccupation: formData.fatherOccupation.trim() || null,
                fatherPhone: formData.fatherPhone || null,
                fatherEmail: formData.fatherEmail.trim() || null,
                motherName: formData.motherName.trim() || null,
                motherOccupation: formData.motherOccupation.trim() || null,
                motherPhone: formData.motherPhone || null,
                motherEmail: formData.motherEmail.trim() || null,
                guardianName: formData.guardianName.trim() || null,
                guardianRelation: formData.guardianRelation || null,
                guardianPhone: formData.guardianPhone || null,
                guardianEmail: formData.guardianEmail.trim() || null,
                remarks: null,
            };

            console.log("📦 API PAYLOAD:", JSON.stringify(apiPayload, null, 2));

            // Pass profileImage as second argument so the API function appends
            // it as the "image" part of the multipart/form-data request.
            const response = await createStudents(apiPayload, profileImage);
            console.log("✅ Create Student Response:", response);

            toast.dismiss(loadingToast);
            toast.success("Student added successfully ✅");
            setTimeout(() => navigate("/students"), 500);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.message || "Failed to add student ❌");
            console.error("❌ Submit error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDiscard = () => navigate('/students');

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
            <div className="mx-auto">
                <button onClick={() => navigate(-1)}
                    className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to List</span>
                </button>
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Add New Student</h1>
                    <p className="text-sm sm:text-base text-gray-500">Enter the details below to onboard a new student into the system.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex flex-wrap -mb-px">
                                <button type="button" onClick={() => setActiveTab('personal')}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    <User size={20} />
                                    <span className="hidden sm:inline">Personal Details</span>
                                    <span className="sm:hidden">Personal</span>
                                </button>
                                <button type="button" onClick={() => handleTabClick('family')}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'family' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    <Users size={20} />
                                    <span className="hidden sm:inline">Family Details</span>
                                    <span className="sm:hidden">Family</span>
                                </button>
                            </nav>
                        </div>
                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeTab === 'personal' && (
                                <>
                                    {/* ── Profile Photo Upload ── */}
                                    <div className="mb-6">
                                        <label className="block font-semibold text-gray-600 text-sm mb-3">
                                            Profile Photo <span className="text-red-600 ml-1">*</span>
                                        </label>
                                        <div className="flex items-center gap-5">
                                            {/* Avatar preview */}
                                            <div className="relative shrink-0">
                                                <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                                                    {imagePreview ? (
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-8 h-8 text-blue-400" />
                                                    )}
                                                </div>
                                                {/* Camera overlay button */}
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
                                                {!imagePreview ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors cursor-pointer"
                                                    >
                                                        <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                                        <p className="text-sm font-medium text-blue-600">Click to upload photo</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">JPEG or PNG, max 10 MB</p>
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-green-700 truncate">{profileImage?.name}</p>
                                                            <p className="text-xs text-green-500 mt-0.5">
                                                                {profileImage ? (profileImage.size / 1024).toFixed(1) + ' KB' : ''}
                                                            </p>
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

                                    <AddStudentPersonalDetails
                                        formData={formData} setFormData={setFormData}
                                        handleInputChange={handleInputChange}
                                        sections={sections} sectionsLoading={sectionsLoading}
                                    />
                                    <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4 mt-4">
                                        <div>
                                            <label htmlFor="rollNumber" className='block font-semibold text-gray-600 text-sm mb-2'>
                                                Roll Number<span className="text-red-600 ml-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="rollNumber"
                                                name="rollNumber"
                                                value={formData.rollNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter roll number"
                                                className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {activeTab === 'family' && (
                                <AddStudentFamilyDetails
                                    formData={formData} setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    errors={familyErrors} setErrors={setFamilyErrors}
                                    guardianSource={guardianSource}
                                    onGuardianSource={handleGuardianSource}
                                />
                            )}
                        </div>
                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button type="button" onClick={handleDiscard}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                    Discard Changes
                                </button>
                                {activeTab === 'personal' ? (
                                    <button type="button" onClick={handleNextTab}
                                        className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all bg-blue-500 hover:bg-blue-600 cursor-pointer text-white flex items-center gap-2">
                                        Next <ChevronLeft className="w-4 h-4 rotate-180" />
                                    </button>
                                ) : (
                                    <button disabled={isSubmitting} type="button" onClick={handleSaveDetails}
                                        className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'}`}>
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Adding...
                                            </span>
                                        ) : 'Save Details'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddNewStudent;