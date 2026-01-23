import React, { useState } from "react";
import {Eye,EyeOff,GraduationCap,Mail,Lock,User,MapPin,Calendar,} from "lucide-react";
import role from '../assets/role.jpg'
import dpis from '../assets/dpis.PNG'

export default function Login_Role() {
const [isRegister, setIsRegister] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState({});

const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    gender: "",
    dob: "",
    email: "",
    password: "",
    role: "",
});

const roles = [
    { value: "", label: "Select your role", disabled: true },
    { value: "principal", label: "Principal" },
    { value: "vice-principal", label: "Vice-Principal" },
    { value: "teachers", label: "Teachers" },
    { value: "students", label: "Students" },
    { value: "other-staffs", label: "Other Staffs" },
];

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
};

// EMAIL VALIDATION FUNCTION
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// PASSWORD VALIDATION FUNCTION
const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 6;

    return {
        isValid: hasUpperCase && hasLowerCase && hasSpecialChar && hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasSpecialChar,
        hasMinLength,
    };
};

const validateForm = () => {
    const newErrors = {};

    // Email validation with proper checks
    if (!formData.email) {
        newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
    }

    // Password validation with all requirements
    if (!formData.password) {
        newErrors.password = "Password is required";
    } else {
        const passwordCheck = validatePassword(formData.password);
        if (!passwordCheck.isValid) {
            if (!passwordCheck.hasMinLength) {
                newErrors.password = "Password must be at least 6 characters";
            } else if (!passwordCheck.hasUpperCase) {
                newErrors.password = "Password must contain at least one uppercase letter";
            } else if (!passwordCheck.hasLowerCase) {
                newErrors.password = "Password must contain at least one lowercase letter";
            } else if (!passwordCheck.hasSpecialChar) {
                newErrors.password = "Password must contain at least one special character";
            }
        }
    }

    if (!formData.role) newErrors.role = "Role is required";

    if (isRegister) {
        if (!formData.firstName) newErrors.firstName = "First name required";
        if (!formData.lastName) newErrors.lastName = "Last name required";
        if (!formData.gender) newErrors.gender = "Gender required";
        if (!formData.dob) newErrors.dob = "DOB required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setTimeout(() => {
        console.log(isRegister ? "REGISTER DATA" : "LOGIN DATA", formData);
        setIsLoading(false);
    }, 1500);
};

return (
    <div className="min-h-screen bg-linear-to-br from-indigo-200 via-blue-200 to-blue-300 flex flex-col items-center justify-center p-4">
    
    {/* School Name - Above the login card */}
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 sm:mb-4 text-center px-4">
        Delhi Public International School
    </h1>

    {/* Login/Register Card Container */}
    <div className="flex sm:flex-row flex-col items-center justify-center">
        {/* Image div */}
        <img className={`${isRegister ? 'lg:w-175' : 'lg:w-123'} w-0 rounded-tl-2xl rounded-bl-2xl`} src={role} alt="" />
    
        <div className=" max-w-l">
            {/* Card */}
            <div className="bg-white/80 sm:w-140 backdrop-blur-xl rounded-tr-3xl rounded-br-3xl shadow-2xl p-6 sm:p-7">
                {/* Header */}
                <div className="text-center mb-5">
                    <div className="mx-auto bg-linear-to-br rounded-full flex items-center justify-center mb-3">
                        <img className="h-20" src={dpis} alt="" />
                    </div>
                    <h1 className="text-2xl font-extrabold bg-linear-to-r from-black to-gray-500 bg-clip-text text-transparent">
                        {isRegister ? "Create Account" : "User Login"}
                    </h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* REGISTER FIELDS */}
                    {isRegister && (
                        <>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                <input 
                                name="firstName" 
                                placeholder="First Name" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                required
                                className="w-full pl-11 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" 
                                />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                            </div>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                <input 
                                name="lastName" 
                                placeholder="Last Name" 
                                value={formData.lastName}
                                required 
                                onChange={handleChange} 
                                className="w-full pl-11 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" 
                                />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            <input 
                                name="address" 
                                placeholder="Address"
                                required 
                                value={formData.address} 
                                onChange={handleChange} 
                                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" 
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <input 
                                name="city" 
                                placeholder="City"
                                required 
                                value={formData.city} 
                                onChange={handleChange} 
                                className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" 
                            />
                            <input 
                                name="state" 
                                placeholder="State"
                                required 
                                value={formData.state} 
                                onChange={handleChange} 
                                className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" 
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <select
                                name="gender"
                                required
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            >
                                <option value="">Select Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>

                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                <input
                                type="date"
                                name="dob"
                                required
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>
                        </>
                    )}

                    {/* EMAIL */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* PASSWORD */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-11 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* ROLE — LAST INPUT */}
                    <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none cursor-pointer"
                        >
                            {roles.map((r) => (
                                <option key={r.value} value={r.value} disabled={r.disabled}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                    </div>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-linear-to-r cursor-pointer from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition disabled:opacity-70"
                    >
                        {isLoading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
                    </button>
                </form>

                {/* TOGGLE - Updated for Login mode */}
                {!isRegister && (
                    <div className="flex items-center justify-between mt-12">
                        <button
                            onClick={() => console.log("Forgot password clicked")}
                            className="text-indigo-700 font-semibold hover:underline cursor-pointer"
                        >
                            Forgot Password?
                        </button>
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="font-semibold cursor-pointer text-indigo-700"
                        >
                            Create New Account? <span className="text-black hover:underline">SignUp</span>
                        </button>
                    </div>
                )}

                {/* TOGGLE - For Register mode */}
                {isRegister && (
                    <div className="text-center mt-6">
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                        >
                            Already have an account? Login
                        </button>
                    </div>
                )}
            </div>
        </div>   
    </div>

    </div>
);
}