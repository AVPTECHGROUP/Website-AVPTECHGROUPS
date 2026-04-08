import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import React, { useContext, useState } from 'react'
import Worker_3 from '../assets/Images/Worker_3.jpeg'
import { Link, useNavigate } from 'react-router-dom'
import { loginAPI } from '../Api/AuthApi'
import { UserContext } from '../ContextAPI/UserContext'
import cstech from "../assets/Images/cstech.png";

const Login_2 = ({ onLoginSuccess }) => {

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [showPassword, setshowPassword] = useState(false)
    const [errors, seterrors] = useState({})
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('')
    const navigate = useNavigate();

    const { setUser } = useContext(UserContext);

    const validateForm = () => {
        let allErrors = {}
        if (!email) {
            allErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            allErrors.email = "Please enter a valid email address"
        }
        if (!password) {
            allErrors.password = "Password is required"
        } else if (password.length < 6) {
            allErrors.password = "Password must be at least 6 characters"
        }
        seterrors(allErrors)
        return Object.keys(allErrors).length === 0
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setLoginError('');
        try {
            const res = await loginAPI({ email, password });
            const token = res.data?.token || res.token;
            const user = res.data?.user || res.user;
            const requireSchoolSelection = res.data?.requireSchoolSelection ?? res.requireSchoolSelection ?? false; // ADD

            if (!token) throw new Error('Invalid response from server. Please try again.');

            localStorage.setItem("token", token);
            localStorage.setItem("requireSchoolSelection", requireSchoolSelection);

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                setUser({
                    id: user.id,
                    userType: user.roles?.[0],
                    email: user.email,
                    permissions: user.permissions,
                });
            }

            if (onLoginSuccess) onLoginSuccess(token);

            if (requireSchoolSelection) {
                navigate("/superAdmin");
            } else {
                navigate("/dashboard");
            }

        } catch (err) {
            setLoginError(err.message || "Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-blue-200">

            {/* Header */}
            <div className="flex flex-col items-center mb-6 gap-2">
                <h1 className="text-center font-extrabold tracking-tight text-gray-800 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    School Management Portal
                </h1>

                {/* Logo Badge */}
                <div className="flex items-center gap-2 px-5 py-2 rounded-xl shadow-md bg-white bg-opacity-75 border border-blue-200">
                    <img src={cstech} className="h-10 w-auto object-contain" alt="CSTech Logo" />
                </div>
            </div>

            {/* Card */}
            <div className="flex flex-col sm:flex-row w-full max-w-3xl overflow-hidden shadow-2xl rounded-2xl border border-blue-200 border-opacity-40">

                <div className="sm:w-5/12 w-full overflow-hidden sm:min-h-full min-h-56" style={{ background: '#7dd3f7' }}>
                    <img
                        src={Worker_3}
                        alt="Portal Visual"
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                {/* Right — Form Panel */}
                <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 py-8 sm:py-10 bg-white">

                    <h2 className="text-center font-bold text-gray-800 text-2xl mb-1 tracking-tight">
                        System Login
                    </h2>
                    <p className="text-center text-sm text-gray-400 mb-5">
                        Sign in to access your portal
                    </p>

                    {loginError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-600 rounded-lg">
                            <p className="text-sm text-center">{loginError}</p>
                        </div>
                    )}

                    <form onSubmit={onSubmitHandler} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                                <input
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => { setemail(e.target.value); setLoginError(''); }}
                                    type="email"
                                    placeholder="Enter your email"
                                    className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-blue-50 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.email ? 'border-2 border-red-400' : 'border border-blue-200'}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs mt-1 text-red-500">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <LockKeyhole size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                                <input
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => { setpassword(e.target.value); setLoginError(''); }}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className={`w-full pl-9 pr-10 py-2.5 rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-blue-50 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.password ? 'border-2 border-red-400' : 'border border-blue-200'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setshowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-150 cursor-pointer"
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs mt-1 text-red-500">{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2.5 rounded-lg font-semibold text-white text-sm tracking-wide transition-all duration-200 shadow-md
                                ${isLoading
                                    ? 'bg-blue-300 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 hover:shadow-blue-300 hover:shadow-lg cursor-pointer active:scale-95'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Verifying...
                                </span>
                            ) : 'Login'}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-2">
                            <hr className="flex-1 border-blue-100" />
                            <ShieldCheck size={14} className="text-blue-300 flex-shrink-0" />
                            <hr className="flex-1 border-blue-100" />
                        </div>

                        {/* Footer Notes */}
                        <div className="text-center space-y-1">
                            <p className="text-xs font-medium text-gray-400">Authorized access only</p>
                            <p className="text-xs text-gray-400">
                                Contact system administrator for credentials if you require access.
                            </p>
                        </div>

                    </form>
                </div>
            </div>

            {/* Developed By */}
            <div className="mt-5 px-6 py-2.5 rounded-full flex items-center gap-1.5 font-medium text-gray-500 shadow-sm bg-white bg-opacity-65 border border-blue-200 border-opacity-50">
                <span className='text-sm'>Developed By</span>
                <Link
                    to="https://computesofttech.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 text-sm hover:text-blue-800 hover:underline transition-colors duration-150"
                >
                    ComputeSoftTech
                </Link>
            </div>

        </div>
    )
}

export default Login_2