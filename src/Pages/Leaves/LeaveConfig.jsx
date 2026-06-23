import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, RefreshCw, X, Settings, Eye,
  CheckCircle, RotateCcw, RotateCw, SearchX,
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
import { getListOfValues } from '../../Api/ListOfValues';
import { toast } from 'react-toastify';

// ─── Leave Type Colors (keyed by value string) ────────────────────────────────
// Falls back to a neutral style for unknown types
const LEAVE_TYPE_COLOR_PALETTE = [
  'bg-red-50 text-red-600 border-red-200',
  'bg-blue-50 text-blue-600 border-blue-200',
  'bg-green-50 text-green-600 border-green-200',
  'bg-gray-100 text-gray-600 border-gray-200',
  'bg-pink-50 text-pink-600 border-pink-200',
  'bg-indigo-50 text-indigo-600 border-indigo-200',
  'bg-slate-50 text-slate-600 border-slate-200',
  'bg-yellow-50 text-yellow-600 border-yellow-200',
  'bg-orange-50 text-orange-600 border-orange-200',
  'bg-purple-50 text-purple-600 border-purple-200',
];

// Build a stable color map from the dynamic list
const buildColorMap = (leaveTypes) => {
  const map = {};
  leaveTypes.forEach((lt, i) => {
    map[lt.value] = LEAVE_TYPE_COLOR_PALETTE[i % LEAVE_TYPE_COLOR_PALETTE.length];
  });
  return map;
};

const FALLBACK_COLOR = 'bg-gray-100 text-gray-600 border-gray-200';

