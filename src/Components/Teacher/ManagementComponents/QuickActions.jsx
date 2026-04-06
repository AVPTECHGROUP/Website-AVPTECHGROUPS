import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon, Plus, KeyIcon } from 'lucide-react';

const QuickActions = ({ teacherId, onResetPassword }) => {
  const navigate = useNavigate();
  const [disablebtn, setDisablebtn] = useState(null);

  useEffect(() => {
    setDisablebtn(teacherId);
  }, [teacherId]);

  const hasSelection = disablebtn !== null;

  return (
    <div className="px-3 mb-6">
      <h1 className="text-lg sm:text-xl font-bold mb-5 text-center lg:text-start sm:text-start md:text-start">
        Quick Actions
      </h1>

      <div className="flex flex-col sm:flex-row items-center ml-10 lg:ml-0 sm:ml-0 md:ml-0 justify-center sm:items-center gap-3 sm:gap-5 lg:w-fit sm:w-fit w-60">

        {/* Add Teacher*/}
        <button
          onClick={() => navigate('/teachers/addTeacher')}
          className="px-4 sm:px-5 py-2.5 w-full sm:w-fit rounded-lg font-medium flex items-center justify-center gap-2 transition-all bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span className="text-sm sm:text-base">Add Teacher</span>
        </button>

        {/* Assign Subjects*/}
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

        {/* Reset Password*/}
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

      </div>
    </div>
  );
};

export default QuickActions;