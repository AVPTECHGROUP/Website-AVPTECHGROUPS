import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getTeachers, createTeachers } from '../../Api/TeachersAPI';

function AddNewTeacher() {
  const navigate = useNavigate();

  const [enabled, setEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    email: "",
    loginEmail: "",
    mobile: "",
    address: "",
    dob: "",
    employeeCode: "",
    highestQualification: "",
    experience: 0,
    joiningDate: "",
    payrollStatus: "ACTIVE" 
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.gender || !formData.mobile) {
      toast.error("Please fill all required fields!");
      return;
    }

    // Check if account status is disabled
    if (!enabled) {
      toast.error("Please enable account status to add teacher!", {
        duration: 3000,
        icon: "⚠️"
      });
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Adding teacher...");

    try {
      const generateEmployeeCode = () => {
  return "EMP" + Math.floor(100 + Math.random() * 900); // EMP123
};

      const apiPayload = {
        personalDetails: {
          fullName: formData.name,
          mobile: formData.mobile,
          email: formData.email || "test.teacher@school.com",
          gender: formData.gender.toUpperCase(),
          dateOfBirth: formData.dob,
          address: formData.address || "NA",
          emergencyContact: "9999999999",
          emergencyContactName: "NA",
          emergencyContactRelation: "NA"
        },
        professionalDetails: {
          employeeCode: formData.employeeCode || generateEmployeeCode(),
          qualification: formData.highestQualification || "NA",
          experienceYears: Number(formData.experience || 1),
          joiningDate: formData.joiningDate,
          department: "GENERAL",
          designation: "TEACHER"
        },
        bankDetails: {
          accountHolderName: "NA",
          accountNumber: "000000000000",
          bankName: "NA",
          ifscCode: "HDFC0123456",
          branchName: "NA"
        },
        accountStatus: "ACTIVE",
        payrollStatus: "INCLUDED",
        remarks: "Created from UI"
      };

      const response = await createTeachers(apiPayload);
      
      toast.dismiss(loadingToast);
      toast.success("Teacher added successfully!", {
        duration: 3000,
        icon: "✅"
      });
      
      // Navigate after a short delay to show the toast
      setTimeout(() => {
        navigate('/teachers');
      }, 500);
      
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to add teacher. Please try again.", {
        duration: 4000,
        icon: "❌"
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='outer flex flex-col bg-gray-100 h-full p-11 lg:p-6'>
      <form onSubmit={handleSubmit}>
        <div className="one flex flex-col gap-3">
          <div className="one_one flex justify-between text-black">
            <h1 className='lg:text-3xl sm:text-2xl font-bold'>Add New Teacher</h1>
            <button 
              type="button"
              onClick={()=>navigate(-1)}
              className='bg-white lg:text-xs text-xs text-gray-600 shadow border border-gray-200 rounded-lg lg:px-2 px-2 py-0 my-0 hover:bg-gray-50 font-medium cursor-pointer'>
              Cancel
            </button>
          </div>
          <p className='text-blue-500 lg:text-xl font-medium sm:text-sm'>Enter the details below to onboard a new teacher into the payroll system.</p>
        </div>
        
        <div className="two">
          <div className="divheading flex justify-start align-end mt-8 bg-white border-2 border-gray-200 rounded-t-xl md:p-2 md:pt-3">
            <i className="fa-solid fa-user text-xl lg:text-2xl p-2 text-blue-500"></i>
            <h2 className='pl-3 lg:text-xl md:text-base font-medium text-gray-700 pt-1'>Personal Details</h2>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 sm:grid-cols-1 border-b-2 border-l-2 border-r-2 border-gray-200 bg-white rounded-b-xl">
          <div className="input1 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="name" className='font-semibold text-gray-600 text-sm'>Full Name<span className="text-red-600 ml-1">*</span></label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder='Enter full name' 
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
              required
            />
          </div>

          <div className="input2 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="gender" className='font-semibold text-gray-600 text-sm'>Gender<span className="text-red-600 ml-1">*</span></label>
            <select 
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none'
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="mobile" className='font-semibold text-gray-600 text-sm'>Mobile Number<span className="text-red-600 ml-1">*</span></label>
            <input 
              type="tel" 
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder='Mobile number' 
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
              required
            />
          </div>

          <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="email" className='font-semibold text-gray-600 text-sm'>Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder='Enter email address' 
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
            />
          </div>

          <div className="input5 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="dob" className='font-semibold text-gray-600 text-sm'>Date of Birth<span className="text-red-600 ml-1">*</span></label>
            <input 
              type="date" 
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
              required
            />
          </div>
          <br />

          <div className="input6 p-3 px-4 sm:text-sm md:text-base lg-text-xl align-text-top md:col-span-2">
            <label htmlFor="address" className='font-semibold text-gray-600 text-sm'>Current Address</label>
            <textarea 
              rows={5} 
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder='Enter residential address' 
              className='bg-gray-100 align-text-top font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
            />
          </div>
        </div>
        
        <div className="Professinal_Details">
          <div className="divheading flex justify-start align-end mt-8 bg-white border-2 border-gray-200 rounded-t-xl md:p-2 md:pt-3">
            <i className="fa-solid fa-briefcase text-xl lg:text-2xl text-blue-500 p-2"></i>
            <h2 className='pl-3 lg:text-xl md:text-base font-medium text-gray-700 pt-1'>Professional Details</h2>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 border-b-2 border-l-2 border-r-2 border-gray-200 bg-white rounded-b-xl">
          <div className="input1 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="employeeCode" className='font-semibold text-gray-600 text-sm'>Employee Code</label>
            <input 
              type="text" 
              name="employeeCode"
              value={formData.employeeCode}
              onChange={handleInputChange}
              placeholder='Auto-generated if empty' 
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
            />
          </div>

          <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl col-span-2">
            <label htmlFor="highestQualification" className='font-semibold text-gray-600 text-sm'>Highest Qualification</label>
            <input 
              type="text" 
              name="highestQualification"
              value={formData.highestQualification}
              onChange={handleInputChange}
              placeholder='Highest Qualification' 
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
            />
          </div>

          <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="experience" className='font-semibold text-gray-600 text-sm'>Experience{`(Years)`}</label>
            <input 
              type="number" 
              name="experience"
              value={formData.experience}
              onChange={(e) => {
                const value = Math.max(0, parseInt(e.target.value) || 0);
                setFormData(prev => ({ ...prev, experience: value }));
              }}
              placeholder='0' 
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
            />
          </div>

          <div className="input5 p-3 px-4 sm:text-sm md:text-base lg-text-xl col-span-2">
            <label htmlFor="joiningDate" className='font-semibold text-gray-600 text-sm'>Date of Joining<span className="text-red-600 ml-1">*</span></label>
            <input 
              type="date" 
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleInputChange}
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
              required
            />
          </div>
        </div>
        
        <div className="System_Access">
          <div className="divheading flex justify-start align-end mt-8 bg-white border-2 border-gray-200 rounded-t-xl md:p-2 md:pt-3">
            <i className="fa-solid fa-gear text-xl lg:text-2xl text-blue-500 p-2"></i>
            <h2 className='pl-3 lg:text-xl md:text-base font-medium text-gray-700 pt-1'>System Access</h2>
          </div>
        </div>
        
        <div className="grid lg-grid-col-4 md:grid-cols-3 sm:grid-cols-2 border-b-2 border-l-2 border-r-2 border-gray-200 bg-white rounded-b-xl">
          <div className="input1 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="loginEmail" className='font-semibold text-gray-600 text-sm'>Login Email/Username</label>
            <input 
              type="email" 
              name="loginEmail"
              value={formData.loginEmail}
              onChange={handleInputChange}
              placeholder='Email/username' 
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
            />
          </div>

          <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="role" className='font-semibold text-gray-600 text-sm'>Role</label>
            <input 
              readOnly 
              type="text" 
              name="role"
              placeholder='Teacher' 
              value='Teacher' 
              className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
            />
          </div>

          <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
            <label htmlFor="accountStatus" className='font-semibold text-gray-600 text-sm'>Account Status</label>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? "bg-blue-500" : "bg-gray-300"}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        <div className="buttons flex gap-2 justify-between lg:justify-end align-middle text-xs lg:text-base">
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 my-2 ml-4 rounded-xl font-medium border-blue-500 border-2 cursor-pointer`}>
            {isSubmitting ? 'Adding...' : 'Save Details'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddNewTeacher;