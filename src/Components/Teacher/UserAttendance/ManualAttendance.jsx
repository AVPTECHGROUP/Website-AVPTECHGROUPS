import React from 'react'
import {TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ManualAttendance = () => {
  const teacher = {
    name: "Dr. Sarah Jenkins",
    employeeId: "EDU-2024-8842",
    requestDate: "May 15, 2024",
    attemptTime: "08:42 AM",
  };
  const handleSubmit = () => {
    if (reason.trim()) setSubmitted(true);
    navigate('/teachers/camera/approved')
  };
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate()

  return (
    <div className='flex h-screen overflow-hidded'>
      <div className='flex-1 flex w-full overflow-hidden flex-col'>
        <div className='flex-1 bg-linear-to-b from-sky-50 to-sky-100 flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl shadow-2xl w-fit p-6 sm:p-8 relative'>
            {/* Header */}
            <div className='mb-6'>
              <div className='flex items-start gap-2 mb-2 flex-col justify-center'>
                <div className='flex items-center gap-2'>
                  <div className='w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center'>
                    <TriangleAlert fill='#e0b21c' color='#fef9c2' size={35} />
                  </div>
                  <h2 className='text-xl text-[#ca9e0e] font-bold'>Verification Failed</h2>
                </div>
                <p className='text-2xl font-bold'>
                  Manual Attendance Request
                </p>
                <p className='text-gray-500 tracking-tighter7'>The automated face verification was unsuccessful. Please verify the details and submit a manual <br /> request.</p>
                <div>
                </div>
              </div>
            </div>
            {/* Divider */}
            <hr className="border-gray-100 mb-5" />

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6">
              <div>
                <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Teacher Name</p>
                <p className="text-[14.5px] font-semibold text-gray-800">{teacher.name}</p>
              </div>
              <div>
                <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Employee ID</p>
                <p className="text-[14.5px] font-semibold text-gray-800">{teacher.employeeId}</p>
              </div>
              <div>
                <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Request Date</p>
                <p className="text-[14.5px] font-semibold text-gray-800">{teacher.requestDate}</p>
              </div>
              <div>
                <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Attempt Time</p>
                <p className="text-[14.5px] font-semibold text-gray-800">{teacher.attemptTime}</p>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100 mb-4" />

            {/* Reason Label Row */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[14.5px] font-semibold text-gray-800">Reason for Manual Attendance</h3>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">Required</span>
            </div>

            {/* Textarea */}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the reason for face verification failure (e.g., poor lighting in room 302, temporary technical glitch, or physical obstruction)..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3.5 text-[13px] text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
            />

            {/* Note */}
            <p className="text-[12px] text-gray-400 italic mt-2.5 mb-6">
              Your request will be sent to the department head for approval.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button className="px-5 py-2.5 text-[13.5px] font-semibold text-gray-700 border border-gray-250 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason.trim()}
                className={`px-6 py-2.5 text-[13.5px] font-semibold text-white rounded-lg transition-all ${reason.trim() ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg cursor-pointer" : "bg-blue-300 cursor-not-allowed"}`}
              >
                Submit Request
              </button>
            </div>

            {/* Privacy Notice */}
            <div className='mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg'>
              <div className='w-4 h-4 shrink-0 mt-0.5'>
                <svg viewBox="0 0 24 24" fill="currentColor" className='text-gray-400'>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <div className='flex gap-1'>
                <strong className='text-sm'>Having trouble?</strong><p className='text-blue-600 text-sm cursor-pointer font-medium'>Contact System Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManualAttendance