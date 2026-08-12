import TeacherPayrollSelfView from "./TeacherPayrollselfview.jsx";
import { getCurrUserDetails } from '../../utils/GetCurrUserDetails';

export default function MyPayroll() {
    const currentUser = getCurrUserDetails();
    return <TeacherPayrollSelfView currentUser={currentUser} />;
}