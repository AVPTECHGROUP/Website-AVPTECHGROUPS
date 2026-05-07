import React, { useState, useEffect } from 'react';
import Card from '../../Components/FeeModal/Card';
import Button from '../../Components/FeeModal/Button';
import Badge from '../../Components/FeeModal/Badge';
import Table from '../../Components/FeeModal/Table';
import Modal from '../../Components/FeeModal/Modal';
import Input from '../../Components/FeeModal/Input';
import Select from '../../Components/FeeModal/Select';
import { Plus } from 'lucide-react';
import {
  getFeePeriods,
  createFeePeriod,
  updateFeePeriod,
  deleteFeePeriod,
  getAcademicYears,
} from '../../Api/FeePeriods';
import { toast } from 'react-toastify';

const cardTopColors = {
  QUARTERLY: '#1A3A5C',
  MONTHLY: '#0369A1',
  YEARLY: '#0D7A55',
  HALF_YEARLY: '#7C3AED',
  CUSTOM: '#92400E',
};

const typeLabels = {
  QUARTERLY: 'Quarterly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  HALF_YEARLY: 'Half-Yearly',
  CUSTOM: 'Custom',
};

const getStatusInfo = (period) => {
  const dueDate = new Date(period.dueDate);
  const today = new Date();
  if (period.collectedAmount && period.totalAmount && period.collectedAmount >= period.totalAmount) {
    return { status: 'PAID', label: 'Closed' };
  }
  if (dueDate < today) {
    return { status: 'OVERDUE', label: 'Overdue' };
  }
  if (period.collectedAmount && period.collectedAmount > 0) {
    return { status: 'PARTIAL', label: 'Active' };
  }
  return { status: 'PENDING', label: 'Upcoming' };
};

const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '\u20B90';
  if (amount >= 10000000) return '\u20B9' + (amount / 10000000).toFixed(1) + 'Cr';
  if (amount >= 100000) return '\u20B9' + (amount / 100000).toFixed(1) + 'L';
  if (amount >= 1000) return '\u20B9' + (amount / 1000).toFixed(1) + 'K';
  return '\u20B9' + amount.toLocaleString('en-IN');
};

