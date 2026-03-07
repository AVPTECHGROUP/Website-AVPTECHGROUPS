import React, { useEffect } from 'react'
import { ChevronDown, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllUserRoles, filterUserByRole } from "../../Api/userManagementAPI";
import { requestManualAttendance } from '../../Api/AttendanceApi';
import { toast } from 'react-toastify';

const ManualAttendance = () => {

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  const [gps, setGps] = useState({
    latitude: null,
    longitude: null,
  });

  useEffect(() => {

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        // fallback if permission denied
        setGps({ latitude: 0, longitude: 0 });
      }
    );
  }, []);



  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await getAllUserRoles();
        setRoles(Array.isArray(res?.data) ? res.data : []);
      } catch {
        toast.error("Failed to load roles");
      }
    };
    loadRoles();
  }, []);

  const handleRoleChange = async (e) => {
    const role = e.target.value;

    setSelectedRole(role);
    setSelectedUserName("");
    setSelectedUserId("");
    setUsers([]);

    if (!role) return;

    try {
      setLoadingUsers(true);
      const res = await filterUserByRole(role);
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleNameChange = (e) => {
    const userId = e.target.value;

    const selectedUser = users.find(
      (user) => String(user.id) === String(userId)
    );

    setSelectedUserId(userId);
    setSelectedUserName(selectedUser?.fullName || "");
  };


  const handleSubmit = async () => {
    if (!reason.trim() || !selectedRole || !selectedUserId) return;

    try {
      setSubmitting(true);

      await requestManualAttendance({
        userId: Number(selectedUserId),
        userType: selectedRole,
        userName: selectedUserName,
        remarks: reason,
        gpsLatitude: gps.latitude ?? 0,
        gpsLongitude: gps.longitude ?? 0,
      });

      toast.success("Request Submitted");
      navigate("/attendance/markUserAttendance");
    } catch (error) {
      toast.error(error.message || "Failed to submit manual attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='flex h-screen overflow-hidden'>
      <div className='flex-1 flex w-full overflow-hidden flex-col'>
        <div className='flex-1 bg-linear-to-b from-sky-50 to-sky-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-auto'>
          <div className='bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl p-4 sm:p-6 lg:p-8 my-auto'>
            {/* Header */}
            <div>
              <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-col justify-center text-center'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 flex items-center justify-center'>
                    <TriangleAlert fill='#e0b21c' color='#fef9c2' size={28} className='sm:w-8.75 sm:h-8.75' />
                  </div>
                  <h2 className='text-lg sm:text-xl lg:text-2xl text-[#ca9e0e] font-bold'>Verification Failed</h2>
                </div>
                <p className='text-xl sm:text-2xl lg:text-3xl font-bold'>
                  Manual Attendance Request
                </p>
                <p className='text-xs sm:text-sm lg:text-base text-gray-500 max-w-2xl px-2'>
                  The automated face verification was unsuccessful. Please verify the details and submit a manual request.
                </p>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100 mb-4 sm:mb-5" />

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-y-5 sm:gap-x-4 mb-4 sm:mb-6">

              {/* Role Dropdown */}
              <div className='w-full'>
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-1.5 sm:mb-2">
                  User Role
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={handleRoleChange}
                    className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* User Name Dropdown */}
              <div className='w-full'>
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-1.5 sm:mb-2">
                  User Name
                </label>
                <div className="relative">
                  <select
                    value={selectedUserId}
                    onChange={handleNameChange}
                    disabled={!selectedRole || loadingUsers}
                    className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                  >
                    <option value="">
                      {loadingUsers ? "Loading..." : "Select Name"}
                    </option>

                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* User ID Input */}
              <div className='w-full sm:col-span-2 lg:col-span-1'>
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-1.5 sm:mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={selectedUserId}
                  readOnly
                  placeholder="Auto-filled"
                  className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100 mb-3 sm:mb-4" />

            {/* Reason Label Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sm:mb-3">
              <h3 className="text-sm sm:text-[14.5px] font-semibold text-gray-800">Reason for Manual Attendance</h3>
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 sm:px-2.5 py-0.5 rounded-full w-fit">Required</span>
            </div>

            {/* Textarea */}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the reason for face verification failure (e.g., poor lighting in room 302, temporary technical glitch, or physical obstruction)..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 sm:p-3.5 text-xs sm:text-[13px] text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
            />

            {/* Note */}
            <p className="text-[11px] sm:text-[12px] text-gray-400 italic mt-2 sm:mt-2.5 mb-4 sm:mb-6">
              Your request will be sent to the department head for approval.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 text-xs sm:text-[13.5px] font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !reason.trim() ||
                  !selectedRole ||
                  !selectedUserId ||
                  !selectedUserName
                }
                className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 text-xs sm:text-[13.5px] font-semibold text-white rounded-lg transition-all ${submitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : reason.trim() && selectedRole && selectedUserId && selectedUserName
                      ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                      : "bg-blue-300 cursor-not-allowed"
                  }`}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>

            {/* Privacy Notice */}
            <div className='mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg'>
              <div className='w-4 h-4 shrink-0 mt-0.5 sm:mt-0'>
                <svg viewBox="0 0 24 24" fill="currentColor" className='text-gray-400'>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <div className='flex flex-col sm:flex-row gap-1 text-center sm:text-left'>
                <strong className='text-xs sm:text-sm'>Having trouble?</strong>
                <p className='text-blue-600 text-xs sm:text-sm cursor-pointer font-medium hover:underline'>Contact System Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManualAttendance