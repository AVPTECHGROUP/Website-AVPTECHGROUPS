import { Mail, Copy, Check } from 'lucide-react'
import React, { useState } from 'react'
import reset from '../assets/reset.jpeg'
import key from '../assets/key.png'

const Reset = () => {

  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)

  // Strong password generator
  const generateStrongPassword = (length = 8) => {
    
    const chars ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@";
    
    let password = "";

    for (let i = 0; i < length; i++) {
        password = password + chars.charAt(Math.floor(Math.random()*chars.length))
    }

    return password;
  };

  // Form validation
  const validateForm = () => {
    let allErrors = {}

    if (!email) {
      allErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      allErrors.email = "Please enter a valid email address"
    }

    setErrors(allErrors)
    return Object.keys(allErrors).length === 0
  }

  // Submit handler
  const onSubmitHandler = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setGeneratedPassword('')
    setCopied(false)

    setTimeout(() => {
      const newPassword = generateStrongPassword()
      setGeneratedPassword(newPassword)
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div 
      className="min-h-screen bg-blue-100 flex items-center justify-center px-4 py-8" 
      style={{
        backgroundImage: `url(${reset})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >

      {/* Background Card */}
      <div className="w-full max-w-2xl rounded-3xl p-4 sm:p-6 md:p-10 lg:p-4 flex justify-center">

        {/* Form Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-8">

          {/* Key Icon */}
          <div className="flex justify-center mb-4">
            <img 
              src={key} 
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain relative bottom-3" 
              alt="Key icon" 
            />
          </div>
        
          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-4 text-gray-800">
            Reset User Password
          </h1>

          <form onSubmit={onSubmitHandler} className="space-y-5">

            {/* Email Field */}
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                Email
              </label>

              <div className="relative">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter email"
                  className="w-full px-4 pl-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm sm:text-base"
                />
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>

              {errors.email && (
                <p className="text-xs sm:text-sm text-red-500 mt-1.5">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base cursor-pointer
                ${isLoading
                  ? 'bg-blue-300 cursor-not-allowed text-white'
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Generating...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>

            {/* Generated Password Display */}
            {generatedPassword && (
              <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3">

                <span className="text-yellow-800 font-mono text-xs sm:text-sm break-all flex-1">
                  {generatedPassword}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                  className="text-yellow-700 hover:text-yellow-900 transition-colors shrink-0 p-1"
                  aria-label={copied ? "Copied" : "Copy password"}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  )
}

export default Reset