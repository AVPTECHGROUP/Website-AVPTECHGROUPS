import TeacherPayrollSelfView from "./TeacherPayrollselfview.jsx";
import {getCurrUserDetails} from "../../utils/getCurrUserDetails/index.js";

export default function MyPayroll() {
    const currentUser = getCurrUserDetails();
    return <TeacherPayrollSelfView currentUser={currentUser} />;
}