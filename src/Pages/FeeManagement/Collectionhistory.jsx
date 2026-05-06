import React, { useState } from 'react';
import Card from '../../Components/FeeModal/Card';
import Button from '../../Components/FeeModal/Button';
import Badge from '../../Components/FeeModal/Badge';
import Table from '../../Components/FeeModal/Table';
import SearchBar from '../../Components/FeeModal/SearchBar';
import Select from '../../Components/FeeModal/Select';
import Pagination from '../../Components/FeeModal/Pagination';
import CollectFeeModal from '../../Components/FeeModal/CollectfeeModal';
import ReceiptModal from '../../Components/FeeModal/ReceiptModal';
import { formatCurrency, formatDate } from '../../Components/FeeModal/helper';
import { FileDown } from 'lucide-react';

// ── mock data ──────────────────────────────────────────────────────────────────
const OUTSTANDING = [
  { id: 1, studentName: 'Kavita Mehta',    studentCode: '#STU-1067', class: '9-A',  period: 'Q1 2025-26', balance: 12000, totalFee: 12000, paidAmount: 0,    status: 'OVERDUE', daysLate: 21 },
  { id: 2, studentName: 'Rahul Tiwari',    studentCode: '#STU-1072', class: '9-A',  period: 'Q1 2025-26', balance: 12000, totalFee: 12000, paidAmount: 0,    status: 'OVERDUE', daysLate: 21 },
  { id: 3, studentName: 'Neha Singh',      studentCode: '#STU-1080', class: '8-A',  period: 'Q1 2025-26', balance: 9500,  totalFee: 10000, paidAmount: 500,  status: 'OVERDUE', daysLate: 16 },
  { id: 4, studentName: 'Aryan Gupta',     studentCode: '#STU-1045', class: '7-B',  period: 'Q1 2025-26', balance: 10000, totalFee: 10000, paidAmount: 0,    status: 'PARTIAL', daysLate: 0  },
  { id: 5, studentName: 'Simran Kaur',     studentCode: '#STU-1032', class: '6-A',  period: 'Q1 2025-26', balance: 8500,  totalFee: 9000,  paidAmount: 500,  status: 'PARTIAL', daysLate: 0  },
  { id: 6, studentName: 'Rohan Joshi',     studentCode: '#STU-1091', class: '10-B', period: 'Q1 2025-26', balance: 11000, totalFee: 12000, paidAmount: 1000, status: 'PARTIAL', daysLate: 0  },
  { id: 7, studentName: 'Divya Nair',      studentCode: '#STU-1112', class: '8-B',  period: 'Q1 2025-26', balance: 7000,  totalFee: 10000, paidAmount: 3000, status: 'UNPAID',  daysLate: 0  },
  { id: 8, studentName: 'Prateek Sharma',  studentCode: '#STU-1104', class: '9-B',  period: 'Q1 2025-26', balance: 12000, totalFee: 12000, paidAmount: 0,    status: 'UNPAID',  daysLate: 0  },
  { id: 9, studentName: 'Aisha Khan',      studentCode: '#STU-1098', class: '7-A',  period: 'Q1 2025-26', balance: 6000,  totalFee: 9000,  paidAmount: 3000, status: 'PARTIAL', daysLate: 0  },
];

const HISTORY = [
  { id: 1, receiptNo: 'RC-2026-00897', date: '2026-05-01', studentName: 'Riya Sharma',      studentCode: '#STU-1001', class: '10-A', period: 'Q1 2025-26', amount: 12000, mode: 'Cash',   status: 'Completed' },
  { id: 2, receiptNo: 'RC-2026-00896', date: '2026-05-01', studentName: 'Arjun Verma',      studentCode: '#STU-1022', class: '9-B',  period: 'Q1 2025-26', amount: 9500,  mode: 'Online', status: 'Completed' },
  { id: 3, receiptNo: 'RC-2026-00895', date: '2026-04-30', studentName: 'Priya Kapoor',     studentCode: '#STU-1045', class: '8-A',  period: 'Annual',     amount: 5000,  mode: 'Cheque', status: 'Partial'   },
  { id: 4, receiptNo: 'RC-2026-00894', date: '2026-04-30', studentName: 'Siddharth Mishra', studentCode: '#STU-1055', class: '7-B',  period: 'Q1 2025-26', amount: 11200, mode: 'Online', status: 'Completed' },
  { id: 5, receiptNo: 'RC-2026-00893', date: '2026-04-29', studentName: 'Ananya Sharma',    studentCode: '#STU-1078', class: '6-A',  period: 'Q1 2025-26', amount: 9000,  mode: 'Cash',   status: 'Completed' },
  { id: 6, receiptNo: 'RC-2026-00892', date: '2026-04-28', studentName: 'Aarav Sharma',     studentCode: '#STU-1001', class: '10-A', period: 'Q1 2025-26', amount: 12000, mode: 'Online', status: 'Completed' },
  { id: 7, receiptNo: 'RC-2026-00891', date: '2026-04-27', studentName: 'Priya Gupta',      studentCode: '#STU-1045', class: '11-A', period: 'Q1 2025-26', amount: 15000, mode: 'Online', status: 'Completed' },
];

const HISTORY_BADGE = { Completed: 'PAID', Partial: 'PARTIAL' };

const dateInputClass =
  'px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all bg-white';

