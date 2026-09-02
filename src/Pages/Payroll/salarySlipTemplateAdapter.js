const formatCurrency = (value) => {
  const n = Number(value) || 0
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const toMoney = (value) => (value == null || value === '' ? 0 : Number(value) || 0)

const normalizeDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function mapSlipToTemplateData(slip = {}, schoolInfo = {}) {
  const schoolName = schoolInfo?.name || schoolInfo?.schoolName || 'School Name'
  const schoolAddress = schoolInfo?.address || schoolInfo?.schoolAddress || ''
  const schoolPhone = schoolInfo?.phone || schoolInfo?.schoolPhone || schoolInfo?.mobile || ''
  const schoolEmail = schoolInfo?.email || schoolInfo?.schoolEmail || ''
  const schoolLogo = schoolInfo?.logoUrl || schoolInfo?.logo || schoolInfo?.schoolLogo || ''
  const schoolLogoFallback = schoolInfo?.logoFallback || schoolInfo?.schoolLogo || ''

  const earnings = [
    { label: 'Basic Salary', value: slip.baseSalary },
    { label: 'House Rent Allowance', value: slip.houseRentAllowance },
    { label: 'Travel Allowance', value: slip.travelAllowance },
    { label: 'Dearness Allowance', value: slip.dearnessAllowance },
    { label: 'Special Allowance', value: slip.specialAllowance },
    { label: 'Other Allowances', value: slip.otherAllowances },
  ].filter((row) => row.value != null && row.value !== '')

  const deductions = [
    { label: 'Provident Fund', value: slip.providentFund },
    { label: 'Professional Tax', value: slip.professionalTax },
    { label: 'Income Tax (TDS)', value: slip.incomeTax },
    { label: 'Other Deductions', value: slip.otherDeductions },
    { label: `Leave Deduction${slip.leaveDays ? ` (${slip.leaveDays} day${slip.leaveDays === 1 ? '' : 's'})` : ''}`, value: slip.leaveDeduction },
  ].filter((row) => row.value != null && row.value !== '')

  const grossEarnings = toMoney(slip.grossEarnings ?? earnings.reduce((sum, row) => sum + toMoney(row.value), 0))
  const totalDeductions = toMoney(slip.totalDeductions ?? deductions.reduce((sum, row) => sum + toMoney(row.value), 0))
  const netSalary = toMoney(slip.netSalary ?? grossEarnings - totalDeductions)

  return {
    schoolName,
    schoolAddress,
    schoolPhone,
    schoolEmail,
    schoolLogo,
    schoolLogoFallback,
    schoolInitials: schoolName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),

    employeeName: slip.userName || slip.employeeName || '—',
    employeeCode: slip.employeeCode || '—',
    employeeId: slip.employeeCode || slip.userId || '—',
    designation: slip.designation || '—',
    department: slip.department || '—',
    salaryType: slip.userType || slip.salaryType || 'Monthly',
    monthLabel: slip.monthLabel || `${new Date(slip.year || new Date().getFullYear(), (slip.month || 1) - 1).toLocaleString('en-IN', { month: 'long' })} ${slip.year || new Date().getFullYear()}`,
    workingDays: slip.totalDays ?? slip.workingDays ?? '—',
    presentDays: slip.presentDays ?? 0,
    leaveDays: slip.leaveDays ?? 0,
    absentDays: slip.absentDays ?? 0,
    approvedBy: slip.approvedBy || '—',
    approvedAt: slip.approvedAt ? normalizeDate(slip.approvedAt) : '—',
    payrollStatus: slip.status || slip.payrollStatus || 'DRAFT',
    generatedBy: slip.generatedBy || '—',
    generatedAt: slip.generatedAt ? normalizeDate(slip.generatedAt) : normalizeDate(new Date()),
    grossEarnings: formatCurrency(grossEarnings),
    totalDeductions: formatCurrency(totalDeductions),
    netSalary: formatCurrency(netSalary),
    grossEarningsValue: grossEarnings,
    totalDeductionsValue: totalDeductions,
    netSalaryValue: netSalary,
    remarks: slip.remarks || '',

    earnings: earnings.map((row) => ({
      label: row.label,
      amountFormatted: formatCurrency(row.value),
      amount: row.value,
    })),
    deductions: deductions.map((row) => ({
      label: row.label,
      amountFormatted: formatCurrency(row.value),
      amount: row.value,
    })),
  }
}