const formatDate = (dateString) => {
  if (!dateString) return '\u2014';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function PeriodModal({ isOpen, onClose, period, academicYears, currentAcademicYear, onSuccess }) {
  const isEdit = !!period;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'QUARTERLY',
    academicYearLabel: '',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (period) {
      const matchedYear = academicYears.find((y) => y.id === period.academicYearId);
      const label = matchedYear?.label || period.academicYearLabel || currentAcademicYear?.label || '';
      setForm({
        name: period.name || '',
        type: period.type || 'QUARTERLY',
        academicYearLabel: label,
        dueDate: period.dueDate ? period.dueDate.split('T')[0] : '',
        notes: period.notes || '',
      });
    } else {
      setForm({
        name: '',
        type: 'QUARTERLY',
        academicYearLabel: currentAcademicYear?.label || '',
        dueDate: '',
        notes: '',
      });
    }
  }, [isOpen, period, currentAcademicYear, academicYears]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Period name is required'); return; }
    if (!form.type) { toast.error('Period type is required'); return; }
    if (!form.academicYearLabel) { toast.error('Academic year is required'); return; }
    if (!form.dueDate) { toast.error('Due date is required'); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        academicYearLabel: form.academicYearLabel,
        dueDate: form.dueDate,
        notes: form.notes.trim(),
      };
      if (isEdit) {
        await updateFeePeriod(period.id, payload);
        toast.success('Fee period updated successfully');
      } else {
        await createFeePeriod(payload);
        toast.success('Fee period created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || ('Failed to ' + (isEdit ? 'update' : 'create') + ' fee period'));
    } finally {
      setLoading(false);
    }
  };

  const academicYearOptions = academicYears.map((year) => {
    const label = year.label || (year.startDate + ' - ' + year.endDate);
    return { value: label, label: label };
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Fee Period' : 'New Fee Period'} size="md">
      <Modal.Body>
        <div className="space-y-4">
          <div>
            <Input
              label="Period Name"
              value={form.name}
              onChange={(v) => set('name', v)}
              placeholder="e.g. Q1, Q3, October, Term 1, Annual..."
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              A clear name visible to staff when collecting payments.
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.type}
              onChange={(v) => set('type', v)}
              options={[
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'QUARTERLY', label: 'Quarterly' },
                { value: 'HALF_YEARLY', label: 'Half-Yearly' },
                { value: 'YEARLY', label: 'Yearly' },
                { value: 'CUSTOM', label: 'Custom / One-time' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(v) => set('dueDate', v)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.academicYearLabel}
                onChange={(v) => set('academicYearLabel', v)}
                options={[
                  { value: '', label: '-- Select academic year --' },
                  ...academicYearOptions,
                ]}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="e.g. Second quarter of the academic year..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Period' : 'Save Period'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const FeePeriods = ({ onNavigate }) => {
  const [modal, setModal] = useState(false);
  const [editPeriod, setEditPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAcademicYears(); }, []);

  useEffect(() => {
    if (currentAcademicYear) fetchPeriods();
  }, [currentAcademicYear]);

  const fetchAcademicYears = async () => {
    try {
      const data = await getAcademicYears();
      setAcademicYears(data);
      const current = data.find((y) => y.isCurrent) || data[0];
      setCurrentAcademicYear(current || null);
      if (!current) setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch academic years');
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    if (!currentAcademicYear) return;
    setLoading(true);
    try {
      const data = await getFeePeriods(currentAcademicYear.id);
      setPeriods(data);
    } catch (error) {
      toast.error('Failed to fetch fee periods');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => { setEditPeriod(null); setModal(true); };
  const openEdit = (p) => { setEditPeriod(p); setModal(true); };
  const close = () => { setModal(false); setEditPeriod(null); };
  const handleSuccess = () => fetchPeriods();

  const handleDelete = async (periodId) => {
    if (!window.confirm('Are you sure you want to delete this period? This action cannot be undone.')) return;
    try {
      await deleteFeePeriod(periodId);
      toast.success('Fee period deleted successfully');
      fetchPeriods();
    } catch (error) {
      toast.error(error.message || 'Failed to delete fee period');
    }
  };

  if (loading && periods.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading fee periods...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Periods</h1>
          <p className="text-sm text-gray-500 mt-0.5">Define named installment periods for each academic year</p>
        </div>
        <div className="flex-shrink-0">
          <Button variant="primary" icon={<Plus size={15} />} onClick={openNew}>
            New Fee Period
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border-l-[3px] border-blue-500 rounded-lg px-4 py-2.5 text-sm text-blue-800">
        Fee Periods define <strong>when</strong> fee is due. After creating a period, attach class-wise fee structures to it from the <strong>Fee Structures</strong> tab.
      </div>

      <div className="grid grid-cols-4 gap-4">
        {periods.map((p) => {
          const statusInfo = getStatusInfo(p);
          return (
            <div
              key={p.id}
              onClick={() => onNavigate && onNavigate('structures', { periodId: p.id })}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-card cursor-pointer hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ borderTop: '3px solid ' + (cardTopColors[p.type] || '#CBD5E1') }}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge status={p.type}>{typeLabels[p.type] || p.type}</Badge>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                >
                  Edit
                </Button>
              </div>
              <div className="text-sm font-extrabold text-gray-900">{p.name}</div>
              <div className="text-[11px] text-gray-500 mt-1">
                Due: <strong>{formatDate(p.dueDate)}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <div className="text-[11px] text-gray-500">Structures</div>
                  <div className="text-sm font-bold mt-0.5">{p.structureCount || 0}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">Students</div>
                  <div className="text-sm font-bold mt-0.5">{p.studentCount || 0}</div>
                </div>
              </div>
              <div className="mt-2">
                <Badge status={statusInfo.status}>{statusInfo.label}</Badge>
              </div>
            </div>
          );
        })}
        <div
          onClick={openNew}
          className="bg-gray-50 border-[1.5px] border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-navy hover:bg-navy-light transition-all duration-200 min-h-[160px]"
        >
          <div className="text-2xl text-gray-400">+</div>
          <div className="text-sm font-semibold text-gray-500 mt-2">New Fee Period</div>
          <div className="text-[11px] text-gray-400 mt-1">Add Q3, October, etc.</div>
        </div>
      </div>

      <Card>
        <Card.Header>All Periods — {currentAcademicYear?.label || '2025-26'}</Card.Header>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Period Name</Table.Head>
              <Table.Head>Type</Table.Head>
              <Table.Head>Due Date</Table.Head>
              <Table.Head>Structures</Table.Head>
              <Table.Head>Students</Table.Head>
              <Table.Head>Collected</Table.Head>
              <Table.Head>Outstanding</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {periods.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={9} className="text-center text-gray-500 py-8">
                  No fee periods found. Click "New Fee Period" to create one.
                </Table.Cell>
              </Table.Row>
            ) : (
              periods.map((p) => {
                const statusInfo = getStatusInfo(p);
                const outstandingAmount = (p.totalAmount || 0) - (p.collectedAmount || 0);
                return (
                  <Table.Row key={p.id}>
                    <Table.Cell><span className="font-bold">{p.name}</span></Table.Cell>
                    <Table.Cell><Badge status={p.type}>{typeLabels[p.type] || p.type}</Badge></Table.Cell>
                    <Table.Cell className="text-gray-600 text-xs">{formatDate(p.dueDate)}</Table.Cell>
                    <Table.Cell>{p.structureCount || 0}</Table.Cell>
                    <Table.Cell>{p.studentCount || 0}</Table.Cell>
                    <Table.Cell className={!p.collectedAmount ? 'text-gray-400' : 'text-success font-semibold'}>
                      {p.collectedAmount ? formatCurrency(p.collectedAmount) : '\u2014'}
                    </Table.Cell>
                    <Table.Cell className={outstandingAmount === 0 ? 'text-success' : 'text-[#B45309] font-semibold'}>
                      {formatCurrency(outstandingAmount)}
                    </Table.Cell>
                    <Table.Cell><Badge status={statusInfo.status}>{statusInfo.label}</Badge></Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="xs" onClick={() => onNavigate && onNavigate('structures', { periodId: p.id })}>
                          Structures
                        </Button>
                        {statusInfo.status !== 'PAID' && (
                          <>
                            <Button variant="secondary" size="xs" onClick={() => openEdit(p)}>Edit</Button>
                            {p.structureCount === 0 && (
                              <Button variant="danger" size="xs" onClick={() => handleDelete(p.id)}>Delete</Button>
                            )}
                          </>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>
      </Card>

      <PeriodModal
        isOpen={modal}
        onClose={close}
        period={editPeriod}
        academicYears={academicYears}
        currentAcademicYear={currentAcademicYear}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default FeePeriods;