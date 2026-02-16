import { SendHorizonal } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { createLeaveRequest } from '../../Api/LeavesManagementAPI';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getListOfValues } from '../../Api/ListOfValues';

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
  useEffect(() => {
    const currUser = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(currUser);
    // FIX: Use prev state to maintain all fields
    setFormData(prev => ({ 
      ...prev,
      mobile: currUser.phone || '' 
    }));
    //FOR LIST OF VALUES
    let fetchListOfValues = async () => {
        try {
          const leaveTypeRes = await getListOfValues('LEAVE_TYPE');
          const formattedLeaveType = leaveTypeRes.map(item => ({
            id: item.id,
            value: item.value,
            label: item.label
          }));
          console.log(formattedLeaveType);
          setListofLeavetype(formattedLeaveType);
        }
        catch (e) {
          console.error("get list of values error error:", e.message);
          throw error;
        }
      }
      fetchListOfValues();
  }, []);

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
        newErrors.toDate = 'To date must be after from date';
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
        contactDuringLeave: formData.mobile
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
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm w-full ${
                    errors.leaveType 
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
                    className={`font-normal text-gray-800 border p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fromDate 
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
                    className={`font-normal text-gray-800 border p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.toDate 
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
                  className={`font-normal text-gray-800 border p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.reason 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-gray-100'
                  }`} />
                {errors.reason && (
                  <p className="mt-1 text-xs text-red-600">{errors.reason}</p>
                )}
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
                  disabled={loading}
                  className={`flex gap-2 justify-center px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}>
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