import React from 'react'
import {
    Banknote,
    ChevronLeft,
    ChevronRight,
    Edit,
    LogOut,
    RotateCcwKey,
    SearchIcon,
    User,
    UserCheck2,
    UserPenIcon,
    UserRoundPlus,
    UserRoundPlusIcon,
    UserRoundSearchIcon,
    UsersIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
function ManageAllUsers() {
    const navigate = useNavigate(); // for navigation
    let cardsArray = [{ IconName: UsersIcon, keyName: "Total Users", val: "1028" },
    { IconName: UserCheck2, keyName: "Teachers", val: "28" },
    { IconName: Banknote, keyName: "Accountants", val: "18" },
    { IconName: UserRoundSearchIcon, keyName: "Students", val: "2891" },]

    let roleOptions = [{ roleKey: "admin", roleVal: "admin" },
    { roleKey: "teacher", roleVal: "teacher" },
    { roleKey: "accountant", roleVal: "accountant" },
    { roleKey: "students", roleVal: "students" }

    ];

    const tableHeadItems = ['User Name', 'Contact', 'Status', 'Actions'];
    let tableheadItemsStyle = 'px-6 py-3 text-left text-sm font-medium text-gray-900 bg-gray-100 uppercase tracking-wider whitespace-nowrap';
    let tabledataItemsStyle = 'px-6 py-3 text-left whitespace-nowrap font-medium text-gray-700';




    function HeaderCard({ IconName, keyName, val }) {
        return (
            <div className="bg-white shadow-md shadow-gray-300 border h-auto  cursor-pointer rounded-xl px-2 py-4 flex items-center border-blue-50 hover:shadow-md hover:shadow-blue-100 transition-all">
                <div className="flex items-start gap-2 pl-2">
                    <div className=" sm:w-1/5 sm:h-14 flex items-center justify-center">
                        <IconName size={25} className="w-6 h-8 sm:w-10 sm:h-9 text-blue-600" />
                    </div>
                    <div className='font-semibold  text-lg items-center align-middle text-staet  pl-2'>
                        <h1 className='text-gray-400 text-xs lg:text-base' >{keyName} </h1>
                        <p className='font-bold lg:text-2xl text-base '>{val}</p>
                    </div>
                </div>
            </div>
        );
    }

    const users = [
        {
            id: 1,
            userName: "Aarav Sharma",
            contact: "aarav.sharma@gmail.com",
            role: "Teacher",
            status: "Active"
        },
        {
            id: 2,
            userName: "Diya Patel",
            contact: "diya.patel@gmail.com",
            role: "Student",
            status: "Active"
        },
        {
            id: 3,
            userName: "Rohan Verma",
            contact: "+91 98765 43210",
            role: "Teacher",
            status: "Inactive"
        },
        {
            id: 4,
            userName: "Sanya Singh",
            contact: "sanya.singh@gmail.com",
            role: "Accountant",
            status: "Inactive"
        },
        {
            id: 5,
            userName: "Vivaan Kapoor",
            contact: "+91 91234 56789",
            role: "Principal",
            status: "Active"
        },
        {
            id: 6,
            userName: "Ananya Joshi",
            contact: "ananya.joshi@gmail.com",
            role: "Teacher",
            status: "Inactive"
        },
        {
            id: 7,
            userName: "Aditya Mehta",
            contact: "+91 99887 66554",
            role: "Student",
            status: "Active"
        },
        {
            id: 8,
            userName: "Isha Nair",
            contact: "isha.nair@gmail.com",
            role: "Student",
            status: "Inactive"
        },
        {
            id: 9,
            userName: "Kabir Rao",
            contact: "+91 90012 34567",
            role: "Teacher",
            status: "Active"
        },
        {
            id: 10,
            userName: "Mira Desai",
            contact: "mira.desai@gmail.com",
            role: "Student",
            status: "Active"
        }
    ];



    return <div className='p-6 bg-blue-50 h-auto'>
        <div className="flex justify-between text-black items-center">
            <div className="div">
                <h1 className='lg:text-3xl sm:text-2xl font-medium'>Manage All Users</h1>
                <p className='text-gray-400 lg:text-xl font-normal text-xs'>Efficiently manage system roles, permissions and account statuses.</p>
            </div>
            <button
                onClick={() => navigate('/dashboard/addUser')}
                type="button"
                className='bg-blue-600 text-xs lg:text-sm text-white shadow border border-gray-200 rounded-lg lg:px-2 px-2 lg:py-2 py-1 my-0 hover:bg-blue-700 font-medium cursor-pointer flex'>
                <UserRoundPlus size={21} className='mx-1' />  Add New User
            </button>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 mb-8 pt-6">
            {
                cardsArray.map((card) => (
                    <HeaderCard key={card.keyName} IconName={card.IconName} keyName={card.keyName.toUpperCase()} val={card.val} />
                ))
            }
        </div>

        {/* filters */}

        <div className="bg-white flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between px-4 py-2 rounded-xl border border-gray-200 mb-4">
            <div className="flex items-center gap-2 border rounded-lg border-gray-200 px-2 py-1 focus-within:shadow-sm focus-within:shadow-blue-200">
                <SearchIcon className="w-5 h-5 text-gray-500" />
                <input placeholder='Search by name, email or ID..' className="text-base sm:text-sm font-normal focus:outline-none  appearance-none text-gray-600 lg:min-w-62" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
                >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                </select>

                <select
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
                >
                    <option defaultValue={"all_roles"}>All Roles</option>
                    {
                        roleOptions.map((item) => (
                            <option key={item.roleKey} value={item.roleVal}>{item.roleVal.toUpperCase()}</option>
                        ))
                    }

                </select>

            </div>
            {/* <div className="flex items-center gap-2 shrink-0 border border-gray-200 px-2 py-2 rounded-lg bg-gray-100">
                <ListFilter className="w-5 h-5 text-gray-500" />
                <p className="text-base sm:text-sm font-medium">More filters</p>
              </div> */}
        </div>


        {/* for list of users  */}
        {/* MOBILE & TABLET – CARD VIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                    {/* Header */}
                    <div className="outerHeadCard flex justify-between ">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                                <User size={22} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{user.userName}</p>
                                <p className="text-xs text-gray-500 font-medium">Role: {user.role}</p>
                            </div>
                        </div>
                        <div>
                            <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${user.status === "Active"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                    }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${user.status === "Active"
                                        ? "bg-green-700"
                                        : "bg-red-700"
                                        }`}
                                />
                                {user.status}
                            </span>
                        </div>
                    </div>
                    {/* Details */}
                    <div className="space-y-2 text-sm">
                        <p>
                            <span className="font-medium text-gray-600">Contact:</span>{" "}
                            {user.contact}
                        </p>
                        {/* <p>
                            <span className="font-medium text-gray-600">Role:</span>{" "}
                            {user.role}
                        </p> */}


                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => navigate(`/dashboard/editUser`)} className="flex-1 py-2  rounded-md text-xs flex items-center justify-center gap-1 bg-gray-100">
                            <Edit size={14} /> Edit
                        </button>
                        <button className="flex-1 py-2  rounded-md text-xs flex items-center justify-center gap-1 text-blue-600 bg-blue-50">
                            <RotateCcwKey size={14} /> Reset
                        </button>
                        <button className="flex-1 py-2  rounded-md text-xs flex items-center justify-center gap-1 text-red-600 bg-red-50">
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* DESKTOP – TABLE VIEW */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 ">
            <table className="w-full">
                <thead className="shadow-sm shadow-blue-100 rouded-t-lg">
                    <tr>
                        {tableHeadItems.map((headings) => (
                            <th key={headings} className={tableheadItemsStyle}>
                                {headings}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="shadow-xs shadow-blue-100 hover:bg-gray-50">
                            <td className={tabledataItemsStyle}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.userName}</p>
                                        <p
                                            className={`text-xs ${user.role.toLowerCase() === 'principal' ||
                                                    user.role.toLowerCase() === 'admin'
                                                    ? 'bg-purple-50 text-purple-600'
                                                    : user.role.toLowerCase() === 'teacher'
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : user.role.toLowerCase() === 'accountant'
                                                            ? 'bg-yellow-50 text-yellow-600'
                                                            : 'bg-gray-100 text-gray-600'
                                                } rounded-lg w-fit py-0.5 px-2 font-medium`}
                                        >
                                            {user.role}
                                        </p>

                                    </div>
                                </div>
                            </td>

                            <td className={tabledataItemsStyle}>{user.contact}</td>
                            <td className={tabledataItemsStyle}>
                                <span
                                    className={`px-3 py-1 rounded-sm text-xs font-medium ${user.status === "Active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {user.status}
                                </span>
                            </td>

                            <td className={tabledataItemsStyle}>
                                <div className="flex gap-2">
                                    <UserPenIcon size={36} onClick={() => navigate(`/dashboard/editUser`)} className="rounded-sm cursor-pointer text-blue-500 p-1" />
                                    <RotateCcwKey size={36} className="rounded-sm text-green-500 cursor-pointer  p-1 " />
                                    <LogOut size={36} className="rounded-sm cursor-pointer text-gray-600  p-1 " />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="shadow-sm shadow-blue-100 rouded-b-lg text-sm font-medium text-gray-900 bg-gray-100 uppercase">
                    <tr>
                        <td colSpan={100} className="px-6 py-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <span className="text-sm text-gray-700">
                                        {/* Showing X to Y of Z */}
                                    </span>

                                    <div className="flex items-center gap-2 ">
                                        <span className="text-sm text-gray-700">Rows per page:</span>
                                        <select className="px-3 py-1 hover:bg-gray-50 shadow-sm shadow-gray-300 rounded focus:outline-none">
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1 text-gray-600 shadow-sm hover:bg-gray-50 rounded cursor-pointer">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button className="px-3 py-1 text-gray-600 shadow-sm hover:bg-gray-50 rounded cursor-pointer">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>

            </table>
        </div>


    </div>
}

export default ManageAllUsers