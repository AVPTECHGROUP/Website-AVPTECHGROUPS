import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Users, Camera, X, FileBadge2, Landmark, Image as ImageIcon, RefreshCcw } from 'lucide-react';
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

// Human-readable names used by both the "please fill this tab first" toast
// (completely untouched tab) and the sequential tab-jump toast below.
const TAB_LABELS = {
    personal: 'Personal Details',
    identity: 'Identity & Documents',
    family: 'Family Details',
    other: 'Other Details',
};

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

    // --- CAMERA & POPUP STATE ---
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [facingMode, setFacingMode] = useState('user'); // Default front camera
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
        setShowCamera(true); // Open camera inside the same modal
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
                closePhotoMenu(); // Close the modal and stop camera
            }
        }, "image/jpeg", 0.9);
    };
    // ----------------------------

    const [documents, setDocuments] = useState({
        birthCertificate: null, transferCertificate: null, reportCard: null, studentAadhaarDoc: null,
        fatherAadhaarDoc: null, motherAadhaarDoc: null, fatherPhoto: null, motherPhoto: null, guardianPhoto: null, genericDocuments: [],
    });

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', gender: '', email: '', mobile: '', address: '', dob: '', admissionNumber: '',
        admissionDate: new Date().toISOString().slice(0, 10), academicYear: '2025-2026', academicYearId: '', rollNumber: '',
        status: 'ACTIVE', bloodGroup: '', previousSchool: '', profileImageUrl: '', sectionId: '', fatherName: '', fatherOccupation: '',
        fatherPhone: '', fatherEmail: '', motherName: '', motherOccupation: '', motherPhone: '', motherEmail: '', guardianName: '',
        guardianRelation: '', guardianPhone: '', guardianEmail: '', emergencyContact: '', hostelRequired: false, transportRequired: false,
        category: 'GENERAL', religion: 'HINDU', whatsappNumber: '', sameAsMobile: false, studentHouse: '', abcId: '', isTransferStudent: false,
        studentAadhaar: '', aparId: '', pen: '', familyId: '', ssmId: '', fatherAadhaar: '', motherAadhaar: '', guardianAddress: '',
        guardianOccupation: '', sameAsCurrentAddress: false, siblings: [], hostelRoomNumber: '', bankAccountNumber: '', bankName: '',
        ifscCode: '', remarks: '',
    });

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await getAllSections();
                if (res?.success && Array.isArray(res.data)) {
                    setSections(res.data.filter(sec => sec.status === 'ACTIVE'));
                } else toast.error(AS.ERRORS?.SECTION_LOAD_FAILED || "Failed to load sections");
            } catch (err) {
                console.error(err);
                toast.error(AS.ERRORS?.SECTION_LOAD_RETRY || "Error loading sections");
            } finally { setSectionsLoading(false); }
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
        let { name, value } = e.target;
        const numericFields = ['mobile', 'whatsappNumber', 'fatherPhone', 'motherPhone', 'guardianPhone', 'emergencyContact', 'studentAadhaar', 'fatherAadhaar', 'motherAadhaar', 'bankAccountNumber'];
        if (numericFields.includes(name)) value = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleGuardianSource = (source) => {
        const newSource = guardianSource === source ? null : source;
        setGuardianSource(newSource);
        if (newSource === 'father') {
            if (!formData.fatherName) { toast.warning("Please fill Father's details first"); return; }
            setFormData(prev => ({ ...prev, guardianName: prev.fatherName, guardianRelation: 'Father', guardianPhone: prev.fatherPhone, guardianEmail: prev.fatherEmail }));
        } else if (newSource === 'mother') {
            if (!formData.motherName) { toast.warning("Please fill Mother's details first"); return; }
            setFormData(prev => ({ ...prev, guardianName: prev.motherName, guardianRelation: 'Mother', guardianPhone: prev.motherPhone, guardianEmail: prev.motherEmail }));
        } else {
            setFormData(prev => ({ ...prev, guardianName: '', guardianRelation: '', guardianPhone: '', guardianEmail: '' }));
        }
        setFormErrors(prev => { const n = { ...prev }; delete n.guardianName; delete n.guardianRelation; delete n.guardianPhone; delete n.guardianEmail; return n; });
    };

    const handleDocumentChange = (key, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) { toast.error('Only PDF, JPG or PNG files allowed'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('File size must be under 10MB'); return; }
        setDocuments(prev => ({ ...prev, [key]: file }));
        if (formErrors[key]) setFormErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    const handleDocumentRemove = (key) => setDocuments(prev => ({ ...prev, [key]: null }));
    const handleGenericDocAdd = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setDocuments(prev => ({ ...prev, genericDocuments: [...prev.genericDocuments, ...files.map(f => ({ id: `${Date.now()}-${f.name}`, file: f }))] }));
        e.target.value = '';
    };
    const handleGenericDocRemove = (id) => setDocuments(prev => ({ ...prev, genericDocuments: prev.genericDocuments.filter(d => d.id !== id) }));
    const handleAddSibling = () => setFormData(prev => ({ ...prev, siblings: [...prev.siblings, { id: Date.now(), name: '', className: '' }] }));
    const handleSiblingChange = (id, field, value) => setFormData(prev => ({ ...prev, siblings: prev.siblings.map(s => s.id === id ? { ...s, [field]: value } : s) }));
    const handleRemoveSibling = (id) => setFormData(prev => ({ ...prev, siblings: prev.siblings.filter(s => s.id !== id) }));

    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const aadhaarRegex = /^\d{12}$/;

    // Each validate*Details function now distinguishes two situations:
    //
    //  1. The tab is COMPLETELY untouched — nothing has been typed into any
    //     of its fields. Rather than surfacing whichever field happens to
    //     be checked first internally, this shows one generic, tab-level
    //     toast: `Please fill "Personal Details" first.` — that's the
    //     right message when someone has genuinely skipped a whole section.
    //
    //  2. The tab has SOME data in it but a specific mandatory field is
    //     still missing or invalid — this shows the specific field-level
    //     toast, same as before (e.g. "Full name is required.").
    //
    // The `silent` flag (default false) still controls whether a toast
    // fires at all — used by handleTabClick's read-only completeness
    // checks where a toast would be redundant.
    const validatePersonalDetails = (silent = false) => {
        const isEmpty = !formData.firstName.trim() && !formData.gender && !formData.mobile
            && !formData.dob && !formData.address?.trim() && !formData.rollNumber.trim() && !formData.sectionId;
        const fail = (msg) => {
            if (!silent) toast.error(isEmpty ? `Please fill "${TAB_LABELS.personal}" first.` : msg);
            return false;
        };
        if (!formData.firstName.trim()) return fail("Full name is required.");
        if (!formData.gender) return fail("Gender is required.");
        if (!formData.mobile) return fail("Mobile number is required.");
        if (!phoneRegex.test(formData.mobile)) return fail("Mobile number must be a valid 10-digit number starting with 6, 7, 8, or 9.");
        if (!formData.dob) return fail("Date of birth is required.");
        if (!formData.admissionDate) return fail("Admission date is required.");
        if (!formData.address?.trim()) return fail("Address is required.");
        if (!formData.rollNumber.trim()) return fail(AS.ERRORS?.ROLL_REQUIRED || "Roll number is required.");
        if (!formData.sectionId) return fail(AS.ERRORS?.SECTION_REQUIRED || "Section is required.");
        if (formData.whatsappNumber && !phoneRegex.test(formData.whatsappNumber)) return fail("WhatsApp number must be a valid 10-digit number starting with 6, 7, 8, or 9.");
        if (formData.email && !emailRegex.test(formData.email)) return fail(AS.ERRORS?.EMAIL_INVALID || "Please enter a valid email address.");
        return true;
    };

    // Identity & Documents has no mandatory fields, so there's no "empty
    // tab" case here — the only possible failure is an invalid (not
    // missing) Aadhaar number, which is always a specific-field situation.
    const validateIdentityDetails = (silent = false) => {
        const fail = (msg) => { if (!silent) toast.error(msg); return false; };
        if (formData.studentAadhaar && !aadhaarRegex.test(formData.studentAadhaar)) return fail("Student Aadhaar Number must be exactly 12 numeric digits.");
        return true;
    };

    const validateFamilyDetails = (silent = false) => {
        const isEmpty = !formData.fatherName?.trim() && !formData.fatherOccupation?.trim()
            && !formData.fatherPhone && !formData.motherName?.trim();
        const fail = (msg) => {
            if (!silent) toast.error(isEmpty ? `Please fill "${TAB_LABELS.family}" first.` : msg);
            return false;
        };
        if (!formData.fatherName?.trim()) return fail("Father's Name is required.");
        if (!formData.fatherOccupation?.trim()) return fail("Father's Occupation is required.");
        if (!formData.fatherPhone) return fail("Father's Phone number is required.");
        if (!phoneRegex.test(formData.fatherPhone)) return fail("Father's Phone must be a valid 10-digit number.");
        if (formData.fatherEmail && !emailRegex.test(formData.fatherEmail)) return fail("Father's Email is invalid.");
        if (formData.fatherAadhaar && !aadhaarRegex.test(formData.fatherAadhaar)) return fail("Father's Aadhaar must be 12 digits.");
        if (!formData.motherName?.trim()) return fail("Mother's Name is required.");
        if (formData.motherPhone && !phoneRegex.test(formData.motherPhone)) return fail("Mother's Phone must be valid.");
        if (formData.motherEmail && !emailRegex.test(formData.motherEmail)) return fail("Mother's Email is invalid.");
        if (formData.motherAadhaar && !aadhaarRegex.test(formData.motherAadhaar)) return fail("Mother's Aadhaar must be 12 digits.");
        if (formData.guardianPhone && !phoneRegex.test(formData.guardianPhone)) return fail("Guardian's Phone must be valid.");
        if (formData.guardianEmail && !emailRegex.test(formData.guardianEmail)) return fail("Guardian's Email is invalid.");
        if (formData.emergencyContact && !phoneRegex.test(formData.emergencyContact)) return fail("Emergency Contact must be valid.");
        return true;
    };

    // Other Details has no baseline-mandatory fields either — Hostel Room
    // Number only becomes required once the person has already toggled
    // "Hostel Required" ON, which is itself an action that means the tab
    // is no longer "untouched". So there's no meaningful empty-tab case
    // here — every possible failure is already a specific-field situation.
    const validateOtherDetails = (silent = false) => {
        const fail = (msg) => { if (!silent) toast.error(msg); return false; };
        if (formData.hostelRequired && !formData.hostelRoomNumber?.trim()) return fail("Hostel Room Number is required.");
        if (formData.bankAccountNumber) {
            if (formData.bankAccountNumber.length < 9 || formData.bankAccountNumber.length > 18) return fail("Bank Account Number must be between 9 and 18 digits.");
        }
        return true;
    };

    const validateTab = (tab, silent = false) => {
        if (tab === 'personal') return validatePersonalDetails(silent);
        if (tab === 'identity') return validateIdentityDetails(silent);
        if (tab === 'family') return validateFamilyDetails(silent);
        if (tab === 'other') return validateOtherDetails(silent);
        return true;
    };

    const scrollToTop = () => formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // "Next" always operates on the CURRENT tab only, so the toast from
    // validateTab (silent=false, the default) is exactly right here — the
    // person is actively working on this tab, and gets either the generic
    // "please fill this tab" message (untouched) or the specific field
    // message (partially filled), per validateTab's own logic above.
    const handleNextTab = () => {
        if (!validateTab(activeTab)) return;
        const idx = TAB_ORDER.indexOf(activeTab);
        if (idx < TAB_ORDER.length - 1) { setActiveTab(TAB_ORDER[idx + 1]); scrollToTop(); }
    };
    const handleBackTab = () => {
        const idx = TAB_ORDER.indexOf(activeTab);
        if (idx > 0) { setActiveTab(TAB_ORDER[idx - 1]); scrollToTop(); }
    };

    // Clicking a stepper tab directly:
    //  - Backward (an earlier tab, or the current one): always allowed —
    //    no validation needed to go back and review.
    //  - Forward: the tab being left must be valid first, using the same
    //    empty-vs-partial toast logic as "Next". If that passes, forward
    //    movement is capped at ONE tab at a time, same as "Next" — trying
    //    to jump further ahead (e.g. Personal -> Family, skipping Identity)
    //    drops the person on the very next tab in the sequence with
    //    `Please fill "Identity & Documents" first.` instead of silently
    //    skipping it, regardless of whether that next tab has mandatory
    //    fields or not.
    const handleTabClick = (tab) => {
        const targetIdx = TAB_ORDER.indexOf(tab);
        const currentIdx = TAB_ORDER.indexOf(activeTab);

        if (targetIdx <= currentIdx) {
            setActiveTab(tab);
            scrollToTop();
            return;
        }

        if (!validateTab(activeTab)) return; // validateTab toasts the right message for this tab's state

        if (targetIdx > currentIdx + 1) {
            const nextTabKey = TAB_ORDER[currentIdx + 1];
            toast.error(`Please fill "${TAB_LABELS[nextTabKey]}" first.`);
            setActiveTab(nextTabKey);
            scrollToTop();
            return;
        }

        setActiveTab(tab);
        scrollToTop();
    };

    const handleSubmit = (e) => e.preventDefault();

    const handleSaveDetails = async () => {
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
            const generatedAdmissionNumber = formData.admissionNumber.trim() ? formData.admissionNumber.trim() : `ADM-${Math.floor(100000 + Math.random() * 900000)}`;

            const apiPayload = {
                admissionNumber: generatedAdmissionNumber, rollNumber: formData.rollNumber.trim() || null, firstName, lastName, fullName,
                sectionId: Number(formData.sectionId), admissionDate: formData.admissionDate, academicYearId: formData.academicYearId ? Number(formData.academicYearId) : null,
                academicYear: formData.academicYear || "2025-2026", status: formData.status || "ACTIVE", bloodGroup: formData.bloodGroup || null,
                previousSchool: formData.previousSchool.trim() || null, transportRequired: Boolean(formData.transportRequired), hostelRequired: Boolean(formData.hostelRequired),
                category: (formData.category || "GENERAL").toUpperCase(), religion: formData.religion ? formData.religion.toUpperCase() : "HINDU",
                whatsappNumber: formData.whatsappNumber || formData.mobile || null, studentHouse: formData.studentHouse.trim() || null,
                aadhaarNumber: formData.studentAadhaar.trim() || null, abcId: formData.abcId.trim() || null, aparId: formData.aparId.trim() || null,
                fatherName: formData.fatherName.trim() || null, fatherOccupation: formData.fatherOccupation.trim() || null, fatherPhone: formData.fatherPhone || null,
                fatherEmail: formData.fatherEmail.trim() || null, fatherAadhaar: formData.fatherAadhaar.trim() || null, motherName: formData.motherName.trim() || null,
                motherOccupation: formData.motherOccupation.trim() || null, motherPhone: formData.motherPhone || null, motherEmail: formData.motherEmail.trim() || null,
                motherAadhaar: formData.motherAadhaar.trim() || null, guardianName: formData.guardianName.trim() || null, guardianRelation: formData.guardianRelation || null,
                guardianPhone: formData.guardianPhone || null, guardianEmail: formData.guardianEmail.trim() || null, guardianAddress: formData.guardianAddress.trim() || null,
                guardianOccupation: formData.guardianOccupation.trim() || null, currentAddress: formData.address.trim() || null, permanentAddress: formData.address.trim() || null,
                hostelRoomDescription: formData.hostelRequired ? (formData.hostelRoomNumber.trim() || null) : null, bankAccountNumber: formData.bankAccountNumber.trim() || null,
                bankName: formData.bankName.trim() || null, bankIfscCode: formData.ifscCode.trim() || null, penNumber: formData.pen.trim() || null,
                ssmId: formData.ssmId.trim() || null, familyId: formData.familyId.trim() || null, remarks: formData.remarks || null,
                personalDetails: {
                    firstName, lastName, fullName, mobile: formData.mobile, email: formData.email.trim() || null, gender: (formData.gender || "MALE").toUpperCase(),
                    dateOfBirth: formData.dob, address: formData.address.trim() || null, emergencyContact: formData.emergencyContact || formData.guardianPhone || formData.fatherPhone || null,
                    emergencyContactName: formData.guardianName || formData.fatherName || null, emergencyContactRelation: formData.guardianRelation || "Father",
                }
            };

            const res = await createStudents(apiPayload, profileImage);
            const createdStudentId = res?.data?.id || res?.id;

            if (createdStudentId) {
                const uploadPromises = [];
                if (documents.birthCertificate) uploadPromises.push(uploadStudentDocument(createdStudentId, 'BIRTH_CERTIFICATE', documents.birthCertificate));
                if (documents.studentAadhaarDoc) uploadPromises.push(uploadStudentDocument(createdStudentId, 'STUDENT_AADHAAR', documents.studentAadhaarDoc));
                if (documents.fatherAadhaarDoc) uploadPromises.push(uploadStudentDocument(createdStudentId, 'FATHER_AADHAAR', documents.fatherAadhaarDoc));
                if (documents.motherAadhaarDoc) uploadPromises.push(uploadStudentDocument(createdStudentId, 'MOTHER_AADHAAR', documents.motherAadhaarDoc));
                if (documents.fatherPhoto) uploadPromises.push(uploadParentPhoto(createdStudentId, 'FATHER', documents.fatherPhoto));
                if (documents.motherPhoto) uploadPromises.push(uploadParentPhoto(createdStudentId, 'MOTHER', documents.motherPhoto));
                if (documents.guardianPhoto) uploadPromises.push(uploadParentPhoto(createdStudentId, 'GUARDIAN', documents.guardianPhoto));
                if (uploadPromises.length > 0) await Promise.allSettled(uploadPromises);
            }

            toast.dismiss(loadingToast);
            toast.success(AS.SUCCESS || "Student added successfully!");
            setTimeout(() => navigate('/students'), 500);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.message || 'Failed to add student ❌');
            console.error(err);
        } finally { setIsSubmitting(false); }
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
                <button onClick={() => navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4">
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
                                    <div className="mb-6">
                                        <label className="block font-semibold text-gray-600 text-sm mb-3">
                                            {AS.PROFILE_PHOTO.LABEL}
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
                                                <button type="button" onClick={() => setShowPhotoMenu(true)}
                                                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow transition-colors">
                                                    <Camera className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            </div>

                                            <div className="flex-1">
                                                {!imagePreview ? (
                                                    <button type="button" onClick={() => setShowPhotoMenu(true)}
                                                            className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors cursor-pointer">
                                                        <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                                        <p className="text-sm font-medium text-blue-600">{AS.PROFILE_PHOTO.CTA}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{AS.PROFILE_PHOTO.FORMAT_HELP}</p>
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-green-700 truncate">{profileImage?.name}</p>
                                                            <p className="text-xs text-green-500 mt-0.5">{profileImage ? (profileImage.size / 1024).toFixed(1) + ' KB' : ''}</p>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            <button type="button" onClick={() => setShowPhotoMenu(true)}
                                                                    className="text-xs px-2.5 py-1 bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors">
                                                                {AS.PROFILE_PHOTO.CHANGE}
                                                            </button>
                                                            <button type="button" onClick={handleRemoveImage}
                                                                    className="w-7 h-7 flex items-center justify-center bg-white border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleImageChange} className="hidden" />
                                    </div>

                                    <AddStudentPersonalDetails formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} errors={formErrors} sections={sections} sectionsLoading={sectionsLoading} />
                                    <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4 mt-4">
                                        <div>
                                            <label htmlFor="rollNumber" className="block font-semibold text-gray-600 text-sm mb-2">
                                                {AS.ROLL_LABEL}<span className="text-red-600 ml-1">*</span>
                                            </label>
                                            <input type="text" id="rollNumber" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} placeholder={AS.ROLL_PLACEHOLDER}
                                                   className="bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                </>
                            )}
                            {activeTab === 'identity' && <AddStudentIdentityDocuments formData={formData} handleInputChange={handleInputChange} errors={formErrors} documents={documents} onDocumentChange={handleDocumentChange} onDocumentRemove={handleDocumentRemove} onGenericDocAdd={handleGenericDocAdd} onGenericDocRemove={handleGenericDocRemove} />}
                            {activeTab === 'family' && <AddStudentFamilyDetails formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} errors={formErrors} setErrors={setFormErrors} guardianSource={guardianSource} onGuardianSource={handleGuardianSource} documents={documents} onDocumentChange={handleDocumentChange} onDocumentRemove={handleDocumentRemove} onAddSibling={handleAddSibling} onSiblingChange={handleSiblingChange} onRemoveSibling={handleRemoveSibling} />}
                            {activeTab === 'other' && <AddStudentOtherDetails formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} errors={formErrors} />}
                        </div>
                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button type="button" onClick={handleDiscard} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                    {C.DISCARD_CHANGES}
                                </button>
                                {!isFirstTab && (
                                    <button type="button" onClick={handleBackTab} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <ChevronLeft className="w-4 h-4" /> Back
                                    </button>
                                )}
                                {!isLastTab ? (
                                    <button type="button" onClick={handleNextTab} className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all bg-blue-500 hover:bg-blue-600 cursor-pointer text-white flex items-center gap-2">
                                        {AS.NEXT} <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button disabled={isSubmitting} type="button" onClick={handleSaveDetails} className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'}`}>
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{AS.SUBMIT_LOADING}</span>
                                        ) : AS.SAVE}
                                    </button>
                                )}
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

export default AddNewStudent;