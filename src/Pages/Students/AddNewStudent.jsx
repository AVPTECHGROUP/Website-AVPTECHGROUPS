import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { toast } from 'react-toastify';
import AddStudentDetails from '../../Components/Students/AddStudentDetails';
import { createStudents } from '../../Api/StudentsApi';

function AddNewStudent() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        email: "",
        mobile: "",
        address: "",
        dob: "",
        admissionNumber: "",
        admissionDate: "",
        status: "ACTIVE",
        fatherName: "",
        motherName: "",
        emergencyContact: "",
        hostelRequired: false,
        transportRequired: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        // Check required fields
        if (!formData.name || !formData.gender || !formData.mobile || !formData.dob || !formData.admissionDate) {
            toast.error("Please fill all required fields!");
            return false;
        }

        // Validate mobile number - must be exactly 10 digits
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobile)) {
            toast.error("Mobile number must be exactly 10 digits!");
            return false;
        }

        // Validate emergency contact if provided - must be exactly 10 digits
        if (formData.emergencyContact && !mobileRegex.test(formData.emergencyContact)) {
            toast.error("Emergency contact must be exactly 10 digits!");
            return false;
        }

        // Validate email format if provided
        if (formData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                toast.error("Please enter a valid email address!");
                return false;
            }
        }

        // Check if status is ACTIVE
        if (formData.status !== 'ACTIVE') {
            toast.error("Student status must be ACTIVE to add a new student!");
            return false;
        }

        // Validate date of birth (should not be in future)
        const dobDate = new Date(formData.dob);
        const today = new Date();
        if (dobDate > today) {
            toast.error("Date of birth cannot be in the future!");
            return false;
        }

        // Validate admission date (should not be in future)
        const admissionDateObj = new Date(formData.admissionDate);
        if (admissionDateObj > today) {
            toast.error("Admission date cannot be in the future!");
            return false;
        }

        // Check if student is at least 3 years old
        const age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate()) ? age - 1 : age;

        if (actualAge < 3) {
            toast.error("Student must be at least 3 years old!");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Run all validations
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Adding student...");

        try {
            const [firstName, ...lastNameArr] = formData.name.trim().split(" ");
            const lastName = lastNameArr.join(" ") || "NA";

            // Generate admission number if not provided
            const generatedAdmissionNumber = formData.admissionNumber.trim()
                ? formData.admissionNumber.trim()
                : `DPIS-${Math.floor(10000 + Math.random() * 90000)}`;


            const apiPayload = {
                admissionNumber: generatedAdmissionNumber,
                rollNumber: `ROLL-${Date.now()}`,

                firstName,
                lastName,

                personalDetails: {
                    fullName: formData.name,
                    mobile: formData.mobile,
                    email: formData.email || "student@school.com",
                    gender: formData.gender.toUpperCase(),
                    dateOfBirth: formData.dob,
                    address: formData.address || "NA",
                    emergencyContact: formData.emergencyContact || "9999999999",
                    emergencyContactName: "Parent",
                    emergencyContactRelation: "Father"
                },

                sectionId: 1,
                admissionDate: formData.admissionDate,
                academicYear: "2025-2026",
                status: formData.status,

                hostelRequired: formData.hostelRequired,
                transportRequired: formData.transportRequired,

                fatherName: formData.fatherName || "NA",
                motherName: formData.motherName || "NA",

                remarks: "Created from UI"
            };

            const response = await createStudents(apiPayload);
            console.log("Create Student Response:", response);

            toast.dismiss(loadingToast);
            toast.success("Student added successfully ✅");

            setTimeout(() => {
                navigate("/students");
            }, 500);

        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.message || "Failed to add student ❌");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDiscard = () => {
        navigate('/students');
    };

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
                        Add New Student
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        Enter the details below to onboard a new student into the system.
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
                            <AddStudentDetails
                                formData={formData}
                                setFormData={setFormData}
                                handleInputChange={handleInputChange}
                            />
                        </div>

                        {/* Footer Buttons */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Discard Changes
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
                                            Adding...
                                        </span>
                                    ) : (
                                        'Save Details'
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

export default AddNewStudent;