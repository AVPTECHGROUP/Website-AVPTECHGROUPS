export const studentFeeData = [
  {
    id: 1,
    studentName: 'Aarav Sharma',
    studentCode: '#STU-1001',
    class: '10-A',
    period: 'Q1 2025-26',
    totalFee: 12000,
    paidAmount: 12000,
    balance: 0,
    status: 'PAID',
    lastPayment: '2025-04-15',
    paymentMode: 'Online'
  },
  {
    id: 2,
    studentName: 'Kavita Mehta',
    studentCode: '#STU-1067',
    class: '9-A',
    period: 'Q1 2025-26',
    totalFee: 12000,
    paidAmount: 8000,
    balance: 4000,
    status: 'PARTIAL',
    lastPayment: '2025-04-10',
    paymentMode: 'Cash'
  },
  {
    id: 3,
    studentName: 'Rohan Verma',
    studentCode: '#STU-1023',
    class: '8-B',
    period: 'Q1 2025-26',
    totalFee: 10000,
    paidAmount: 0,
    balance: 10000,
    status: 'UNPAID',
    lastPayment: '-',
    paymentMode: '-'
  },
  {
    id: 4,
    studentName: 'Priya Gupta',
    studentCode: '#STU-1045',
    class: '11-A',
    period: 'Q1 2025-26',
    totalFee: 15000,
    paidAmount: 15000,
    balance: 0,
    status: 'PAID',
    lastPayment: '2025-04-20',
    paymentMode: 'Online'
  },
  {
    id: 5,
    studentName: 'Siddharth Mishra',
    studentCode: '#STU-1055',
    class: '8-A',
    period: 'Q1 2025-26',
    totalFee: 10000,
    paidAmount: 5000,
    balance: 5000,
    status: 'PARTIAL',
    lastPayment: '2025-04-05',
    paymentMode: 'Cash'
  },
  {
    id: 6,
    studentName: 'Ananya Singh',
    studentCode: '#STU-1078',
    class: '7-C',
    period: 'Q1 2025-26',
    totalFee: 9000,
    paidAmount: 9000,
    balance: 0,
    status: 'PAID',
    lastPayment: '2025-04-18',
    paymentMode: 'Online'
  },
  {
    id: 7,
    studentName: 'Arjun Patel',
    studentCode: '#STU-1089',
    class: '12-B',
    period: 'Q1 2025-26',
    totalFee: 18000,
    paidAmount: 10000,
    balance: 8000,
    status: 'PARTIAL',
    lastPayment: '2025-04-12',
    paymentMode: 'Cash'
  },
  {
    id: 8,
    studentName: 'Nisha Kumar',
    studentCode: '#STU-1034',
    class: '6-A',
    period: 'Q1 2025-26',
    totalFee: 8000,
    paidAmount: 0,
    balance: 8000,
    status: 'UNPAID',
    lastPayment: '-',
    paymentMode: '-'
  },
];

export const feeComponents = [
  { name: 'Tuition Fee', amount: 8000 },
  { name: 'Transport Fee', amount: 2400 },
  { name: 'Lab Fee', amount: 1200 },
  { name: 'Library Fee', amount: 400 },
];

export const paymentHistory = [
  {
    id: 1,
    receiptNo: 'RC-2026-00897',
    date: '2025-04-15',
    studentName: 'Aarav Sharma',
    class: '10-A',
    amount: 12000,
    mode: 'Online',
    status: 'Completed'
  },
  {
    id: 2,
    receiptNo: 'RC-2026-00896',
    date: '2025-04-14',
    studentName: 'Priya Gupta',
    class: '11-A',
    amount: 15000,
    mode: 'Online',
    status: 'Completed'
  },
  {
    id: 3,
    receiptNo: 'RC-2026-00895',
    date: '2025-04-12',
    studentName: 'Kavita Mehta',
    class: '9-A',
    amount: 8000,
    mode: 'Cash',
    status: 'Completed'
  },
];

export const feeStructures = [
  {
    id: 1,
    name: 'Standard Fee - Primary (1-5)',
    classes: ['1-A', '2-A', '3-A', '4-A', '5-A'],
    components: [
      { name: 'Tuition Fee', amount: 6000 },
      { name: 'Transport Fee', amount: 2000 },
      { name: 'Activity Fee', amount: 1000 },
    ],
    total: 9000,
    frequency: 'Quarterly'
  },
  {
    id: 2,
    name: 'Standard Fee - Middle (6-8)',
    classes: ['6-A', '7-A', '7-B', '8-A', '8-B'],
    components: [
      { name: 'Tuition Fee', amount: 7000 },
      { name: 'Transport Fee', amount: 2000 },
      { name: 'Lab Fee', amount: 1000 },
    ],
    total: 10000,
    frequency: 'Quarterly'
  },
  {
    id: 3,
    name: 'Standard Fee - Secondary (9-10)',
    classes: ['9-A', '9-B', '10-A', '10-B'],
    components: [
      { name: 'Tuition Fee', amount: 8000 },
      { name: 'Transport Fee', amount: 2400 },
      { name: 'Lab Fee', amount: 1200 },
      { name: 'Library Fee', amount: 400 },
    ],
    total: 12000,
    frequency: 'Quarterly'
  },
  {
    id: 4,
    name: 'Standard Fee - Senior (11-12)',
    classes: ['11-A', '11-B', '12-A', '12-B'],
    components: [
      { name: 'Tuition Fee', amount: 10000 },
      { name: 'Transport Fee', amount: 3000 },
      { name: 'Lab Fee', amount: 1500 },
      { name: 'Exam Fee', amount: 500 },
    ],
    total: 15000,
    frequency: 'Quarterly'
  },
];