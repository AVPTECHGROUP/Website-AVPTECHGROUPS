import React, { useState } from 'react';
import { Plus } from 'lucide-react';

// Icon components mapping
const ICONS = {
    allowance: 'fa-solid fa-square-h text-blue-600',
    transport: 'fa-solid fa-bus text-blue-600',
    penalty: 'fa-solid fa-clock-rotate-left text-orange-400',
    wallet: 'fa-solid fa-wallet',
    calendar: 'fa-solid fa-calendar-days',
    warning: 'fa-solid fa-triangle-exclamation'
};

export default function TeacherSalaryConfig() {
    const [salaryType, setSalaryType] = useState('monthly');
    const [baseSalary, setBaseSalary] = useState('15000');
    const [leaveDeductionEnabled, setLeaveDeductionEnabled] = useState(true);
    const [unpaidLeave, setUnpaidLeave] = useState('0.00');
    const [lateArrivalPenalty, setLateArrivalPenalty] = useState('0.00');
    const [showAddAllowanceForm, setShowAddAllowanceForm] = useState(false);
    const [showAddPenaltyForm, setShowAddPenaltyForm] = useState(false);

    const [allowances, setAllowances] = useState([
        { id: 1, name: 'HRA Allowance', category: 'Fixed Monthly', amount: 8000, iconClass: ICONS.allowance },
        { id: 2, name: 'Transport Stipend', category: 'Fuel & Transit', amount: 2000, iconClass: ICONS.transport }
    ]);

    const [penalties, setPenalties] = useState([
        { id: 1, name: 'Late Mark', occurrences: '3 occurrences/mo', amount: -750, iconClass: ICONS.penalty }
    ]);

    const calculateNet = () => {
        const base = parseFloat(baseSalary) || 0;
        const allowanceTotal = allowances.reduce((sum, a) => sum + a.amount, 0);
        const penaltyTotal = penalties.reduce((sum, p) => sum + p.amount, 0);
        return base + allowanceTotal + penaltyTotal;
    };

    const handleAddAllowance = (e) => {
        e.preventDefault();
        setAllowances([
            ...allowances,
            {
                id: allowances.length + 1,
                name: e.target.name.value,
                category: e.target.category.value,
                amount: parseFloat(e.target.amount.value) || 0,
                iconClass: ICONS.allowance
            }
        ]);
        e.target.reset();
        setShowAddAllowanceForm(false);
    };

    const handleAddPenalty = (e) => {
        e.preventDefault();
        setPenalties([
            ...penalties,
            {
                id: Math.max(...penalties.map(p => p.id), 0) + 1,
                name: e.target.name.value,
                occurrences: e.target.occurrences.value,
                amount: -Math.abs(parseFloat(e.target.amount.value) || 0),
                iconClass: ICONS.penalty
            }
        ]);
        e.target.reset();
        setShowAddPenaltyForm(false);
    };

    const handleDeleteAllowance = (id) => {
        setAllowances(allowances.filter(a => a.id !== id));
    };

    const handleDeletePenalty = (id) => {
        setPenalties(penalties.filter(p => p.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teacher Salary Configuration</h1>
                        <span className="bg-green-100 border border-green-200 shadow-xs text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-fit">
                            ELIGIBLE
                        </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">Configure monthly and daily payroll rules for faculty members.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Core Compensation & Leave Rules */}
                    <div className="col-span-2 space-y-6">
                        {/* Core Compensation */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600"><i className={`fa-solid fa-wallet`}></i></span>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Core Compensation</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">SALARY TYPE</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setSalaryType('monthly')}
                                            className={`py-3 px-4 rounded-lg font-medium transition-colors ${salaryType === 'monthly'
                                                ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                                                : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                                                }`}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            onClick={() => setSalaryType('perday')}
                                            className={`py-3 px-4 rounded-lg font-medium transition-colors ${salaryType === 'perday'
                                                ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                                                : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                                                }`}
                                        >
                                            Per Day
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">BASE SALARY AMOUNT</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="text"
                                            value={baseSalary}
                                            onChange={(e) => setBaseSalary(e.target.value)}
                                            className="w-full pl-8 pr-24 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">INR / MONTH</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Calculated based on a 22-day working month</p>
                                </div>
                            </div>
                        </div>

                        {/* Leave Deduction Rules */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                        <span className="text-red-600"><i className={`fa-solid fa-calendar-days`}></i></span>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Leave Deduction Rules</h2>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={leaveDeductionEnabled}
                                        onChange={(e) => setLeaveDeductionEnabled(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-12 p-0.5 px-1 shadow h-6 bg-gray-200 peer-focus:outline-none  rounded-full peer peer-checked:after:translate-x-full  after:absolute after:bg-white  after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">UNPAID LEAVE (DAILY)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="text"
                                            value={unpaidLeave}
                                            onChange={(e) => setUnpaidLeave(e.target.value)}
                                            disabled={!leaveDeductionEnabled}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">LATE ARRIVAL PENALTY</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="text"
                                            value={lateArrivalPenalty}
                                            onChange={(e) => setLateArrivalPenalty(e.target.value)}
                                            disabled={!leaveDeductionEnabled}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Deducted per 15 minutes of delay</p>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Right Column - Allowances & Penalties */}
                    <div className="space-y-6">
                        {/* Allowances */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">Allowances</h3>
                                <button
                                    onClick={() => setShowAddAllowanceForm(!showAddAllowanceForm)}
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                            </div>

                            <div className="space-y-3">
                                {showAddAllowanceForm && (
                                    <form onSubmit={handleAddAllowance} className="bg-white p-3 sm:p-4 rounded-md shadow-sm space-y-3 border border-blue-200">
                                        <input
                                            name="name"
                                            required
                                            placeholder="Allowance name"
                                            className="w-full border-b-2 border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
                                        />
                                        <div className="flex sm:flex-row gap-2">
                                            
                                                <span className=" text-gray-500 text-xl">₹</span>
                                                 <input
                                                name="amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                required
                                                placeholder="0.00"
                                                className="w-full sm:w-1/2 border-2 border-gray-300 px-2 py-1 text-sm outline-none rounded-sm focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />

                                            <input
                                                name="category"
                                                required
                                                placeholder="Category"
                                                className="w-full border-b-2 border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="flex-1 sm:flex-none bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600 transition">
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddAllowanceForm(false)}
                                                className="flex-1 sm:flex-none bg-gray-300 text-gray-700 px-4 py-2 text-sm rounded hover:bg-gray-400 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {allowances.map((allowance) => (
                                    <div key={allowance.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="text-xl"><i className={allowance.iconClass}></i></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 text-sm">{allowance.name}</div>
                                            <div className="text-xs text-gray-500">{allowance.category}</div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="font-semibold text-gray-900">₹{allowance.amount.toLocaleString()}</div>
                                            <button
                                                onClick={() => handleDeleteAllowance(allowance.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Penalties */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="flex  sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                                <h3 className="font-semibold text-base sm:text-base text-gray-900">Active Penalties</h3>
                                <button
                                    onClick={() => setShowAddPenaltyForm(!showAddPenaltyForm)}
                                    className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs sm:text-sm font-medium cursor-pointer w-fit" >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            </div>

                            <div className="space-y-3">
                                {showAddPenaltyForm && (
                                    <form onSubmit={handleAddPenalty} className="bg-white p-3 sm:p-4 rounded-md shadow-sm space-y-3 border border-red-200">
                                        <input
                                            name="name"
                                            required
                                            placeholder="Penalty name"
                                            className="w-full border-b-2 border-gray-300 px-2 py-1 text-sm outline-none focus:border-red-500"
                                        />
                                        <div className="flex sm:flex-row gap-2">
                                            <span className=" text-gray-500 text-xl">₹</span>
                                                 <input
                                                name="amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                required
                                                placeholder="0.00"
                                                className="w-full sm:w-1/2 border-2 border-gray-300 px-2 py-1 text-sm outline-none rounded-sm focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                            <input
                                                name="occurrences"
                                                required
                                                placeholder="Occurrences"
                                                className="w-full border-b-2 border-gray-300 px-2 py-1 text-sm outline-none focus:border-red-500"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 text-sm rounded hover:bg-red-600 transition">
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddPenaltyForm(false)}
                                                className="flex-1 sm:flex-none bg-gray-300 text-gray-700 px-4 py-2 text-sm rounded hover:bg-gray-400 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {penalties.map((penalty) => (
                                    <div key={penalty.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="text-xl"><i className={penalty.iconClass}></i></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 text-sm">{penalty.name}</div>
                                            <div className="text-xs text-gray-500">{penalty.occurrences}</div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="font-semibold text-red-600">-₹{Math.abs(penalty.amount).toLocaleString()}</div>
                                            <button
                                                onClick={() => handleDeletePenalty(penalty.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    {/* Total Estimated Net */}
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 my-6">
                        <div className="text-sm font-medium text-blue-700 mb-2">TOTAL ESTIMATED NET</div>
                        <div className="text-3xl font-bold text-black-900 mb-1">
                            ₹{calculateNet().toLocaleString()}
                            <span className="text-lg font-normal text-gray-700">/mo</span>
                        </div>
                        <p className="text-xs text-gray-600">After all active allowances and average penalties are applied</p>
                    </div>
                    </div>
                   

                </div>
                {/* Warning Banner */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4 flex items-center gap-3">
                    <span className="text-yellow-600 text-xl shrink-0"><i className={ICONS.warning}></i></span>
                    <p className="text-sm text-orange-800">
                        <strong>Attention:</strong> Changes made to the salary structure will only apply to future payroll cycles. Current processing cycles will remain unaffected.
                    </p>
                </div>
                {/* Bottom Actions */}
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={()=>{
                        setAllowances([]);setPenalties([]);setBaseSalary('0.00');setUnpaidLeave('0.00');setLateArrivalPenalty('0.00');
                    }} className="px-6 py-3 text-xs lg:text-base border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                        Reset
                    </button>
                    <button className="px-6 py-3 text-xs lg:text-base bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}