import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Users } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'family'

    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        email: "",
        mobile: "",
        address: "",
        dob: "",
        admissionNumber: "",
        admissionDate: "",
        academicYear: "2025-2026",
        status: "ACTIVE",
        bloodGroup: "",
        previousSchool: "",
        profileImageUrl: "",
        sectionId: "",
        fatherName: "",
        fatherOccupation: "",
        fatherPhone: "",
        fatherEmail: "",
        motherName: "",
        motherOccupation: "",
        motherPhone: "",
        motherEmail: "",
        guardianName: "",
        guardianRelation: "",
        guardianPhone: "",
        guardianEmail: "",
        emergencyContact: "",
        hostelRequired: false,
        transportRequired: false,
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear inline error for this field as user types
        if (familyErrors[name]) {
            setFamilyErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validatePersonalDetails = () => {
        if (!formData.name.trim() || !formData.gender || !formData.mobile || !formData.dob || !formData.admissionDate || !formData.academicYear) {
            toast.error("Please fill all required fields!");
            return false;
        }
        if (!formData.sectionId) {
            toast.error("Please select a section!");
            return false;
        }
        if (!phoneRegex.test(formData.mobile)) {
            toast.error("Mobile number must be exactly 10 digits!");
            return false;
        }
        if (formData.email && !emailRegex.test(formData.email)) {
            toast.error("Please enter a valid student email address!");
            return false;
        }
        if (formData.status !== 'ACTIVE') {
            toast.error("Student status must be ACTIVE to add a new student!");
            return false;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dobDate = new Date(formData.dob);
        if (dobDate >= today) {
            toast.error("Date of birth cannot be today or in the future!");
            return false;
        }
        const age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) ? age - 1 : age;
        if (actualAge < 3) {
            toast.error("Student must be at least 3 years old!");
            return false;
        }
        const admissionDateObj = new Date(formData.admissionDate);
        if (admissionDateObj > today) {
            toast.error("Admission date cannot be in the future!");
            return false;
        }
        return true;
    };

    const buildFamilyErrors = (data) => {
        const e = {};
        if (!data.fatherName.trim()) e.fatherName = "Father's name is required";
        if (!data.fatherOccupation.trim()) e.fatherOccupation = "Father's occupation is required";
        if (!data.fatherPhone) e.fatherPhone = "Father's phone is required";
        else if (!phoneRegex.test(data.fatherPhone)) e.fatherPhone = "Must be exactly 10 digits";
        if (!data.fatherEmail.trim()) e.fatherEmail = "Father's email is required";
        else if (!emailRegex.test(data.fatherEmail)) e.fatherEmail = "Invalid email format";

        if (!data.motherName.trim()) e.motherName = "Mother's name is required";
        if (!data.motherOccupation.trim()) e.motherOccupation = "Mother's occupation is required";
        if (!data.motherPhone) e.motherPhone = "Mother's phone is required";
        else if (!phoneRegex.test(data.motherPhone)) e.motherPhone = "Must be exactly 10 digits";
        if (!data.motherEmail.trim()) e.motherEmail = "Mother's email is required";
        else if (!emailRegex.test(data.motherEmail)) e.motherEmail = "Invalid email format";

        if (!data.guardianName.trim()) e.guardianName = "Guardian's name is required";
        if (!data.guardianRelation) e.guardianRelation = "Relation is required";
        if (!data.guardianPhone) e.guardianPhone = "Guardian's phone is required";
        else if (!phoneRegex.test(data.guardianPhone)) e.guardianPhone = "Must be exactly 10 digits";
        if (data.guardianEmail && !emailRegex.test(data.guardianEmail)) e.guardianEmail = "Invalid email format";

        if (!data.emergencyContact) e.emergencyContact = "Emergency contact is required";
        else if (!phoneRegex.test(data.emergencyContact)) e.emergencyContact = "Must be exactly 10 digits";

        return e;
    };

    const validateFamilyDetails = () => {
        const errors = buildFamilyErrors(formData);
        if (Object.keys(errors).length > 0) {
            setFamilyErrors(errors);
            return false;
        }
        setFamilyErrors({});
        return true;
    };

    const handleNextTab = () => {
        if (!validatePersonalDetails()) return;
        setActiveTab('family');
    };

    const handleTabClick = (tab) => {
        if (tab === 'family') {
            if (!validatePersonalDetails()) return;
        }
        setActiveTab(tab);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Actual submission is handled by handleSaveDetails via the Save Details button.
        // This just prevents any accidental native form submit.
    };

    const handleSaveDetails = async () => {
        if (!validatePersonalDetails()) {
            setActiveTab('personal');
            return;
        }
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

            const apiPayload = {
                admissionNumber: generatedAdmissionNumber,
                rollNumber: null,
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
                profileImageUrl: null,
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

            const response = await createStudents(apiPayload);
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
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to List</span>
                </button>

                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        Add New Student
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        Enter the details below to onboard a new student into the system.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg shadow">
                        {/* ── Tab Nav ── */}
                        <div className="border-b border-gray-200">
                            <nav className="flex flex-wrap -mb-px">
                                {/* Personal Details Tab */}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('personal')}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <User size={20} />
                                    <span className="hidden sm:inline">Personal Details</span>
                                    <span className="sm:hidden">Personal</span>
                                </button>

                                {/* Family Details Tab */}
                                <button
                                    type="button"
                                    onClick={() => handleTabClick('family')}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'family'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Users size={20} />
                                    <span className="hidden sm:inline">Family Details</span>
                                    <span className="sm:hidden">Family</span>
                                </button>
                            </nav>
                        </div>

                        {/* ── Tab Content ── */}
                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeTab === 'personal' && (
                                <AddStudentPersonalDetails
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    sections={sections}
                                    sectionsLoading={sectionsLoading}
                                />
                            )}
                            {activeTab === 'family' && (
                                <AddStudentFamilyDetails
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleInputChange={handleInputChange}
                                    errors={familyErrors}
                                    setErrors={setFamilyErrors}
                                />
                            )}
                        </div>

                        {/* ── Footer Buttons ── */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Discard Changes
                                </button>

                                {activeTab === 'personal' ? (
                                    <button
                                        type="button"
                                        onClick={handleNextTab}
                                        className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all bg-blue-500 hover:bg-blue-600 cursor-pointer text-white flex items-center gap-2"
                                    >
                                        Next
                                        <ChevronLeft className="w-4 h-4 rotate-180" />
                                    </button>
                                ) : (
                                    <button
                                        disabled={isSubmitting}
                                        type="button"
                                        onClick={handleSaveDetails}
                                        className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${isSubmitting
                                                ? 'bg-blue-300 cursor-not-allowed text-white'
                                                : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Adding...
                                            </span>
                                        ) : (
                                            'Save Details'
                                        )}
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