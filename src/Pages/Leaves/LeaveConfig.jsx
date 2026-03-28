import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, RefreshCw, X, Settings,
  CheckCircle, XCircle, RotateCcw, ChevronDown, ChevronUp,
  CalendarDays, Layers, ToggleLeft, ToggleRight, AlertTriangle,
} from 'lucide-react';
import CardComponent from '../../Components/CommonComp/CardComponent';
import ListLoader from '../../Components/CommonComp/ListLoader';
import {
  getAllLeaveConfigs,
  createLeaveConfig,
  updateLeaveConfig,
  deleteLeaveConfig,
  seedLeaveConfigs,
} from '../../Api/LeaveConfigAPI';
import { toast } from 'react-toastify';

// ─── Constants ───────────────────────────────────────────────────────────────
const LEAVE_TYPE_OPTIONS = [
  { value: 'SICK_LEAVE',        label: 'Sick Leave',         defaultLimit: 12 },
  { value: 'CASUAL_LEAVE',      label: 'Casual Leave',       defaultLimit: 10 },
  { value: 'EARNED_LEAVE',      label: 'Earned Leave',       defaultLimit: 15 },
  { value: 'UNPAID_LEAVE',      label: 'Unpaid Leave',       defaultLimit: 0  },
  { value: 'MATERNITY_LEAVE',   label: 'Maternity Leave',    defaultLimit: 180},
  { value: 'PATERNITY_LEAVE',   label: 'Paternity Leave',    defaultLimit: 15 },
  { value: 'BEREAVEMENT_LEAVE', label: 'Bereavement Leave',  defaultLimit: 5  },
  { value: 'STUDY_LEAVE',       label: 'Study Leave',        defaultLimit: 7  },
  { value: 'COMPENSATORY_OFF',  label: 'Compensatory Off',   defaultLimit: 12 },
  { value: 'SPECIAL_LEAVE',     label: 'Special Leave',      defaultLimit: 3  },
];

const LEAVE_TYPE_COLORS = {
  SICK_LEAVE:        'bg-red-50 text-red-600 border-red-200',
  CASUAL_LEAVE:      'bg-blue-50 text-blue-600 border-blue-200',
  EARNED_LEAVE:      'bg-green-50 text-green-600 border-green-200',
  UNPAID_LEAVE:      'bg-gray-100 text-gray-600 border-gray-200',
  MATERNITY_LEAVE:   'bg-pink-50 text-pink-600 border-pink-200',
  PATERNITY_LEAVE:   'bg-indigo-50 text-indigo-600 border-indigo-200',
  BEREAVEMENT_LEAVE: 'bg-slate-50 text-slate-600 border-slate-200',
  STUDY_LEAVE:       'bg-yellow-50 text-yellow-600 border-yellow-200',
  COMPENSATORY_OFF:  'bg-orange-50 text-orange-600 border-orange-200',
  SPECIAL_LEAVE:     'bg-purple-50 text-purple-600 border-purple-200',
};

