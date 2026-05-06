import React, { useState, useEffect } from 'react';
import Button from '../../Components/FeeModal/Button';
import Badge from '../../Components/FeeModal/Badge';
import Modal from '../../Components/FeeModal/Modal';
import Select from '../../Components/FeeModal/Select';
import Input from '../../Components/FeeModal/Input';
import { Plus, X } from 'lucide-react';
import {
  getFeeStructures,
  createFeeStructure,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
} from '../../Api/FeeStructures';
import { getFeePeriods, getAcademicYears } from '../../Api/FeePeriods';
import { toast } from 'react-toastify';

const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '\u20B90';
  if (amount >= 10000000) return '\u20B9' + (amount / 10000000).toFixed(1) + 'Cr';
  if (amount >= 100000) return '\u20B9' + (amount / 100000).toFixed(1) + 'L';
  if (amount >= 1000) return '\u20B9' + (amount / 1000).toFixed(1) + 'K';
  return '\u20B9' + amount.toLocaleString('en-IN');
};

const STRUCT_STATUS = {
  LOCKED: { label: 'Locked', badge: 'PAID', accent: '#64748B' },
  ACTIVE: { label: 'Active', badge: 'PARTIAL', accent: '#1A3A5C' },
  DRAFT: { label: 'Draft', badge: 'UNPAID', accent: '#B45309' },
};

const COMPONENT_TYPE_OPTIONS = [
  { value: 'TUITION', label: 'Tuition Fee' },
  { value: 'TRANSPORT', label: 'Transport Fee' },
  { value: 'LAB', label: 'Lab Fee' },
  { value: 'LIBRARY', label: 'Library Fee' },
  { value: 'ACTIVITY', label: 'Activity Fee' },
  { value: 'SPORTS', label: 'Sports Fee' },
  { value: 'EXAM', label: 'Exam Fee' },
  { value: 'MISC', label: 'Misc' },
  { value: 'OTHER', label: 'Other' },
];

