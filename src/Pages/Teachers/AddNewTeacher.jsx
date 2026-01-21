import React from 'react'
import { useState } from 'react';

function AddNewTeacher() {

  const [enabled, setEnabled] = useState(false);

  function handle_Submit(e){
      e.preventDefault();

  }

  return (
    <div className='outer flex flex-col bg-gray-100 h-full p-11 lg:p-6'>

      <form action={handle_Submit}>
      <div className="one flex flex-col gap-3">
        <div className="one_one flex justify-between text-black">
          <h1 className='lg:text-3xl sm:text-2xl  font-bold'>Add New Teacher</h1>
          <button className='bg-white lg:text-xs text-xs text-gray-600 shadow border border-gray-200 rounded-lg lg:px-2 px-2 py-0 my-0 hover:bg-gray-50 font-medium cursor-pointer '>Cancel</button>
        </div>
        <p className='text-blue-500 lg:text-xl font-medium sm:text-sm'>Enter the details below to onboard a new teacher into the payroll system.</p>
      </div>
      <div className="two">
        <div className="divheading flex justify-start align-end mt-8 bg-white border-2 border-gray-200 rounded-t-xl  md:p-2 md:pt-3">
           <i className="fa-solid fa-user text-xl lg:text-2xl p-2 text-blue-500"></i>
          <h2 className='pl-3 lg:text-xl md:text-base font-medium text-gray-700 pt-1'>Personal Details</h2>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 sm:grid-cols-1 border-b-2 border-l-2 border-r-2 border-gray-200 bg-white rounded-b-xl">
        <div className="input1 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
          <label htmlFor="name" className='font-semibold text-gray-600 text-sm'>Full Name<span className="text-red-600 ml-1">*</span> </label>
          <input required name='fullname' type="text" placeholder='Enter full name' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>

        <div className="input2 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
          <label htmlFor="Gender" className='font-semibold text-gray-600 text-sm'>Gender<span className="text-red-600 ml-1">*</span> </label>
          <select name="selectGender" className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md  focus:outline-none appearance-none '>
            <option value="admin">Select Gender</option>
            <option value="admin">Male</option>
            <option value="teacher">Female</option>
          </select>
        </div>

        <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
          <label htmlFor="mobile" className='font-semibold text-gray-600 text-sm'>Mobile Number {`(unique)`}<span className="text-red-600 ml-1">*</span> </label>
          <input type="phone" name='phone_number' placeholder='Mobile number' className='bg-gray-100 font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>

        <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
          <label htmlFor="email" className='font-semibold text-gray-600 text-sm'>Email Address {`(optional)`}</label>
          <input type="email" name='email_id' placeholder='Enter email address' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>

        <div className="input5 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
          <label htmlFor="dob" className='font-semibold text-gray-600 text-sm'>Date of Birth<span className="text-red-600 ml-1">*</span> </label>
          <input type="date" name='_dob' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>
        <br />

        <div className="input6 p-3 px-4 sm:text-sm md:text-base lg-text-xl align-text-top md:col-span-2">
          <label htmlFor="address" className='font-semibold text-gray-600 text-sm'>Current Address </label>
          <textarea rows={5}  name='_address' type="text" placeholder='Enter residential address' className='bg-gray-100 align-text-top  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>


      </div>
      <div className="Professinal_Details">
        <div className="divheading flex justify-start align-end mt-8 bg-white border-2 border-gray-200 rounded-t-xl  md:p-2 md:pt-3">
          <i className="fa-solid fa-briefcase text-xl lg:text-2xl text-blue-500 p-2"></i>
          <h2 className='pl-3 lg:text-xl md:text-base font-medium text-gray-700 pt-1'>Professional Details</h2>
        </div>
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 border-b-2 border-l-2 border-r-2 border-gray-200 bg-white rounded-b-xl">
        <div className="input1 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
          <label htmlFor="empCode" className='font-semibold text-gray-600 text-sm'>Employee Code  </label>
          <input type="text" name='employeeCode' placeholder='Employee Code' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>


        <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl col-span-2">
          <label htmlFor="qualification" className='font-semibold text-gray-600 text-sm'>Hightest Qualification </label>
          <input type="text" name='hightestQualification' placeholder='Highest Qualification' className='bg-gray-100 font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>

        <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
          <label htmlFor="experience"  className='font-semibold text-gray-600 text-sm'>Experience{`(Years)`} </label>
          <input type="number" onChange={(e)=>e.target.value<0 ? e.target.value = 0 : e.target.value = e.target.value} placeholder='0' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>

        <div className="input5 p-3 px-4 sm:text-sm md:text-base lg-text-xl col-span-2">
          <label htmlFor="dob" className='font-semibold text-gray-600 text-sm'>Date of Joining<span className="text-red-600 ml-1">*</span> </label>
          <input type="date" className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>
      </div>
      <div className="System_Access">
        <div className="divheading flex justify-start align-end mt-8 bg-white border-2 border-gray-200 rounded-t-xl  md:p-2 md:pt-3">
         <i className="fa-solid fa-gear text-xl lg:text-2xl text-blue-500 p-2"></i>
          <h2 className='pl-3 lg:text-xl md:text-base font-medium text-gray-700 pt-1'>SystemAccess</h2>
        </div>
      </div>
      <div className="grid lg-grid-col-4 md:grid-cols-3 sm:grid-cols-2 border-b-2 border-l-2 border-r-2 border-gray-200 bg-white rounded-b-xl">
        <div className="input1 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
          <label htmlFor="userName" className='font-semibold text-gray-600 text-sm'>Login Email/Username</label>
          <input type="email" placeholder='Email/username' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>

        <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl ">
          <label htmlFor="qualification" className='font-semibold text-gray-600 text-sm'>Role </label>
          <input readOnly type="text" placeholder='Teacher' value={'Teacher'} className='bg-gray-100 font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
        </div>

        <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
          <label htmlFor="experience" className='font-semibold text-gray-600 text-sm'>Account Status </label>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300
             ${enabled ? "bg-blue-500" : "bg-gray-300"}`}>
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300
              ${enabled ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>
      </div>

      <div className="buttons flex gap-2 justify-between lg:justify-end align-middle text-xs lg:text-base">
        <button className='text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 my-2 mr-4 rounded-sm font-medium border-blue-500 border-2 cursor-pointer'>Save & Assign Details </button>
        <button type='submit' className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 my-2 ml-4 rounded-sm font-medium border-blue-500 border-2 cursor-pointer '>Save Teacher</button>
      </div>
    </form>
      </div>
  )
}

export default AddNewTeacher
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeachers, addTeacher } from "../../utils/allTeachers";

function AddNewTeacher() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
  id: "",
  name: "",
  role: "",
  image: "", // image URL
  email: "",
  mobile: "",
  address: "",
  dob: "",
  highestQualification: "",
  experience: "",
  status: "Active",
  attendance: "Allowed",
  joiningDate: ""
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate unique teacher ID
   const generateTeacherId = () => {
    const teachers = getTeachers();
    if (teachers.length === 0) return "TCH001";

    const ids = teachers.map(t =>
      parseInt(t.id.replace("TCH", ""))
    );
    const maxId = Math.max(...ids);
    return `TCH${String(maxId + 1).padStart(3, "0")}`;
  };

  // Get initials from name
  const getInitials = (name) => {
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

   const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.gender || !formData.mobile) {
      alert("Please fill required fields");
      return;
    }

    const newTeacher = {
      id: formData.employeeCode || generateTeacherId(),
      name: formData.name,
      role: "Teacher",
      avatar: getInitials(formData.name),
      image: `https://randomuser.me/api/portraits/${formData.gender === "Male" ? "men" : "women"}/${Math.floor(Math.random() * 50)}.jpg`,
      email: formData.email || formData.loginEmail,
      mobile: formData.mobile,
      address: formData.address,
      dob: formData.dob,
      highestQualification: formData.highestQualification,
      experience: formData.experience,
      status: enabled ? "Active" : "Inactive",
      attendance: enabled ? "Allowed" : "Blocked",
      joiningDate: formData.joiningDate
    };

    addTeacher(newTeacher);

    navigate(`/teachers/assign/${newTeacher.id}`);
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
            <label htmlFor="mobile" className='font-semibold text-gray-600 text-sm'>Mobile Number {`(unique)`}<span className="text-red-600 ml-1">*</span></label>
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
            className='text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 my-2 mr-4 rounded-sm font-medium border-blue-500 border-2 cursor-pointer'>
            Save & Assign Details
          </button>
          <button 
            type="submit"
            className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 my-2 ml-4 rounded-sm font-medium border-blue-500 border-2 cursor-pointer'>
            Save Teacher
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddNewTeacher;
