import { SendHorizonal } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { createLeaveRequest } from '../../Api/LeavesManagementAPI';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function ApplyLeaves() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({
    id: '',
    fullName: '',
    roles: '',
    phone: ''
  });
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    mobile: '',
    reason: ''
  });

  useEffect(() => {
    const currUser = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(currUser);
    setFormData({ mobile: currUser.phone || '' })
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiscardButton = () => {
    setFormData({
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: ''
    })
  }

  async function handleSubmitLeaveReq(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const leavePayload = {
        userId: currentUser.id,
        userType: currentUser.roles[0],
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        contactDuringLeave: formData.mobile
      }
      console.log(leavePayload);
      const resLeaveReq = await createLeaveRequest(leavePayload);
      toast.success(resLeaveReq.message);
      navigate('/leaves/myLeaves');
      handleDiscardButton();

    } catch (e) {
      toast.error(e.message || 'failed to create new request');
    }finally{
      setLoading(false);
    }
  }
  return (
    <div className='p-4 md:p-12 bg-gray-50 h-screen pb-0 mb-0'>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          New Leave Request
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Submit your application for review.
        </p>
      </div>
      <div className="space-y-6 bg-white px-4 py-4 lg:p-8 rounded-xl shadow-sm ">
        {/* Personal Details Section */}
        <div>
          <form onSubmit={handleSubmitLeaveReq}>
            <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className='block font-semibold text-gray-600 text-sm mb-2'>
                  Employee Name
                </label>
                <input
                  type="text"
                  value={currentUser.fullName}
                  name="name"
                  placeholder='eg. Sah Jenkins'
                  className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  disabled
                />
              </div>

              <div>
                <label htmlFor="leaveType" className='block font-semibold text-gray-600 text-sm mb-2'>
                  Leave Type<span className="text-red-600 ml-1">*</span>
                </label>
                {/* Leave Type */}
                <select
                  required
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm w-full">
                  <option disabled value='' >All Leave Types</option>
                  {[{ value: 'SICK_LEAVE', key: 'Sick Leave' },
                  { value: 'CASUAL_LEAVE', key: 'Casual Leave' },
                  { value: 'EARNED_LEAVE', key: 'Earned Leave' },
                  { value: 'UNPAID_LEAVE', key: 'Unpaid Leave' },
                  { value: 'MATERNITY_LEAVE', key: 'Maternity Leave' },
                  { value: 'PATERNITY_LEAVE', key: 'Paternity Leave' },
                  { value: 'BEREAVEMENT_LEAVE', key: 'Bereavement Leave' },
                  { value: 'STUDY_LEAVE', key: 'Study Leave' },
                  { value: 'COMPENSATORY_OFF', key: 'Compensatory Leave' },
                  { value: 'SPECIAL_LEAVE', key: 'Special Leave' }
                  ].map((val) => (<option key={val.value} value={val.value}>{val.key}</option>))}
                </select>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <label htmlFor="fromDate" className='block font-semibold text-gray-600 text-sm mb-2'>
                    From Date<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    required
                    value={formData.formData}
                    type="date"
                    name="fromDate"
                    onChange={handleInputChange}
                    className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label htmlFor="toDate" className='block font-semibold text-gray-600 text-sm mb-2'>
                    To Date<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    required
                    value={formData.toDate}
                    type="date"
                    name="toDate"
                    onChange={handleInputChange}
                    className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className='block font-semibold text-gray-600 text-sm mb-2'>
                  Mobile Number
                </label>
                <input
                  value={formData.mobile}
                  type="tel"
                  name="mobile"
                  onChange={handleInputChange}
                  placeholder='Enter mobile number during leave'
                  className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="reason" className='block font-semibold text-gray-600 text-sm mb-2'>
                  Reason For Leave<span className="text-red-600 ml-1">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  required
                  rows={4}
                  name="reason"
                  onChange={handleInputChange}
                  placeholder='Please describe the reason for your absence...'
                  className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 ">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={()=>handleDiscardButton()}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className={` flex gap-2 justify-center px-6 py-2.5 text-sm font-medium rounded-lg transition-all bg-blue-600 text-white`}>
                  <p>{loading?'Submitting ...':'Submit Request'}</p> <SendHorizonal className='p-1' />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ApplyLeaves