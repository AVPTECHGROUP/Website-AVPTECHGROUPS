import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Space, Moon, Sun } from 'lucide-react'
import React, { useState } from 'react'
import worker_1 from '../assets/Images/worker_1.jpg'
import {useNavigate } from 'react-router-dom'
const Login_2 = ({ onLoginSuccess }) => {

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [showPassword, setshowPassword] = useState(false)
    const [errors, seterrors] = useState({})
  const [isLoading, setIsLoading] = useState(false);
    const [isDark, setIsDark] = useState(false)

    const navigate=useNavigate()
    const validateForm = () => {
        let allErrors = {}

        if (!email) {
            allErrors.email = "Email is required"
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            allErrors.email = "Please enter a valid email address"
        }

        if (!password) {
            allErrors.password = "Password is required"
        }
        else if (password.length < 6) {
            allErrors.password = "Password must be atleast 6 characters"
        }
        seterrors(allErrors)
        return Object.keys(allErrors).length === 0
    }


    const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await loginAPI({ email, password });

      // store token & user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    if (onLoginSuccess) onLoginSuccess(res.data.token);

      // navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
    return (
        <>
            <div className={`min-h-screen relative flex items-center flex-col justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-blue-100'}`}>

        <h1 className={`text-center font-bold sm:p-8 p-5 sm:text-3xl text-[16px] transition-colors duration-300 ${isDark ?'text-blue-400' : 'text-black'}`}>School Payroll & Attendance Management System</h1>
                {/* Theme Toggle Button */}
                <button
                    onClick={() => setIsDark(!isDark)}
                    className={`sm:absolute sm:top-6 sm:right-6 p-2 -right-35.5 relative cursor-pointer rounded-full transition-all duration-300 ${isDark
                            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                        }`} aria-label="Toggle theme">

                {/* Icon Change is isDark-true */}
                    {isDark ? <Sun size={23} /> : <Moon size={23} fill='grey' stroke='0' />}
                </button>

                <div className='flex flex-col sm:flex-row'>

                <div className={`sm:w-full max-w-md shadow-xl sm:p-1 sm:mt-0 mt-4 p-5 flex items-center flex-col pt-10 sm:rounded-tl-xl sm:rounded-bl-xl rounded-tl-xl transition-colors duration-300 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>

                    
                    <img className='w-full sm:h-full object-cover relaive shadow-2xl' src={worker_1} alt="" />

                </div>

                <div className={`w-full sm:h-full max-w-md sm:rounded-tr-xl sm:rounded-br-xl rounded-br-xl shadow-xl p-8 transition-colors duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>

                    {/* Heading of the form--> */}

                <h1 className={`text-center text-2xl font-bold tracking-wide leading-tight mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>Super Admin Login</h1>
                <p className={`text-center mb-1 font-normal transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Secure access to the School Payroll & Attendance System</p>

                {/* Form details */}
                    <form onSubmit={onSubmitHandler} className='space-y-4'>
                        <div>
                            <label className={`block text-[16px] font-medium transition-colors duration-300 mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                            <div className='relative'>

                                <input value={email} onChange={(e) => setemail(e.target.value)} className={`w-full pl-10 px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-300 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`} type="email" placeholder='Enter your email' />
                                {/* Email-icon  */}
                                <Mail size={19} className={`absolute left-3 bottom-0 -translate-y-1/2 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-700'}`} />
                            </div>
                            {errors.email && (
                                <p className='text-sm mt-1 text-red-500'>{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className={`block text-[16px] relative bottom-2 font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                            <div className='relative'>
                                <input value={password} onChange={(e) => setpassword(e.target.value)} className={`w-full pl-10 px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-300 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`} type={showPassword ? 'text' : 'password'} name="" placeholder='Enter your password' />
                                <LockKeyhole size={19} className={`absolute left-3 bottom-0 -translate-y-1/2 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-700'}`} />
                                <button type='button' onClick={() => setshowPassword(!showPassword)} className='absolute right-3 top-3'>
                                    {showPassword ? (
                                        <EyeOff
                                        size={20}
                                        className={`cursor-pointer ${errors?.password ? "text-red-500" : ""}`}
                                        />
                                    ) : (
                                        <Eye
                                        size={20}
                                        className={`cursor-pointer ${errors?.password ? "text-red-500" : ""}`}
                                        />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className='text-sm mt-1 text-red-500'>{errors.password}</p>
                            )}
                        </div>

                        <button type='submit' disabled={isLoading} className={`w-full mt-1 cursor-pointer py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-600 text-white'}`}>
                            {isLoading ? (<span className='flex items-center justify-center gap-2'>
                                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>1
                                Verifying...
                            </span>
                            ) : (
                                'Login'
                            )}
                        </button>
                        <hr className={`transition-colors duration-300 ${isDark ? 'border-gray-600' : 'text-gray-300'}`} />
                        <div className='flex items-center justify-center gap-1'>
                            <ShieldCheck size={14} className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-700'}`} />
                            <p className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Authorized access only</p>
                        </div>
                        <p className={`text-center relative bottom-2 text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Contact system administrator for credentials if you require access.</p>
                    </form>
                </div>
                </div>

            </div>
        </>
    )
}

export default Login_2