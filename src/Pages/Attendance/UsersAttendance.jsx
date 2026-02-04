import { Bell,Search, Upload, User, ChevronLeft, ChevronRight, X, Camera, Calendar } from 'lucide-react'
import React, { useState, useRef } from 'react'
import {teachersData} from '../../assets/allTeachers'

const UsersAttendance = () => {

  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [teachers, setTeachers]= useState(teachersData)
  const itemsPerPage = 10
  const date=new Date().toLocaleDateString()

  
  // Calculate pagination
  const totalPages = Math.ceil(teachers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTeachers = teachers.slice(startIndex, endIndex)
  
  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page)
  }
  
  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
    }
  
  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const attendanceStatus=(teacher)=>{
    setTeachers(prev=>prev.map(t=>t.id=== teacher.id ? {...t , status:'Not Marked' ? 'Present' : "Not Marked"} : t))
  }


// const webcamRef = useRef(null)

  // const handleCaptureVerify = () => {
  //   // Here you can capture the image from webcam
  //   const imageSrc = webcamRef.current?.getScreenshot()
  //   console.log('Captured image:', imageSrc)
    
  //   // Return to attendance tab
  //   setActiveTab('attendance')
  //   setSelectedTeacher(null)
  // }

  // const handleCancel = () => {
  //   setActiveTab('attendance')
  //   setSelectedTeacher(null)
  // }

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
                <User size={25} className="w-7 h-10 text-blue-700" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Manage Attendance</h1>
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
        
        {/* Page Content - Attendance Table */}
          <div className='flex-1 bg-linear-to-b from-sky-50 to-sky-100 overflow-auto p-4 sm:p-6 lg:p-8'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4'>
              <div>
                <h1 className='text-xl sm:text-3xl font-bold text-gray-900'>Teacher Attendance</h1>
                <p className='text-gray-500 mt-1 font-medium text-[12px] lg:w-full w-70 sm:text-base'>Manage and track daily attendance records for all faculty members.</p>
              </div>
              <div className='flex gap-3 w-fit'>
                <button className='px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all cursor-pointer shadow-md'>
                  <Calendar color='grey' className='w-5 h-5'/>
                  <span className='text-gray-600 font-medium'>{date}</span>
                </button>
                <button className='px-3 py-2 cursor-pointer bg-blue-500 border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all text-sm shadow-md'>
                  <Upload className="w-5 h-7 text-white"/>
                  <span className='font-medium text-lg text-white'>Export Reports</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Teacher Name</th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Employee ID</th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Department</th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Status</th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Action</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {currentTeachers.map((teacher) => (
                      <tr key={teacher.id} className='hover:bg-gray-50 transition-colors'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center gap-3'>
                            <div className={`w-10 h-10 rounded-full ${teacher.color} flex items-center justify-center font-semibold text-sm`}>
                              {teacher.initials}
                            </div>
                            <span className='font-medium text-gray-900'>{teacher.name}</span>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-gray-600 font-medium'>{teacher.employeeId}</td>
                        <td className='px-6 py-4 whitespace-nowrap text-gray-600'>{teacher.department}</td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className={`px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium ${teacher.status==='Present' ? 'bg-green-100 text-green-600' : ""}`}>
                            {teacher.status}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <button 
                            onClick={() => attendanceStatus(teacher)} 
                            className='text-blue-600 font-semibold cursor-pointer hover:text-blue-800 transition-colors'
                            >
                            Mark Attendance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
                <div className='text-sm text-gray-600'>
                  Showing {startIndex + 1}-{Math.min(endIndex, teachers.length)} of {teachers.length} teachers
                </div>
                <div className='flex items-center gap-2'>
                  <button 
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className='w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                    >
                    <ChevronLeft className='w-5 h-5' />
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium transition-all ${
                          currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                        >
                          {pageNum}
                        </button>
                      )
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className='px-1'>...</span>
                    }
                    return null
                  })}

                  <button 
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                    className='w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                    >
                    <ChevronRight className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

export default UsersAttendance


{/* Face Verification Camera */}

//  {activeTab === 'camera' && (
//           <div className='flex-1 bg-linear-to-b from-gray-600 to-gray-800 flex items-center justify-center p-4'>
//             <div className='bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative'>
//               {/* Close Button */}
//               <button 
//                 onClick={handleCancel}
//                 className='absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all'
//               >
//                 <X className='w-5 h-5 text-gray-600' />
//               </button>

//               {/* Header */}
//               <div className='mb-6'>
//                 <div className='flex items-center gap-3 mb-2'>
//                   <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
//                     <Camera className='w-6 h-6 text-blue-600' />
//                   </div>
//                   <div>
//                     <h2 className='text-2xl font-bold text-gray-900'>Face Verification</h2>
//                     <p className='text-sm text-gray-500'>
//                       Verifying identity for {selectedTeacher?.name}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Camera Preview */}
//               <div className='relative mb-6 rounded-2xl overflow-hidden bg-gray-900'>
//                 {

//                 {/* Face Guide Overlay */}
//                 <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
//                   <div className='w-64 h-80 border-4 border-blue-400 rounded-full opacity-30'></div>
//                 </div>

//                 {/* Instruction */}
//                 <div className='absolute bottom-4 left-0 right-0 flex justify-center'>
//                   <div className='bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium'>
//                     Align your face within the guide
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className='space-y-3'>
//                 <button 
//                   onClick={handleCaptureVerify}
//                   className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl'
//                 >
//                   <Camera className='w-5 h-5' />
//                   Capture & Verify
//                 </button>
//                 <button 
//                   onClick={handleCancel}
//                   className='w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all border border-gray-200'
//                 >
//                   Cancel
//                 </button>
//               </div>

//               {/* Privacy Notice */}
//               <div className='mt-6 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg'>
//                 <div className='w-4 h-4 shrink-0 mt-0.5'>
//                   <svg viewBox="0 0 24 24" fill="currentColor" className='text-gray-400'>
//                     <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
//                   </svg>
//                 </div>
//                 <p>
//                   <strong>Encrypted Face Biometric:</strong> This data is processed locally and not stored. 
//                   Privacy Shield Active. Verified by SecuSchool.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}