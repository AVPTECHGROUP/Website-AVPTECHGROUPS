import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

const ApprovedManualAttendance = () => {
  const requestData = {
    teacherName: "Sarah Jenkins",
    department: "Mathematics Department",
    dateTime: "October 24, 2023 | 08:15 AM",
    reason: "Face verification failed due to poor ambient lighting conditions in the north corridor.",
    confidenceScore: "12%",
  };

  const handleReviewRequest = () => {
    console.log("Review request clicked");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 to-sky-100 flex items-center justify-center lg:p-2 p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 md:p-8 border border-gray-100">
        
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="relative">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center shadow-md">
              <Calendar size={28} className="text-amber-500 sm:w-8 sm:h-8" strokeWidth={2} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-[10px] sm:text-xs font-bold">!</span>
            </div>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2 sm:mb-3 px-2">
          Manual Attendance Approval Required
        </h1>

        <p className="text-gray-500 text-xs sm:text-sm md:text-base text-center mb-6 sm:mb-5 leading-relaxed lg:tracking-tighter px-2">
          Dear Principal, a manual attendance request has been submitted for your review following a face verification failure at the staff entrance.
        </p>

        <div className="bg-linear-to-br from-gray-50 to-white rounded-xl p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 border border-gray-100 mb-5 sm:mb-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100">
            <span className="text-xs sm:text-sm font-medium text-gray-500">Teacher Name</span>
            <span className="text-sm sm:text-base font-semibold text-gray-900">{requestData.teacherName}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100">
            <span className="text-xs sm:text-sm font-medium text-gray-500">Department</span>
            <span className="text-sm sm:text-base font-semibold text-gray-900">{requestData.department}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100">
            <span className="text-xs sm:text-sm font-medium text-gray-500">Date & Time</span>
            <span className="text-sm sm:text-base font-semibold text-gray-900">{requestData.dateTime}</span>
          </div>

          <div className="flex flex-col gap-2 pb-3 sm:pb-4 border-b border-gray-100">
            <span className="text-xs sm:text-sm font-medium text-gray-500">Reason for Request</span>
            <p className="text-xs sm:text-sm italic text-gray-700 leading-relaxed">
              "{requestData.reason}"
            </p>
          </div>
          
          <div className="flex justify-start sm:justify-end pt-1">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 w-fit">
              <AlertCircle size={14} className="text-amber-600 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-semibold text-amber-700 whitespace-nowrap">
                AI Confidence Score: {requestData.confidenceScore}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <button
            onClick={handleReviewRequest}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Review Request
          </button>
          
          <p className="text-[10px] sm:text-xs font-medium text-gray-400 text-center">
            Button expires in 24 hours.
          </p>
        </div>

        <div className="pt-4 sm:pt-5 border-t border-gray-100">
          <div className="flex items-start gap-2 text-[10px] sm:text-xs text-gray-500 bg-blue-50 border border-blue-100 p-2.5 sm:p-3 rounded-lg">
            <div className="mt-0.5 shrink-0">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <p className="leading-relaxed">
              <strong className="text-gray-700">Action Required:</strong> Please review this request and approve or deny the manual attendance entry within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedManualAttendance;