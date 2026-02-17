import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon, Plus } from 'lucide-react';

const QuickActions = ({ buttonText = '', navigateTo = '' }) => {
    const navigate = useNavigate();
    const [isAction, setIsAction] = useState('add');

    return (
        <div className="rounded-xl p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
                {/* Add User Button */}
                <button
                    onClick={() => navigate(navigateTo)}
                    className={`px-4 sm:px-2 py-2.5 w-full border-gray-100 cursor-pointer sm:w-fit rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                        isAction === "add"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-black hover:bg-gray-50"
                    }`}
                >
                    <UserPlusIcon className="w-5 h-5" />
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default QuickActions;