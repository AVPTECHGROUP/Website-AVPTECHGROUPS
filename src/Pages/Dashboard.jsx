import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import { 
  Search, 
  Bell, 
  User,
  GraduationCap,
  ClipboardList,
  Calendar,
  ArrowRight,
  UserCheck2,
  BookOpen,
  CalendarX,
  Wallet,
  Stamp,
  Key,
  ShieldCheck,
  NotebookPen,
  Thermometer,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Edit,
  Plus,
  Minus,
  UserRoundCogIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAction, setisAction] = useState('verify');
  const [selectedMonth, setSelectedMonth] = useState(25000);
  const date = new Date().toLocaleDateString();
  
  const teachers = [
    {
      name: 'Sarah Johnson',
      id: 'T-C023001',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
      icon: <Thermometer size={20} color='red'/>,
      activityType: 'Leave Request (Sick)',
      date: date,
      status: 'Pending'
    },
    {
      name: 'Michael Chen',
      id: 'T-P123004',
      avatar: 'https://img.freepik.com/free-photo/medium-shot-smiley-man-sitting-desk_23-2149927603.jpg?t=st=1768023901~exp=1768027501~hmac=68747d7292046a5976e3580d067dfc80d31ad6a26285b3c0bd38ca8ffb28b86a',
      icon: <Check size={20} color='seagreen'/>,
      activityType: 'Attendance Submission',
      date: date,
      status: 'Pending'
    },
    {
      name: 'Emily Davis',
      id: 'T-C023012',
      avatar: 'https://img.freepik.com/free-photo/medium-shot-woman-working-laptop_23-2149300643.jpg?t=st=1768024040~exp=1768027640~hmac=1d8fbde971ce13c8e254ba5f27df48789a6e4bc22f4e3a70b6846f323f865632',
      icon: <Wallet size={20} color='blue'/>,
      activityType: 'Payroll Adjustment',
      date: date,
      status: 'Pending'
    },
    {
      name: 'David Wilson',
      id: 'T-P123008',
      avatar: 'https://www.shutterstock.com/image-photo/portrait-successful-mature-asian-businessman-600nw-2433298537.jpg',
      icon: <AlertCircle size={20} color='#f81339'/>,
      activityType: 'Attendance Missing',
      date: date,
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
                <NotebookPen size={25} className="w-7 h-10 text-blue-700" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard</h1>
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
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-500 mt-1 font-medium text-[12px] lg:w-full w-70 sm:text-base">Welcome back, here's what happening at school today.</p>
            </div>
            <div className="flex gap-3 w-fit bg-gray-50">
              <button className="px-4 py-2 border bg-white border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-md">
                <Calendar className="w-4 h-4" />               
                <span className="hidden sm:inline">{date}</span>
                <span className="sm:hidden">{date}</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 w-fit mb-8">
            <div className="bg-gray-50 shadow-md border h-auto cursor-pointer rounded-xl p-4 flex items-center border-gray-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white shadow-md border border-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap size={25} className="w-8 h-8 sm:w-10 sm:h-9 text-blue-600" />
                </div>
              </div>
              
              <div className='flex flex-col mb-2 ml-2 min-w-0'>
                <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Total Students</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 ">{selectedMonth}</p>
                <div className='flex gap-2 flex-wrap'>
                  {/* <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 bg-green-200 p-1 w-fit rounded-2xl text-green-700 font-bold whitespace-nowrap'>40 Active</p>
                  <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 text-gray-600 p-1 font-bold whitespace-nowrap'>2 Inactive</p> */}
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
                <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Today's Attendance</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">95%</p>
                <div className='flex gap-2 flex-wrap'>
                  {/* <p className='text-[11px] sm:text-[13px] mt-2 sm:relative sm:top-3 bg-red-200 p-1 w-fit rounded-2xl px-2 text-red-600 font-bold whitespace-nowrap'>2 Absent</p>
                  <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 text-red-500 p-1 font-bold whitespace-nowrap'>1 Pending</p> */}
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
                <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Pending Verifications</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">5</p>
                <div className='flex gap-2'>
                  {/* <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 bg-indigo-200 p-1 w-fit rounded-2xl text-gray-700 font-bold whitespace-nowrap'>Needs Review</p> */}
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
                <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Pending Leaves</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">3</p>
                <div className='flex gap-2'>
                  {/* <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 bg-pink-200 p-1 w-fit rounded-2xl text-pink-600 font-bold whitespace-nowrap'>Awating Approval</p> */}
                </div>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
              </button>
            </div>

            {/* <div className="bg-gray-50 shadow-md h-auto rounded-xl p-4 cursor-pointer border flex items-center border-gray-300 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 shadow-md border border-gray-50 sm:h-14 bg-white rounded-xl flex items-center justify-center shrink-0">
                  <Wallet size={25} className="w-8 h-8 sm:w-10 sm:h-8 text-blue-600" />
                </div>
              </div>
              <div className='flex flex-col mb-2.5 ml-2 min-w-0'>
                <p className="text-gray-600 mb-1 font-bold text-sm sm:text-base">Monthly Payroll</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">₹124.5k</p>
                <div className='flex gap-2 flex-wrap'>
                  <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 bg-blue-200 p-1 w-fit rounded-2xl text-blue-600 font-bold whitespace-nowrap'>Generated</p>
                  <p className='text-[11px] sm:text-[13px] px-2 mt-2 sm:relative sm:top-3 text-gray-500 p-1 font-bold whitespace-nowrap'>/ Pending</p>
                </div>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-4" />
              </button>
            </div> */}
          </div>

          {/* Quick Actions */}
          <div className='p-3'>
            <h1 className='text-lg sm:text-xl font-bold mb-5'>Quick Actions</h1>

            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 lg:w-fit sm:w-fit w-65'>
                 <button onClick={()=>{ navigate('/dashboard/manageUsers')}} className={`cursor-pointer flex bg-white p-3 px-4 rounded-xl w-full sm:w-fit flex-row gap-2 text-[13px] sm:text-[14px] font-bold justify-center ${isAction === "verify" ? 'border-2 text-blue-500' :'border-gray-300 text-black'}`}>
                <UserRoundCogIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                <span>Manage Users</span>
              </button>
              
              <button className={`cursor-pointer flex bg-white p-3 px-4 rounded-xl w-full sm:w-fit flex-row gap-2 text-[13px] sm:text-[14px] font-bold justify-center`}>
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5"/>
                <span>Verify Attendance</span>
              </button>
              
              <button onClick={()=>setisAction('approve')} className={`cursor-pointer flex bg-white p-3 px-4 rounded-xl w-full sm:w-fit flex-row gap-2 text-[13px] sm:text-[14px] font-bold justify-center ${isAction === "approve" ? 'border-2 text-blue-500' :'border-gray-300 text-black'}`}>
                <Stamp className="w-4 h-4 sm:w-5 sm:h-5"/>
                <span>Approve Leaves</span>
              </button>
              
              <button onClick={()=>setisAction('generate')} className={`cursor-pointer flex bg-white p-3 px-4 rounded-xl w-full sm:w-fit flex-row gap-2 text-[13px] sm:text-[14px] font-bold justify-center ${isAction === "generate" ? 'border-2 text-blue-500' :'border-gray-300 text-black'}`}>
                <Key className="w-4 h-4 sm:w-5 sm:h-5"/>
                <span>Generate Payroll</span>
              </button>

              <button onClick={()=>setisAction('add')} className={`cursor-pointer flex bg-white p-3 px-4 rounded-xl w-full sm:w-fit flex-row gap-2 text-[13px] sm:text-[14px] font-bold justify-center ${isAction === "add" ? 'border-2 text-blue-500' :'border-gray-300 text-black'}`}>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5"/>
                <span>Add User</span>
              </button>
              <button onClick={()=>setisAction('remove')} className={`cursor-pointer flex bg-white p-3 px-4 rounded-xl w-full sm:w-fit flex-row gap-2 text-[13px] sm:text-[14px] font-bold justify-center ${isAction === "remove" ? 'border-2 text-blue-500' :'border-gray-300 text-black'}`}>
                <Minus className="w-4 h-4 sm:w-5 sm:h-5"/>
                <span>Remove User</span>
              </button>
            </div>
          </div>

          {/* Dashboard Preview Table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Rest Activity</h3>
              </div>
              <div className="flex gap-2">
                <p className='font-medium cursor-po text-blue-600 text-sm sm:text-base'>View All</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-160">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teachers Name</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activity Type</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
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
                      <td className="px-4 sm:px-6 py-4">
                        <span className="px-3 py-1 flex items-center gap-2 bg-blue-50 w-fit rounded-full text-xs sm:text-sm font-medium">
                          {teacher.icon}
                          <span className="hidden sm:inline">{teacher.activityType}</span>
                          <span className="sm:hidden">{teacher.activityType.split(' ')[0]}</span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-gray-900 font-semibold text-xs sm:text-base">{teacher.date}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-all">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='w-full h-full p-4 sm:p-5 bg-gray-100 border border-gray-300 flex flex-col sm:flex-row items-center justify-between rounded-bl-xl rounded-br-xl gap-4'>
                <p className='text-xs sm:text-sm font-medium text-gray-600'>Showing 4 of 12 recent activities</p>
                <div className='flex gap-2 cursor-pointer'>
                  <ChevronLeft size={20} color='gray'/>
                  <ChevronRight size={20} color='gray'/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;