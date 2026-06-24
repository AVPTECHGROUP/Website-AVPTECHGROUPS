import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon, Plus, KeyIcon,Upload } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS as P } from '../../../Constants/Permission';

const QuickActions = ({ teacherId, onResetPassword, onExportCSV }) => {
  const navigate = useNavigate();
  const [disablebtn, setDisablebtn] = useState(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    setDisablebtn(teacherId);
  }, [teacherId]);

  const hasSelection = disablebtn !== null;

  return (
    <div className="px-3 mb-3 pt-0 sm:pt-0 lg:pt-0">
      <h1 className="text-lg sm:text-xl font-bold mb-2 text-center lg:text-start sm:text-start md:text-start">
        Quick Actions
      </h1>

      <div className="flex flex-col sm:flex-row items-center ml-10 lg:ml-0 sm:ml-0 md:ml-0 justify-center sm:items-center gap-3 sm:gap-5 lg:w-fit sm:w-fit w-60">

        {/* Add Teacher*/}
        <button
          onClick={() => navigate('/teachers/addTeacher')}
          className="px-4 sm:px-5 py-2.5 w-full sm:w-fit rounded-lg font-medium flex items-center justify-center gap-2 transition-all bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span className="text-sm md:text-sm sm:text-base">Add Teacher</span>
        </button>

        {/* Assign Subjects — requires TEACHER_EDIT */}
        {hasPermission(P.TEACHER_EDIT) && (
          <button
            disabled={!hasSelection}
            title={!hasSelection ? 'Select one teacher' : ''}
            onClick={() => navigate(`/teachers/classAssignment/${teacherId}`)}
            className={`flex px-4 sm:px-5 py-2.5 rounded-lg w-full sm:w-fit flex-row gap-2 text-[13px] sm:text-[14px] font-bold justify-center transition-all
              ${hasSelection
                ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }`}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Assign Subjects</span>
          </button>
        )}

        {/* Reset Password — requires USER_EDIT */}
        {hasPermission(P.USER_EDIT) && (
          <button
            disabled={!hasSelection}
            title={!hasSelection ? 'Select a teacher row first' : 'Reset password for selected teacher'}
            onClick={() => hasSelection && onResetPassword?.()}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg w-full sm:w-fit text-[13px] sm:text-[14px] font-bold justify-center transition-all
              ${hasSelection
                ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }`}
          >
            <KeyIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Reset Password</span>
          </button>
        )}

        {/* Export CSV Button (FIXED: Triggers current active page sync export handler) */}
        <button
          onClick={onExportCSV}
          className="px-4 sm:px-5 py-2.5 w-full sm:w-fit rounded-lg font-semibold flex items-center justify-center gap-2 transition-all bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 cursor-pointer active:scale-95 shadow-2xs"
        >
          <Upload className="w-5 h-5 text-gray-500" />
          <span className="text-sm sm:text-base">Export CSV</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;