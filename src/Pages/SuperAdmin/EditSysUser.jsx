import { BriefcaseBusiness, User2, UserRoundPen, UserRoundPenIcon } from 'lucide-react'
import React, { useState } from 'react'

function EditSysUser() {
    const inputStyle = "bg-gray-100 mt-1 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none";
    const impMark = <span className="text-red-600 ml-1">*</span>;

    const [selectedRole, setSelectedRole] = useState(""); //used when api calling

    function SelectedInputField() {
        if (selectedRole === 'parent') {
            return <>
                <div className=" p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                    <label htmlFor="highestQualification" className='font-semibold text-gray-600 text-sm'>Highest Qualification</label>
                    <input
                        type="text"
                        name="highestQualification"
                        placeholder='Highest Qualification'
                        className={inputStyle}
                    />
                </div>

                <div className=" p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                    <label htmlFor="profession" className='font-semibold text-gray-600 text-sm'>Profession</label>
                    <input
                        type="text"
                        name="Profession"
                        placeholder='Profession'
                        className={inputStyle}
                    />
                </div>
            </>
        }
        else {
            return <> <div className="p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                <label htmlFor="employeeCode" className='font-semibold text-gray-600 text-sm'>Employee Code</label>
                <input
                    type="text"
                    name="employeeCode"
                    placeholder='Auto-generated if empty'
                    className={inputStyle}
                />
            </div>
                <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl ">
                    <label htmlFor="highestQualification" className='font-semibold text-gray-600 text-sm'>Highest Qualification</label>
                    <input
                        type="text"
                        name="highestQualification"
                        placeholder='Highest Qualification'
                        className={inputStyle}
                    />
                </div>

                <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                    <label htmlFor="experience" className='font-semibold text-gray-600 text-sm'>Experience{`(Years)`}</label>
                    <input
                        type="number"
                        name="experience"
                        placeholder='0'
                        className={inputStyle}
                    />
                </div>

                <div className="input5 p-3 px-4 sm:text-sm md:text-base lg-text-xl ">
                    <label htmlFor="joiningDate" className='font-semibold text-gray-600 text-sm'>Date of Joining{impMark} </label>
                    <input
                        type="date"
                        name="joiningDate"
                        className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none'
                        required
                    />
                </div>
            </>
        }
    }

    return (
        <div className='m-6'>
            {/* <button
                type="button"
                className='bg-white hover:bg-gray-100 text-sm lg:text-lg text-black shadow border border-gray-200 rounded-lg  px-2 my-4 py-1  font-medium cursor-pointer flex items-end'>
                <ChevronLeft size={25} />  Back
            </button> */}

            {/* Header */}
            <div className="mb-6 flex">
                <UserRoundPen size={45} className='text-blue-600 m-1 mr-4' />
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-end">
                        Edit User: UserName
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        Update account details for this user.
                    </p>
                </div>
            </div>

            <div className="two mb-0">
                <div className="divheading flex justify-start align-end mt-8 bg-white border-2 border-gray-200 rounded-t-xl md:p-2 md:pt-3">
                    <User2 size={32} className=" text-blue-500" />
                    <h2 className='pl-3 lg:text-xl md:text-base font-medium text-gray-700 pt-1'>Personal Details</h2>
                </div>
            </div>
            <div className=" grid lg:grid-cols-2 sm:grid-cols-1 border-b-2 border-l-2 border-r-2 border-gray-200 bg-white rounded-b-xl">
                <div className="input1 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                    <label htmlFor="name" className='font-semibold text-gray-600 text-sm'>Full Name</label>{impMark}
                    <input
                        type="text"
                        name="name"
                        placeholder='Enter full name'
                        className={inputStyle}
                        required
                    />
                </div>
                <div className="input2 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                    <label htmlFor="gender" className='font-semibold text-gray-600 text-sm'>Gender</label>{impMark}
                    <select
                        name="gender" className={inputStyle} required>
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                    <label htmlFor="mobile" className='font-semibold text-gray-600 text-sm'>Mobile Number </label>{impMark}
                    <input
                        type="tel"
                        name="mobile"
                        placeholder='Mobile number'
                        className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none'
                        required
                    />
                </div>

                <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                    <label htmlFor="email" className='font-semibold text-gray-600 text-sm'>Email Address </label>{impMark}
                    <input
                        type="email"
                        name="email"
                        placeholder='Enter email address'
                        className={inputStyle}
                    />
                </div>

                <div className="input5 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                    <label htmlFor="dob" className='font-semibold text-gray-600 text-sm'>Date of Birth</label>{impMark}
                    <input
                        type="date"
                        name="dob"
                        className={inputStyle}
                        required
                    />
                </div>
                <br />
                <div className="input6 p-3 px-4 sm:text-sm md:text-base lg-text-xl align-text-top md:col-span-2">
                    <label htmlFor="address" className='font-semibold text-gray-600 text-sm'>Current Address</label>
                    <textarea
                        rows={5}
                        name="address"
                        placeholder='Enter residential address'
                        className={inputStyle}
                    />
                </div>
            </div>

            <div className="two mb-0">
                <div className="divheading flex justify-start align-end mt-8 bg-white border-2 border-gray-200 rounded-t-xl md:p-2 md:pt-3">
                    <BriefcaseBusiness size={32} className=" text-blue-500" />
                    <h2 className='pl-3 lg:text-xl md:text-base font-medium text-gray-700 pt-1'>Professional Details</h2>
                </div>
            </div>
            <div className=" grid lg:grid-cols-2 sm:grid-cols-1 border-b-2 border-x-2 border-x-gray-200 border-b-gray-200 bg-white rounded-b-xl">
                <div className="input2 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                    <label htmlFor="Systemrole" className='font-semibold text-gray-600 text-sm'>Selected Role</label>{impMark}
                    <input type="text" value={'eg. teacher'} className="bg-gray-100 mt-1 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none cursor-not-allowed"  readOnly />
                </div>

                {<SelectedInputField />}
            </div>

            <div className="btnClass flex justify-end">
                <button
                    className='text-gray-500 hover:bg-gray-200 px-3 py-1 my-2 mr-4 rounded-sm font-medium border-gray-500 border-2 cursor-pointer'>
                    Cancel
                </button>
                <button
                    type="submit"
                    className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 my-2 ml-4 rounded-sm font-medium border-blue-500 border-2 cursor-pointer'>
                    Update User
                </button>
            </div>
        </div>


    )
}

export default EditSysUser