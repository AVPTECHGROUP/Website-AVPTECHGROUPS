import React, { useState } from 'react';
import {
  IndianRupee, TrendingUp, AlertCircle, Receipt, Percent,
  ArrowRight, Settings
} from 'lucide-react';
import StatCard from '../../Components/FeeModal/Statcard';
import Card from '../../Components/FeeModal/Card';
import Button from '../../Components/FeeModal/Button';
import Table from '../../Components/FeeModal/Table';
import Badge from '../../Components/FeeModal/Badge';
import Select from '../../Components/FeeModal/Select';
import { formatCurrency } from '../../Components/FeeModal/helper';

// ── local data ─────────────────────────────────────────────────────────────────
const classCollectionData = [
  { cls: 'Class 10', students: 82,  billed: 984000,  collected: 820000, balance: 164000, pct: 83,  status: 'PARTIAL' },
  { cls: 'Class 9',  students: 90,  billed: 990000,  collected: 990000, balance: 0,      pct: 100, status: 'PAID'    },
  { cls: 'Class 8',  students: 76,  billed: 760000,  collected: 570000, balance: 190000, pct: 75,  status: 'OVERDUE' },
  { cls: 'Class 7',  students: 74,  billed: 666000,  collected: 590000, balance: 76000,  pct: 89,  status: 'PARTIAL' },
  { cls: 'Class 6',  students: 72,  billed: 576000,  collected: 576000, balance: 0,      pct: 100, status: 'PAID'    },
];

const recentCollections = [
  { initials: 'RS', name: 'Riya Sharma',      cls: 'Cl.10-A · Q1', amt: 12000,  mode: 'Cash',   day: 'Today',     color: '#1A3A5C' },
  { initials: 'AV', name: 'Arjun Verma',      cls: 'Cl.9-B · Q1',  amt: 9500,   mode: 'Online', day: 'Today',     color: '#B45309' },
  { initials: 'PK', name: 'Priya Kapoor',     cls: 'Cl.8-A · Ann', amt: 5000,   mode: 'Cheque', day: 'Partial',   color: '#1A3A5C' },
  { initials: 'SM', name: 'Siddharth Mishra', cls: 'Cl.7-B · Q1',  amt: 11200,  mode: 'Online', day: 'Yesterday', color: '#0D7A55' },
];

const overdueAlerts = [
  { name: 'Kavita Mehta', info: '9-A · Q1 · 21 days overdue', amt: 18000 },
  { name: 'Rahul Tiwari', info: '9-A · Q1 · 21 days overdue', amt: 12000 },
  { name: 'Neha Singh',   info: '8-A · Q1 · 16 days overdue', amt: 9500  },
];

const activePeriods = [
  { type: 'QUARTERLY', typeLabel: 'Quarterly', name: 'Q1 2025-26',    due: 'Apr 30, 2026', sub: '482 students',   subColor: '#1A3A5C', accent: '#1A3A5C', status: 'PARTIAL',  statusLabel: 'Active'    },
  { type: 'QUARTERLY', typeLabel: 'Quarterly', name: 'Q2 2025-26',    due: 'Jul 31, 2026', sub: 'Not started',    subColor: '#64748B', accent: null,       status: 'PENDING',  statusLabel: 'Upcoming'  },
  { type: 'YEARLY',    typeLabel: 'Yearly',    name: 'Annual 2025-26', due: 'Apr 10, 2026', sub: '100% collected', subColor: '#0D7A55', accent: '#0D7A55',  status: 'PAID',    statusLabel: 'Closed'    },
  { type: 'MONTHLY',   typeLabel: 'Monthly',   name: 'May 2026',       due: 'May 10, 2026', sub: '124 students',   subColor: '#0369A1', accent: '#0369A1',  status: 'PARTIAL',  statusLabel: 'Active'    },
];

// ── Progress bar ───────────────────────────────────────────────────────────────
function ProgressBar({ pct }) {
  const color = pct === 100 ? '#0D7A55' : pct >= 85 ? '#0D7A55' : pct >= 70 ? '#B45309' : '#B91C1C';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div style={{ width: `${pct}%`, background: color }} className="h-full rounded-full" />
      </div>
      <span className="text-[11px] text-gray-500">{pct}%</span>
    </div>
  );
}