const EMPTY_FORM = {
  leaveType: '',
  leaveName: '',
  annualLimit: '',
  description: '',
  isApplicable: true,
  carryForwardAllowed: false,
  maxCarryForwardDays: 0,
};

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
const DeleteConfirmModal = ({ config, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Disable Leave Type</h2>
      </div>
      <p className="text-gray-600 mb-1">
        Are you sure you want to disable <span className="font-semibold text-gray-900">{config?.leaveName}</span>?
      </p>
      <p className="text-sm text-gray-500 mb-6">
        This leave type will no longer appear in balance or apply-for-leave screens.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          Disable
        </button>
      </div>
    </div>
  </div>
);

// ─── Seed Confirm Modal ─────────────────────────────────────────────────────
const SeedConfirmModal = ({ onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Seed Default Leave Types</h2>
      </div>
      <p className="text-gray-600 mb-1">
        This will provision all <span className="font-semibold text-gray-900">10 standard leave types</span> with platform-recommended defaults.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Existing configurations will <span className="font-medium text-gray-700">not</span> be overwritten. Safe to run multiple times.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          Seed Defaults
        </button>
      </div>
    </div>
  </div>
);

// ─── Add / Edit Modal ────────────────────────────────────────────────────────
const LeaveConfigModal = ({ mode, initialData, existingTypes, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        leaveType:           initialData.leaveType           ?? '',
        leaveName:           initialData.leaveName           ?? '',
        annualLimit:         initialData.annualLimit          ?? '',
        description:         initialData.description         ?? '',
        isApplicable:        initialData.isApplicable        ?? true,
        carryForwardAllowed: initialData.carryForwardAllowed ?? false,
        maxCarryForwardDays: initialData.maxCarryForwardDays ?? 0,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [mode, initialData]);

  // Auto-fill leaveName and limit when leaveType is selected in Add mode
  const handleLeaveTypeChange = (value) => {
    const option = LEAVE_TYPE_OPTIONS.find(o => o.value === value);
    setForm(prev => ({
      ...prev,
      leaveType: value,
      leaveName: option ? option.label : prev.leaveName,
      annualLimit: option ? option.defaultLimit : prev.annualLimit,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.leaveType)                         e.leaveType    = 'Leave type is required';
    if (!form.leaveName.trim())                  e.leaveName    = 'Display name is required';
    if (form.leaveName.trim().length < 2)        e.leaveName    = 'Min 2 characters';
    if (form.leaveName.trim().length > 100)      e.leaveName    = 'Max 100 characters';
    if (form.annualLimit === '' || form.annualLimit === null) e.annualLimit = 'Annual limit is required';
    if (Number(form.annualLimit) < 0)            e.annualLimit  = 'Must be ≥ 0';
    if (form.description && form.description.length > 500) e.description = 'Max 500 characters';
    if (form.carryForwardAllowed && Number(form.maxCarryForwardDays) < 0) e.maxCarryForwardDays = 'Must be ≥ 0';
    if (mode === 'add' && existingTypes.includes(form.leaveType)) e.leaveType = 'This leave type already exists';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      leaveType:           form.leaveType,
      leaveName:           form.leaveName.trim(),
      annualLimit:         Number(form.annualLimit),
      description:         form.description?.trim() || null,
      isApplicable:        form.isApplicable,
      carryForwardAllowed: form.carryForwardAllowed,
      maxCarryForwardDays: Number(form.maxCarryForwardDays),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'add' ? 'Add Leave Type' : 'Edit Leave Configuration'}
            </h2>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            {mode === 'add' ? (
              <select
                value={form.leaveType}
                onChange={e => handleLeaveTypeChange(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.leaveType ? 'border-red-400' : 'border-gray-200'}`}
              >
                <option value="">— Select leave type —</option>
                {LEAVE_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                value={LEAVE_TYPE_OPTIONS.find(o => o.value === form.leaveType)?.label || form.leaveType}
                disabled
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500"
              />
            )}
            {errors.leaveType && <p className="text-xs text-red-500 mt-1">{errors.leaveType}</p>}
          </div>

          {/* Display Name + Annual Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.leaveName}
                onChange={e => setForm(p => ({ ...p, leaveName: e.target.value }))}
                placeholder="e.g. Sick Leave"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.leaveName ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.leaveName && <p className="text-xs text-red-500 mt-1">{errors.leaveName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Limit (days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.annualLimit}
                onChange={e => setForm(p => ({ ...p, annualLimit: e.target.value }))}
                placeholder="e.g. 12"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.annualLimit ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.annualLimit && <p className="text-xs text-red-500 mt-1">{errors.annualLimit}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Policy note shown to staff (optional)"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
            />
            <div className="flex justify-between mt-1">
              {errors.description
                ? <p className="text-xs text-red-500">{errors.description}</p>
                : <span />
              }
              <span className="text-xs text-gray-400">{form.description?.length || 0}/500</span>
            </div>
          </div>

          {/* Toggles row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Is Applicable */}
            <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Applicable</p>
                <p className="text-xs text-gray-500">Enable this leave type for the school</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, isApplicable: !p.isApplicable }))}
                className={`transition-colors ${form.isApplicable ? 'text-green-500' : 'text-gray-400'}`}
              >
                {form.isApplicable
                  ? <ToggleRight className="w-8 h-8" />
                  : <ToggleLeft className="w-8 h-8" />
                }
              </button>
            </div>

            {/* Carry Forward */}
            <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Carry Forward</p>
                <p className="text-xs text-gray-500">Roll unused days to next year</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, carryForwardAllowed: !p.carryForwardAllowed }))}
                className={`transition-colors ${form.carryForwardAllowed ? 'text-blue-500' : 'text-gray-400'}`}
              >
                {form.carryForwardAllowed
                  ? <ToggleRight className="w-8 h-8" />
                  : <ToggleLeft className="w-8 h-8" />
                }
              </button>
            </div>
          </div>

          {/* Max Carry Forward Days — only if carry forward enabled */}
          {form.carryForwardAllowed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Carry Forward Days <span className="text-gray-400">(0 = unlimited)</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.maxCarryForwardDays}
                onChange={e => setForm(p => ({ ...p, maxCarryForwardDays: e.target.value }))}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.maxCarryForwardDays ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.maxCarryForwardDays && <p className="text-xs text-red-500 mt-1">{errors.maxCarryForwardDays}</p>}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {mode === 'add' ? 'Add Leave Type' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function LeaveConfig() {
  const [configs, setConfigs]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [modalMode, setModalMode]     = useState(null); // 'add' | 'edit' | null
  const [editTarget, setEditTarget]   = useState(null); // full config object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  // Summary stats derived from configs
  const totalConfigs     = configs.length;
  const activeConfigs    = configs.filter(c => c.isApplicable).length;
  const carryForwardCount = configs.filter(c => c.carryForwardAllowed).length;
  const totalAnnualDays  = configs.filter(c => c.isApplicable).reduce((sum, c) => sum + (c.annualLimit || 0), 0);

  const existingTypes = configs.map(c => c.leaveType);

  // ── Fetch ──
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await getAllLeaveConfigs();
      setConfigs(res.data || []);
    } catch (err) {
      toast.error('Failed to load leave configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  // ── Seed Defaults ──
  const handleSeedConfirm = async () => {
    try {
      setSeedLoading(true);
      const res = await seedLeaveConfigs();
      toast.success(res.message || 'Default leave configurations seeded successfully');
      setShowSeedConfirm(false);
      await fetchConfigs();
    } catch (err) {
      toast.error(err.message || 'Failed to seed defaults');
    } finally {
      setSeedLoading(false);
    }
  };

  // ── Add ──
  const handleAdd = async (payload) => {
    try {
      setSubmitLoading(true);
      await createLeaveConfig(payload);
      toast.success(`${payload.leaveName} added successfully!`);
      setModalMode(null);
      await fetchConfigs();
    } catch (err) {
      toast.error(err.message || 'Failed to create leave configuration');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Edit ──
  const handleEditClick = (config) => {
    setEditTarget(config);
    setModalMode('edit');
  };

  const handleEdit = async (payload) => {
    try {
      setSubmitLoading(true);
      await updateLeaveConfig(editTarget.id, payload);
      toast.success(`${payload.leaveName} updated successfully!`);
      setModalMode(null);
      setEditTarget(null);
      await fetchConfigs();
    } catch (err) {
      toast.error(err.message || 'Failed to update leave configuration');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Delete ──
  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await deleteLeaveConfig(deleteTarget.id);
      toast.success(`${deleteTarget.leaveName} disabled successfully`);
      setDeleteTarget(null);
      await fetchConfigs();
    } catch (err) {
      toast.error(err.message || 'Failed to disable leave type');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Stat cards ──
  const statsCards = [
    { IconName: Layers,       keyName: 'Total Types',      val: totalConfigs,      iconTxColor: 'text-blue-600',   iconBgColor: 'bg-blue-50'   },
    { IconName: CheckCircle,  keyName: 'Active Types',     val: activeConfigs,     iconTxColor: 'text-green-600',  iconBgColor: 'bg-green-50'  },
    { IconName: CalendarDays, keyName: 'Total Annual Days', val: totalAnnualDays,  iconTxColor: 'text-purple-600', iconBgColor: 'bg-purple-50' },
    { IconName: RotateCcw,    keyName: 'Carry Forward',    val: carryForwardCount, iconTxColor: 'text-orange-600', iconBgColor: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage annual leave limits and policies for each leave type
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSeedConfirm(true)}
            disabled={seedLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm disabled:opacity-60"
          >
            {seedLoading
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />
            }
            Seed Defaults
          </button>
          <button
            onClick={() => setModalMode('add')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Leave Type
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, i) => (
          <CardComponent key={i} {...card} />
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Leave Types
            <span className="ml-2 text-sm font-normal text-gray-500">({totalConfigs})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-6">
            <ListLoader />
          </div>
        ) : configs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Settings className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium text-gray-500">No leave types configured</p>
            <p className="text-sm mt-1">Click <span className="font-medium text-blue-500">"Seed Defaults"</span> to set up standard leave types, or add one manually.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Leave Type</th>
                    <th className="px-6 py-3 font-medium">Display Name</th>
                    <th className="px-6 py-3 font-medium text-center">Annual Limit</th>
                    <th className="px-6 py-3 font-medium text-center">Carry Forward</th>
                    <th className="px-6 py-3 font-medium text-center">Status</th>
                    <th className="px-6 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {configs.map((cfg, idx) => (
                    <tr key={cfg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${LEAVE_TYPE_COLORS[cfg.leaveType] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {cfg.leaveType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{cfg.leaveName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-900">{cfg.annualLimit}</span>
                        <span className="text-gray-400 text-xs ml-1">days</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {cfg.carryForwardAllowed ? (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">{cfg.maxCarryForwardDays === 0 ? 'Unlimited' : `${cfg.maxCarryForwardDays}d`}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {cfg.isApplicable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(cfg)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cfg)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Disable"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {configs.map((cfg, idx) => (
                <div key={cfg.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${LEAVE_TYPE_COLORS[cfg.leaveType] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {cfg.leaveType.replace(/_/g, ' ')}
                      </span>
                      <p className="font-semibold text-gray-900 mt-1">{cfg.leaveName}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleEditClick(cfg)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(cfg)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    <span><span className="font-medium">{cfg.annualLimit}</span> days/year</span>
                    {cfg.carryForwardAllowed && (
                      <span className="text-blue-600">Carry forward: {cfg.maxCarryForwardDays === 0 ? 'Unlimited' : `${cfg.maxCarryForwardDays}d`}</span>
                    )}
                    <span className={cfg.isApplicable ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {cfg.isApplicable ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                  {cfg.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cfg.description}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <LeaveConfigModal
          mode={modalMode}
          initialData={modalMode === 'edit' ? editTarget : null}
          existingTypes={existingTypes}
          onSubmit={modalMode === 'add' ? handleAdd : handleEdit}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          loading={submitLoading}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          config={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* ── Seed Confirm Modal ── */}
      {showSeedConfirm && (
        <SeedConfirmModal
          onConfirm={handleSeedConfirm}
          onCancel={() => setShowSeedConfirm(false)}
          loading={seedLoading}
        />
      )}
    </div>
  );
}
