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
} from '../../Api/FeePeriods';
// ✅ getAcademicYears is no longer imported — year comes from props
import { toast } from 'react-toastify';

const cardTopColors = {
  QUARTERLY:   '#1A3A5C',
  MONTHLY:     '#0369A1',
  YEARLY:      '#0D7A55',
  HALF_YEARLY: '#7C3AED',
  CUSTOM:      '#92400E',
};

const typeLabels = {
  QUARTERLY:   'Quarterly',
  MONTHLY:     'Monthly',
  YEARLY:      'Yearly',
  HALF_YEARLY: 'Half-Yearly',
  CUSTOM:      'Custom',
};

const getStatusInfo = (period) => {
  const dueDate = new Date(period.dueDate);
  const today   = new Date();
  if (period.collectedAmount && period.totalAmount && period.collectedAmount >= period.totalAmount) {
    return { status: 'PAID', label: 'Closed' };
  }
  if (dueDate < today) return { status: 'OVERDUE', label: 'Overdue' };
  if (period.collectedAmount && period.collectedAmount > 0) return { status: 'PARTIAL', label: 'Active' };
  return { status: 'PENDING', label: 'Upcoming' };
};

const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '₹0';
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
  if (amount >= 100000)   return '₹' + (amount / 100000).toFixed(1) + 'L';
  if (amount >= 1000)     return '₹' + (amount / 1000).toFixed(1) + 'K';
  return '₹' + amount.toLocaleString('en-IN');
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Period Modal ─────────────────────────────────────────────────────────────
// academicYear prop is { id, label } — no dropdown needed, just display the label
function PeriodModal({ isOpen, onClose, period, academicYear, onSuccess }) {
  const isEdit  = !!period;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:              '',
    type:              'QUARTERLY',
    academicYearLabel: '',
    dueDate:           '',
    notes:             '',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (period) {
      setForm({
        name:              period.name || '',
        type:              period.type || 'QUARTERLY',
        // Always use the passed-in academicYear label — no lookup needed
        academicYearLabel: academicYear?.label || period.academicYearLabel || '',
        dueDate:           period.dueDate ? period.dueDate.split('T')[0] : '',
        notes:             period.notes || '',
      });
    } else {
      setForm({
        name:              '',
        type:              'QUARTERLY',
        academicYearLabel: academicYear?.label || '',
        dueDate:           '',
        notes:             '',
      });
    }
  }, [isOpen, period, academicYear]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim())        { toast.error('Period name is required');    return; }
    if (!form.type)               { toast.error('Period type is required');    return; }
    if (!form.academicYearLabel)  { toast.error('Academic year is required'); return; }
    if (!form.dueDate)            { toast.error('Due date is required');       return; }

    setLoading(true);
    try {
      const payload = {
  name: form.name.trim(),
  type: form.type,
  academicYearId: academicYear.id,
  academicYearLabel: academicYear.label,
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
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} fee period`);
    } finally {
      setLoading(false);
    }
  };

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
                { value: 'MONTHLY',     label: 'Monthly'          },
                { value: 'QUARTERLY',   label: 'Quarterly'        },
                { value: 'HALF_YEARLY', label: 'Half-Yearly'      },
                { value: 'YEARLY',      label: 'Yearly'           },
                { value: 'CUSTOM',      label: 'Custom / One-time' },
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
            {/* ✅ Academic year shown as read-only chip — no dropdown, no API call */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Academic Year
              </label>
              <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                {form.academicYearLabel || '—'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes (optional)</label>
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
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Period' : 'Save Period'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// ─── FeePeriods Component ─────────────────────────────────────────────────────
//
// Props:
//   academicYear  { id, label }  — passed from FeeManagement root (fetched once in Overview)
//   onNavigate    fn             — tab navigation
//
const FeePeriods = ({ academicYear, onNavigate }) => {
  const [modal,      setModal]      = useState(false);
  const [editPeriod, setEditPeriod] = useState(null);
  const [periods,    setPeriods]    = useState([]);
  const [loading,    setLoading]    = useState(false);

  // ✅ Fetch periods as soon as we have the academicYearId — no separate year fetch
  useEffect(() => {
    if (academicYear?.id) fetchPeriods();
  }, [academicYear?.id]);

  const fetchPeriods = async () => {
    if (!academicYear?.id) return;
    setLoading(true);
    try {
      const data = await getFeePeriods(academicYear.id);
      setPeriods(data);
    } catch (error) {
      toast.error('Failed to fetch fee periods');
    } finally {
      setLoading(false);
    }
  };

  const openNew  = () => { setEditPeriod(null);  setModal(true); };
  const openEdit = (p) => { setEditPeriod(p);    setModal(true); };
  const close    = () => { setModal(false);       setEditPeriod(null); };
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

  // Show a waiting state if academicYear hasn't arrived yet
  if (!academicYear?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Waiting for academic year…</div>
      </div>
    );
  }

  if (loading && periods.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading fee periods...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Periods</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Define named installment periods · AY {academicYear.label}
          </p>
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

      {/* Period cards */}
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
                <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
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

        {/* Add new card */}
        <div
          onClick={openNew}
          className="bg-gray-50 border-[1.5px] border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-navy hover:bg-navy-light transition-all duration-200 min-h-[160px]"
        >
          <div className="text-2xl text-gray-400">+</div>
          <div className="text-sm font-semibold text-gray-500 mt-2">New Fee Period</div>
          <div className="text-[11px] text-gray-400 mt-1">Add Q3, October, etc.</div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Card.Header>All Periods — {academicYear.label}</Card.Header>
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
                const statusInfo      = getStatusInfo(p);
                const outstandingAmt  = (p.totalAmount || 0) - (p.collectedAmount || 0);
                return (
                  <Table.Row key={p.id}>
                    <Table.Cell><span className="font-bold">{p.name}</span></Table.Cell>
                    <Table.Cell><Badge status={p.type}>{typeLabels[p.type] || p.type}</Badge></Table.Cell>
                    <Table.Cell className="text-gray-600 text-xs">{formatDate(p.dueDate)}</Table.Cell>
                    <Table.Cell>{p.structureCount || 0}</Table.Cell>
                    <Table.Cell>{p.studentCount  || 0}</Table.Cell>
                    <Table.Cell className={!p.collectedAmount ? 'text-gray-400' : 'text-success font-semibold'}>
                      {p.collectedAmount ? formatCurrency(p.collectedAmount) : '—'}
                    </Table.Cell>
                    <Table.Cell className={outstandingAmt === 0 ? 'text-success' : 'text-[#B45309] font-semibold'}>
                      {formatCurrency(outstandingAmt)}
                    </Table.Cell>
                    <Table.Cell><Badge status={statusInfo.status}>{statusInfo.label}</Badge></Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="xs"
                          onClick={() => onNavigate && onNavigate('structures', { periodId: p.id })}>
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

      {/* Modal — no academicYears array needed, just pass academicYear */}
      <PeriodModal
        isOpen={modal}
        onClose={close}
        period={editPeriod}
        academicYear={academicYear}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default FeePeriods;