// ── Avatar pill ────────────────────────────────────────────────────────────────
function Avatar({ initials, color }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

// ── Overview page ──────────────────────────────────────────────────────────────
const Overview = ({ onNavigate, onCollect }) => {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Summary for Academic Year 2025–26 · All Classes · May 2026</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">⬇ Export Report</Button>
          <Button variant="primary" size="sm" onClick={onCollect}>+ Collect Fee</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard title="Total Billed"      value="₹48.6L" subtitle="520 students · 4 periods" type="total"    icon={<IndianRupee size={18} />} />
        <StatCard title="Collected"         value="₹34.2L" subtitle="70.4% collection rate"    type="paid"     icon={<TrendingUp size={18} />} />
        <StatCard title="Partial / Pending" value="₹6.8L"  subtitle="87 students with balance" type="partial"  icon={<AlertCircle size={18} />} />
        <StatCard title="Overdue"           value="₹7.6L"  subtitle="9 students past due date" type="overdue"  icon={<Receipt size={18} />} />
        <StatCard title="Discounts Given"   value="₹1.4L"  subtitle="43 students"              type="discount" icon={<Percent size={18} />} />
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Collection by class (spans 2 cols) */}
        <div className="col-span-2">
          <Card>
            <Card.Header
              actions={
                <Select
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: 'q1', label: 'Q1 2025-26' },
                    { value: 'annual', label: 'Annual 2025-26' },
                  ]}
                  placeholder="All Periods"
                  className="text-xs py-1 px-2 h-7"
                />
              }
            >
              Collection by Class
            </Card.Header>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Class</Table.Head>
                  <Table.Head>Students</Table.Head>
                  <Table.Head>Billed</Table.Head>
                  <Table.Head>Collected</Table.Head>
                  <Table.Head>Balance</Table.Head>
                  <Table.Head>Progress</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {classCollectionData.map((row) => (
                  <Table.Row key={row.cls}>
                    <Table.Cell><span className="font-semibold">{row.cls}</span></Table.Cell>
                    <Table.Cell>{row.students}</Table.Cell>
                    <Table.Cell>{formatCurrency(row.billed)}</Table.Cell>
                    <Table.Cell className="text-success font-semibold">{formatCurrency(row.collected)}</Table.Cell>
                    <Table.Cell className={row.balance > 0 ? (row.status === 'OVERDUE' ? 'text-danger font-semibold' : 'text-[#B45309] font-semibold') : 'text-success'}>
                      {row.balance > 0 ? formatCurrency(row.balance) : '₹0'}
                    </Table.Cell>
                    <Table.Cell><ProgressBar pct={row.pct} /></Table.Cell>
                    <Table.Cell><Badge status={row.status} showDot /></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent collections */}
          <Card>
            <Card.Header
              actions={
                <button
                  onClick={() => onNavigate('collections')}
                  className="text-xs text-navy font-semibold flex items-center gap-1 hover:underline"
                >
                  View all <ArrowRight size={12} />
                </button>
              }
            >
              Recent Collections
            </Card.Header>
            <div>
              {recentCollections.map((r, i) => (
                <div
                  key={r.name}
                  className={`flex items-center gap-3 px-4 py-2.5 ${i < recentCollections.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <Avatar initials={r.initials} color={r.color} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{r.name}</div>
                    <div className="text-[11px] text-gray-500">{r.cls}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${r.mode === 'Cheque' ? 'text-[#B45309]' : 'text-success'}`}>{formatCurrency(r.amt)}</div>
                    <div className="text-[11px] text-gray-500">{r.mode} · {r.day}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Overdue alerts */}
          <Card className="border-l-[3px] border-l-danger">
            <Card.Header
              actions={
                <Button variant="danger" size="xs" onClick={() => onNavigate('collections')}>View All</Button>
              }
            >
              Overdue Alerts
            </Card.Header>
            <div>
              {overdueAlerts.map((a, i) => (
                <div
                  key={a.name}
                  className={`flex items-center justify-between px-4 py-2.5 ${i < overdueAlerts.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{a.name}</div>
                    <div className="text-[11px] text-gray-500">{a.info}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-sm font-bold text-danger">{formatCurrency(a.amt)}</div>
                    <Button variant="primary" size="xs" onClick={onCollect} className="mt-1">Collect</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Active Fee Periods */}
      <Card>
        <Card.Header
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('periods')}>
              Manage Periods <ArrowRight size={13} />
            </Button>
          }
        >
          Active Fee Periods — 2025–26
        </Card.Header>
        <Card.Body className="grid grid-cols-4 gap-4 p-4">
          {activePeriods.map((p) => (
            <div
              key={p.name}
              className="rounded-lg border border-gray-200 p-3"
              style={{ borderLeft: p.accent ? `3px solid ${p.accent}` : undefined }}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge status={p.type}>{p.typeLabel}</Badge>
                <Badge status={p.status}>{p.statusLabel}</Badge>
              </div>
              <div className="text-sm font-bold text-gray-800">{p.name}</div>
              <div className="text-[11px] text-gray-500 mt-1">Due: {p.due}</div>
              <div className="text-xs font-bold mt-2" style={{ color: p.subColor }}>{p.sub}</div>
            </div>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Overview;