import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const Attendance = lazy(() => import('../../Pages/Attendance/Attendance'));
const UsersAttendance = lazy(() => import('../../Pages/Attendance/UsersAttendance'));
const MarkUserAttendance = lazy(() => import('../../Pages/Attendance/MarkUserAttendance'));
const WarningVerificationFailed = lazy(() => import('../../Components/UserAttendance/WarningVerificationFailed'));
const ManualAttendance = lazy(() => import('../../Components/UserAttendance/ManualAttendanceRequest'));
const StudentAttendance = lazy(() => import('../../Pages/Attendance/StudentAttendance/StudentAttendance'));
const StaffAttendanceRegistration = lazy(() => import('../../Pages/Attendance/StaffAttendanceRegistration'));
const StudentAttendanceRegistration = lazy(() => import('../../Pages/Attendance/StudentAttendanceRegistration'));

export default function AttendanceRoutes() {
  return (
  <>
    {/* Available to all authenticated users */}
    <Route path="/attendance/markUserAttendance" element={<MarkUserAttendance />} />

    {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL */}
    <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/attendance/staffImgReg" element={<StaffAttendanceRegistration />} />
      <Route path="/attendance/studentImgReg" element={<StudentAttendanceRegistration />} />
      <Route path="/attendance/usersAttendance" element={<UsersAttendance />} />
      <Route path="/attendance/usersAttendance/warning" element={<WarningVerificationFailed />} />
      <Route path="/attendance/usersAttendance/manual" element={<ManualAttendance />} />
    </Route>

    {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, TEACHER */}
    <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
      <Route path="/attendance/studentAttendance" element={<StudentAttendance />} />
    </Route>
  </>
  );
}

