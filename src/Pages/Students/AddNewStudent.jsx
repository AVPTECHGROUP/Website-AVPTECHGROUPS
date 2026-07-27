import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Users, Camera, X, FileBadge2, Landmark } from 'lucide-react';
import { toast } from 'react-toastify';
import AddStudentPersonalDetails from '../../Components/Students/AddStudentPersonalDetails';
import AddStudentIdentityDocuments from '../../Components/Students/AddStudentIdenetityDocuments';
import AddStudentFamilyDetails from '../../Components/Students/AddStudentFamilyDetails';
import AddStudentOtherDetails from '../../Components/Students/AddStudentOtherDetails';
import { createStudents, uploadStudentDocument, uploadParentPhoto } from '../../Api/Students/StudentsApi';
import { getAllSections } from '../../Api/Teachers/TeachersAPI';
import STUDENT_MODULE_STRINGS from '../../Constants/StringConstants/StudentsConst';

const AS = STUDENT_MODULE_STRINGS.ADD_STUDENT;
const C = STUDENT_MODULE_STRINGS.COMMON;

const TAB_ORDER = ['personal', 'identity', 'family', 'other'];

function AddNewStudent() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [sections, setSections] = useState([]);
    const [sectionsLoading, setSectionsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [guardianSource, setGuardianSource] = useState(null);

    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const formTopRef = useRef(null);

    const [documents, setDocuments] = useState({
        birthCertificate: null,
        transferCertificate: null,
        reportCard: null,
        studentAadhaarDoc: null,
        fatherAadhaarDoc: null,
        motherAadhaarDoc: null,
        fatherPhoto: null,
        motherPhoto: null,
        guardianPhoto: null,
        genericDocuments: [], // [{ id, file }]
    });

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', gender: '', email: '', mobile: '', address: '', dob: '',
        admissionNumber: '', admissionDate: new Date().toISOString().slice(0, 10), academicYear: '2025-2026',
        academicYearId: '',
        rollNumber: '',
        status: 'ACTIVE', bloodGroup: '', previousSchool: '', profileImageUrl: '',
        sectionId: '', fatherName: '', fatherOccupation: '', fatherPhone: '',
        fatherEmail: '', motherName: '', motherOccupation: '', motherPhone: '',
        motherEmail: '', guardianName: '', guardianRelation: '', guardianPhone: '',
        guardianEmail: '', emergencyContact: '', hostelRequired: false, transportRequired: false,

        // Personal additions
        category: 'GENERAL', religion: 'HINDU', whatsappNumber: '', sameAsMobile: false,
        studentHouse: '', abcId: '', isTransferStudent: false,

        // Identity & Documents
        studentAadhaar: '', aparId: '', pen: '', familyId: '', ssmId: '',

        // Family additions
        fatherAadhaar: '', motherAadhaar: '',
        guardianAddress: '', guardianOccupation: '', sameAsCurrentAddress: false,
        siblings: [], // [{ id, name, className }]

        // Other additions
        hostelRoomNumber: '', bankAccountNumber: '', bankName: '', ifscCode: '', remarks: '',
    });

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await getAllSections();
                if (res?.success && Array.isArray(res.data)) {
                    const activeSections = res.data.filter(sec => sec.status === 'ACTIVE');
                    setSections(activeSections);
                } else {
                    toast.error(AS.ERRORS?.SECTION_LOAD_FAILED || "Failed to load sections");
                }
            } catch (err) {
                console.error('fetchSections error:', err);
                toast.error(AS.ERRORS?.SECTION_LOAD_RETRY || "Error loading sections");
            } finally {
                setSectionsLoading(false);
            }
        };
        fetchSections();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) { toast.error(AS.ERRORS.PHOTO_TYPE); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error(AS.ERRORS.PHOTO_SIZE); return; }
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
        if (formErrors[name]) {
            setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const handleGuardianSource = (source) => {
        const newSource = guardianSource === source ? null : source;
        setGuardianSource(newSource);
        if (newSource === 'father') {
            if (!formData.fatherName) { toast.warning("Please fill Father's details first"); return; }
            setFormData(prev => ({
                ...prev,
                guardianName: prev.fatherName, guardianRelation: 'Father',
                guardianPhone: prev.fatherPhone, guardianEmail: prev.fatherEmail,
            }));
        } else if (newSource === 'mother') {
            if (!formData.motherName) { toast.warning("Please fill Mother's details first"); return; }
            setFormData(prev => ({
                ...prev,
                guardianName: prev.motherName, guardianRelation: 'Mother',
                guardianPhone: prev.motherPhone, guardianEmail: prev.motherEmail,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                guardianName: '', guardianRelation: '', guardianPhone: '', guardianEmail: '',
            }));
        }
        setFormErrors(prev => {
            const n = { ...prev };
            delete n.guardianName; delete n.guardianRelation;
            delete n.guardianPhone; delete n.guardianEmail;
            return n;
        });
    };

    // ── Document handlers ──
    const handleDocumentChange = (key, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) { toast.error('Only PDF, JPG or PNG files allowed'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('File size must be under 10MB'); return; }
        setDocuments(prev => ({ ...prev, [key]: file }));
        if (formErrors[key]) {
            setFormErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
        }
    };

    const handleDocumentRemove = (key) => {
        setDocuments(prev => ({ ...prev, [key]: null }));
    };

    const handleGenericDocAdd = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setDocuments(prev => ({
            ...prev,
            genericDocuments: [
                ...prev.genericDocuments,
                ...files.map(f => ({ id: `${Date.now()}-${f.name}`, file: f })),
            ],
        }));
        e.target.value = '';
    };

    const handleGenericDocRemove = (id) => {
        setDocuments(prev => ({ ...prev, genericDocuments: prev.genericDocuments.filter(d => d.id !== id) }));
    };

    // ── Sibling handlers ──
    const handleAddSibling = () => {
        setFormData(prev => ({
            ...prev,
            siblings: [...prev.siblings, { id: Date.now(), name: '', className: '' }],
        }));
    };

    const handleSiblingChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            siblings: prev.siblings.map(s => s.id === id ? { ...s, [field]: value } : s),
        }));
    };

    const handleRemoveSibling = (id) => {
        setFormData(prev => ({ ...prev, siblings: prev.siblings.filter(s => s.id !== id) }));
    };

    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ── Validations ──
    const validatePersonalDetails = () => {
        if (!profileImage) { toast.error(AS.ERRORS.PHOTO_REQUIRED); return false; }
        if (
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.gender ||
            !formData.mobile ||
            !formData.dob ||
            !formData.admissionDate
        ) {
            toast.error(AS.ERRORS.REQUIRED_FIELDS); return false;
        }
        if (!formData.rollNumber.trim()) { toast.error(AS.ERRORS.ROLL_REQUIRED); return false; }
        if (!formData.sectionId) { toast.error(AS.ERRORS.SECTION_REQUIRED); return false; }
        if (!phoneRegex.test(formData.mobile)) { toast.error(AS.ERRORS.MOBILE_INVALID); return false; }
        if (formData.email && !emailRegex.test(formData.email)) { toast.error(AS.ERRORS.EMAIL_INVALID); return false; }
        return true;
    };

    const validateIdentityDetails = () => {
        return true;
    };

    const validateFamilyDetails = () => {
        if (!formData.fatherName?.trim()) {
            toast.error("Father's Name is required");
            return false;
        }
        if (!formData.fatherOccupation?.trim()) {
            toast.error("Father's Occupation is required");
            return false;
        }
        if (!formData.fatherPhone) {
            toast.error("Father's Phone number is required");
            return false;
        }
        if (!phoneRegex.test(formData.fatherPhone)) {
            toast.error("Father's Phone must be a valid 10-digit number");
            return false;
        }
        if (formData.fatherEmail && !emailRegex.test(formData.fatherEmail)) {
            toast.error("Father's Email is invalid");
            return false;
        }

        if (!formData.motherName?.trim()) {
            toast.error("Mother's Name is required");
            return false;
        }
        if (formData.motherPhone && !phoneRegex.test(formData.motherPhone)) {
            toast.error("Mother's Phone must be a valid 10-digit number");
            return false;
        }
        if (formData.motherEmail && !emailRegex.test(formData.motherEmail)) {
            toast.error("Mother's Email is invalid");
            return false;
        }

        if (formData.guardianPhone && !phoneRegex.test(formData.guardianPhone)) {
            toast.error("Guardian's Phone must be a valid 10-digit number");
            return false;
        }
        if (formData.guardianEmail && !emailRegex.test(formData.guardianEmail)) {
            toast.error("Guardian's Email is invalid");
            return false;
        }
        if (formData.emergencyContact && !phoneRegex.test(formData.emergencyContact)) {
            toast.error("Emergency Contact must be a valid 10-digit number");
            return false;
        }

        return true;
    };

    const validateOtherDetails = () => {
        if (formData.hostelRequired && !formData.hostelRoomNumber?.trim()) {
            toast.error("Hostel Room Number is required when hostel accommodation is enabled");
            return false;
        }
        return true;
    };

    const validateTab = (tab) => {
        if (tab === 'personal') return validatePersonalDetails();
        if (tab === 'identity') return validateIdentityDetails();
        if (tab === 'family') return validateFamilyDetails();
        if (tab === 'other') return validateOtherDetails();
        return true;
    };

    const scrollToTop = () => formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const handleNextTab = () => {
        if (!validateTab(activeTab)) return;
        const idx = TAB_ORDER.indexOf(activeTab);
        if (idx < TAB_ORDER.length - 1) {
            setActiveTab(TAB_ORDER[idx + 1]);
            scrollToTop();
        }
    };

    const handleBackTab = () => {
        const idx = TAB_ORDER.indexOf(activeTab);
        if (idx > 0) {
            setActiveTab(TAB_ORDER[idx - 1]);
            scrollToTop();
        }
    };

    const handleTabClick = (tab) => {
        const targetIdx = TAB_ORDER.indexOf(tab);
        const currentIdx = TAB_ORDER.indexOf(activeTab);
        if (targetIdx > currentIdx) {
            for (let i = currentIdx; i < targetIdx; i++) {
                if (!validateTab(TAB_ORDER[i])) return;
            }
        }
        setActiveTab(tab);
        scrollToTop();
    };

    const handleSubmit = (e) => e.preventDefault();

    const handleSaveDetails = async () => {
        // Validate all tabs before submitting
        if (!validatePersonalDetails()) { setActiveTab('personal'); scrollToTop(); return; }
        if (!validateIdentityDetails()) { setActiveTab('identity'); scrollToTop(); return; }
        if (!validateFamilyDetails()) { setActiveTab('family'); scrollToTop(); return; }
        if (!validateOtherDetails()) { setActiveTab('other'); scrollToTop(); return; }

        setIsSubmitting(true);
        const loadingToast = toast.loading(AS.LOADING || "Adding student...");

        try {
            const firstName = formData.firstName.trim();
            const lastName = formData.lastName.trim();
            const fullName = `${firstName} ${lastName}`.trim();

            const generatedAdmissionNumber = formData.admissionNumber.trim()
                ? formData.admissionNumber.trim()
                : `ADM-${Math.floor(100000 + Math.random() * 900000)}`;

            // Correct OpenAPI aligned payload
            const apiPayload = {
                admissionNumber: generatedAdmissionNumber,
                rollNumber: formData.rollNumber.trim() || null,
                firstName,
                lastName,
                fullName,
                sectionId: Number(formData.sectionId),
                admissionDate: formData.admissionDate,
                academicYearId: formData.academicYearId ? Number(formData.academicYearId) : null,
                academicYear: formData.academicYear || "2025-2026",
                status: formData.status || "ACTIVE",
                bloodGroup: formData.bloodGroup || null,
                previousSchool: formData.previousSchool.trim() || null,
                transportRequired: Boolean(formData.transportRequired),
                hostelRequired: Boolean(formData.hostelRequired),
                category: (formData.category || "GENERAL").toUpperCase(),
                religion: (formData.religion || "HINDU").toUpperCase(),
                whatsappNumber: formData.whatsappNumber || formData.mobile || null,
                studentHouse: formData.studentHouse.trim() || null,
                aadhaarNumber: formData.studentAadhaar.trim() || null,
                abcId: formData.abcId.trim() || null,
                aparId: formData.aparId.trim() || null,
                fatherName: formData.fatherName.trim() || null,
                fatherOccupation: formData.fatherOccupation.trim() || null,
                fatherPhone: formData.fatherPhone || null,
                fatherEmail: formData.fatherEmail.trim() || null,
                fatherAadhaar: formData.fatherAadhaar.trim() || null,
                motherName: formData.motherName.trim() || null,
                motherOccupation: formData.motherOccupation.trim() || null,
                motherPhone: formData.motherPhone || null,
                motherEmail: formData.motherEmail.trim() || null,
                motherAadhaar: formData.motherAadhaar.trim() || null,
                guardianName: formData.guardianName.trim() || null,
                guardianRelation: formData.guardianRelation || null,
                guardianPhone: formData.guardianPhone || null,
                guardianEmail: formData.guardianEmail.trim() || null,
                guardianAddress: formData.guardianAddress.trim() || null,
                guardianOccupation: formData.guardianOccupation.trim() || null,
                currentAddress: formData.address.trim() || null,
                permanentAddress: formData.address.trim() || null,
                hostelRoomDescription: formData.hostelRequired ? (formData.hostelRoomNumber.trim() || null) : null,
                bankAccountNumber: formData.bankAccountNumber.trim() || null,
                bankName: formData.bankName.trim() || null,
                bankIfscCode: formData.ifscCode.trim() || null,
                penNumber: formData.pen.trim() || null,
                ssmId: formData.ssmId.trim() || null,
                familyId: formData.familyId.trim() || null,
                remarks: formData.remarks || null,
                personalDetails: {
                    firstName,
                    lastName,
                    fullName,
                    mobile: formData.mobile,
                    email: formData.email.trim() || null,
                    gender: (formData.gender || "MALE").toUpperCase(),
                    dateOfBirth: formData.dob,
                    address: formData.address.trim() || null,
                    emergencyContact: formData.emergencyContact || formData.guardianPhone || formData.fatherPhone || null,
                    emergencyContactName: formData.guardianName || formData.fatherName || null,
                    emergencyContactRelation: formData.guardianRelation || "Father",
                }
            };

            // 1. Create Student Core Payload
            const res = await createStudents(apiPayload, profileImage);
            const createdStudentId = res?.data?.id || res?.id;

            // 2. Automated Upload of optional documents & photos
            if (createdStudentId) {
                const uploadPromises = [];
                if (documents.birthCertificate) uploadPromises.push(uploadStudentDocument(createdStudentId, 'BIRTH_CERTIFICATE', documents.birthCertificate));
                if (documents.studentAadhaarDoc) uploadPromises.push(uploadStudentDocument(createdStudentId, 'STUDENT_AADHAAR', documents.studentAadhaarDoc));
                if (documents.fatherAadhaarDoc) uploadPromises.push(uploadStudentDocument(createdStudentId, 'FATHER_AADHAAR', documents.fatherAadhaarDoc));
                if (documents.motherAadhaarDoc) uploadPromises.push(uploadStudentDocument(createdStudentId, 'MOTHER_AADHAAR', documents.motherAadhaarDoc));

                if (documents.fatherPhoto) uploadPromises.push(uploadParentPhoto(createdStudentId, 'FATHER', documents.fatherPhoto));
                if (documents.motherPhoto) uploadPromises.push(uploadParentPhoto(createdStudentId, 'MOTHER', documents.motherPhoto));
                if (documents.guardianPhoto) uploadPromises.push(uploadParentPhoto(createdStudentId, 'GUARDIAN', documents.guardianPhoto));

                if (uploadPromises.length > 0) {
                    await Promise.allSettled(uploadPromises);
                }
            }

            toast.dismiss(loadingToast);
            toast.success(AS.SUCCESS || "Student added successfully!");
            setTimeout(() => navigate('/students'), 500);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.message || 'Failed to add student ❌');
            console.error('Submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDiscard = () => navigate('/students');

    const isFirstTab = activeTab === TAB_ORDER[0];
    const isLastTab = activeTab === TAB_ORDER[TAB_ORDER.length - 1];

    const TABS = [
        { key: 'personal', label: AS.TABS.PERSONAL, short: 'Personal', Icon: User },
        { key: 'identity', label: 'Identity & Documents', short: 'Identity', Icon: FileBadge2 },
        { key: 'family', label: AS.TABS.FAMILY, short: 'Family', Icon: Users },
        { key: 'other', label: 'Other Details', short: 'Other', Icon: Landmark },
    ];

    return (
        <div ref={formTopRef} className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
            <div className="mx-auto">
                <button onClick={() => navigate(-1)}
                        className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">{C.BACK_TO_LIST}</span>
                </button>
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{AS.PAGE_TITLE}</h1>
                    <p className="text-sm sm:text-base text-gray-500">{AS.SUBTITLE}</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex flex-wrap -mb-px">
                                {TABS.map(({ key, label, short, Icon }) => (
                                    <button key={key} type="button" onClick={() => handleTabClick(key)}
                                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                        <Icon size={20} />
                                        <span className="hidden sm:inline">{label}</span>
                                        <span className="sm:hidden">{short}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeTab === 'personal' && (
                                <>
                                    {/* ── Profile Photo Upload ── */}
                                    <div className="mb-6">
                                        <label className="block font-semibold text-gray-600 text-sm mb-3">
                                            {AS.PROFILE_PHOTO.LABEL} <span className="text-red-600 ml-1">*</span>
                                        </label>
                                        <div className="flex items-center gap-5">
                                            <div className="relative shrink-0">
                                                <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                                                    {imagePreview ? (
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-8 h-8 text-blue-400" />
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow transition-colors"
                                                >
                                                    <Camera className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            </div>

                                            <div className="flex-1">
                                                {!imagePreview ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors cursor-pointer"
                                                    >
                                                        <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                                        <p className="text-sm font-medium text-blue-600">{AS.PROFILE_PHOTO.CTA}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{AS.PROFILE_PHOTO.FORMAT_HELP}</p>
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
                                                                {AS.PROFILE_PHOTO.CHANGE}
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

                                    <AddStudentPersonalDetails
                                        formData={formData} setFormData={setFormData}
                                        handleInputChange={handleInputChange}
                                        errors={formErrors}
                                        sections={sections} sectionsLoading={sectionsLoading}
                                    />
                                    <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4 mt-4">
                                        <div>
                                            <label htmlFor="rollNumber" className="block font-semibold text-gray-600 text-sm mb-2">
                                                {AS.ROLL_LABEL}<span className="text-red-600 ml-1">*</span>
                                            </label>
                                            <input
                                                type="text" id="rollNumber" name="rollNumber"
                                                value={formData.rollNumber} onChange={handleInputChange}
                                                placeholder={AS.ROLL_PLACEHOLDER}
                                                className="bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {activeTab === 'identity' && (
                                <AddStudentIdentityDocuments
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    errors={formErrors}
                                    documents={documents}
                                    onDocumentChange={handleDocumentChange}
                                    onDocumentRemove={handleDocumentRemove}
                                    onGenericDocAdd={handleGenericDocAdd}
                                    onGenericDocRemove={handleGenericDocRemove}
                                />
                            )}
                            {activeTab === 'family' && (
                                <AddStudentFamilyDetails
                                    formData={formData} setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    errors={formErrors} setErrors={setFormErrors}
                                    guardianSource={guardianSource}
                                    onGuardianSource={handleGuardianSource}
                                    documents={documents}
                                    onDocumentChange={handleDocumentChange}
                                    onDocumentRemove={handleDocumentRemove}
                                    onAddSibling={handleAddSibling}
                                    onSiblingChange={handleSiblingChange}
                                    onRemoveSibling={handleRemoveSibling}
                                />
                            )}
                            {activeTab === 'other' && (
                                <AddStudentOtherDetails
                                    formData={formData} setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    errors={formErrors}
                                />
                            )}
                        </div>
                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button type="button" onClick={handleDiscard}
                                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                    {C.DISCARD_CHANGES}
                                </button>
                                {!isFirstTab && (
                                    <button type="button" onClick={handleBackTab}
                                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <ChevronLeft className="w-4 h-4" /> Back
                                    </button>
                                )}
                                {!isLastTab ? (
                                    <button type="button" onClick={handleNextTab}
                                            className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all bg-blue-500 hover:bg-blue-600 cursor-pointer text-white flex items-center gap-2">
                                        {AS.NEXT} <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button disabled={isSubmitting} type="button" onClick={handleSaveDetails}
                                            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'}`}>
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                {AS.SUBMIT_LOADING}
                                            </span>
                                        ) : AS.SAVE}
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