const EMPTY_FORM = {
  leaveType: '',
  leaveName: '',
  annualLimit: '',
  description: '',
  carryForwardAllowed: false,
  maxCarryForwardDays: 0,
};

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewLeaveConfigModal = ({ config, colorMap, onClose }) => {
  if (!config) return null;
  const colorClass = colorMap[config.leaveType] || FALLBACK_COLOR;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{config.leaveName}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${colorClass}`}>
                {config.leaveType.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Annual Limit</p>
              <p className="text-lg font-bold text-gray-900">
                {config.annualLimit}
                <span className="text-sm font-normal text-gray-500 ml-1">days</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="relative inline-flex h-5 w-10 items-center rounded-full"
                  style={{ backgroundColor: config.isActive ? '#22c55e' : '#d1d5db' }}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${config.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                </span>
                <span className={`text-sm font-medium ${config.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                  {config.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Carry Forward</p>
            {config.carryForwardAllowed ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">
                  Enabled
                  {config.maxCarryForwardDays > 0
                    ? ` — up to ${config.maxCarryForwardDays} days`
                    : ' — Unlimited'}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not allowed</p>
            )}
          </div>

          {config.description && (
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{config.description}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
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

// ─── Seed Confirm Modal ───────────────────────────────────────────────────────
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
        This will provision all <span className="font-semibold text-gray-900">standard leave types</span> with platform-recommended defaults.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Only runs if no active configurations exist. If active configs already exist, this is a no-op.
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

// ─── Re-enable Confirm Modal ──────────────────────────────────────────────────
const ReEnableConfirmModal = ({ config, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <RotateCw className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Re-enable Leave Type</h2>
      </div>
      <p className="text-gray-600 mb-1">
        Re-enable <span className="font-semibold text-gray-900">{config?.leaveName}</span>?
      </p>
      <p className="text-sm text-gray-500 mb-6">
        It will be restored with its current settings and appear again in balance and leave application screens.
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} disabled={loading}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-60">
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          Re-enable
        </button>
      </div>
    </div>
  </div>
);

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const LeaveConfigModal = ({ mode, initialData, activeTypes, leaveTypeOptions, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        leaveType: initialData.leaveType ?? '',
        leaveName: initialData.leaveName ?? '',
        annualLimit: initialData.annualLimit ?? '',
        description: initialData.description ?? '',
        carryForwardAllowed: initialData.carryForwardAllowed ?? false,
        maxCarryForwardDays: initialData.maxCarryForwardDays ?? 0,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [mode, initialData]);

  // Auto-fill leaveName when a leave type is selected
  const handleLeaveTypeChange = (value) => {
    const option = leaveTypeOptions.find(o => o.value === value);
    setForm(prev => ({
      ...prev,
      leaveType: value,
      leaveName: option ? option.label : prev.leaveName,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.leaveType) e.leaveType = 'Leave type is required';
    if (!form.leaveName.trim()) e.leaveName = 'Display name is required';
    if (form.leaveName.trim().length < 2) e.leaveName = 'Min 2 characters';
    if (form.leaveName.trim().length > 100) e.leaveName = 'Max 100 characters';
    if (form.annualLimit === '' || form.annualLimit === null) e.annualLimit = 'Annual limit is required';
    if (Number(form.annualLimit) < 0) e.annualLimit = 'Must be ≥ 0';
    if (form.description && form.description.length > 500) e.description = 'Max 500 characters';
    if (form.carryForwardAllowed && Number(form.maxCarryForwardDays) < 0) e.maxCarryForwardDays = 'Must be ≥ 0';
    if (mode === 'add' && activeTypes.includes(form.leaveType))
      e.leaveType = 'An active config for this leave type already exists — use Edit to update it';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      leaveType: form.leaveType,
      leaveName: form.leaveName.trim(),
      annualLimit: Number(form.annualLimit),
      description: form.description?.trim() || null,
      carryForwardAllowed: form.carryForwardAllowed,
      maxCarryForwardDays: Number(form.maxCarryForwardDays),
    });
  };

  // Find the label for the current leaveType when in edit mode
  const editLeaveTypeLabel =
    leaveTypeOptions.find(o => o.value === form.leaveType)?.label || form.leaveType;

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
              leaveTypeOptions.length === 0 ? (
                <div className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading leave types…
                </div>
              ) : (
                <select
                  value={form.leaveType}
                  onChange={e => handleLeaveTypeChange(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${errors.leaveType ? 'border-red-400' : 'border-gray-200'}`}
                >
                  <option value="">— Select leave type —</option>
                  {leaveTypeOptions.map(o => (
                    <option key={o.id ?? o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )
            ) : (
              <input
                value={editLeaveTypeLabel}
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
                <span className="text-gray-400 ml-1 font-normal">(0 = unlimited)</span>
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

          {/* Carry Forward Toggle */}
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

          {/* Max Carry Forward Days */}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeaveConfig() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reEnableLoading, setReEnableLoading] = useState(false);

  // Dynamic leave types from API
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [colorMap, setColorMap] = useState({});

  const [filterStatus, setFilterStatus] = useState('all');
  const [modalMode, setModalMode] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reEnableTarget, setReEnableTarget] = useState(null);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  const [allConfigs, setAllConfigs] = useState([]);

  const totalConfigs = allConfigs.length;
  const activeConfigs = allConfigs.filter(c => c.isActive).length;
  const carryForwardCount = allConfigs.filter(c => c.carryForwardAllowed).length;
  const totalAnnualDays = allConfigs.filter(c => c.isActive).reduce((sum, c) => sum + (c.annualLimit || 0), 0);
  const activeTypes = allConfigs.filter(c => c.isActive).map(c => c.leaveType);

  // ── Fetch dynamic leave types ──
  useEffect(() => {
    const fetchListOfValues = async () => {
      try {
        const leaveTypeRes = await getListOfValues('LEAVE_TYPE');
        const formatted = leaveTypeRes.map(item => ({
          id: item.id,
          value: item.value,
          label: item.label,
        }));
        setLeaveTypeOptions(formatted);
        setColorMap(buildColorMap(formatted));
      } catch (e) {
        console.error('get list of values error:', e.message);
        toast.error('Failed to load leave type options');
      }
    };
    fetchListOfValues();
  }, []);

  // ── Fetch configs ──
  const fetchConfigs = async (filter = filterStatus) => {
    try {
      setLoading(true);
      const isActiveParam = filter === 'active' ? true : filter === 'inactive' ? false : undefined;
      const res = await getAllLeaveConfigs(isActiveParam);
      setConfigs(res.data || []);
      if (filter !== 'all') {
        const allRes = await getAllLeaveConfigs(undefined);
        setAllConfigs(allRes.data || []);
      } else {
        setAllConfigs(res.data || []);
      }
    } catch {
      toast.error('Failed to load leave configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs('all'); }, []);

  const handleFilterChange = (key) => {
    setFilterStatus(key);
    fetchConfigs(key);
  };

  // ── Seed ──
  const handleSeedConfirm = async () => {
    try {
      setSeedLoading(true);
      const res = await seedLeaveConfigs();
      toast.success(res.message || 'Default leave configurations seeded successfully');
      setShowSeedConfirm(false);
      await fetchConfigs(filterStatus);
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
      await fetchConfigs(filterStatus);
    } catch (err) {
      toast.error(err.message || 'Failed to create leave configuration');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Edit ──
  const handleEditClick = (config) => { setEditTarget(config); setModalMode('edit'); };

  const handleEdit = async (payload) => {
    try {
      setSubmitLoading(true);
      await updateLeaveConfig(editTarget.id, payload);
      toast.success(`${payload.leaveName} updated successfully!`);
      setModalMode(null);
      setEditTarget(null);
      await fetchConfigs(filterStatus);
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
      await fetchConfigs(filterStatus);
    } catch (err) {
      toast.error(err.message || 'Failed to disable leave type');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Re-enable ──
  const handleReEnableConfirm = async () => {
    try {
      setReEnableLoading(true);
      await createLeaveConfig({
        leaveType: reEnableTarget.leaveType,
        leaveName: reEnableTarget.leaveName,
        annualLimit: reEnableTarget.annualLimit,
        description: reEnableTarget.description || null,
        carryForwardAllowed: reEnableTarget.carryForwardAllowed,
        maxCarryForwardDays: reEnableTarget.maxCarryForwardDays,
      });
      toast.success(`${reEnableTarget.leaveName} re-enabled successfully`);
      setReEnableTarget(null);
      await fetchConfigs(filterStatus);
    } catch (err) {
      toast.error(err.message || 'Failed to re-enable leave type');
    } finally {
      setReEnableLoading(false);
    }
  };

  // ── Stat cards ──
  const statsCards = [
    { IconName: Layers, keyName: 'Total Types', val: totalConfigs, iconTxColor: 'text-blue-600', iconBgColor: 'bg-blue-50' },
    { IconName: CheckCircle, keyName: 'Active Types', val: activeConfigs, iconTxColor: 'text-green-600', iconBgColor: 'bg-green-50' },
    { IconName: CalendarDays, keyName: 'Total Annual Days', val: totalAnnualDays, iconTxColor: 'text-purple-600', iconBgColor: 'bg-purple-50' },
    { IconName: RotateCcw, keyName: 'Carry Forward', val: carryForwardCount, iconTxColor: 'text-orange-600', iconBgColor: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 bg-linear-to-b from-sky-50 to-sky-100">

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
            <RefreshCw className={`w-4 h-4 ${seedLoading ? 'animate-spin' : ''}`} />
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
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm mt-5 mb-6">
        {statsCards.map((card, i) => (
          <CardComponent key={i} {...card} />
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Table toolbar */}
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-semibold text-gray-900">
            Leave Types
            <span className="ml-2 text-sm font-normal text-gray-500">({configs.length})</span>
          </h2>
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border cursor-pointer border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* ═══ DESKTOP TABLE — hidden below md, horizontal scroll when needed ═══ */}
        <div className="hidden md:block w-full min-w-0">
          {/* overflow-x-auto ensures horizontal scroll stays INSIDE the card; min-w-0 prevents flex/grid blowout */}
          <div className="overflow-x-auto overflow-y-auto max-h-[32rem] w-full">
            <table className="w-full min-w-[700px] table-fixed" style={{ minWidth: '700px' }}>
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr className="text-xs">
                  <th className="px-4 lg:px-5 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap w-10">#</th>
                  <th className="px-4 lg:px-5 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Leave Type</th>
                  <th className="px-4 lg:px-5 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Display Name</th>
                  <th className="px-4 lg:px-5 py-3 text-center font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Annual Limit</th>
                  <th className="px-4 lg:px-5 py-3 text-center font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Carry Forward</th>
                  <th className="px-4 lg:px-5 py-3 text-center font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="px-4 lg:px-5 py-3 text-center font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">

                {loading && <ListLoader avatar={false} />}

                {!loading && configs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <SearchX className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          {filterStatus === 'inactive'
                            ? 'No inactive leave types'
                            : filterStatus === 'active'
                              ? 'No active leave types'
                              : 'No leave types configured'}
                        </p>
                        {filterStatus === 'all' && (
                          <p className="text-xs text-gray-500">
                            Click <span className="font-medium text-blue-500">"Seed Defaults"</span> to set up standard leave types, or add one manually.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && configs.length > 0 && configs.map((cfg, idx) => {
                  const isInactive = !cfg.isActive;
                  const badgeColor = colorMap[cfg.leaveType] || FALLBACK_COLOR;
                  return (
                    <tr key={cfg.id} className={`transition-colors ${isInactive ? 'bg-gray-50/60' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 lg:px-5 py-3.5">
                        <span className={`text-sm ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>{idx + 1}</span>
                      </td>
                      <td className="px-4 lg:px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${badgeColor} ${isInactive ? 'opacity-60' : ''}`}>
                          {cfg.leaveType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 lg:px-5 py-3.5">
                        <p className={`font-semibold text-sm whitespace-nowrap ${isInactive ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {cfg.leaveName}
                        </p>
                      </td>
                      <td className="px-4 lg:px-5 py-3.5 text-center whitespace-nowrap">
                        <span className={`text-sm font-semibold ${isInactive ? 'text-gray-400' : 'text-gray-900'}`}>{cfg.annualLimit}</span>
                        <span className="text-gray-400 text-xs ml-1">days</span>
                      </td>
                      <td className="px-4 lg:px-5 py-3.5 text-center whitespace-nowrap">
                        {cfg.carryForwardAllowed ? (
                          <span className={`inline-flex items-center gap-1 text-sm ${isInactive ? 'text-gray-400' : 'text-blue-600'}`}>
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">{cfg.maxCarryForwardDays === 0 ? 'Unlimited' : `${cfg.maxCarryForwardDays}d`}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 lg:px-5 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium ${cfg.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.isActive ? 'bg-green-700' : 'bg-gray-400'}`} />
                          {cfg.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-5 py-3.5">
                        <div className="flex justify-center items-center gap-2 whitespace-nowrap">
                          {/* Toggle */}
                          <button
                            onClick={() => cfg.isActive ? setDeleteTarget(cfg) : setReEnableTarget(cfg)}
                            title={cfg.isActive ? 'Click to disable' : 'Click to re-enable'}
                            className="relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none"
                            style={{ backgroundColor: cfg.isActive ? '#22c55e' : '#d1d5db' }}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${cfg.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                          <button
                            onClick={() => setViewTarget(cfg)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleEditClick(cfg)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        </div>

        {/* ═══ MOBILE CARDS — visible below md ═══ */}
        <div className="md:hidden">
          {loading && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                <span className="text-gray-600 text-sm">Loading...</span>
              </div>
            </div>
          )}

          {!loading && configs.length === 0 && (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <SearchX className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {filterStatus === 'inactive'
                    ? 'No inactive leave types'
                    : filterStatus === 'active'
                      ? 'No active leave types'
                      : 'No leave types configured'}
                </p>
              </div>
            </div>
          )}

          {!loading && configs.length > 0 && (
            <div className="divide-y divide-gray-100">
              {configs.map((cfg) => {
                const isInactive = !cfg.isActive;
                const badgeColor = colorMap[cfg.leaveType] || FALLBACK_COLOR;
                return (
                  <div key={cfg.id} className={`p-4 transition-colors ${isInactive ? 'opacity-80 bg-gray-50/40' : 'hover:bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeColor} ${isInactive ? 'opacity-60' : ''}`}>
                          {cfg.leaveType.replace(/_/g, ' ')}
                        </span>
                        <p className={`font-semibold text-sm mt-1.5 truncate ${isInactive ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {cfg.leaveName}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-xs text-gray-500">
                            <span className="font-medium text-gray-700">{cfg.annualLimit}</span> days/year
                          </span>
                          {cfg.carryForwardAllowed && (
                            <span className={`text-xs ${isInactive ? 'text-gray-400' : 'text-blue-600'}`}>
                              Carry: {cfg.maxCarryForwardDays === 0 ? 'Unlimited' : `${cfg.maxCarryForwardDays}d`}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium ${cfg.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.isActive ? 'bg-green-700' : 'bg-gray-400'}`} />
                            {cfg.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {cfg.description && (
                          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{cfg.description}</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <button
                          onClick={() => cfg.isActive ? setDeleteTarget(cfg) : setReEnableTarget(cfg)}
                          title={cfg.isActive ? 'Disable' : 'Re-enable'}
                          className="relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none"
                          style={{ backgroundColor: cfg.isActive ? '#22c55e' : '#d1d5db' }}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${cfg.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewTarget(cfg)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button onClick={() => handleEditClick(cfg)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <LeaveConfigModal
          mode={modalMode}
          initialData={modalMode === 'edit' ? editTarget : null}
          activeTypes={activeTypes}
          leaveTypeOptions={leaveTypeOptions}
          onSubmit={modalMode === 'add' ? handleAdd : handleEdit}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          loading={submitLoading}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          config={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {reEnableTarget && (
        <ReEnableConfirmModal
          config={reEnableTarget}
          onConfirm={handleReEnableConfirm}
          onCancel={() => setReEnableTarget(null)}
          loading={reEnableLoading}
        />
      )}

      {viewTarget && (
        <ViewLeaveConfigModal
          config={viewTarget}
          colorMap={colorMap}
          onClose={() => setViewTarget(null)}
        />
      )}

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