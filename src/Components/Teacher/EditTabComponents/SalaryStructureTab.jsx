import React, { useState, useEffect } from 'react';
import {
    Plus,
    Wallet,
    Calendar,
    AlertTriangle,
    RotateCcw,
    IndianRupee
} from 'lucide-react';
import { getTeacherSalary } from '../../../Api/Teachers/TeachersAPI';

const SalaryStructureTab = ({ formData, setFormData, handleInputChange, teacherId }) => {

    const [allowances, setAllowances] = useState([]);
    const [penalties, setPenalties] = useState([]);
    const [leaveDeductionEnabled, setLeaveDeductionEnabled] = useState(true);
    const [showAddAllowanceForm, setShowAddAllowanceForm] = useState(false);
    const [showAddPenaltyForm, setShowAddPenaltyForm] = useState(false);
    const [newAllowance, setNewAllowance] = useState({ name: '', amount: '' });
    const [newPenalty, setNewPenalty] = useState({ name: '', amount: '' });
    const [isSalaryLoading, setIsSalaryLoading] = useState(true);

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
        { label: 'Income Tax',       key: 'incomeTax' },
        { label: 'Other Deductions', key: 'otherDeductions' },
    ];

    // ✅ FIX: block '-', '+', 'e', 'E' so amounts can never be typed as negative or
    // in scientific notation. Applied to every amount input below (allowance amount
    // was previously missing ANY guard at all — that's how "-500" got through and
    // was then ADDED into the net total, silently subtracting it).
    const blockNonPositiveKeys = (e) => {
        if (["-", "+", "e", "E"].includes(e.key)) {
            e.preventDefault();
        }
    };

    // ✅ FIX: strip any '-', '+', 'e' that slips in via paste/autofill/drag-drop,
    // which onKeyDown alone can't catch.
    const sanitizeAmountInput = (value) => value.replace(/[-+eE]/g, '');

    useEffect(() => {
        if (!teacherId) return;

        const fetchSalary = async () => {
            setIsSalaryLoading(true);
            try {
                const data = await getTeacherSalary(teacherId);
                if (!data) return;

                setFormData(prev => ({
                    ...prev,
                    salaryId:             data.id,
                    salaryType:           data.salaryType           || '',
                    baseSalary:           data.baseSalary           || '',
                    houseRentAllowance:   data.houseRentAllowance   || 0,
                    travelAllowance:      data.travelAllowance      || 0,
                    dearnessAllowance:    data.dearnessAllowance    || 0,
                    specialAllowance:     data.specialAllowance     || 0,
                    otherAllowances:      data.otherAllowances      || 0,
                    providentFund:        data.providentFund        || 0,
                    professionalTax:      data.professionalTax      || 0,
                    incomeTax:            data.incomeTax            || 0,
                    otherDeductions:      data.otherDeductions      || 0,
                    leaveDeductionPerDay: data.leaveDeductionPerDay || 0,
                }));

                const loadedAllowances = ALLOWANCE_OPTIONS
                    .filter(key => data[key] > 0)
                    .map(key => ({
                        id: key,
                        name: key,
                        amount: parseFloat(data[key])
                    }));
                setAllowances(loadedAllowances);

                const loadedPenalties = DEDUCTION_OPTIONS
                    .filter(opt => data[opt.key] > 0)
                    .map(opt => ({
                        id: opt.key,
                        key: opt.key,
                        label: opt.label,
                        amount: parseFloat(data[opt.key])
                    }));
                setPenalties(loadedPenalties);

                setLeaveDeductionEnabled(data.leaveDeductionPerDay > 0);

            } catch (error) {
                console.error("Failed to load salary", error);
            } finally {
                setIsSalaryLoading(false);
            }
        };

        fetchSalary();
    }, [teacherId]);

    // ✅ FIX: leaveDeductionPerDay is a daily RATE used during payroll processing,
    // not a fixed monthly deduction — exclude it from the config-time net estimate.
    const calculateNet = () => {
        const base           = parseFloat(formData.baseSalary) || 0;
        const allowanceTotal = allowances.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
        const penaltyTotal   = penalties.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        return base + allowanceTotal - penaltyTotal;
    };

    const getAvailableAllowances = () => {
        const addedNames = allowances.map(a => a.name);
        return ALLOWANCE_OPTIONS.filter(opt => !addedNames.includes(opt));
    };

    const getAvailableDeductions = () => {
        const selectedKeys = penalties.map(p => p.key);
        return DEDUCTION_OPTIONS.filter(opt => !selectedKeys.includes(opt.key));
    };

    const handleAddAllowance = (e) => {
        e.preventDefault();
        if (!newAllowance.name || !newAllowance.amount) return;
        // ✅ FIX: force a non-negative amount even if a negative value somehow reaches
        // here (paste, autofill, or browser quirks bypassing onKeyDown), and reject
        // a zero/invalid amount outright instead of silently adding a 0-value row.
        const amount = Math.abs(parseFloat(newAllowance.amount)) || 0;
        if (amount <= 0) return;
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
            salaryType:           '',
            baseSalary:           '',
            leaveDeductionPerDay: 0,
            houseRentAllowance:   0,
            travelAllowance:      0,
            dearnessAllowance:    0,
            specialAllowance:     0,
            otherAllowances:      0,
            providentFund:        0,
            professionalTax:      0,
            incomeTax:            0,
            otherDeductions:      0,
        }));
        setLeaveDeductionEnabled(true);
        setShowAddAllowanceForm(false);
        setShowAddPenaltyForm(false);
    };

    if (isSalaryLoading) {
        return (
            <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading salary details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-0 py-2 sm:py-4">

            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                        Teacher Salary Configuration
                    </h1>
                    <span className="bg-green-100 border border-green-200 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 mt-0.5">
                        ELIGIBLE
                    </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                    Configure monthly and daily payroll rules for faculty members.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">

                {/* ── Left Column ────────────────────────────────────────────────── */}
                <div className="col-span-1 xl:col-span-2 space-y-4">

                    {/* Core Compensation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-4 sm:mb-5">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Core Compensation</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Salary Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2 tracking-widest uppercase">
                                    Salary Type
                                </label>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, salaryType: 'MONTHLY' }))}
                                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors border-2 ${formData.salaryType === 'MONTHLY'
                                            ? 'bg-blue-50 text-blue-700 border-blue-500'
                                            : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, salaryType: 'PER_DAY' }))}
                                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors border-2 ${formData.salaryType === 'PER_DAY'
                                            ? 'bg-blue-50 text-blue-700 border-blue-500'
                                            : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        Per Day
                                    </button>
                                </div>
                            </div>

                            {/* Base Salary */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2 tracking-widest uppercase">
                                    Base Salary Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                                    <input
                                        name="baseSalary"
                                        type="number"
                                        min="0"
                                        onKeyDown={blockNonPositiveKeys}
                                        value={formData.baseSalary}
                                        onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: sanitizeAmountInput(e.target.value) }))}
                                        placeholder="0"
                                        className="w-full pl-8 pr-24 sm:pr-28 py-2.5 border border-gray-300 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium whitespace-nowrap">
                                        {formData.salaryType === 'PER_DAY' ? '/ DAY' : '/ MONTH'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leave Deduction Rules */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                                </div>
                                <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Leave Deduction Rules</h2>
                            </div>
                            {/* Toggle */}
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                                <input
                                    type="checkbox"
                                    checked={leaveDeductionEnabled}
                                    onChange={(e) => {
                                        setLeaveDeductionEnabled(e.target.checked);
                                        if (!e.target.checked) {
                                            setFormData(prev => ({ ...prev, leaveDeductionPerDay: 0 }));
                                        }
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full relative peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                            </label>
                        </div>

                        {/* Stack always on narrow, side-by-side when card has room */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-widest uppercase">
                                    Unpaid Leave / Day
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                    <input
                                        type="number"
                                        name="leaveDeductionPerDay"
                                        onKeyDown={blockNonPositiveKeys}
                                        value={formData.leaveDeductionPerDay}
                                        onChange={handleInputChange}
                                        disabled={!leaveDeductionEnabled}
                                        min="0"
                                        placeholder="0"
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Applied per absent day at payroll</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-widest uppercase">
                                    Late Arrival / 15 min
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                    <input
                                        type="number"
                                        name="lateArrivalPenalty"
                                        onKeyDown={blockNonPositiveKeys}
                                        value={formData.lateArrivalPenalty || ''}
                                        onChange={handleInputChange}
                                        disabled={!leaveDeductionEnabled}
                                        min="0"
                                        placeholder="0"
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Deducted per 15 min delay</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Column ────────────────────────────────────────────────── */}
                <div className="col-span-1 space-y-4">

                    {/* Allowances */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-sm">Allowances</h3>
                            <button
                                type="button"
                                onClick={() => setShowAddAllowanceForm(!showAddAllowanceForm)}
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add New
                            </button>
                        </div>

                        <div className="space-y-2">
                            {showAddAllowanceForm && (
                                <div className="bg-gray-50 p-3 rounded-lg space-y-2.5 border border-blue-200">
                                    {getAvailableAllowances().length > 0 ? (
                                        <>
                                            <select
                                                value={newAllowance.name}
                                                onChange={(e) => setNewAllowance(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full border border-gray-300 px-2.5 py-2 text-xs outline-none rounded-md focus:border-blue-500 bg-white"
                                            >
                                                <option value="" disabled>Select allowance type</option>
                                                {getAvailableAllowances().map(option => (
                                                    <option key={option} value={option}>{ALLOWANCE_LABELS[option]}</option>
                                                ))}
                                            </select>
                                            <div className="flex items-center gap-1.5 border border-gray-300 px-2.5 py-1.5 rounded-md bg-white">
                                                <span className="text-gray-400 text-sm shrink-0">₹</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    onKeyDown={blockNonPositiveKeys}
                                                    value={newAllowance.amount}
                                                    onChange={(e) => setNewAllowance(prev => ({ ...prev, amount: sanitizeAmountInput(e.target.value) }))}
                                                    placeholder="Amount"
                                                    className="w-full text-xs outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={handleAddAllowance} className="flex-1 bg-blue-500 text-white py-1.5 text-xs rounded-md hover:bg-blue-600 transition font-medium">Add</button>
                                                <button type="button" onClick={() => setShowAddAllowanceForm(false)} className="flex-1 bg-white border border-gray-300 text-gray-600 py-1.5 text-xs rounded-md hover:bg-gray-50 transition">Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-xs text-gray-500 py-2">All allowances added</div>
                                    )}
                                </div>
                            )}

                            {allowances.length === 0 && !showAddAllowanceForm && (
                                <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                                    No allowances added yet
                                </p>
                            )}

                            {allowances.map((allowance) => (
                                <div key={allowance.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition">
                                    {/* icon */}
                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center shrink-0">
                                        <IndianRupee className="w-4 h-4" />
                                    </div>
                                    {/* label — takes all leftover space, truncates */}
                                    <p className="flex-1 min-w-0 font-medium text-gray-800 text-xs truncate">
                                        {ALLOWANCE_LABELS[allowance.name]}
                                    </p>
                                    {/* amount + delete — never shrinks */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="font-semibold text-gray-900 text-xs tabular-nums">
                                            ₹{allowance.amount.toLocaleString()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAllowance(allowance.id, allowance.name)}
                                            className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition text-xs leading-none"
                                        >✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Deductions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-sm">Active Deductions</h3>
                            <button
                                type="button"
                                onClick={() => setShowAddPenaltyForm(!showAddPenaltyForm)}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add
                            </button>
                        </div>

                        <div className="space-y-2">
                            {showAddPenaltyForm && (
                                <div className="bg-gray-50 p-3 rounded-lg space-y-2.5 border border-red-200">
                                    {getAvailableDeductions().length > 0 ? (
                                        <>
                                            <select
                                                value={newPenalty.name}
                                                onChange={(e) => setNewPenalty(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full border border-gray-300 px-2.5 py-2 text-xs outline-none rounded-md focus:border-red-400 bg-white"
                                            >
                                                <option value="" disabled>Select deduction type</option>
                                                {getAvailableDeductions().map(opt => (
                                                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="flex items-center gap-1.5 border border-gray-300 px-2.5 py-1.5 rounded-md bg-white">
                                                <span className="text-gray-400 text-sm shrink-0">₹</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="Amount"
                                                    onKeyDown={blockNonPositiveKeys}
                                                    value={newPenalty.amount}
                                                    onChange={(e) => setNewPenalty(prev => ({ ...prev, amount: sanitizeAmountInput(e.target.value) }))}
                                                    className="w-full text-xs outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={handleAddPenalty} className="flex-1 bg-red-500 text-white py-1.5 text-xs rounded-md hover:bg-red-600 transition font-medium">Add</button>
                                                <button type="button" onClick={() => setShowAddPenaltyForm(false)} className="flex-1 bg-white border border-gray-300 text-gray-600 py-1.5 text-xs rounded-md hover:bg-gray-50 transition">Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-xs text-gray-500 py-2">All deductions added</div>
                                    )}
                                </div>
                            )}

                            {penalties.length === 0 && !showAddPenaltyForm && (
                                <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                                    No deductions added yet
                                </p>
                            )}

                            {penalties.map((penalty) => (
                                <div key={penalty.id} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 border border-gray-100 transition">
                                    {/* icon */}
                                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                                        <RotateCcw className="w-4 h-4 text-orange-400" />
                                    </div>
                                    {/* label — flex-1 with min-w-0 prevents overflow */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 text-xs truncate">{penalty.label}</div>
                                    </div>
                                    {/* amount + delete — never shrinks */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="font-semibold text-red-500 text-xs tabular-nums whitespace-nowrap">
                                            −₹{penalty.amount.toLocaleString()}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePenalty(penalty.id, penalty.key)}
                                            className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition text-xs leading-none"
                                        >✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Net Estimate */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                        <div className="text-xs font-semibold text-blue-600 mb-2 tracking-widest uppercase">
                            Estimated Net
                        </div>
                        <div className="flex items-baseline gap-1 mb-1.5">
                            <span className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                                ₹{calculateNet().toLocaleString()}
                            </span>
                            <span className="text-sm font-normal text-gray-500">
                                {formData.salaryType === 'PER_DAY' ? '/day' : '/month'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Base + allowances − fixed deductions.<br />
                            <span className="text-gray-400">Leave & penalty rates apply at payroll time.</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Note:</strong> Changes apply to future payroll cycles only. Current processing is unaffected.
                </p>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end mt-4">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 text-xs sm:text-sm border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    Reset to Default
                </button>
            </div>
        </div>
    );
};

export default SalaryStructureTab;