// ── component ──────────────────────────────────────────────────────────────────
const CollectionsHistory = () => {
  const [tab, setTab]                 = useState('outstanding');
  const [selected, setSelected]       = useState([]);
  const [search, setSearch]           = useState('');
  const [statusF, setStatusF]         = useState('');
  const [classF, setClassF]           = useState('');
  const [periodF, setPeriodF]         = useState('');
  const [modeF, setModeF]             = useState('');
  const [fromDate, setFromDate]       = useState('');
  const [toDate, setToDate]           = useState('');
  const [page, setPage]               = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [collectModal, setCollectModal] = useState({ isOpen: false, student: null });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, receipt: null });

  // ── filtered lists ─────────────────────────────────────────────────────────
  const filteredOut = OUTSTANDING.filter((s) => {
    const q = search.toLowerCase();
    return (
      (!q      || s.studentName.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q) || s.class.toLowerCase().includes(q)) &&
      (!statusF || s.status === statusF) &&
      (!classF  || s.class  === classF)  &&
      (!periodF || s.period === periodF)
    );
  });

  const filteredHist = HISTORY.filter((h) => {
    const q = search.toLowerCase();
    return (
      (!q     || h.studentName.toLowerCase().includes(q) || h.receiptNo.toLowerCase().includes(q)) &&
      (!modeF  || h.mode  === modeF)  &&
      (!classF || h.class === classF)
    );
  });

  // ── selection ──────────────────────────────────────────────────────────────
  const toggle     = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll  = ()   => setSelected((p) => p.length === filteredOut.length ? [] : filteredOut.map((s) => s.id));
  const isSelected = (id) => selected.includes(id);
  const selTotal   = OUTSTANDING.filter((s) => selected.includes(s.id)).reduce((a, s) => a + s.balance, 0);

  // ── pagination ─────────────────────────────────────────────────────────────
  const activeList = tab === 'outstanding' ? filteredOut : filteredHist;
  const pagedItems = activeList.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleCollect = (student) => setCollectModal({ isOpen: true, student });

  const handleFeeSubmit = (data) => {
    const receipt = {
      receiptNo:    `RC-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
      date:         data.paymentDate,
      studentName:  data.student.studentName,
      studentCode:  data.student.studentCode,
      class:        data.student.class,
      period:       data.student.period,
      components:   [{ name: 'Fee Payment', amount: parseFloat(data.amountPaid) }],
      amountPaid:   parseFloat(data.amountPaid),
      discount:     parseFloat(data.discount) || 0,
      lateFine:     parseFloat(data.lateFine) || 0,
      paymentMode:  data.paymentMode,
      balanceAfter: data.student.balance - parseFloat(data.amountPaid),
    };
    setCollectModal({ isOpen: false, student: null });
    setReceiptModal({ isOpen: true, receipt });
  };

  const CLASSES = [...new Set(OUTSTANDING.map((s) => s.class))].sort();
  const PERIODS = [...new Set(OUTSTANDING.map((s) => s.period))];

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Collections & History</h1>
          <p className="text-sm text-gray-500 mt-0.5">Collect fee payments and view complete transaction history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FileDown size={14} />}>Export</Button>
          <Button variant="primary"   size="sm" onClick={() => handleCollect(OUTSTANDING[0])}>+ Collect Fee</Button>
        </div>
      </div>

      {/* ── Inner tabs ── */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'outstanding', label: 'Outstanding & Overdue', badge: OUTSTANDING.filter((s) => s.status === 'OVERDUE').length },
          { key: 'history',     label: 'Payment History',       badge: 0 },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); setSearch(''); setClassF(''); setStatusF(''); setModeF(''); }}
            className={`inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'text-navy border-navy'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="bg-danger text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB 1 — Outstanding & Overdue
      ══════════════════════════════════════ */}
      {tab === 'outstanding' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <SearchBar
              placeholder="Student name, code or class..."
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              className="flex-1 min-w-[240px]"
            />
            <Select value={classF}  onChange={(v) => { setClassF(v);  setPage(1); }} options={CLASSES.map((c) => ({ value: c, label: c }))} placeholder="All Classes" className="w-36" />
            <Select value={periodF} onChange={(v) => { setPeriodF(v); setPage(1); }} options={PERIODS.map((p) => ({ value: p, label: p }))} placeholder="All Periods" className="w-36" />
            <Select
              value={statusF}
              onChange={(v) => { setStatusF(v); setPage(1); }}
              options={[{ value: 'OVERDUE', label: 'Overdue' }, { value: 'PARTIAL', label: 'Partial' }, { value: 'UNPAID', label: 'Unpaid' }]}
              placeholder="All Status"
              className="w-36"
            />
          </div>

          {/* Bulk bar */}
          {selected.length > 0 && (
            <div className="bg-navy rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white text-sm font-bold">{selected.length} students selected</span>
                <span className="text-white/60 text-xs">Total: <strong className="text-white">{formatCurrency(selTotal)}</strong></span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelected([])}>Clear</Button>
                <Button variant="success"   size="sm" onClick={() => handleCollect(OUTSTANDING[0])}>Collect Selected ({selected.length})</Button>
              </div>
            </div>
          )}

          <Card>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>
                    <input
                      type="checkbox"
                      checked={filteredOut.length > 0 && selected.length === filteredOut.length}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 cursor-pointer accent-navy"
                    />
                  </Table.Head>
                  <Table.Head>Student</Table.Head>
                  <Table.Head>Class</Table.Head>
                  <Table.Head>Period</Table.Head>
                  <Table.Head className="text-right">Balance Due</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-center">Action</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {pagedItems.length === 0 ? (
                  <Table.Row>
                    <Table.Cell>
                      <div className="text-center text-gray-400 py-8 text-sm col-span-7">No records found</div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  pagedItems.map((s) => (
                    <Table.Row
                      key={s.id}
                      selected={isSelected(s.id)}
                      className={s.status === 'OVERDUE' && !isSelected(s.id) ? 'bg-red-50' : ''}
                    >
                      <Table.Cell>
                        <input type="checkbox" checked={isSelected(s.id)} onChange={() => toggle(s.id)} className="w-3.5 h-3.5 cursor-pointer accent-navy" />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="font-semibold text-gray-900">{s.studentName}</div>
                        <div className="text-xs text-gray-500">{s.studentCode}</div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="px-2 py-0.5 bg-navy-light text-navy text-xs font-semibold rounded">{s.class}</span>
                      </Table.Cell>
                      <Table.Cell className="text-xs text-gray-600">{s.period}</Table.Cell>
                      <Table.Cell className="text-right">
                        {s.status === 'OVERDUE' ? (
                          <span className="inline-flex items-center gap-1 text-danger text-xs font-bold">
                            ● {formatCurrency(s.balance)} · {s.daysLate}d late
                          </span>
                        ) : (
                          <span className="font-semibold">{formatCurrency(s.balance)}</span>
                        )}
                      </Table.Cell>
                      <Table.Cell><Badge status={s.status} showDot /></Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-center">
                          <Button variant="primary" size="xs" onClick={() => handleCollect(s)}>Collect</Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(filteredOut.length / rowsPerPage)}
              onPageChange={setPage}
              itemsPerPage={rowsPerPage}
              totalItems={filteredOut.length}
              onItemsPerPageChange={(n) => { setRowsPerPage(n); setPage(1); }}
            />
          </Card>
        </>
      )}

      {/* ══════════════════════════════════════
          TAB 2 — Payment History
      ══════════════════════════════════════ */}
      {tab === 'history' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <SearchBar
              placeholder="Student name or receipt no..."
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              className="flex-1 min-w-[240px]"
            />
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={dateInputClass} />
            <input type="date" value={toDate}   onChange={(e) => setToDate(e.target.value)}   className={dateInputClass} />
            <Select
              value={classF}
              onChange={(v) => { setClassF(v); setPage(1); }}
              options={[...new Set(HISTORY.map((h) => h.class))].sort().map((c) => ({ value: c, label: c }))}
              placeholder="All Classes"
              className="w-32"
            />
            <Select
              value={modeF}
              onChange={(v) => { setModeF(v); setPage(1); }}
              options={[{ value: 'Cash', label: 'Cash' }, { value: 'Online', label: 'Online' }, { value: 'Cheque', label: 'Cheque' }, { value: 'DD', label: 'DD' }]}
              placeholder="All Modes"
              className="w-32"
            />
          </div>

          <Card>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Receipt No.</Table.Head>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Student</Table.Head>
                  <Table.Head>Class</Table.Head>
                  <Table.Head>Period</Table.Head>
                  <Table.Head className="text-right">Amount</Table.Head>
                  <Table.Head>Mode</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-center">Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {pagedItems.length === 0 ? (
                  <Table.Row>
                    <Table.Cell>
                      <div className="text-center text-gray-400 py-8 text-sm">No records found</div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  pagedItems.map((h) => (
                    <Table.Row key={h.id}>
                      <Table.Cell><span className="font-semibold text-navy text-xs">{h.receiptNo}</span></Table.Cell>
                      <Table.Cell className="text-xs text-gray-600">{formatDate(h.date)}</Table.Cell>
                      <Table.Cell>
                        <div className="font-semibold text-gray-900">{h.studentName}</div>
                        <div className="text-xs text-gray-400">{h.studentCode}</div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="px-2 py-0.5 bg-navy-light text-navy text-xs font-semibold rounded">{h.class}</span>
                      </Table.Cell>
                      <Table.Cell className="text-xs text-gray-600">{h.period}</Table.Cell>
                      <Table.Cell className="text-right font-bold text-success">{formatCurrency(h.amount)}</Table.Cell>
                      <Table.Cell className="text-xs text-gray-600">{h.mode}</Table.Cell>
                      <Table.Cell>
                        <Badge status={HISTORY_BADGE[h.status] || 'PAID'}>{h.status}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() =>
                              setReceiptModal({
                                isOpen: true,
                                receipt: {
                                  receiptNo:    h.receiptNo,
                                  date:         h.date,
                                  studentName:  h.studentName,
                                  studentCode:  h.studentCode,
                                  class:        h.class,
                                  period:       h.period,
                                  components:   [{ name: 'Fee Payment', amount: h.amount }],
                                  amountPaid:   h.amount,
                                  discount:     0,
                                  lateFine:     0,
                                  paymentMode:  h.mode,
                                  balanceAfter: 0,
                                },
                              })
                            }
                          >
                            Receipt
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(filteredHist.length / rowsPerPage)}
              onPageChange={setPage}
              itemsPerPage={rowsPerPage}
              totalItems={filteredHist.length}
              onItemsPerPageChange={(n) => { setRowsPerPage(n); setPage(1); }}
            />
          </Card>
        </>
      )}

      {/* ── Modals ── */}
      <CollectFeeModal
        isOpen={collectModal.isOpen}
        onClose={() => setCollectModal({ isOpen: false, student: null })}
        student={collectModal.student}
        onSubmit={handleFeeSubmit}
      />
      <ReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, receipt: null })}
        receipt={receiptModal.receipt}
      />
    </div>
  );
};

export default CollectionsHistory;