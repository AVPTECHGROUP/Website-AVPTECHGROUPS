import React, { useState } from 'react'

function EditTeachersDetaills() {
    const [enabled, setEnabled] = useState(false);
    
   function handle_updateDetails(){

    }
    return (
        <div className='outer flex flex-col  bg-gray-100 h-full p-11 lg:p-16'>
            <form action={handle_updateDetails}>
        <button className='bg-white lg:text-xs text-xs text-gray-600 shadow-xs border border-gray-200 rounded-lg lg:px-2 px-2 py-1 mb-1 hover:bg-gray-50 font-medium cursor-pointer '><i className="fa-solid fa-circle-chevron-left"></i> Back</button>
                <div className="one flex flex-col">
                    
                    <div className="one_one flex justify-between text-black">
                        <h1 className='lg:text-3xl sm:text-2xl  font-bold'>Edit Teacher Details </h1>
                       
                    </div>
                    <p className='text-blue-500 lg:text-xl sm:text-sm'>Update the teacher's existing information in the payroll system.</p>
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
                        <input type="text" placeholder='Enter full name' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
                    </div>

                    <div className="input2 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                        <label htmlFor="Gender" className='font-semibold text-gray-600 text-sm'>Gender<span className="text-red-600 ml-1">*</span> </label>
                        <select name="select" className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md  focus:outline-none appearance-none '>
                            <option value="admin">Select Gender</option>
                            <option value="admin">Male</option>
                            <option value="teacher">Female</option>
                        </select>
                    </div>

                    <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                        <label htmlFor="mobile" className='font-semibold text-gray-600 text-sm'>Mobile Number {`(unique)`}<span className="text-red-600 ml-1">*</span> </label>
                        <input type="phone" placeholder='Mobile number' className='bg-gray-100 font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
                    </div>

                    <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                        <label htmlFor="email" className='font-semibold text-gray-600 text-sm'>Email Address {`(optional)`}</label>
                        <input type="email" placeholder='Enter email address' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
                    </div>

                    <div className="input5 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                        <label htmlFor="dob" className='font-semibold text-gray-600 text-sm'>Date of Birth<span className="text-red-600 ml-1">*</span> </label>
                        <input type="date" className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
                    </div>
                    <br />

                    <div className="input6 p-3 px-4 sm:text-sm md:text-base lg-text-xl align-text-top md:col-span-2">
                        <label htmlFor="address" className='font-semibold text-gray-600 text-sm'>Current Address </label>
                        <textarea rows={5} type="text" placeholder='Enter residential address' className='bg-gray-100 align-text-top  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
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
                        <input type="text" readOnly placeholder='Employee Code' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
                    </div>


                    <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl col-span-2">
                        <label htmlFor="qualification" className='font-semibold text-gray-600 text-sm'>Hightest Qualification </label>
                        <input type="text" placeholder='Highest Qualification' className='bg-gray-100 font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
                    </div>

                    <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                        <label htmlFor="experience" className='font-semibold text-gray-600 text-sm'>Experience{`(Years)`} </label>
                        <input type="number" onChange={(e) => e.target.value < 0 ? e.target.value = 0 : e.target.value = e.target.value} placeholder='0' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
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
                        <input type="email" placeholder='Email / username' className='bg-gray-100  font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
                    </div>

                    <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl ">
                        <label htmlFor="qualification" className='font-semibold text-gray-600 text-sm'>Role </label>
                        <input  type="text" placeholder='Teacher' className='bg-gray-100 font-normal  text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none' />
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
                    <button className='text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 my-2 mr-4 rounded-sm font-medium border-blue-500 border-2 cursor-pointer'>Update Details </button>
                    <button className=' hover:bg-gray-50 bg-white text-gray-600 px-3 py-1 my-2 ml-4 rounded-sm font-medium border-gray-200 border-2 cursor-pointer '>Cancel</button>
                </div>

            </form>
        </div>

    )
}

export default EditTeachersDetaills