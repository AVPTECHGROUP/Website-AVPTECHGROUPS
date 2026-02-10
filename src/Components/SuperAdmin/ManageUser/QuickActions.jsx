import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon, Plus } from 'lucide-react';

const QuickActions = () => {
    const navigate = useNavigate();
    const [isAction, setIsAction] = useState('add');

    return (
        <div className="px-3 mb-6">
            <h1 className="text-lg sm:text-xl font-bold mb-5 text-center lg:text-start sm:text-start md:text-start">Quick Actions</h1>

            <div className="flex flex-col sm:flex-row items-center ml-10 lg:ml-0 sm:ml-0 md:ml-0 justify-center sm:items-center gap-3 sm:gap-5 lg:w-fit sm:w-fit w-60">
                {/* Add User Button */}
                <button
                    name='addNewUser'
                    onClick={() => navigate('/dashboard/addUser')}
                    className={`px-4 sm:px-2 py-2.5 w-full border-gray-100 cursor-pointer sm:w-fit rounded-lg font-medium flex items-center justify-center gap-2 transition-all
                                         ${isAction === "add" ? "bg-blue-600 text-white" : "bg-white text-black hover:bg-gray-50"
                        }`}
                >
                    <UserPlusIcon className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Add New User</span>
                </button>


            </div>
        </div>
    );
};

export default QuickActions;