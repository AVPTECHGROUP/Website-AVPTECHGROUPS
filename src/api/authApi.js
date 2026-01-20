import config from "../config/config";

export const loginAPI = ({ email, password }) => {
 console.log("Calling API:", `${config.BASE_URL}/api/v1/auth/login`);


  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (
        email === "superadmin@school.com" &&
        password === "Admin@123"
      ) {
        resolve({
          success: true,
          message: "Login successful",
          data: {
            token: "mock-jwt-token",
            "tokenType": "Bearer",
            "expiresIn": 86400000,
            "user": {
              "id": 6,
              "email": "superadmin@school.com",
              "firstName": "Super",
              "lastName": "Admin",
              "phone": "+1234567890",
              "status": "ACTIVE",
              "emailVerified": true,
              "lastLogin": "2026-01-14T08:26:16.3656544",
              "roles": [
                "SUPER_ADMIN"
              ],
              "permissions": [
                "PAYROLL_CREATE",
                "GRADE_VIEW",
                "STUDENT_DELETE",
                "USER_READ_ALL",
                "GRADE_ASSIGN",
                "TEACHER_READ",
                "USER_UPDATE_ALL",
                "PAYROLL_VIEW",
                "ATTENDANCE_APPROVE",
                "USER_RESET_PASSWORD",
                "GRADE_UPDATE",
                "USER_DELETE_ALL",
                "ATTENDANCE_VIEW",
                "ATTENDANCE_REPORT",
                "LEAVE_VIEW",
                "STUDENT_CREATE",
                "USER_CREATE_ALL",
                "ATTENDANCE_MARK",
                "REPORT_VIEW_ALL",
                "PAYROLL_UPDATE",
                "TEACHER_DELETE",
                "USER_MANAGE_ROLES",
                "STUDENT_READ",
                "TEACHER_UPDATE",
                "TEACHER_CREATE",
                "PAYROLL_APPROVE",
                "LEAVE_CREATE",
                "LEAVE_APPROVE",
                "STUDENT_UPDATE"
              ],
              "profile": {
                "id": 1,
                "employeeId": "ADMIN001",
                "department": "Administration",
                "accessLevel": "SUPER_ADMIN"
              },
              "fullName": "Super Admin"
            }
          },
          "timestamp": "2026-01-14T08:26:16.6508702"
        }
        );
      } else {
        reject({
          success: false,
          message: "Invalid credentials"
        });
      }
    }, 1200);
  });
};
