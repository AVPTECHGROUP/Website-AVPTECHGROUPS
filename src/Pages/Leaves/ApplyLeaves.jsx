import { SendHorizonal } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { createLeaveRequest } from '../../Api/LeavesManagementAPI';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getListOfValues } from '../../Api/ListOfValues';
import { getAllLeaveConfigs } from '../../Api/LeaveConfigAPI';

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

  const [errors, setErrors] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const [listOfLeaveType, setListofLeavetype] = useState([]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  // useEffect(() => {
  //   const currUser = JSON.parse(localStorage.getItem('user'));
  //   setCurrentUser(currUser);
  //   // FIX: Use prev state to maintain all fields
  //   setFormData(prev => ({
  //     ...prev,
  //     mobile: currUser.phone || ''
  //   }));
  //   //FOR LIST OF VALUES
  //   let fetchListOfValues = async () => {
  //     try {
  //       //const leaveTypeRes = await getListOfValues('LEAVE_TYPE');
  //       const leaveTypeRes = await getAllLeaveConfigs(true);

  //       leaveTypeRes = leaveTypeRes.data;
  //       console.log(leaveTypeRes + "=============================================")
  //       const formattedLeaveType = leaveTypeRes
  //         .filter(item => item.isActive === true)
  //         .map(item => ({
  //           id: item.id,
  //           value: item.leaveType,
  //           label: item.leaveName,
  //         }));
  //       console.log(formattedLeaveType);
  //       setListofLeavetype(formattedLeaveType);
  //     }
  //     catch (e) {
  //       console.error("get list of values error error:", e.message);
  //       throw error;
  //     }
  //   }
  //   fetchListOfValues();
  // }, []);

  useEffect(() => {
    const currUser = JSON.parse(localStorage.getItem('user'));

    setCurrentUser(currUser);

    setFormData(prev => ({
      ...prev,
      mobile: currUser?.phone || ''
    }));

    const fetchListOfValues = async () => {
      try {
        // Same API pattern as fetchConfigs
        const res = await getAllLeaveConfigs(true);

        console.log('Leave Config Response:', res);

        const formattedLeaveType = (res.data || [])
          .filter(item => item.isActive)
          .map(item => ({
            id: item.id,
            value: item.leaveType,
            label: item.leaveName
          }));

        console.log(formattedLeaveType);

        setListofLeavetype(formattedLeaveType);

      } catch (e) {
        console.error('Get leave configurations error:', e);
        toast.error('Failed to load leave types');
      }
    };

    fetchListOfValues();

  }, []);

  const isSingleDayLeave =
    formData.fromDate &&
    formData.toDate &&
    formData.fromDate === formData.toDate;

  useEffect(() => {
    if (!isSingleDayLeave) {
      setIsHalfDay(false);
    }
  }, [isSingleDayLeave]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDiscardButton = () => {
    setFormData({
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: ''
    });
    setErrors({
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: ''
    });
  }

  // Client-side validation
  const validateForm = () => {
    const newErrors = {
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: ''
    };

    let isValid = true;

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
      isValid = false;
    }

    if (!formData.fromDate) {
      newErrors.fromDate = 'From date is required';
      isValid = false;
    }

    if (!formData.toDate) {
      newErrors.toDate = 'To date is required';
      isValid = false;
    }

    if (!formData.reason || formData.reason.trim() === '') {
      newErrors.reason = 'Reason for leave is required';
      isValid = false;
    }

    // Validate date range
    if (formData.fromDate && formData.toDate) {
      const fromDate = new Date(formData.fromDate);
      const toDate = new Date(formData.toDate);

      if (toDate < fromDate) {
        newErrors.toDate = 'To leave date must be after from leave date';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  async function handleSubmitLeaveReq(e) {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return;
    }

    try {
      setLoading(true);
      const leavePayload = {
        userId: currentUser.id,
        userType: currentUser.roles[0],
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        contactDuringLeave: formData.mobile,
        isHalfDay: isHalfDay
      }
      console.log(leavePayload);
      const resLeaveReq = await createLeaveRequest(leavePayload);
      toast.success(resLeaveReq.message);

      // Only clear form and navigate on success
      setFormData({
        leaveType: '',
        fromDate: '',
        toDate: '',
        mobile: currentUser.phone || '',
        reason: ''
      });
      setErrors({
        leaveType: '',
        fromDate: '',
        toDate: '',
        reason: ''
      });

      navigate('/leaves/myLeaves');
    } catch (error) {
      console.error("Error creating leave request:", error);

      // Handle validation errors from server
      if (error?.response?.data?.data && typeof error.response.data.data === 'object') {
        const serverErrors = error.response.data.data;
        const newErrors = {
          leaveType: serverErrors.leaveType || '',
          fromDate: serverErrors.fromDate || '',
          toDate: serverErrors.toDate || '',
          reason: serverErrors.reason || ''
        };
        setErrors(newErrors);
        toast.error(error.response.data.message || 'Validation failed');
        return;
      }

      // Handle other error formats
      let errorMessage = 'Failed to create leave request';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='p-4 bg-gray-50 h-screen pb-0 mb-0 bg-linear-to-b from-sky-50 to-sky-100'>
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          New Leave Request
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Submit your application for review.
        </p>
      </div>
      <div className="space-y-4 bg-white px-2 py-2 lg:p-4 rounded-xl shadow-sm ">
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
                  className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-1 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                  className={`px-4 py-1 border rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm w-full ${errors.leaveType
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-gray-100'
                    }`}>
                  <option disabled value='' >Select Leave Type</option>
                  {listOfLeaveType.map((val) => (<option key={val.id} value={val.value}>{val.label}</option>))}
                </select>
                {errors.leaveType && (
                  <p className="mt-1 text-xs text-red-600">{errors.leaveType}</p>
                )}
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <label htmlFor="fromDate" className='block font-semibold text-gray-600 text-sm mb-2'>
                    From Date<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    required
                    value={formData.fromDate}
                    type="date"
                    name="fromDate"
                    onChange={handleInputChange}
                    className={`font-normal text-gray-800 border p-1 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fromDate
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-100'
                      }`}
                  />
                  {errors.fromDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.fromDate}</p>
                  )}
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
                    className={`font-normal text-gray-800 border p-1 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.toDate
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-100'
                      }`}
                  />
                  {errors.toDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.toDate}</p>
                  )}
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
                  className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-1 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 text-sm mb-2">
                  Half Day Leave
                </label>

                <div
                  className={`flex items-center justify-between p-2 rounded-lg border ${isSingleDayLeave
                    ? 'bg-gray-100 border-gray-300'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Enable Half Day
                    </p>

                    {!isSingleDayLeave && (
                      <p className="text-xs text-gray-500 mt-1">
                        Select the same From and To date to enable half day leave.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!isSingleDayLeave}
                    onClick={() => setIsHalfDay((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isHalfDay ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isHalfDay ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="reason" className='block font-semibold text-gray-600 text-sm mb-2'>
                  Reason For Leave<span className="text-red-600 ml-1">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  required
                  rows={3}
                  name="reason"
                  onChange={handleInputChange}
                  placeholder='Please describe the reason for your absence...'
                  className={`font-normal text-gray-800 border p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.reason
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-100'
                    }`} />
                {errors.reason && (
                  <p className="mt-1 text-xs text-red-600">{errors.reason}</p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-4 sm:px-6 lg:px-8  pt-2 ">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleDiscardButton()}
                  className="px-2 text-sm cursor-pointer font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex gap-2 cursor-pointer justify-center px-2  py-1 text-sm font-medium rounded-lg transition-all ${loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}>
                  <p>{loading ? 'Submitting ...' : 'Submit Request'}</p> <SendHorizonal className='p-1' />
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