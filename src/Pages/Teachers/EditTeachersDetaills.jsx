import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeacherById, updateTeacher } from '../../utils/allTeachers';
import { ChevronLeft } from 'lucide-react';

function EditTeachersDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [enabled, setEnabled] = useState(false);
    
   const [teacher, setTeacher] = useState(null)

    useEffect(()=>{
    const data = getTeacherById(id)
    setTeacher(data)
    },[id])


    function formatToInputDate(dateStr) {
    if (!dateStr) return '';
     const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        mobile: '',
        email: '',
        dob: '',
        address: '',
        id: '',
        highestQualification: '',
        experience: 0,
        joiningDate: '',
        loginEmail: '',
        role: 'Teacher',
        accountStatus: false
    });

    // Populate form with existing data when component mounts
    useEffect(() => {
        if (teacher) {
            setFormData({
                name: teacher.name || '',
                gender: teacher.gender,
                mobile: teacher.mobile || '',
                email: teacher.email || '',
                dob: teacher.dob || '',
                address: teacher.address || '',
                id: teacher.id || '',
                highestQualification: teacher.highestQualification || '',
                experience: teacher.experience || 0,
                joiningDate: formatToInputDate(teacher.joiningDate),
                loginEmail: teacher.email || '',
                role: teacher.role || 'Teacher',
                accountStatus: teacher.status === 'Active'
            });
            setEnabled(teacher.status === 'Active');
        }
    }, [teacher]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    function handle_updateDetails(e) {
  e.preventDefault();

  const updatedTeacher = {
    ...formData,
    status: enabled ? 'Active' : 'Inactive'
  };

  updateTeacher(updatedTeacher);
  navigate('/teachers');
}


    // If teacher not found, redirect
    if (!teacher) {
        return (
            <div className='outer flex flex-col bg-gray-100 h-full p-11 lg:p-16'>
                <p>Teacher not found</p>
                <button onClick={()=>navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to List</span>
          </button>
            </div>
        );
    }

    return (
        <div className='outer flex flex-col bg-gray-100 h-full p-11 lg:p-16'>
            <form onSubmit={handle_updateDetails}>
                <button onClick={()=>navigate(-1)} className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to List</span>
          </button>
                <div className="one flex flex-col">
                    <div className="one_one flex justify-between text-black">
                        <h1 className='lg:text-3xl sm:text-2xl font-bold'>Edit Teacher Details</h1>
                    </div>
                    <p className='text-blue-500 lg:text-xl sm:text-sm'>Update the teacher's existing information in the payroll system.</p>
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
                        />
                    </div>

                    <div className="input2 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                        <label htmlFor="gender" className='font-semibold text-gray-600 text-sm'>Gender<span className="text-red-600 ml-1">*</span></label>
                        <select 
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none'>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                        <label htmlFor="mobile" className='font-semibold text-gray-600 text-sm'>Mobile Number {`(unique)`}<span className="text-red-600 ml-1">*</span></label>
                        <input 
                            type="tel" 
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            placeholder='Mobile number' 
                            className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
                        />
                    </div>

                    <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                        <label htmlFor="email" className='font-semibold text-gray-600 text-sm'>Email Address {`(optional)`}</label>
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
                            readOnly
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
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
                        <label htmlFor="empCode" className='font-semibold text-gray-600 text-sm'>Employee Code</label>
                        <input 
                            type="text" 
                            name="id"
                            value={formData.id}
                            readOnly 
                            placeholder='Employee Code' 
                            className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
                        />
                    </div>

                    <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl col-span-2">
                        <label htmlFor="qualification" className='font-semibold text-gray-600 text-sm'>Highest Qualification</label>
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
                            readOnly
                            value={formData.joiningDate}
                            onChange={handleInputChange}
                            className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
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
                            placeholder='Email / username' 
                            className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' 
                        />
                    </div>

                    <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                        <label htmlFor="role" className='font-semibold text-gray-600 text-sm'>Role</label>
                        <input 
                            type="text" 
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            placeholder='Teacher' 
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
                    <button type="submit" className='text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 my-2 mr-4 rounded-sm font-medium border-blue-500 border-2 cursor-pointer'>
                        Update Details
                    </button>
                    <button type="button" onClick={()=>navigate(-1)} className='hover:bg-gray-50 bg-white text-gray-600 px-3 py-1 my-2 ml-4 rounded-sm font-medium border-gray-200 border-2 cursor-pointer'>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditTeachersDetails;