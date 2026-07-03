import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

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
      <Route path={ROUTE_PATHS.ATTENDANCE_MARK_USER} element={<MarkUserAttendance />} />

      {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL */}
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL} />}>
        <Route path={ROUTE_PATHS.ATTENDANCE} element={<Attendance />} />
        <Route path={ROUTE_PATHS.ATTENDANCE_STAFF_IMG_REG} element={<StaffAttendanceRegistration />} />
        <Route path={ROUTE_PATHS.ATTENDANCE_STUDENT_IMG_REG} element={<StudentAttendanceRegistration />} />
        <Route path={ROUTE_PATHS.ATTENDANCE_USERS} element={<UsersAttendance />} />
        <Route path={ROUTE_PATHS.ATTENDANCE_USERS_WARNING} element={<WarningVerificationFailed />} />
        <Route path={ROUTE_PATHS.ATTENDANCE_USERS_MANUAL} element={<ManualAttendance />} />
      </Route>

      {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, TEACHER */}
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL_TEACHER} />}>
        <Route path={ROUTE_PATHS.ATTENDANCE_STUDENT} element={<StudentAttendance />} />
      </Route>
    </>
  );
}
