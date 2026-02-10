import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import { 
  Search, 
  Bell, 
  User,
  ClipboardList,
  Calendar,
  ArrowRight,
  UserCheck2,
  BookOpen,
  CalendarX,
  CalendarCheck,
  ChartColumn,
  TriangleAlert,
  Clock,
  UserX
} from 'lucide-react';

const Attendance = () => {
  const date = new Date().toLocaleDateString();
  
  const teachers = [
    {
      name: 'Sarah Johnson',
      id: 'T-C023001',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
      role: 'Principal Admin',
      attendance:96,
      last_login:'10 min ago',
      status: 'Active'
    },
    {
      name: 'Michael Chen',
      id: 'T-P123004',
      avatar: 'https://img.freepik.com/free-photo/medium-shot-smiley-man-sitting-desk_23-2149927603.jpg?t=st=1768023901~exp=1768027501~hmac=68747d7292046a5976e3580d067dfc80d31ad6a26285b3c0bd38ca8ffb28b86a',
      role: 'Department Head',
      attendance:92,
      last_login:'1 hour ago',
      status: 'Active'
    },
    {
      name: 'Emily Davis',
      id: 'T-C023012',
      avatar: 'https://img.freepik.com/free-photo/medium-shot-woman-working-laptop_23-2149300643.jpg?t=st=1768024040~exp=1768027640~hmac=1d8fbde971ce13c8e254ba5f27df48789a6e4bc22f4e3a70b6846f323f865632',
      role: 'Academic Coord',
      attendance:90,
      last_login:'4 hours ago',
      status: 'Active'
    },
    {
      name: 'David Wilson',
      id: 'T-P123008',
      avatar: 'https://www.shutterstock.com/image-photo/portrait-successful-mature-asian-businessman-600nw-2433298537.jpg',
      role: 'Staff Admin',
      attendance:93,
      last_login:'3 hours ago',
      status: 'Active'
    },
     {
      name: 'Henry Ross',
      id: 'T-P123008',
      avatar: 'https://t4.ftcdn.net/jpg/05/48/53/81/240_F_548538123_FuwZ4M0SC6nMgNVO7MTkvO1ZxLTzELuh.jpg',
      role: 'HR Admin',
      attendance:95,
      last_login:'15 min ago',
      status: 'Active'
    }
  ];

  return (
     <div className="flex h-screen overflow-hidden">
          {/* Sidebar Component */}
    
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            {/* Page Content */}
            <div className="flex-1 bg-linear-to-b from-sky-50 to-sky-100 overflow-auto p-4 sm:p-6 lg:p-8">
              {/* Page Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance Overview</h2>
                  <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Here’s an overview of today’s attendance across the school.</p>
                </div>
                <div className="flex gap-3 bg-gray-50 w-fit">
                  <button className="px-4 py-2 border bg-white border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-md">
                    <Calendar className="w-4 h-4" />               
                    <span className="hidden sm:inline">{date}</span>
                    <span className="sm:hidden">{date}</span>
                  </button>
                </div>
              </div>
    
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 mb-8 w-fit">
                <div className="bg-gray-50 shadow-md border h-auto cursor-pointer rounded-xl p-4 flex items-center border-gray-300 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white shadow-md border border-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <ChartColumn size={25} className="w-8 h-8 sm:w-10 sm:h-9 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className='flex flex-col mb-2 ml-2 min-w-0'>
                    <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Overall Attendance</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 ">94.2%</p>
                    <div className='flex gap-2 flex-wrap'>
                      <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 bg-green-200 p-1 w-fit rounded-2xl text-green-700 font-bold whitespace-nowrap'>Good Standing</p>
                     
                    </div>
                  </div>
                  <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
                  </button>
                </div>
    
                <div className="bg-gray-50 shadow-md h-auto rounded-xl p-4 cursor-pointer border flex items-center border-gray-300 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shadow-md border border-gray-50 bg-white rounded-xl flex items-center justify-center shrink-0">
                      <UserCheck2 size={25} className="w-8 h-8 sm:w-10 sm:h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className='flex flex-col mb-2.5 ml-2 min-w-0'>
                    <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Active School Admins</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">6</p>
                    <div className='flex gap-2 flex-wrap'>
                      <p className='text-[11px] sm:text-[13px] bg-blue-100 p-1 mt-2 sm:relative sm:top-3 w-fit rounded-2xl text-blue-800 font-bold whitespace-nowrap'>All roles currently online</p>
                    </div>
                  </div>
                  <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
                  </button>
                </div>
    
                <div className="bg-gray-50 shadow-md h-auto rounded-xl p-4 cursor-pointer border flex items-center border-gray-300 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 shadow-md border border-gray-50 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen size={25} className="w-8 h-8 sm:w-10 sm:h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className='flex flex-col mb-2.5 ml-2 min-w-0'>
                    <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Avg Staff Attendence</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">97%</p>
                    <div className='flex gap-2'>
                      <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 bg-green-200 p-1 w-fit rounded-2xl text-green-700 font-bold whitespace-nowrap'>0.4% above target</p>
                    </div>
                  </div>
                  <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
                  </button>
                </div>
    
                <div className="bg-gray-50 shadow-md h-auto rounded-xl p-4 cursor-pointer border flex items-center border-gray-300 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 shadow-md border border-gray-50 sm:h-14 bg-white rounded-xl flex items-center justify-center shrink-0">
                      <CalendarX size={25} className="w-8 h-8 sm:w-10 sm:h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className='flex flex-col mb-2.5 ml-2 min-w-0'>
                    <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Pending Attendance Approvals</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">3 Requests</p>
                    <div className='flex gap-2'>
                      <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 bg-pink-200 p-1 w-fit rounded-2xl text-pink-600 font-bold whitespace-nowrap'>Action Required</p>
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
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Admin Accountability</h3>
                  </div>
                  <div className="flex gap-2">
                    <p className='font-medium cursor-po text-blue-600 text-sm'>Manage Admins</p>
                  </div>
                </div>
    
                <div className="overflow-x-auto">
                  <table className="w-full min-w-160">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Administrator</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Attendance</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {teachers.map((teacher, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-all">
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center text-white text-lg shrink-0">
                                <img className='rounded-full w-10 h-10' src={teacher.avatar} alt="" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{teacher.name}</p>
                                <p className="text-xs sm:text-sm text-gray-500">{teacher.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 ">
                            <span className="px-3 py-1 flex items-center gap-2 bg-blue-50 w-fit rounded-full text-xs sm:text-sm font-medium">
                              {teacher.icon}
                              <span className="hidden sm:inline">{teacher.role}</span>
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="text-gray-900 font-semibold text-xs sm:text-base">{teacher.attendance}%</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 w-fit">
                              {teacher.last_login}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <button className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-all">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 w-fit">
                              {teacher.status}
                            </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default Attendance;