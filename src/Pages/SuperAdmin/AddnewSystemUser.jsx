import { BriefcaseBusiness, User2 } from "lucide-react";
import { useState } from "react";


function AddnewSystemUser() {

    const [selectedRole, setSelectedRole] = useState('');

    const inputStyle = "bg-gray-100 mt-1 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none";
    const impMark = <span className="text-red-600 ml-1">*</span>;

    let roleSelection = [
        { key: 'Principal', value: 'principal' },
        { key: 'Accountant', value: 'accountant' },
        { key: 'Teacher', value: 'teacher' },
        { key: 'Registrar', value: 'registrar' },
        { key: 'Parent', value: 'parent' }
    ];

    function dynamicInputFields(inp) {
        if (inp === 'parent') {
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
        <>
            <div className="outer p-6">
                <div className="one flex flex-col">
                    <div className="flex justify-between text-black items-center">
                        <div className="div">
                            <h1 className='lg:text-3xl sm:text-2xl font-bold'>Add New System User</h1>
                            <p className='text-blue-500 lg:text-xl font-medium sm:text-sm'>Enter the details below to onboard a new user into the system.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className='bg-white lg:text-xs text-xs text-gray-600 shadow border border-gray-200 rounded-lg lg:px-2 px-2 py-2 my-0 hover:bg-gray-50 font-medium cursor-pointer'>
                            Cancel
                        </button>
                    </div>
                    <div className="two mb-0">
                        <div className="divheading flex justify-start align-end mt-8 bg-white border-2 border-gray-200 rounded-t-xl md:p-2 md:pt-3">
                           <User2 size={32} className=" text-blue-500" />
                            <h2 className='pl-3 lg:text-xl md:text-base font-medium text-gray-700 pt-1'>Personal Details</h2>
                        </div>
                    </div>
                    <div className=" grid lg:grid-cols-2 sm:grid-cols-1 border-b-2 border-l-2 border-r-2 border-gray-200 bg-white rounded-b-xl">
                        <div className="input1 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                            <label htmlFor="name" className='font-semibold text-gray-600 text-sm'>Full Name{impMark}</label>
                            <input
                                type="text"
                                name="name"
                                placeholder='Enter full name'
                                className={inputStyle}
                                required
                            />
                        </div>
                        <div className="input2 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                            <label htmlFor="gender" className='font-semibold text-gray-600 text-sm'>Gender{impMark}</label>
                            <select
                                name="gender" className={inputStyle} required>
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div className="input3 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                            <label htmlFor="mobile" className='font-semibold text-gray-600 text-sm'>Mobile Number {impMark}</label>
                            <input
                                type="tel"
                                name="mobile"
                                placeholder='Mobile number'
                                className='bg-gray-100 font-normal text-gray-800 border-gray-400 p-1 px-4 w-full rounded-md focus:outline-none appearance-none'
                                required
                            />
                        </div>

                        <div className="input4 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                            <label htmlFor="email" className='font-semibold text-gray-600 text-sm'>Email Address {impMark}</label>
                            <input
                                type="email"
                                name="email"
                                placeholder='Enter email address'
                                className={inputStyle}
                            />
                        </div>

                        <div className="input5 p-3 px-4 sm:text-sm md:text-base lg-text-xl">
                            <label htmlFor="dob" className='font-semibold text-gray-600 text-sm'>Date of Birth{impMark}</label>
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
                            <label htmlFor="Systemrole" className='font-semibold text-gray-600 text-sm'>Select Role{impMark}</label>
                            <select
                                name="role"
                                className={inputStyle}
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                required>
                                <option value="" disabled>Select System Role</option>
                                {
                                    roleSelection.map((ele) => (
                                        <option value={ele.value} key={ele.key}> {ele.value.toUpperCase()} </option>
                                    ))}
                            </select>
                        </div>
                        {dynamicInputFields(selectedRole)}
                    </div>

                    <div className="btnClass flex justify-end">
                        <button
                            type="submit"
                            className='text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 my-2 mr-4 rounded-sm font-medium border-blue-500 border-2 cursor-pointer'>
                            Save & Assign Details
                        </button>
                        <button
                            type="submit"
                            className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 my-2 ml-4 rounded-sm font-medium border-blue-500 border-2 cursor-pointer'>
                            Save User
                        </button>  </div>
                </div>
            </div>
        </>
    )
}

export default AddnewSystemUser