function ViewDetailsModal({ isOpen, onClose, structure }) {
  if (!structure) return null;
  const meta = STRUCT_STATUS[structure.status?.toUpperCase()] || STRUCT_STATUS.DRAFT;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fee Structure Details" size="sm">
      <Modal.Body>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Period</div>
                <div className="font-semibold">{structure.feePeriod?.name || '\u2014'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Classes</div>
                <div className="font-semibold">{structure.classes?.map((c) => c.name).join(', ') || '\u2014'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Status</div>
                <Badge status={meta.badge}>{meta.label}</Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Students</div>
                <div className="font-semibold">{structure.studentCount || '\u2014'}</div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Fee Components</h4>
            <div className="space-y-1">
              {structure.components?.map((comp, i, arr) => (
                <div key={i} className={'flex justify-between py-2 text-sm' + (i < arr.length - 1 ? ' border-b border-gray-100' : '')}>
                  <span className="text-gray-600">{comp.customName || comp.componentType}</span>
                  <span className="font-semibold">{formatCurrency(comp.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 pt-3 border-t-2 border-gray-200">
                <span className="font-bold text-sm">Total</span>
                <span className="font-extrabold text-navy text-base">{formatCurrency(structure.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

function StructureModal({ isOpen, onClose, structure, periods, classes, onSuccess }) {
  const isEdit = !!structure;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    feePeriodId: '',
    academicYearId: '',
    classIds: [],
    components: [{ componentType: 'TUITION', customName: '', amount: '', displayOrder: 0 }],
  });

  useEffect(() => {
    if (!isOpen) return;
    if (structure) {
      setForm({
        feePeriodId: structure.feePeriodId?.toString() || '',
        academicYearId: structure.academicYearId?.toString() || '',
        classIds: structure.classes?.map((c) => c.id) || [],
        components: structure.components?.map((comp, idx) => ({
          componentType: comp.componentType || 'TUITION',
          customName: comp.customName || '',
          amount: comp.amount?.toString() || '',
          displayOrder: comp.displayOrder ?? idx,
        })) || [{ componentType: 'TUITION', customName: '', amount: '', displayOrder: 0 }],
      });
    } else {
      setForm({
        feePeriodId: '',
        academicYearId: '',
        classIds: [],
        components: [{ componentType: 'TUITION', customName: '', amount: '', displayOrder: 0 }],
      });
    }
  }, [isOpen, structure]);

  const toggleClass = (classId) => {
    setForm((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id) => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  const addComponent = () => {
    setForm((prev) => ({
      ...prev,
      components: [...prev.components, { componentType: '', customName: '', amount: '', displayOrder: prev.components.length }],
    }));
  };

  const removeComponent = (index) => {
    setForm((prev) => ({ ...prev, components: prev.components.filter((_, i) => i !== index) }));
  };

  const updateComponent = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      components: prev.components.map((comp, i) => i === index ? { ...comp, [field]: value } : comp),
    }));
  };

  const totalAmount = form.components.reduce((sum, comp) => sum + (parseFloat(comp.amount) || 0), 0);

  const academicYearOptions = periods.reduce((acc, period) => {
    const ayId = period.academicYearId?.toString();
    if (ayId && !acc.find((item) => item.value === ayId)) {
      acc.push({
        value: ayId,
        label: period.academicYear?.label || ('Academic Year ' + ayId),
      });
    }
    return acc;
  }, []);

  const filteredPeriods = form.academicYearId
    ? periods.filter((p) => p.academicYearId?.toString() === form.academicYearId)
    : periods;

  const selectedClasses = classes.filter((c) => form.classIds.includes(c.id));
  const totalStudents = selectedClasses.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  const handleSubmit = async (saveAsDraft) => {
    if (!form.feePeriodId) { toast.error('Please select a fee period'); return; }
    if (form.classIds.length === 0) { toast.error('Please select at least one class'); return; }
    if (form.components.length === 0) { toast.error('Please add at least one fee component'); return; }
    for (let i = 0; i < form.components.length; i++) {
      const comp = form.components[i];
      if (!comp.componentType) { toast.error('Please select a component type for row ' + (i + 1)); return; }
      if (!comp.amount || parseFloat(comp.amount) <= 0) { toast.error('Please enter a valid amount for ' + comp.componentType); return; }
    }

    setLoading(true);
    try {
      const payload = {
        feePeriodId: parseInt(form.feePeriodId),
        classIds: form.classIds,
        components: form.components.map((comp, idx) => ({
          componentType: comp.componentType,
          customName: comp.customName.trim() || null,
          amount: parseFloat(comp.amount),
          displayOrder: idx,
        })),
        saveAsDraft: saveAsDraft,
      };
      if (isEdit) {
        await updateFeeStructure(structure.id, payload);
        toast.success('Fee structure updated successfully');
      } else {
        await createFeeStructure(payload);
        toast.success(saveAsDraft ? 'Fee structure saved as draft' : 'Fee structure published successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || ('Failed to ' + (isEdit ? 'update' : 'create') + ' fee structure'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Fee Structure' : 'Create Fee Structure'} size="lg">
      <Modal.Body>
        <div className="space-y-5">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select Period</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Academic Year <span className="text-red-500">*</span></label>
                <Select
                  value={form.academicYearId}
                  onChange={(v) => setForm((prev) => ({ ...prev, academicYearId: v, feePeriodId: '' }))}
                  options={[{ value: '', label: '-- Select academic year --' }, ...academicYearOptions]}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fee Period <span className="text-red-500">*</span></label>
                <Select
                  value={form.feePeriodId}
                  onChange={(v) => setForm((prev) => ({ ...prev, feePeriodId: v }))}
                  options={[{ value: '', label: '-- Select a period --' }, ...filteredPeriods.map((p) => ({ value: p.id.toString(), label: p.name }))]}
                  disabled={!form.academicYearId}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Apply to Classes</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Select one or more classes.</p>
            <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
              {classes.map((cls) => (
                <label
                  key={cls.id}
                  className={'flex items-center gap-1.5 px-3 py-2 rounded-md border-2 cursor-pointer transition-all text-xs font-semibold select-none ' + (form.classIds.includes(cls.id) ? 'bg-navy text-white border-navy' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400')}
                >
                  <input type="checkbox" className="sr-only" checked={form.classIds.includes(cls.id)} onChange={() => toggleClass(cls.id)} />
                  {cls.name}
                  {cls.studentCount > 0 && <span className="text-[10px] opacity-70">({cls.studentCount})</span>}
                </label>
              ))}
            </div>
            {form.classIds.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                Selected: <strong>{selectedClasses.map((c) => c.name).join(', ')}</strong> — {totalStudents} students
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Fee Components</span>
              </div>
              <Button variant="ghost" size="xs" icon={<Plus size={12} />} onClick={addComponent}>Add Component</Button>
            </div>
            <div className="space-y-2.5">
              <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                <div className="col-span-5">Component</div>
                <div className="col-span-4">Custom Name</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1"></div>
              </div>
              {form.components.map((comp, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-5">
                    <Select
                      value={comp.componentType}
                      onChange={(v) => updateComponent(i, 'componentType', v)}
                      options={[{ value: '', label: '-- Select --' }, ...COMPONENT_TYPE_OPTIONS]}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      value={comp.customName}
                      onChange={(v) => updateComponent(i, 'customName', v)}
                      placeholder="Optional..."
                      disabled={!['MISC', 'OTHER'].includes(comp.componentType)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={comp.amount} onChange={(v) => updateComponent(i, 'amount', v)} placeholder="0" />
                  </div>
                  <div className="col-span-1 flex items-center justify-center pt-1">
                    {form.components.length > 1 && (
                      <button type="button" onClick={() => removeComponent(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3.5 bg-gray-900 rounded-lg flex justify-between items-center">
              <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Total Fee Amount</span>
              <span className="text-xl font-extrabold text-white">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        {!isEdit && (
          <Button variant="ghost" onClick={() => handleSubmit(true)} disabled={loading}>Save as Draft</Button>
        )}
        <Button variant="primary" onClick={() => handleSubmit(false)} disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Structure' : 'Save Structure'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const FeeStructures = () => {
  const [periodFilter, setPeriodFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [activeStructure, setActiveStructure] = useState(null);
  const [structures, setStructures] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [structuresLoading, setStructuresLoading] = useState(false);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const yearsData = await getAcademicYears();
      const current = yearsData.find((y) => y.isCurrent) || yearsData[0];
      if (current) {
        const periodsData = await getFeePeriods(current.id);
        setPeriods(periodsData);
      }
      await fetchStructures(null);
      setClasses([
        { id: 1, name: 'Class 6', studentCount: 72 },
        { id: 2, name: 'Class 7', studentCount: 74 },
        { id: 3, name: 'Class 8', studentCount: 76 },
        { id: 4, name: 'Class 9', studentCount: 90 },
        { id: 5, name: 'Class 10', studentCount: 82 },
        { id: 6, name: 'Class 11', studentCount: 60 },
        { id: 7, name: 'Class 12', studentCount: 55 },
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStructures = async (periodId) => {
    try {
      setStructuresLoading(true);
      const data = await getFeeStructures(periodId || '');
      setStructures(data);
    } catch (error) {
      toast.error('Failed to fetch fee structures');
    } finally {
      setStructuresLoading(false);
    }
  };

  const openCreate = () => { setActiveStructure(null); setModal('create'); };

  const openEdit = async (s) => {
    try {
      const full = await getFeeStructureById(s.id);
      setActiveStructure(full);
      setModal('edit');
    } catch (error) {
      toast.error('Failed to load structure details');
    }
  };

  const openView = async (s) => {
    try {
      const full = await getFeeStructureById(s.id);
      setActiveStructure(full);
      setModal('view');
    } catch (error) {
      toast.error('Failed to load structure details');
    }
  };

  const close = () => { setModal(null); setActiveStructure(null); };
  const handleSuccess = () => fetchStructures(periodFilter ? parseInt(periodFilter) : null);

  const handleDelete = async (structureId) => {
    if (!window.confirm('Delete this draft structure? This cannot be undone.')) return;
    try {
      await deleteFeeStructure(structureId);
      toast.success('Fee structure deleted successfully');
      handleSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to delete fee structure');
    }
  };

  const handlePeriodFilterChange = (value) => {
    setPeriodFilter(value);
    fetchStructures(value ? parseInt(value) : null);
  };

  const getStatusMeta = (status) => STRUCT_STATUS[status?.toUpperCase()] || STRUCT_STATUS.DRAFT;
  const filtered = periodFilter ? structures.filter((s) => s.feePeriodId === parseInt(periodFilter)) : structures;

  if (loading && structures.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading fee structures...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Structures</h1>
          <p className="text-sm text-gray-500 mt-0.5">Class-wise fee components per period</p>
        </div>
        <div className="flex gap-2 items-center flex-shrink-0">
          <div className="w-44">
            <Select
              value={periodFilter}
              onChange={handlePeriodFilterChange}
              options={[{ value: '', label: 'All Periods' }, ...periods.map((p) => ({ value: p.id.toString(), label: p.name }))]}
            />
          </div>
          <Button variant="primary" icon={<Plus size={15} />} onClick={openCreate}>
            New Structure
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border-l-[3px] border-blue-500 rounded-lg px-4 py-2.5 text-sm text-blue-800">
        A structure sets fee components and amounts for selected classes under a period. Once any payment is recorded it is <strong>locked</strong> and cannot be edited.
      </div>

      {structuresLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400 text-sm">Loading structures...</div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((s) => {
            const meta = getStatusMeta(s.status);
            const classNames = s.classes?.map((c) => c.name).join(' & ') || '';
            const componentsText = s.components?.map((c) => (c.customName || c.componentType) + ' ' + formatCurrency(c.amount)).join(' · ') || '';
            return (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-200 p-[18px] shadow-card hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ borderTop: '3px solid ' + meta.accent }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{s.feePeriod?.name || 'Unknown Period'}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{classNames}</div>
                  </div>
                  <Badge status={meta.badge}>{meta.label}</Badge>
                </div>
                <div className="text-2xl font-extrabold mt-3 mb-1" style={{ color: meta.accent }}>{formatCurrency(s.totalAmount)}</div>
                <div className="text-xs text-gray-500 leading-relaxed line-clamp-2">{componentsText}</div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  {s.status !== 'DRAFT' && (
                    <Button variant="secondary" size="xs" onClick={() => openView(s)}>View Details</Button>
                  )}
                  {s.status !== 'LOCKED' && (
                    <Button variant="ghost" size="xs" onClick={() => openEdit(s)}>
                      {s.status === 'DRAFT' ? 'Edit Draft' : 'Edit'}
                    </Button>
                  )}
                  {s.status === 'DRAFT' && (
                    <Button variant="secondary" size="xs" className="!text-red-600 !border-red-200 !bg-red-50" onClick={() => handleDelete(s.id)}>
                      Delete
                    </Button>
                  )}
                  {s.studentCount > 0 && (
                    <span className="ml-auto text-[11px] text-gray-400">{s.studentCount} students</span>
                  )}
                </div>
              </div>
            );
          })}
          <div
            onClick={openCreate}
            className="bg-gray-50 border-[1.5px] border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-navy hover:bg-blue-50 transition-all duration-200 min-h-[190px]"
          >
            <div className="text-3xl text-gray-400">+</div>
            <div className="text-sm font-semibold text-gray-500 mt-2">New Fee Structure</div>
            <div className="text-[11px] text-gray-400 mt-1 text-center">Select period, classes & components</div>
          </div>
        </div>
      )}

      <StructureModal isOpen={modal === 'create'} onClose={close} periods={periods} classes={classes} onSuccess={handleSuccess} />
      <StructureModal isOpen={modal === 'edit'} onClose={close} structure={activeStructure} periods={periods} classes={classes} onSuccess={handleSuccess} />
      <ViewDetailsModal isOpen={modal === 'view'} onClose={close} structure={activeStructure} />
    </div>
  );
};

export default FeeStructures;