import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import { 
  Search, 
  Bell, 
  User,
  GraduationCap,
  ClipboardList,
  ArrowRight,
  UserCheck2,
  BookOpen,
  CalendarX,
  Wallet,
  Stamp,
  Key,
  ShieldCheck,
  Thermometer,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Edit,
  Plus,
  Minus,
  Settings,
  CalendarCheckIcon,
  BookCheckIcon,
  NotebookTextIcon,
  Calendar,
  Zap,
  Download,
  Filter
} from 'lucide-react';

const Payroll = () => {
  const [selectedMonth, setSelectedMonth] = useState(25000);
  const date = new Date().toLocaleDateString();
  const [includeAllowances, setIncludeAllowances] = useState(true);


 const teachers = [
    {
      name: 'Sarah Johnson',
      id: 'T-C023001',
      avatar: '👩‍🏫',
      presentDays: 22,
      absent: 0,
      basicSalary: 3200.00,
      deductions: -30.00,
      netSalary: 3200.00,
      status: 'Pending'
    },
    {
      name: 'Michael Chen',
      id: 'T-P123004',
      avatar: '👨‍🏫',
      presentDays: 20,
      absent: 2,
      basicSalary: 3000.00,
      deductions: -200.00,
      netSalary: 2800.00,
      status: 'Pending'
    },
    {
      name: 'Emily Davis',
      id: 'T-C023012',
      avatar: '👩‍💼',
      presentDays: 21,
      absent: 1,
      basicSalary: 3100.00,
      deductions: -100.00,
      netSalary: 3000.00,
      status: 'Pending'
    },
    {
      name: 'David Wilson',
      id: 'T-P123008',
      avatar: '👨‍💼',
      presentDays: 22,
      absent: 0,
      basicSalary: 3400.00,
      deductions: -0.00,
      netSalary: 3400.00,
      status: 'Pending'
    }
  ];
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Component */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              
              <div className="w-10 h-14 bg-[#F8FAFC] rounded-lg flex items-center justify-center border border-gray-300">
                <Wallet size={25} className="w-7 h-10 text-blue-700" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Payroll Management</h1>
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
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Generate Payroll</h2>
              <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Generate and manage monthly teacher payroll.</p>
            </div>
              <div className="flex gap-3">
              <button className="px-4 py-2 border cursor-pointer border-gray-300 bg-white text-sm rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-all">
                <ClipboardList className="w-4 h-4" />
                History
              </button>
              <button className="px-4 py-2 border cursor-pointer border-gray-300 bg-white text-sm rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-all">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 mb-8">
            <div className="bg-gray-50 shadow-md border h-auto cursor-pointer rounded-xl p-4 flex items-center border-gray-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white shadow-md border border-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <CalendarCheckIcon size={25} className="w-8 h-8 sm:w-10 sm:h-9 text-blue-600" />
                </div>
              </div>
              
              <div className='flex flex-col mb-2 ml-2 min-w-0'>
                <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Selected Month</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 ">October 2023</p>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
              </button>
            </div>

            <div className="bg-gray-50 shadow-md h-auto rounded-xl p-4 cursor-pointer border flex items-center border-gray-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shadow-md border border-gray-50 bg-white rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap size={25} className="w-8 h-8 sm:w-10 sm:h-8 text-blue-600" />
                </div>
              </div>
              <div className='flex flex-col mb-2.5 ml-2 min-w-0'>
                <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Total Teachers</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">48</p>
                <div className='flex gap-2 flex-wrap'>
                  <p className='text-[11px] sm:text-[13px] sm:relative sm:top-3  p-1 w-fit rounded-2xl px-2 font-bold whitespace-nowrap text-gray-700'>Active</p>
                </div>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
              </button>
            </div>

            <div className="bg-gray-50 shadow-md h-auto rounded-xl p-4 cursor-pointer border flex items-center border-gray-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 shadow-md border border-gray-50 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shrink-0">
                  <BookCheckIcon size={25} className="w-8 h-8 sm:w-10 sm:h-8 text-blue-600" />
                </div>
              </div>
              <div className='flex flex-col mb-2.5 ml-2 min-w-0'>
                <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Attendance Considered</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">1,056 Days</p>
                <div className='flex gap-2'>
                  <p className='text-[11px] sm:text-[13px] px-2 text-sm sm:relative sm:top-3 bg-indigo-200 w-fit rounded-2xl text-gray-700 font-bold whitespace-nowrap'>Needs Review</p>
                </div>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
              </button>
            </div>

            <div className="bg-gray-50 shadow-md h-auto rounded-xl p-4 cursor-pointer border flex items-center border-gray-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 shadow-md border border-gray-50 sm:h-14 bg-white rounded-xl flex items-center justify-center shrink-0">
                  <NotebookTextIcon size={25} className="w-8 h-8 sm:w-10 sm:h-8 text-blue-600" />
                </div>
              </div>
              <div className='flex flex-col mb-2.5 ml-2 min-w-0'>
                <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Payroll Status</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">Not Generated</p>
                <div className='flex gap-2'>
                </div>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
           <div>
        
           <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                 <Zap className="w-5 h-5 text-white" />
               </div>
               <h3 className="text-lg font-bold text-gray-900">Generate Monthly Payroll</h3>
             </div>
            <p className="text-sm text-gray-600 mb-6 pt-1 lg:pl-14 lg:pr-6">
               Payroll will be calculated based on approved attendance and approved leaves. Please verify all attendance records before proceeding.
             </p>

             <div className="flex lg:items-end gap-4 flex-col lg:flex-row">
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                 <div className="relative">
                   <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                   <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="pl-10 pr-4 lg:py-2.5 border text-sm border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option>March 2026</option>
                    <option>April 2026</option>
                    <option>May 2026</option>
                  </select>
                </div>
              </div>

              <div className="flex-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAllowances}
                    onChange={(e) => setIncludeAllowances(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Include allowances & penalties</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 lg:ml-6">Calculates bonuses and deductions automatically.</p>
              </div>

              <button className="px-6 py-2.5 w-fit bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-all">
                <Zap className="w-4 h-4" />
                Generate Payroll
              </button>
            </div>
          </div> 

    </div>

          {/* Payroll Preview Table */}
         {/* Payroll Preview Table */}
<div className="bg-white rounded-xl border border-gray-200">
  <div className="flex items-center justify-between p-6 border-b border-gray-200">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <ClipboardList className="w-4 h-4 text-blue-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">Payroll Preview</h3>
    </div>
    <div className="flex gap-2">
      <button className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
        <Filter className="w-4 h-4 text-gray-600" />
      </button>
      <button className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
        <Download className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  </div>

  {/* DESKTOP TABLE */}
  <div className="hidden lg:block overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Teacher</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Present</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Absent</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Basic</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Deductions</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Net Salary</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {teachers.map((teacher, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {teacher.avatar}
                </div>
                <div>
                  <p className="font-medium">{teacher.name}</p>
                  <p className="text-sm text-gray-500">{teacher.id}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">{teacher.presentDays}</td>
            <td className="px-6 py-4">{teacher.absent}</td>
            <td className="px-6 py-4">${teacher.basicSalary.toFixed(2)}</td>
            <td className="px-6 py-4 text-red-600">${teacher.deductions.toFixed(2)}</td>
            <td className="px-6 py-4 font-semibold">${teacher.netSalary.toFixed(2)}</td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                {teacher.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <button className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* MOBILE / TABLET CARD VIEW */}
  <div className="lg:hidden divide-y">
    {teachers.map((teacher, index) => (
      <div key={index} className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {teacher.avatar}
          </div>
          <div>
            <p className="font-semibold">{teacher.name}</p>
            <p className="text-xs text-gray-500">{teacher.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p><span className="text-gray-500">Present:</span> {teacher.presentDays}</p>
          <p><span className="text-gray-500">Absent:</span> {teacher.absent}</p>
          <p><span className="text-gray-500">Basic:</span> ${teacher.basicSalary}</p>
          <p><span className="text-gray-500">Deductions:</span> ${teacher.deductions}</p>
          <p className="col-span-2 font-semibold">
            Net Salary: ${teacher.netSalary}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            {teacher.status}
          </span>
          <button className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    ))}
  </div>

  <div className="p-4 bg-gray-100 flex items-center justify-between rounded-b-xl">
    <p className="text-xs text-gray-600">Showing 4 of 12</p>
    <div className="flex gap-2">
      <ChevronLeft size={18} />
      <ChevronRight size={18} />
    </div>
  </div>
</div>

          </div>
        </div>
      </div>
  );
};

export default Payroll;