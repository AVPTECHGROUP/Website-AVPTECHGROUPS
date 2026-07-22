import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Users, Camera, X, FileBadge2, Landmark } from 'lucide-react';
import { toast } from 'react-toastify';
import AddStudentPersonalDetails from '../../Components/Students/AddStudentPersonalDetails';
import AddStudentIdentityDocuments from '../../Components/Students/AddStudentIdenetityDocuments';
import AddStudentFamilyDetails from '../../Components/Students/AddStudentFamilyDetails';
import AddStudentOtherDetails from '../../Components/Students/AddStudentOtherDetails';
import { createStudents } from '../../Api/Students/StudentsApi';
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
        fatherPhoto: null,
        motherPhoto: null,
        guardianPhoto: null,
        genericDocuments: [], // [{ id, file }]
    });

    const [formData, setFormData] = useState({
        name: '', gender: '', email: '', mobile: '', address: '', dob: '',
        admissionNumber: '', admissionDate: '', academicYear: '2025-2026',
        rollNumber: '',
        status: 'ACTIVE', bloodGroup: '', previousSchool: '', profileImageUrl: '',
        sectionId: '', fatherName: '', fatherOccupation: '', fatherPhone: '',
        fatherEmail: '', motherName: '', motherOccupation: '', motherPhone: '',
        motherEmail: '', guardianName: '', guardianRelation: '', guardianPhone: '',
        guardianEmail: '', emergencyContact: '', hostelRequired: false, transportRequired: false,

        // Personal — identity/contact additions
        category: '', whatsappNumber: '', sameAsMobile: false,
        studentHouse: '', abcId: '', isTransferStudent: false,

        // Identity & Documents
        studentAadhaar: '', aparId: '', pen: '', familyId: '', ssmId: '',

        // Family — Aadhaar, guardian address, siblings
        fatherAadhaar: '', motherAadhaar: '',
        guardianAddress: '', sameAsCurrentAddress: false,
        siblings: [], // [{ id, name, className }]

        // Other — hostel room & bank
        hostelRoomNumber: '', bankAccountNumber: '', bankName: '', ifscCode: '',
    });

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await getAllSections();
                if (res?.success && Array.isArray(res.data)) {
                    const activeSections = res.data.filter(sec => sec.status === 'ACTIVE');
                    setSections(activeSections);
                } else {
                    toast.error(S.EDIT_STUDENT.ERRORS.SECTION_LOAD_FAILED);
                }
            } catch (err) {
                console.error('fetchSections error:', err);
                toast.error(S.EDIT_STUDENT.ERRORS.SECTION_LOAD_RETRY);
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
            if (!formData.fatherName) { toast.warning(S.FAMILY_FORM.GUARDIAN_ALERT_FATHER); return; }
            setFormData(prev => ({
                ...prev,
                guardianName: prev.fatherName, guardianRelation: 'Father',
                guardianPhone: prev.fatherPhone, guardianEmail: prev.fatherEmail,
            }));
        } else if (newSource === 'mother') {
            if (!formData.motherName) { toast.warning(S.FAMILY_FORM.GUARDIAN_ALERT_MOTHER); return; }
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

    // ── Document (file) handlers — shared by Identity & Family tabs ──
    const handleDocumentChange = (key, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) { toast.error('Only PDF, JPG or PNG files are allowed'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
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

    // ── Sibling handlers — Family tab ──
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
    const aadhaarRegex = /^[0-9]{12}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    const validatePersonalDetails = () => {
        if (!profileImage) { toast.error(AS.ERRORS.PHOTO_REQUIRED); return false; }
        if (!formData.name.trim() || !formData.gender || !formData.mobile || !formData.dob || !formData.admissionDate || !formData.academicYear) {
            toast.error(AS.ERRORS.REQUIRED_FIELDS); return false;
        }
        if (!formData.rollNumber.trim()) { toast.error(AS.ERRORS.ROLL_REQUIRED); return false; }
        if (!formData.sectionId) { toast.error(AS.ERRORS.SECTION_REQUIRED); return false; }
        if (!formData.category) { toast.error("Please select the student's category"); return false; }
        if (!phoneRegex.test(formData.mobile)) { toast.error(AS.ERRORS.MOBILE_INVALID); return false; }
        if (formData.whatsappNumber && !phoneRegex.test(formData.whatsappNumber)) { toast.error('WhatsApp number must be exactly 10 digits'); return false; }
        if (formData.email && !emailRegex.test(formData.email)) { toast.error(AS.ERRORS.EMAIL_INVALID); return false; }
        if (formData.status !== 'ACTIVE') { toast.error(AS.ERRORS.STATUS_INVALID); return false; }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (new Date(formData.dob) >= today) { toast.error(AS.ERRORS.DOB_INVALID); return false; }
        if (new Date(formData.admissionDate) > today) { toast.error(AS.ERRORS.ADMISSION_DATE_INVALID); return false; }
        return true;
    };

    const buildIdentityErrors = (data, docs) => {
        const e = {};
        if (!data.studentAadhaar) e.studentAadhaar = "Student's Aadhaar number is required";
        else if (!aadhaarRegex.test(data.studentAadhaar)) e.studentAadhaar = 'Must be exactly 12 digits';
        if (!data.aparId.trim()) e.aparId = 'APAR ID is required';
        if (!docs.birthCertificate) e.birthCertificate = 'Birth certificate is required';
        if (data.isTransferStudent && !docs.transferCertificate) e.transferCertificate = 'Transfer certificate is required for transfer students';
        return e;
    };

    const validateIdentityDetails = () => {
        const errors = buildIdentityErrors(formData, documents);
        if (Object.keys(errors).length > 0) { setFormErrors(prev => ({ ...prev, ...errors })); return false; }
        setFormErrors(prev => {
            const n = { ...prev };
            ['studentAadhaar', 'aparId', 'birthCertificate', 'transferCertificate'].forEach(k => delete n[k]);
            return n;
        });
        return true;
    };

    const buildFamilyErrors = (data) => {
        const e = {};
        if (!data.fatherName.trim()) e.fatherName = "Father's name is required";
        if (!data.fatherOccupation.trim()) e.fatherOccupation = "Father's occupation is required";
        if (!data.fatherPhone) e.fatherPhone = "Father's phone is required";
        else if (!phoneRegex.test(data.fatherPhone)) e.fatherPhone = 'Must be exactly 10 digits';
        if (data.fatherEmail && !emailRegex.test(data.fatherEmail)) e.fatherEmail = 'Invalid email format';
        if (data.fatherAadhaar && !aadhaarRegex.test(data.fatherAadhaar)) e.fatherAadhaar = 'Must be exactly 12 digits';
        if (!data.motherName.trim()) e.motherName = "Mother's name is required";
        if (data.motherPhone && !phoneRegex.test(data.motherPhone)) e.motherPhone = 'Must be exactly 10 digits';
        if (data.motherEmail && !emailRegex.test(data.motherEmail)) e.motherEmail = 'Invalid email format';
        if (data.motherAadhaar && !aadhaarRegex.test(data.motherAadhaar)) e.motherAadhaar = 'Must be exactly 12 digits';
        if (data.guardianPhone && !phoneRegex.test(data.guardianPhone)) e.guardianPhone = 'Must be exactly 10 digits';
        if (data.guardianEmail && !emailRegex.test(data.guardianEmail)) e.guardianEmail = 'Invalid email format';
        if (data.emergencyContact && !phoneRegex.test(data.emergencyContact)) e.emergencyContact = 'Must be exactly 10 digits';
        return e;
    };

    const validateFamilyDetails = () => {
        const errors = buildFamilyErrors(formData);
        if (Object.keys(errors).length > 0) { setFormErrors(prev => ({ ...prev, ...errors })); return false; }
        setFormErrors(prev => {
            const n = { ...prev };
            ['fatherName', 'fatherOccupation', 'fatherPhone', 'fatherEmail', 'fatherAadhaar',
                'motherName', 'motherPhone', 'motherEmail', 'motherAadhaar',
                'guardianPhone', 'guardianEmail', 'emergencyContact'].forEach(k => delete n[k]);
            return n;
        });
        return true;
    };

    const buildOtherErrors = (data) => {
        const e = {};
        if (data.hostelRequired && !data.hostelRoomNumber.trim()) e.hostelRoomNumber = 'Room number is required when hostel is enabled';
        const bankFieldsTouched = data.bankAccountNumber || data.bankName || data.ifscCode;
        if (bankFieldsTouched) {
            if (!data.bankAccountNumber.trim()) e.bankAccountNumber = 'Account number is required';
            if (!data.bankName.trim()) e.bankName = 'Bank name is required';
            if (!data.ifscCode.trim()) e.ifscCode = 'IFSC code is required';
            else if (!ifscRegex.test(data.ifscCode)) e.ifscCode = 'Invalid IFSC format';
        }
        return e;
    };

    const validateOtherDetails = () => {
        const errors = buildOtherErrors(formData);
        if (Object.keys(errors).length > 0) { setFormErrors(prev => ({ ...prev, ...errors })); return false; }
        setFormErrors(prev => {
            const n = { ...prev };
            ['hostelRoomNumber', 'bankAccountNumber', 'bankName', 'ifscCode'].forEach(k => delete n[k]);
            return n;
        });
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
        // Only gate validation when moving forward past the current step
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
        if (!validatePersonalDetails()) { setActiveTab('personal'); return; }
        if (!validateIdentityDetails()) { setActiveTab('identity'); return; }
        if (!validateFamilyDetails()) { setActiveTab('family'); return; }
        if (!validateOtherDetails()) { setActiveTab('other'); return; }
        setIsSubmitting(true);
        const loadingToast = toast.loading(AS.LOADING);
        try {
            const nameParts = formData.name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ').trim() || firstName;
            const generatedAdmissionNumber = formData.admissionNumber.trim()
                ? formData.admissionNumber.trim()
                : `DPIS-${Math.floor(10000 + Math.random() * 90000)}`;

            const apiPayload = {
                admissionNumber: generatedAdmissionNumber,
                rollNumber: formData.rollNumber.trim() || null,
                firstName,
                lastName,
                category: formData.category.toUpperCase() || null,
                personalDetails: {
                    fullName: formData.name.trim(),
                    mobile: formData.mobile,
                    whatsappNumber: formData.whatsappNumber || formData.mobile || null,
                    email: formData.email.trim() || null,
                    gender: formData.gender.toUpperCase(),
                    dateOfBirth: formData.dob,
                    address: formData.address.trim() || null,
                    emergencyContact: formData.emergencyContact || null,
                    emergencyContactName: formData.guardianName.trim() || null,
                    emergencyContactRelation: formData.guardianRelation || null,
                    studentHouse: formData.studentHouse.trim() || null,
                    abcId: formData.abcId.trim() || null,
                },
                identityDetails: {
                    aadhaarNumber: formData.studentAadhaar || null,
                    aparId: formData.aparId.trim() || null,
                    pen: formData.pen.trim() || null,
                    familyId: formData.familyId.trim() || null,
                    ssmId: formData.ssmId.trim() || null,
                },
                sectionId: Number(formData.sectionId),
                admissionDate: formData.admissionDate,
                academicYear: formData.academicYear,
                status: formData.status,
                bloodGroup: formData.bloodGroup || null,
                previousSchool: formData.previousSchool.trim() || null,
                isTransferStudent: formData.isTransferStudent,
                hostelRequired: formData.hostelRequired,
                hostelRoomNumber: formData.hostelRequired ? (formData.hostelRoomNumber.trim() || null) : null,
                transportRequired: formData.transportRequired,
                fatherName: formData.fatherName.trim() || null,
                fatherOccupation: formData.fatherOccupation.trim() || null,
                fatherPhone: formData.fatherPhone || null,
                fatherEmail: formData.fatherEmail.trim() || null,
                fatherAadhaar: formData.fatherAadhaar || null,
                motherName: formData.motherName.trim() || null,
                motherOccupation: formData.motherOccupation.trim() || null,
                motherPhone: formData.motherPhone || null,
                motherEmail: formData.motherEmail.trim() || null,
                motherAadhaar: formData.motherAadhaar || null,
                guardianName: formData.guardianName.trim() || null,
                guardianRelation: formData.guardianRelation || null,
                guardianPhone: formData.guardianPhone || null,
                guardianEmail: formData.guardianEmail.trim() || null,
                guardianAddress: formData.guardianAddress.trim() || null,
                siblings: formData.siblings
                    .filter(s => s.name.trim())
                    .map(s => ({ name: s.name.trim(), className: s.className.trim() || null })),
                bankDetails: (formData.bankAccountNumber || formData.bankName || formData.ifscCode) ? {
                    accountNumber: formData.bankAccountNumber.trim(),
                    bankName: formData.bankName.trim(),
                    ifscCode: formData.ifscCode.trim(),
                } : null,
                remarks: null,
            };

            // profileImage + the `documents` bundle (birth/transfer certificates, report card,
            // parent/guardian photos, generic uploads) are sent as multipart files alongside
            // apiPayload — see createStudents in StudentsApi.js for the multipart wiring.
            const response = await createStudents(apiPayload, profileImage, documents);
            console.log('✅ Create Student Response:', response);
            toast.dismiss(loadingToast);
            toast.success(AS.SUCCESS);
            setTimeout(() => navigate('/students'), 500);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.message || 'Failed to add student ❌');
            console.error('❌ Submit error:', err);
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