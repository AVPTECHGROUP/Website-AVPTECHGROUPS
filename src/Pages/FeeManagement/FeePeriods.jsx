import React, { useState, useEffect, useContext } from 'react';
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
import { UserContext } from '../../ContextAPI/UserContext';
import { toast } from 'react-toastify';

// ─── Constants ─────────────────────────────────────────────────────────────────

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
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

// ─── Period Modal ─────────────────────────────────────────────────────────────

function PeriodModal({ isOpen, onClose, period, academicYear, onSuccess }) {
  const isEdit = !!period;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'QUARTERLY', academicYearLabel: '', dueDate: '', notes: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (period) {
      setForm({
        name:              period.name || '',
        type:              period.type || 'QUARTERLY',
        academicYearLabel: academicYear?.label || period.academicYearLabel || '',
        dueDate:           period.dueDate ? period.dueDate.split('T')[0] : '',
        notes:             period.notes || '',
      });
    } else {
      setForm({
        name: '', type: 'QUARTERLY',
        academicYearLabel: academicYear?.label || '',
        dueDate: '', notes: '',
      });
    }
  }, [isOpen, period, academicYear]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim())       { toast.error('Period name is required');   return; }
    if (!form.type)              { toast.error('Period type is required');   return; }
    if (!form.academicYearLabel) { toast.error('Academic year is required'); return; }
    if (!form.dueDate)           { toast.error('Due date is required');      return; }

    setLoading(true);
    try {
      const payload = {
        name:              form.name.trim(),
        type:              form.type,
        academicYearId:    academicYear.id,
        academicYearLabel: academicYear.label,
        dueDate:           form.dueDate,
        notes:             form.notes.trim(),
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
              placeholder="e.g. Q1, Q3, October, Term 1, Annual…"
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
                { value: 'MONTHLY',     label: 'Monthly'           },
                { value: 'QUARTERLY',   label: 'Quarterly'         },
                { value: 'HALF_YEARLY', label: 'Half-Yearly'       },
                { value: 'YEARLY',      label: 'Yearly'            },
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
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Academic Year</label>
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
              placeholder="e.g. Second quarter of the academic year…"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Update Period' : 'Save Period'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// ─── FeePeriods ───────────────────────────────────────────────────────────────
//
// Props:
//   onGoToStructures(periodId) — called instead of navigate() so the parent
//   FeeSynthesisPage can switch tabs without losing the header/nav.

const FeePeriods = ({ onGoToStructures }) => {
  const { currentAcademicYear } = useContext(UserContext);
  const academicYearId    = currentAcademicYear?.id;
  const academicYearLabel = currentAcademicYear?.label;

  const [modal,      setModal]      = useState(false);
  const [editPeriod, setEditPeriod] = useState(null);
  const [periods,    setPeriods]    = useState([]);
  const [loading,    setLoading]    = useState(false);

  const fetchPeriods = async () => {
    if (!academicYearId) return;
    setLoading(true);
    try {
      const data = await getFeePeriods(academicYearId);
      setPeriods(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to fetch fee periods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!academicYearId) return;
    fetchPeriods();
  }, [academicYearId]);

  const openNew       = ()  => { setEditPeriod(null); setModal(true); };
  const openEdit      = (p) => { setEditPeriod(p);    setModal(true); };
  const close         = ()  => { setModal(false);     setEditPeriod(null); };
  const handleSuccess = ()  => fetchPeriods();

  // ✅ Use the prop callback instead of navigate() — keeps the wrapper intact
  const goToStructures = (periodId) => {
    if (onGoToStructures) {
      onGoToStructures(periodId);
    }
  };

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

  if (!academicYearId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">⏳ Waiting for academic year…</div>
      </div>
    );
  }

  if (loading && periods.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Loading fee periods…</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Periods</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Define named installment periods · AY {academicYearLabel}
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={openNew} className="flex-shrink-0">
          New Fee Period
        </Button>
      </div>

      {/* ── Info banner ───────────────────────────────────────────────────── */}
      <div className="bg-blue-50 border-l-[3px] border-blue-500 rounded-lg px-4 py-2.5 text-sm text-blue-800">
        Fee Periods define <strong>when</strong> fee is due. After creating a period, attach class-wise fee
        structures from the <strong>Fee Structures</strong> tab.
      </div>

      {/* ── Period cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {periods.map((p) => {
          const statusInfo = getStatusInfo(p);
          return (
            <div
              key={p.id}
              onClick={() => goToStructures(p.id)}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
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

        {/* Add new period placeholder */}
        <div
          onClick={openNew}
          className="bg-gray-50 border-[1.5px] border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#1A3A5C] hover:bg-blue-50 transition-all duration-200 min-h-[160px]"
        >
          <div className="text-2xl text-gray-400">+</div>
          <div className="text-sm font-semibold text-gray-500 mt-2">New Fee Period</div>
          <div className="text-[11px] text-gray-400 mt-1">Add Q3, October, etc.</div>
        </div>
      </div>

      {/* ── All periods table ─────────────────────────────────────────────── */}
      <Card>
        <Card.Header>All Periods — {academicYearLabel}</Card.Header>
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
            ) : periods.map((p) => {
              const statusInfo     = getStatusInfo(p);
              const outstandingAmt = (p.totalAmount || 0) - (p.collectedAmount || 0);
              return (
                <Table.Row key={p.id}>
                  <Table.Cell><span className="font-bold">{p.name}</span></Table.Cell>
                  <Table.Cell><Badge status={p.type}>{typeLabels[p.type] || p.type}</Badge></Table.Cell>
                  <Table.Cell className="text-gray-600 text-xs">{formatDate(p.dueDate)}</Table.Cell>
                  <Table.Cell>{p.structureCount || 0}</Table.Cell>
                  <Table.Cell>{p.studentCount  || 0}</Table.Cell>
                  <Table.Cell className={!p.collectedAmount ? 'text-gray-400' : 'text-green-700 font-semibold'}>
                    {p.collectedAmount ? formatCurrency(p.collectedAmount) : '—'}
                  </Table.Cell>
                  <Table.Cell className={outstandingAmt === 0 ? 'text-green-700' : 'text-amber-700 font-semibold'}>
                    {formatCurrency(outstandingAmt)}
                  </Table.Cell>
                  <Table.Cell><Badge status={statusInfo.status}>{statusInfo.label}</Badge></Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2 flex-wrap">
                      {/* ✅ Uses prop callback — header/nav stays intact */}
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => goToStructures(p.id)}
                      >
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
            })}
          </Table.Body>
        </Table>
      </Card>

      <PeriodModal
        isOpen={modal}
        onClose={close}
        period={editPeriod}
        academicYear={currentAcademicYear}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default FeePeriods;