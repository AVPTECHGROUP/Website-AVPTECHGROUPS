import React, { useState } from 'react';
import {
    Plus,
    Wallet,
    Calendar,
    AlertTriangle,
    RotateCcw,
    IndianRupee
} from 'lucide-react';

// ─── Reusable error text ──────────────────────────────────────────────────────
const ErrorText = ({ msg }) =>
    msg ? (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {msg}
        </p>
    ) : null;

// ─────────────────────────────────────────────────────────────────────────────

const AddSalaryDetails = ({ formData, setFormData, handleInputChange, errors = {}, setSalaryErrors }) => {

    const [allowances, setAllowances] = useState([]);
    const [penalties, setPenalties] = useState([]);
    const [leaveDeductionEnabled, setLeaveDeductionEnabled] = useState(true);
    const [showAddAllowanceForm, setShowAddAllowanceForm] = useState(false);
    const [showAddPenaltyForm, setShowAddPenaltyForm] = useState(false);
    const [newAllowance, setNewAllowance] = useState({ name: '', amount: '' });
    const [newPenalty, setNewPenalty] = useState({ name: '', amount: '' });

    const ALLOWANCE_OPTIONS = [
        'houseRentAllowance',
        'travelAllowance',
        'dearnessAllowance',
        'specialAllowance',
        'otherAllowances',
        'providentFund'
    ];

    const ALLOWANCE_LABELS = {
        houseRentAllowance: "House Rent Allowance",
        travelAllowance: "Travel Allowance",
        dearnessAllowance: "Dearness Allowance",
        specialAllowance: "Special Allowance",
        otherAllowances: "Other Allowances",
        providentFund: "Provident Fund"
    };

    const DEDUCTION_OPTIONS = [
        { label: 'Professional Tax', key: 'professionalTax' },
        { label: 'Income Tax', key: 'incomeTax' },
        { label: 'Other Deductions', key: 'otherDeductions' },
    ];

    const calculateNet = () => {
        const base = parseFloat(formData.baseSalary) || 0;
        const allowanceTotal = allowances.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
        const penaltyTotal = penalties.reduce((sum, p) => sum + Math.abs(parseFloat(p.amount || 0)), 0);
        const leaveDeduction = parseFloat(formData.leaveDeductionPerDay) || 0;
        return base + allowanceTotal - penaltyTotal - leaveDeduction;
    };

    const getAvailableAllowances = () => {
        const addedNames = allowances.map(a => a.name);
        return ALLOWANCE_OPTIONS.filter(option => !addedNames.includes(option));
    };

    const getAvailableDeductions = () => {
        const selectedKeys = penalties.map(p => p.key);
        return DEDUCTION_OPTIONS.filter(option => !selectedKeys.includes(option.key));
    };

    const handleAddAllowance = (e) => {
        e.preventDefault();
        if (!newAllowance.name || !newAllowance.amount) return;
        const amount = parseFloat(newAllowance.amount);
        setAllowances(prev => [...prev, { id: Date.now(), name: newAllowance.name, amount }]);
        setFormData(prev => ({ ...prev, [newAllowance.name]: amount }));
        setNewAllowance({ name: '', amount: '' });
        setShowAddAllowanceForm(false);
    };

    const handleAddPenalty = (e) => {
        e.preventDefault();
        if (!newPenalty.name || !newPenalty.amount) return;
        const selected = DEDUCTION_OPTIONS.find(o => o.key === newPenalty.name);
        if (!selected) return;
        const amount = Math.abs(parseFloat(newPenalty.amount));
        setPenalties(prev => [...prev, { id: Date.now(), key: selected.key, label: selected.label, amount }]);
        setFormData(prev => ({ ...prev, [selected.key]: amount }));
        setNewPenalty({ name: '', amount: '' });
        setShowAddPenaltyForm(false);
    };

    const handleDeleteAllowance = (id, name) => {
        setAllowances(prev => prev.filter(a => a.id !== id));
        setFormData(prev => ({ ...prev, [name]: 0 }));
    };

    const handleDeletePenalty = (id, key) => {
        setPenalties(prev => prev.filter(p => p.id !== id));
        setFormData(prev => ({ ...prev, [key]: 0 }));
    };

    const handleReset = () => {
        setAllowances([]);
        setPenalties([]);
        setNewAllowance({ name: '', amount: '' });
        setNewPenalty({ name: '', amount: '' });
        setFormData(prev => ({
            ...prev,
            salaryType: 'MONTHLY',
            baseSalary: '',
            leaveDeductionPerDay: '',
            lateArrivalPenalty: '',
            houseRentAllowance: 0,
            travelAllowance: 0,
            dearnessAllowance: 0,
            specialAllowance: 0,
            otherAllowances: 0,
            providentFund: 0,
            professionalTax: 0,
            incomeTax: 0,
            otherDeductions: 0,
        }));
        setSalaryErrors?.({});
        setLeaveDeductionEnabled(true);
        setShowAddAllowanceForm(false);
        setShowAddPenaltyForm(false);
    };

    // Clear individual salary errors on change
    const handleBaseSalaryChange = (e) => {
        setFormData(prev => ({ ...prev, baseSalary: e.target.value }));
        if (e.target.value && Number(e.target.value) > 0) {
            setSalaryErrors?.(prev => ({ ...prev, baseSalary: '' }));
        }
    };

    const handleSalaryTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, salaryType: type }));
        setSalaryErrors?.(prev => ({ ...prev, salaryType: '' }));
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            {/* Header */}
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

                {/* ── Left Column ────────────────────────────────────────────────── */}
                <div className="col-span-2 space-y-6">

                    {/* Core Compensation */}
                    <div className={`bg-white rounded-xl shadow-sm border p-6 ${errors?.salaryType || errors?.baseSalary ? 'border-red-300' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Core Compensation</h2>
                            {(errors?.salaryType || errors?.baseSalary) && (
                                <span className="ml-auto text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                    Required
                                </span>
                            )}
                        </div>

                        <div className="space-y-6">

                            {/* Salary Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    SALARY TYPE <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleSalaryTypeSelect('MONTHLY')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-colors border-2 ${formData.salaryType === 'MONTHLY'
                                            ? 'bg-blue-50 text-blue-700 border-blue-500'
                                            : errors?.salaryType
                                                ? 'bg-red-50 text-red-600 border-red-300 hover:border-red-400'
                                                : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'
                                            }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSalaryTypeSelect('PER_DAY')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-colors border-2 ${formData.salaryType === 'PER_DAY'
                                            ? 'bg-blue-50 text-blue-700 border-blue-500'
                                            : errors?.salaryType
                                                ? 'bg-red-50 text-red-600 border-red-300 hover:border-red-400'
                                                : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'
                                            }`}
                                    >
                                        Per Day
                                    </button>
                                </div>
                                <ErrorText msg={errors?.salaryType} />
                            </div>

                            {/* Base Salary */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    BASE SALARY AMOUNT <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        name="baseSalary"
                                        type="number"
                                        min="0"
                                        value={formData.baseSalary}
                                        onChange={handleBaseSalaryChange}
                                        placeholder="0"
                                        className={`w-full pl-8 pr-32 py-3 border-2 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 transition-colors ${errors?.baseSalary
                                            ? 'border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            }`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                        {formData.salaryType === 'PER_DAY' ? 'INR / DAY' : 'INR / MONTH'}
                                    </span>
                                </div>
                                <ErrorText msg={errors?.baseSalary} />
                            </div>
                        </div>
                    </div>

                    {/* Leave Deduction Rules */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Leave Deduction Rules</h2>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={leaveDeductionEnabled}
                                    onChange={(e) => {
                                        setLeaveDeductionEnabled(e.target.checked);
                                        if (!e.target.checked) {
                                            setFormData(prev => ({ ...prev, leaveDeductionPerDay: '', lateArrivalPenalty: '' }));
                                        }
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-12 p-0.5 px-1 shadow h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    UNPAID LEAVE (DAILY)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        name="leaveDeductionPerDay"
                                        value={formData.leaveDeductionPerDay}
                                        onChange={handleInputChange}
                                        disabled={!leaveDeductionEnabled}
                                        min="0"
                                        placeholder="0"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    LATE ARRIVAL PENALTY
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        name="lateArrivalPenalty"
                                        value={formData.lateArrivalPenalty || ''}
                                        onChange={handleInputChange}
                                        disabled={!leaveDeductionEnabled}
                                        min="0"
                                        placeholder="0"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Deducted per 15 minutes of delay</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Column ────────────────────────────────────────────────── */}
                <div className="space-y-6">

                    {/* Allowances */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Allowances</h3>
                            <button
                                type="button"
                                onClick={() => setShowAddAllowanceForm(!showAddAllowanceForm)}
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                Add New
                            </button>
                        </div>

                        <div className="space-y-3">
                            {showAddAllowanceForm && (
                                <div className="bg-white p-3 sm:p-4 rounded-md shadow-sm space-y-3 border border-blue-200">
                                    {getAvailableAllowances().length > 0 ? (
                                        <>
                                            <select
                                                value={newAllowance.name}
                                                onChange={(e) => setNewAllowance(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full border-2 border-gray-300 px-2 py-2 text-sm outline-none rounded-sm focus:border-blue-500"
                                            >
                                                <option value="" disabled>Select allowance</option>
                                                {getAvailableAllowances().map(option => (
                                                    <option key={option} value={option}>{ALLOWANCE_LABELS[option]}</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2 border-2 border-gray-300 px-2 py-1">
                                                <span className="text-gray-500 text-xl">₹</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={newAllowance.amount}
                                                    onChange={(e) => setNewAllowance(prev => ({ ...prev, amount: e.target.value }))}
                                                    placeholder="0.00"
                                                    className="w-full text-sm outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={handleAddAllowance} className="flex-1 bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600 transition">Add</button>
                                                <button type="button" onClick={() => setShowAddAllowanceForm(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 text-sm rounded hover:bg-gray-400 transition">Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-sm text-gray-500 py-4">All allowances have been added</div>
                                    )}
                                </div>
                            )}

                            {allowances.length === 0 && !showAddAllowanceForm && (
                                <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                                    No allowances added yet
                                </p>
                            )}

                            {allowances.map((allowance) => (
                                <div key={allowance.id} className="flex items-center justify-between gap-4 p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition">
                                    <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center shrink-0">
                                        <IndianRupee className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm truncate">{ALLOWANCE_LABELS[allowance.name]}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="font-semibold text-gray-900 text-sm">₹{allowance.amount.toLocaleString()}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAllowance(allowance.id, allowance.name)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 transition"
                                        >✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Penalties */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Active Penalties</h3>
                            <button
                                type="button"
                                onClick={() => setShowAddPenaltyForm(!showAddPenaltyForm)}
                                className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>

                        <div className="space-y-3">
                            {showAddPenaltyForm && (
                                <div className="bg-white p-3 sm:p-4 rounded-md shadow-sm space-y-3 border border-red-200">
                                    {getAvailableDeductions().length > 0 ? (
                                        <>
                                            <select
                                                value={newPenalty.name}
                                                onChange={(e) => setNewPenalty(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full border-2 border-gray-300 px-2 py-2 text-sm outline-none rounded-sm focus:border-red-500"
                                            >
                                                <option value="" disabled>Select deduction</option>
                                                {getAvailableDeductions().map(option => (
                                                    <option key={option.key} value={option.key}>{option.label}</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2 border-2 border-gray-300 px-2 py-1">
                                                <span className="text-gray-500 text-xl">₹</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={newPenalty.amount}
                                                    onChange={(e) => setNewPenalty(prev => ({ ...prev, amount: e.target.value }))}
                                                    className="w-full text-sm outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={handleAddPenalty} className="flex-1 bg-red-500 text-white px-4 py-2 text-sm rounded hover:bg-red-600 transition">Add</button>
                                                <button type="button" onClick={() => setShowAddPenaltyForm(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 text-sm rounded hover:bg-gray-400 transition">Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-sm text-gray-500 py-4">All deductions have been added</div>
                                    )}
                                </div>
                            )}

                            {penalties.length === 0 && !showAddPenaltyForm && (
                                <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                                    No penalties added yet
                                </p>
                            )}

                            {penalties.map((penalty) => (
                                <div key={penalty.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                                        <RotateCcw className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 text-sm">{penalty.label}</div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="font-semibold text-red-600">-₹{penalty.amount.toLocaleString()}</div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePenalty(penalty.id, penalty.key)}
                                            className="text-red-400 hover:text-red-600 text-sm transition-colors"
                                        >✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Net Estimate */}
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 my-6">
                        <div className="text-sm font-medium text-blue-700 mb-2">TOTAL ESTIMATED NET</div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            ₹{calculateNet().toLocaleString()}
                            <span className="text-lg font-normal text-gray-600">
                                {formData.salaryType === 'PER_DAY' ? '/day' : '/month'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600">After all active allowances and average penalties are applied</p>
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-sm text-orange-800">
                    <strong>Attention:</strong> Changes made to the salary structure will only apply to future payroll cycles. Current processing cycles will remain unaffected.
                </p>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 text-xs lg:text-base border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default AddSalaryDetails;