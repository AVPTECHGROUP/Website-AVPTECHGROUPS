import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import { 
  Search, 
  Bell, 
  User,
  ClipboardList,
  Calendar,
  ArrowRight,
  CalendarCheck,
  TriangleAlert,
  Clock,
  UserX,
  LucideNotebookText,
  Check,
  CircleX,
} from 'lucide-react';

const Leaves = () => {
  const date = new Date().toLocaleDateString();
  
  const leaveRequests = [
  {
    name: 'Sarah Smith',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
    leaveType: 'Sick Leave',
    fromDate: 'Oct 12, 2023',
    toDate: 'Oct 14, 2023',
    totalDays: 3,
    status: 'Pending',
    action:'View'
  },
  {
    name: 'John Doe',
    avatar: 'https://img.freepik.com/free-photo/portrait-confident-businessman_23-2148157227.jpg',
    leaveType: 'Casual Leave',
    fromDate: 'Oct 20, 2023',
    toDate: 'Oct 20, 2023',
    totalDays: 1,
    status: 'Approved',
    action:'View'
  },
  {
    name: 'Emily Blunt',
    avatar: 'https://img.freepik.com/free-photo/medium-shot-woman-working-laptop_23-2149300643.jpg',
    leaveType: 'Unpaid Leave',
    fromDate: 'Oct 22, 2023',
    toDate: 'Oct 25, 2023',
    totalDays: 4,
    status: 'Pending',
    action:'View'
  },
  {
    name: 'Michael Ross',
    avatar: 'https://img.freepik.com/free-photo/smiling-businessman-with-crossed-arms_23-2148226159.jpg',
    leaveType: 'Sick Leave',
    fromDate: 'Oct 05, 2023',
    toDate: 'Oct 06, 2023',
    totalDays: 2,
    status: 'Rejected',
    action:'View'
  }
];

const statusStyles = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700'
};


  return (
     <div className="flex h-screen overflow-hidden">
          {/* Sidebar Component */}
    
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  
                  <div className="w-12 h-14 bg-[#F8FAFC] rounded-lg flex items-center justify-center border border-gray-300">
                    <CalendarCheck size={25} className="w-7 h-10 text-blue-700" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Leaves Management</h1>
                </div>
    
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="relative hidden md:block">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search teacher or ID..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all relative">
                    <Bell className="w-5 h-5 text-gray-700" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-all">
                    <User className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </header>
    
            {/* Page Content */}
            <div className="flex-1 bg-linear-to-b from-sky-50 to-sky-100 overflow-auto p-4 sm:p-6 lg:p-8">
              {/* Page Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Approve Leaves</h2>
                  <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Review and take action on pending leave requests</p>
                </div>
                <div className="flex gap-3 bg-gray-50">
                  <button className="px-4 py-2 border bg-white border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-md">
                    <Calendar className="w-4 h-4" />               
                    <span className="hidden sm:inline">{date}</span>
                    <span className="sm:hidden">{date.split('/')[0]}/{date.split('/')[1]}</span>
                  </button>
                </div>
              </div>
    
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 mb-8">
                <div className="bg-gray-50  shadow-md border h-auto cursor-pointer rounded-xl p-4 flex items-center border-gray-300 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white shadow-md border border-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <LucideNotebookText size={25} className="w-8 h-8 sm:w-10 sm:h-9 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className='flex flex-col mb-2 ml-2 min-w-0'>
                    <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Pending Request</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 ">12</p>
                    <div className='flex gap-2 flex-wrap'>
                      <p className='text-[11px] sm:text-[13px] mt-2 sm:relative sm:top-3 bg-red-200 p-1 w-fit rounded-2xl px-2 text-red-600 font-bold whitespace-nowrap'>Action Required</p>
                     
                    </div>
                  </div>
                  <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
                  </button>
                </div>
    
                <div className="bg-gray-50 shadow-md h-auto rounded-xl p-4 cursor-pointer border flex items-center border-gray-300 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shadow-md border border-gray-50 bg-white rounded-xl flex items-center justify-center shrink-0">
                      <Check size={25} className="w-8 h-8 sm:w-10 sm:h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className='flex flex-col mb-2.5 ml-2 min-w-0'>
                    <p className="text-gray-600 mb-1 font-bold text-sm text-nowrap sm:text-base">Approved (This Month)</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">46</p>
                    <div className='flex gap-2 flex-wrap'>
                      <p className='text-[11px] sm:text-[13px] bg-blue-100 p-1 mt-2 sm:relative sm:top-3 w-fit rounded-2xl text-blue-800 font-bold whitespace-nowrap'>Needs Review</p>
                    </div>
                  </div>
                  <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
                  </button>
                </div>
    
                <div className="bg-gray-50 shadow-md h-auto rounded-xl p-4 cursor-pointer border flex items-center border-gray-300 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 shadow-md border border-gray-50 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shrink-0">
                      <CircleX size={25} className="w-8 h-8 sm:w-10 sm:h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className='flex flex-col mb-2.5 ml-2 min-w-0'>
                    <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base text-nowrap">Rejected (This Month)</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">3</p>
                    <div className='flex gap-2'>
                       <p className='text-[11px] sm:text-[13px] bg-blue-100 p-1 mt-2 sm:relative sm:top-3 w-fit rounded-2xl text-blue-800 font-bold whitespace-nowrap'>Needs Review</p>
                    </div>
                  </div>
                  <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
                  </button>
                </div>
              </div>
  
              {/* School Admin Preview Table */}
<div className="bg-white rounded-xl border border-gray-200">
  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <ClipboardList className="w-4 h-4 text-blue-600" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-gray-900">
        Admin Accountability
      </h3>
    </div>
    <p className="font-medium cursor-pointer text-blue-600 text-sm">
      Manage Admins
    </p>
  </div>

  {/* ================= DESKTOP TABLE ================= */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full min-w-160">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
            Teacher Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
            Leave Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
            From
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
            To
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
            Days
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
            Action
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {leaveRequests.map((teacher, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={teacher.avatar}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <p className="font-medium text-gray-900">
                  {teacher.name}
                </p>
              </div>
            </td>
            <td className="px-6 py-4">{teacher.leaveType}</td>
            <td className="px-6 py-4">{teacher.fromDate}</td>
            <td className="px-6 py-4">{teacher.toDate}</td>
            <td className="px-6 py-4">{teacher.totalDays}</td>
            <td className="px-6 py-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[teacher.status]}`}
              >
                {teacher.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {teacher.action}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* ================= MOBILE CARDS ================= */}
  <div className="md:hidden divide-y">
    {leaveRequests.map((teacher, index) => (
      <div key={index} className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <img
            src={teacher.avatar}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">{teacher.name}</p>
            <p className="text-xs text-gray-500">{teacher.leaveType}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <p><span className="font-medium">From:</span> {teacher.fromDate}</p>
          <p><span className="font-medium">To:</span> {teacher.toDate}</p>
          <p><span className="font-medium">Days:</span> {teacher.totalDays}</p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${statusStyles[teacher.status]}`}
          >
            {teacher.status}
          </span>
        </div>

        <button className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium w-fit">
          {teacher.action}
        </button>
      </div>
    ))}
  </div>
</div>

                  <div className='w-full mt-7 bg-[#eff1f6] border border-gray-300 flex flex-col rounded-tl-xl rounded-tr-xl'>
                    <div className='flex gap-3 items-center  p-5'>
                    <TriangleAlert size={25} color='white' fill='maroon'/>
                    <p className='text-xs sm:text-sm font-medium text-black'>Department Compliance Alerts</p>
                    </div>
                    <div className='bg-white p-4 flex justify-between items-center border border-gray-300'>
                    <div className='flex gap-3'>
                    <Clock size={20} color='#a3a307' className='bg-yellow-200 w-6 h-5'/>
                    <p className='text-xs sm:text-sm font-medium text-black'>Late login beyond allowed time</p>
                    </div>
                    <button className='p-2 border hover:bg-blue-100 font-medium cursor-pointer rounded-xl text-sm border-gray-400'>View Details</button>
                    </div>
                    <div className='bg-white p-4 flex justify-between items-center'>
                    <div className='flex gap-3'>
                    <UserX size={20} color='#0847d9'/>
                    <p className='text-xs sm:text-sm font-medium text-black'>Attendance not submitted (Today / Yesterday)</p>
                    </div>
                    <button className='p-2 border hover:bg-blue-100 font-medium cursor-pointer rounded-xl text-sm border-gray-400'>Update</button>
                    </div>

                    
              </div>
            </div>
          </div>
        </div>
      );
};

export default Leaves;