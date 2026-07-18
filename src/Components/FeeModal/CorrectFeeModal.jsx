const CollectFeeModal = ({ open, onClose, student: initialStudent, periodOptions, onSuccess, canCollect, canViewTransport }) => {
  const isManualMode = !initialStudent;

  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [form, setForm] = useState({
    academicAmount: '', transportAmount: '',
    paymentMode: STATUSES.CASH, paymentDate: getTodayDate(),
    referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [periodStructures, setPeriodStructures] = useState([]);
  const [periodClasses, setPeriodClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [activeStudent, setActiveStudent] = useState(null);

  const [transportInfo, setTransportInfo] = useState(null);
  const [transportLoading, setTransportLoading] = useState(false);

  const academicTouchedRef = useRef(false);
  const transportTouchedRef = useRef(false);

  const academicBalance = Number(activeStudent?.balance) || 0;
  const transportDue = transportInfo?.outstandingAmount
      ?? Math.max(0, (transportInfo?.finalTotal || 0) - (transportInfo?.paidAmount || 0));

  const hasAcademicStructure = !!activeStudent?.feeStructureId;
  const academicSettled = academicBalance <= 0;
  const transportSettled = transportDue <= 0;
  const isFullyPaid = activeStudent !== null && academicSettled && (!canViewTransport || transportSettled);
  // Transport-only student = genuinely no academic fee structure this
  // period. Still routed to the Transport module — see file-level note.
  const isTransportOnlyStudent = activeStudent !== null && !hasAcademicStructure && transportDue > 0;

  const academicAmountNum = parseFloat(form.academicAmount) || 0;
  const transportAmountNum = parseFloat(form.transportAmount) || 0;
  const discountNum = parseFloat(form.discount) || 0;
  const lateFineNum = parseFloat(form.lateFine) || 0;

  // Discount/late fine apply to the ACADEMIC portion only, matching the
  // original single-column behavior — transport amount is sent as-is.
  const netAcademicAmount = Math.max(0, academicAmountNum - discountNum);
  const netTotal = netAcademicAmount + lateFineNum + transportAmountNum;

  const academicExceedsBalance = netAcademicAmount > academicBalance + EPS && academicBalance > 0;
  const transportExceedsBalance = transportAmountNum > transportDue + EPS && transportDue > 0;
  const discountExceedsAmount = discountNum > academicAmountNum + EPS;

  const activeStructure = useMemo(() => {
    if (!periodStructures.length) return null;
    if (activeStudent?.feeStructureId) {
      const byId = periodStructures.find((s) => s.id === activeStudent.feeStructureId);
      if (byId) return byId;
    }
    return periodStructures.find((s) => (s.classes || []).some((c) => String(c.id) === selectedClassId)) || null;
  }, [periodStructures, activeStudent, selectedClassId]);

  const academicItems = useMemo(
      () => (activeStudent && hasAcademicStructure ? getAcademicLineItems(activeStructure, activeStudent.totalFee || academicBalance) : []),
      [activeStructure, activeStudent, academicBalance, hasAcademicStructure]
  );
  const academicSubtotal = academicItems.reduce((s, it) => s + it.amount, 0);
  const transportItems = useMemo(() => getTransportLineItems(transportInfo), [transportInfo]);

  useEffect(() => {
    if (!open) return;
    setPeriodStructures([]); setPeriodClasses([]); setSelectedClassId('');
    setStudents([]); setStudentSearch(''); setTransportInfo(null);
    academicTouchedRef.current = false; transportTouchedRef.current = false;
    if (initialStudent) {
      const totalFee = Number(initialStudent.totalFee) || 0;
      const balance = Number(initialStudent.balance) || 0;
      const paidAmount = reconcilePaidAmount(totalFee, balance, initialStudent.paidAmount);

      setActiveStudent({ ...initialStudent, totalFee, balance, paidAmount });
      const matched =
          periodOptions.find((p) => String(p.value) === String(initialStudent.feePeriodId)) ||
          periodOptions.find((p) => p.label?.trim().toLowerCase() === initialStudent.period?.trim().toLowerCase()) ||
          periodOptions[0];
      setSelectedPeriodId(matched ? String(matched.value) : '');
      setForm({
        academicAmount: balance > 0 ? String(balance) : '',
        transportAmount: '',
        paymentMode: STATUSES.CASH, paymentDate: getTodayDate(),
        referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
      });
    } else {
      setActiveStudent(null); setSelectedPeriodId('');
      setForm({ academicAmount: '', transportAmount: '', paymentMode: STATUSES.CASH, paymentDate: getTodayDate(), referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '' });
    }
  }, [open, initialStudent, periodOptions]);

  useEffect(() => {
    if (!selectedPeriodId) {
      setPeriodStructures([]); setPeriodClasses([]); setSelectedClassId(''); setStudents([]);
      if (isManualMode) setActiveStudent(null);
      return;
    }
    const load = async () => {
      setClassesLoading(true);
      try {
        const structures = await getFeeStructures(parseInt(selectedPeriodId));
        const arr = Array.isArray(structures) ? structures : [];
        setPeriodStructures(arr);
        const seen = new Set(); const classes = [];
        arr.forEach((s) => (s.classes || []).forEach((c) => {
          if (!seen.has(c.id)) { seen.add(c.id); classes.push({ id: c.id, name: c.name || c.className }); }
        }));
        setPeriodClasses(classes);
      } catch {
        toast.error(COLLECTION_HISTORY_STRINGS.TOAST_LOAD_FAILED, COLLECTION_HISTORY_STRINGS.TOAST_COULD_NOT_FETCH_CLASSES);
      } finally { setClassesLoading(false); }
    };
    load();
  }, [selectedPeriodId]);

  useEffect(() => {
    if (!selectedClassId || !selectedPeriodId) { setStudents([]); return; }
    let cancelled = false;
    const load = async () => {
      setStudentsLoading(true);
      try {
        let roster = [];
        try {
          roster = await getStudentByClass(selectedClassId);
        } catch {
          const res = await authFetch(`${BASE_URL}/students/class/${selectedClassId}?status=ACTIVE`);
          const data = await res.json();
          roster = Array.isArray(data) ? data : (data?.data || []);
        }
        roster = Array.isArray(roster) ? roster : [];

        let feeRecordsByStudent = new Map();
        try {
          const res = await getOutstandingFees({ periodId: selectedPeriodId, classId: selectedClassId, page: 0, size: 500 });
          (res?.records || []).forEach((r) => feeRecordsByStudent.set(String(r.studentId), r));
        } catch { /* falls through */ }

        let paidByStudent = new Map();
        try {
          const hist = await getFeeCollectionHistory({ classId: selectedClassId, periodId: selectedPeriodId, page: 0, size: 500 });
          (hist?.records || []).forEach((h) => {
            const sid = String(h.studentId ?? h.student?.id ?? '');
            if (!sid) return;
            paidByStudent.set(sid, (paidByStudent.get(sid) || 0) + (Number(h.amountPaid) || 0));
          });
        } catch { /* falls through to "never billed" below */ }

        const matchedStructure = periodStructures.find((st) => (st.classes || []).some((c) => String(c.id) === selectedClassId));
        const structureComponents = matchedStructure?.components || matchedStructure?.feeComponents || [];
        const structureTotal = Array.isArray(structureComponents) && structureComponents.length > 0
            ? structureComponents.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
            : Number(matchedStructure?.totalAmount || matchedStructure?.amount) || 0;

        const merged = roster.map((s) => {
          const sid = String(s.id || s.studentId);
          const rec = feeRecordsByStudent.get(sid);
          if (rec) {
            const totalFee = Number(rec.totalFee) || 0;
            const balanceDueVal = Number(rec.balanceDue) || 0;
            return {
              ...s,
              balanceDue: balanceDueVal,
              paidAmount: reconcilePaidAmount(totalFee, balanceDueVal, rec.paidAmount),
              totalFee,
              feeStructureId: rec.feeStructureId ?? matchedStructure?.id ?? null,
              overdueDays: rec.overdueDays || 0,
              dueDate: rec.dueDate,
            };
          }
          const historyPaid = paidByStudent.get(sid) || 0;
          const resolvedBalance = Math.max(0, structureTotal - historyPaid);
          return {
            ...s,
            balanceDue: resolvedBalance,
            paidAmount: Math.min(historyPaid, structureTotal),
            totalFee: structureTotal,
            feeStructureId: matchedStructure?.id ?? s.feeStructureId ?? null,
            overdueDays: 0,
            dueDate: null,
          };
        });

        if (!cancelled) setStudents(merged);
      } catch {
        if (!cancelled) {
          toast.error(COLLECTION_HISTORY_STRINGS.TOAST_LOAD_FAILED, COLLECTION_HISTORY_STRINGS.TOAST_COULD_NOT_FETCH_STUDENTS);
          setStudents([]);
        }
      } finally { if (!cancelled) setStudentsLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedClassId, selectedPeriodId, periodStructures]);

  useEffect(() => {
    if (!canViewTransport || !activeStudent?.studentId || !selectedPeriodId) { setTransportInfo(null); return; }
    let cancelled = false;
    (async () => {
      setTransportLoading(true);
      try {
        const info = await getStudentTransportBilling(activeStudent.studentId, selectedPeriodId);
        if (!cancelled) setTransportInfo(info);
      } catch {
        if (!cancelled) setTransportInfo(null);
      } finally {
        if (!cancelled) setTransportLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [canViewTransport, activeStudent, selectedPeriodId]);

  // Once transport data resolves, default its amount field to the full
  // transport due — independently of the academic field, and only if the
  // user hasn't already typed their own transport value.
  useEffect(() => {
    if (!activeStudent || transportLoading || transportTouchedRef.current) return;
    if (transportDue > 0) {
      setForm((p) => (p.transportAmount === String(transportDue) ? p : { ...p, transportAmount: String(transportDue) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportLoading, transportDue, activeStudent]);

  if (!open) return null;

  const isOverdue = activeStudent?.status === STATUSES.OVERDUE;

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    return !q || name.includes(q) || (s.admissionNumber || '').toLowerCase().includes(q);
  });

  const selectStudent = (s) => {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const classObj = periodClasses.find((c) => String(c.id) === selectedClassId);
    const studentBalance = Number(s.balanceDue) || 0;
    const paidSoFar = Number(s.paidAmount) || 0;
    academicTouchedRef.current = false; transportTouchedRef.current = false;

    setActiveStudent({
      studentId: s.id || s.studentId,
      studentName: fullName,
      studentCode: s.admissionNumber || s.studentCode,
      class: s.className || s.class || classObj?.name || '',
      feeStructureId: s.feeStructureId,
      feePeriodId: selectedPeriodId,
      balance: studentBalance,
      paidAmount: paidSoFar,
      totalFee: Number(s.totalFee) || 0,
      dueDate: s.dueDate,
      daysLate: s.overdueDays || 0,
      status:
          s.overdueDays > 0 && studentBalance > 0 ? STATUSES.OVERDUE
              : paidSoFar > 0 && studentBalance > 0 ? STATUSES.PARTIAL
                  : studentBalance <= 0 ? STATUSES.PAID
                      : STATUSES.PENDING,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
    });

    setForm((p) => ({ ...p, academicAmount: studentBalance > 0 ? String(studentBalance) : '' }));
  };

  // FIX: discount and late fine must only ever be zero or a positive whole
  // number. Rather than parsing the value and clamping it after the fact
  // (Math.max(0, Number(...))), which can leave a stray "-" sitting visibly
  // in a controlled type="number" input because React doesn't repaint an
  // invalid numeric input on every keystroke, we strip any character that
  // isn't a digit directly out of the raw string as the user types or
  // pastes. This makes a negative value structurally impossible to enter,
  // not just numerically clamped after the fact.
  const sanitizeNonNegativeAmount = (raw) => raw.replace(/[^0-9]/g, '');

  const handleSubmit = async () => {
    if (!activeStudent) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_NO_STUDENT_SELECTED, COLLECTION_HISTORY_STRINGS.TOAST_PLEASE_SELECT_STUDENT); return; }
    if (isTransportOnlyStudent) { toast.warning('Transport-only fee', 'This student has no academic fee for this period — collect the transport fee via Transport → Billing.'); return; }
    if (isFullyPaid) { toast.info(COLLECTION_HISTORY_STRINGS.TOAST_NO_BALANCE_DUE, `${activeStudent.studentName} has no outstanding balance.`); return; }
    if (academicAmountNum <= 0 && transportAmountNum <= 0) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_INVALID_AMOUNT, 'Enter an academic and/or transport amount to collect.'); return; }
    if (academicExceedsBalance) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_AMOUNT_TOO_HIGH, `Academic amount cannot exceed ${fmt(academicBalance)}.`); return; }
    if (transportExceedsBalance) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_AMOUNT_TOO_HIGH, `Transport amount cannot exceed ${fmt(transportDue)}.`); return; }
    if (discountExceedsAmount) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_DISCOUNT_TOO_HIGH, COLLECTION_HISTORY_STRINGS.TOAST_DISCOUNT_EXCEEDS); return; }
    if (!selectedPeriodId) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_NO_PERIOD_SELECTED, COLLECTION_HISTORY_STRINGS.TOAST_PLEASE_SELECT_PERIOD); return; }
    if (academicAmountNum > 0 && !activeStudent.feeStructureId) { toast.error(COLLECTION_HISTORY_STRINGS.TOAST_FEE_STRUCTURE_MISSING, COLLECTION_HISTORY_STRINGS.TOAST_NO_FEE_STRUCTURE_FOUND); return; }
    // FIX: hard backstop — even though discount/lateFine can no longer be
    // typed as negative (sanitizeNonNegativeAmount strips '-' on every
    // keystroke), this guards against any other code path that might set
    // form.discount / form.lateFine programmatically.
    if (discountNum < 0) { toast.warning('Invalid discount', 'Discount cannot be negative.'); return; }
    if (lateFineNum < 0) { toast.warning('Invalid late fine', 'Late fine cannot be negative.'); return; }

    try {
      setLoading(true);
      // FIX: amountPaid (academic, net of discount) and transportAmount
      // (raw, no discount) are now sent as two SEPARATE fields on the same
      // confirmed payload — this is what actually resolves the "amount
      // exceeds balance" error, which was the backend validating a
      // combined amount against the academic balance alone.
      const res = await createFeeCollection({
        studentId: activeStudent.studentId,
        feeStructureId: activeStudent.feeStructureId ?? 0,
        amountPaid: netAcademicAmount,
        discount: discountNum || 0,
        discountReason: form.discountReason || null,
        lateFine: lateFineNum || 0,
        paymentMode: form.paymentMode,
        paymentDate: form.paymentDate,
        referenceNo: form.referenceNo || null,
        remarks: form.remarks || null,
        transportAmount: transportAmountNum || 0,
      });
      toast.success(
          COLLECTION_HISTORY_STRINGS.TOAST_PAYMENT_RECORDED,
          transportAmountNum > 0
              ? `Receipt generated for ${activeStudent.studentName} (Academic ${fmt(netAcademicAmount)} + Transport ${fmt(transportAmountNum)}).`
              : `Receipt generated for ${activeStudent.studentName}.`
      );
      onSuccess(res, activeStudent, { transportPaid: transportAmountNum, transportInfo });
    } catch (e) {
      toast.error(COLLECTION_HISTORY_STRINGS.TOAST_PAYMENT_FAILED, e.message || COLLECTION_HISTORY_STRINGS.TOAST_COULD_NOT_RECORD_PAYMENT);
    } finally { setLoading(false); }
  };

  const submitDisabled =
      loading || !activeStudent || isFullyPaid || isTransportOnlyStudent ||
      (academicAmountNum <= 0 && transportAmountNum <= 0) ||
      academicExceedsBalance || transportExceedsBalance || discountExceedsAmount;

  return (
      <Modal open={open} onClose={onClose}
             title={COLLECTION_HISTORY_STRINGS.BTN_COLLECT_FEE}
             subtitle={COLLECTION_HISTORY_STRINGS.HEADER_SUBTITLE}
             wide
             footer={
               <>
                 <Btn variant="secondary" onClick={onClose} className="w-full sm:w-auto">{COLLECTION_HISTORY_STRINGS.BTN_CANCEL}</Btn>
                 <div className="relative group w-full sm:w-auto">
                   <Btn variant="success" onClick={handleSubmit} disabled={submitDisabled} className="w-full sm:w-auto">
                     {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                     {loading ? COLLECTION_HISTORY_STRINGS.BTN_RECORDING : COLLECTION_HISTORY_STRINGS.BTN_RECORD_RECEIPT}
                   </Btn>
                   {activeStudent && isFullyPaid && (
                       <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                         ✓ Fully paid
                       </div>
                   )}
                 </div>
               </>
             }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── LEFT: Period → Class → Student (manual mode only) ── */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fee Period <span className="text-gray-400">*</span></label>
              <select value={selectedPeriodId} onChange={(e) => setSelectedPeriodId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white">
                <option value="">-- Select fee period --</option>
                {periodOptions.map((p) => <option key={p.value} value={String(p.value)}>{p.label}</option>)}
              </select>
            </div>

            {isManualMode && selectedPeriodId && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Class <span className="text-gray-400">*</span>
                    {classesLoading && <span className="text-gray-400 font-normal ml-1">(loading…)</span>}
                  </label>
                  {!classesLoading && periodClasses.length === 0 ? (
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                        {COLLECTION_HISTORY_STRINGS.MSG_NO_CLASSES}
                      </div>
                  ) : (
                      <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50/50 max-h-32 overflow-y-auto">
                        {classesLoading
                            ? <div className="text-xs text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_LOADING_CLASSES}</div>
                            : periodClasses.map((c) => (
                                <button key={c.id} type="button"
                                        onClick={() => { setSelectedClassId(String(c.id)); setStudentSearch(''); setActiveStudent(null); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedClassId === String(c.id)
                                            ? 'bg-blue-950 text-white border-blue-950'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-950/50 hover:text-blue-950'
                                        }`}>
                                  {c.name}
                                </button>
                            ))
                        }
                      </div>
                  )}
                </div>
            )}

            {isManualMode && selectedClassId && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Student <span className="text-gray-400">*</span>
                    {studentsLoading && <span className="text-gray-400 font-normal ml-1">(loading…)</span>}
                  </label>
                  <div className="relative mb-2">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                           placeholder={COLLECTION_HISTORY_STRINGS.PLACEHOLDER_SEARCH_STUDENT}
                           className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white" />
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                    {studentsLoading ? (
                        <div className="flex items-center justify-center py-8 gap-2">
                          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_LOADING_STUDENTS}</span>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-400">
                          {studentSearch ? COLLECTION_HISTORY_STRINGS.MSG_NO_STUDENT_MATCH : COLLECTION_HISTORY_STRINGS.MSG_NO_STUDENTS_CLASS}
                        </div>
                    ) : filteredStudents.map((s) => {
                      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
                      const isSelected = activeStudent?.studentId === (s.id || s.studentId);
                      const sBalance = s.balanceDue ?? s.balance ?? 0;
                      const isPaid = sBalance <= 0;
                      return (
                          <div key={s.id || s.studentId} onClick={() => selectStudent(s)}
                               className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${isSelected ? 'bg-blue-50 border-l-4 border-l-[#1E3A5F]'
                                   : isPaid ? 'bg-emerald-50/50 hover:bg-emerald-50'
                                       : 'hover:bg-gray-50'
                               }`}>
                            <Av name={fullName} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-gray-900 truncate">{fullName}</div>
                              <div className="text-xs text-gray-500">{s.admissionNumber || s.studentCode || '—'}</div>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-1.5">
                              {isPaid
                                  ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Paid</span>
                                  : <span className="text-[10px] font-semibold text-orange-600">{fmt(sBalance)}</span>
                              }
                              {isSelected && <span className="text-[10px] font-bold text-[#1E3A5F] bg-blue-100 px-2 py-0.5 rounded-md">Selected</span>}
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </div>
            )}

            {activeStudent && (
                <div className={`border rounded-xl p-3 flex items-center gap-3 ${isFullyPaid ? 'bg-emerald-50 border-emerald-200' : isTransportOnlyStudent ? 'bg-sky-50 border-sky-200' : 'bg-blue-50 border-blue-200'}`}>
                  <Av name={activeStudent.studentName} status={activeStudent.status} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900 truncate">{activeStudent.studentName}</div>
                    <div className="text-xs text-gray-600 truncate">{activeStudent.studentCode} · Class {activeStudent.class}</div>
                    {activeStudent.parentName && <div className="text-[11px] text-gray-500 mt-0.5 truncate">Parent: {activeStudent.parentName}</div>}
                    {isFullyPaid && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle size={12} className="text-emerald-600" />
                          <span className="text-[11px] font-bold text-emerald-700">Fully paid</span>
                        </div>
                    )}
                    {isTransportOnlyStudent && (
                        <div className="flex items-center gap-1 mt-1">
                          <Bus size={12} className="text-sky-600" />
                          <span className="text-[11px] font-bold text-sky-700">Transport fee only — use Transport module</span>
                        </div>
                    )}
                  </div>
                </div>
            )}

            {/* ── Fee Breakdown: itemized Academic + Transport ── */}
            {activeStudent && selectedPeriodId && (
                <div className="space-y-2">
                  <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Fee Breakdown</div>

                  {hasAcademicStructure && (
                      <LineItemBlock
                          title="Academic Fee"
                          icon={<IndianRupee size={12} />}
                          items={academicItems}
                          subtotal={academicSubtotal}
                          tone="slate"
                      />
                  )}

                  {canViewTransport && (
                      <LineItemBlock
                          title="Transport Fee"
                          icon={<Bus size={12} />}
                          items={transportLoading ? [] : transportItems}
                          subtotal={transportDue}
                          tone="sky"
                          extra={
                            transportLoading ? (
                                <div className="text-xs text-sky-600 flex items-center gap-2 mt-2">
                                  <span className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" /> Loading…
                                </div>
                            ) : !transportInfo ? (
                                <div className="text-xs text-sky-600 mt-2">No transport allocation for this student/period.</div>
                            ) : (
                                <div className="text-[11px] text-sky-500 mt-2">
                                  {transportInfo.routeName || transportInfo.routeCode || 'Route'} · {transportInfo.stopName || '—'}
                                </div>
                            )
                          }
                      />
                  )}
                </div>
            )}
          </div>

          {/* ── RIGHT: Payment form — two independent amount columns ── */}
          <div className={`space-y-4 ${(isFullyPaid || isTransportOnlyStudent) ? 'opacity-40 pointer-events-none select-none' : ''}`}>

            {/* Two-column amount entry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Academic column */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Academic Amount <span className="text-gray-400">*</span>
                </label>
                <div className="relative">
                  <Inp
                      type="number"
                      value={form.academicAmount}
                      disabled={!hasAcademicStructure}
                      className={`pr-16 ${academicExceedsBalance ? 'border-orange-400 bg-orange-50' : ''}`}
                      onChange={(e) => { academicTouchedRef.current = true; setForm((p) => ({ ...p, academicAmount: e.target.value })); }}
                      max={academicBalance} min={0}
                      placeholder={hasAcademicStructure ? `Max ${fmt(academicBalance)}` : 'N/A'}
                  />
                  {hasAcademicStructure && academicBalance > 0 && (
                      <button type="button"
                              onClick={() => { academicTouchedRef.current = true; setForm((p) => ({ ...p, academicAmount: String(academicBalance) })); }}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#1E3A5F] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-1 rounded">
                        Full
                      </button>
                  )}
                </div>
                {academicExceedsBalance && (
                    <p className="text-[10.5px] text-orange-600 font-medium mt-1">Exceeds academic due ({fmt(academicBalance)})</p>
                )}
                {!hasAcademicStructure && (
                    <p className="text-[10.5px] text-gray-400 mt-1">No academic fee this period</p>
                )}
              </div>

              {/* Transport column */}
              {canViewTransport && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Bus size={11} className="text-sky-600" /> Transport Amount
                    </label>
                    <div className="relative">
                      <Inp
                          type="number"
                          value={form.transportAmount}
                          disabled={transportDue <= 0}
                          className={`pr-16 ${transportExceedsBalance ? 'border-orange-400 bg-orange-50' : ''}`}
                          onChange={(e) => { transportTouchedRef.current = true; setForm((p) => ({ ...p, transportAmount: e.target.value })); }}
                          max={transportDue} min={0}
                          placeholder={transportDue > 0 ? `Max ${fmt(transportDue)}` : 'None due'}
                      />
                      {transportDue > 0 && (
                          <button type="button"
                                  onClick={() => { transportTouchedRef.current = true; setForm((p) => ({ ...p, transportAmount: String(transportDue) })); }}
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-1.5 py-1 rounded">
                            Full
                          </button>
                      )}
                    </div>
                    {transportExceedsBalance && (
                        <p className="text-[10.5px] text-orange-600 font-medium mt-1">Exceeds transport due ({fmt(transportDue)})</p>
                    )}
                  </div>
              )}
            </div>

            {(academicAmountNum > 0 && academicAmountNum < academicBalance) || (transportAmountNum > 0 && transportAmountNum < transportDue) ? (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  <Info size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-[11px] text-amber-700">
                    Partial payment — the remainder will stay outstanding for that column.
                  </div>
                </div>
            ) : null}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {COLLECTION_HISTORY_STRINGS.LBL_PAYMENT_MODE} <span className="text-gray-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_MODES_WITH_ICON.map(([mode, icon, label]) => (
                    <button key={mode} type="button" onClick={() => setForm((p) => ({ ...p, paymentMode: mode }))}
                            className={`flex flex-col items-center gap-1 sm:gap-1.5 px-2 py-2 sm:py-2.5 rounded-xl border-2 transition-all ${form.paymentMode === mode
                                ? 'border-[#1E3A5F] bg-blue-50 text-[#1E3A5F]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-[#1E3A5F]/40'
                            }`}>
                      <span className="text-lg sm:text-xl">{icon}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold">{label}</span>
                    </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {COLLECTION_HISTORY_STRINGS.LBL_PAYMENT_DATE} <span className="text-gray-400">*</span>
                </label>
                <Inp type="date" value={form.paymentDate}
                     onChange={(e) => setForm((p) => ({ ...p, paymentDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{COLLECTION_HISTORY_STRINGS.LBL_REFERENCE_NO}</label>
                <Inp value={form.referenceNo} placeholder="TXN / Cheque no."
                     onChange={(e) => setForm((p) => ({ ...p, referenceNo: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {COLLECTION_HISTORY_STRINGS.LBL_DISCOUNT} <span className="text-gray-400 font-normal">(academic only, optional)</span>
              </label>
              {/* FIX: discount can now only ever be zero or a positive whole
                  number — '-' and any other non-digit character are
                  stripped as the user types or pastes, so a negative value
                  is never actually renderable in the field, not merely
                  clamped after the fact. */}
              <Inp
                  type="number"
                  min={0}
                  step={1}
                  value={form.discount}
                  placeholder="Discount amount"
                  className={discountExceedsAmount ? 'border-orange-400 bg-orange-50' : ''}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, discount: sanitizeNonNegativeAmount(e.target.value) }));
                  }}
              />
              {discountExceedsAmount && (
                  <p className="text-[11px] text-orange-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {COLLECTION_HISTORY_STRINGS.MSG_DISCOUNT_EXCEEDS}
                  </p>
              )}
              {discountNum > 0 && !discountExceedsAmount && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle size={11} /> Discount of {fmt(discountNum)} applied
                  </p>
              )}
              <textarea value={form.discountReason} rows={2}
                        onChange={(e) => setForm((p) => ({ ...p, discountReason: e.target.value }))}
                        placeholder={COLLECTION_HISTORY_STRINGS.LBL_REASON}
                        className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
            </div>

            {isOverdue && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle size={14} className="text-amber-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-amber-800">{COLLECTION_HISTORY_STRINGS.MSG_LATE_FINE_PROMPT}</div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Due: {fmtDate(activeStudent?.dueDate)} · {activeStudent?.daysLate} day{activeStudent?.daysLate !== 1 ? 's' : ''} overdue
                      </div>
                    </div>
                  </div>
                  {/* FIX: same non-negative sanitization as discount — the
                      late fine field can never hold a '-' character. */}
                  <Inp
                      type="number"
                      min={0}
                      step={1}
                      value={form.lateFine}
                      placeholder="Fine amount (₹)"
                      onChange={(e) => {
                        setForm((p) => ({ ...p, lateFine: sanitizeNonNegativeAmount(e.target.value) }));
                      }}
                  />
                </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{COLLECTION_HISTORY_STRINGS.LBL_REMARKS}</label>
              <textarea value={form.remarks} rows={2}
                        onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                        placeholder={COLLECTION_HISTORY_STRINGS.LBL_OPTIONAL_NOTE}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#1E3A5F] rounded-xl px-4 py-3 gap-2">
              <div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">{COLLECTION_HISTORY_STRINGS.LBL_RECEIPT_NO}</div>
                <div className="text-white font-bold text-sm mt-0.5">{COLLECTION_HISTORY_STRINGS.LBL_AUTO_GENERATED}</div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[10px] text-white/50 uppercase tracking-wider">{COLLECTION_HISTORY_STRINGS.LBL_NET_COLLECTED}</div>
                <div className={`font-extrabold text-xl ${netTotal > 0 ? 'text-white' : 'text-white/30'}`}>
                  {netTotal > 0 ? fmt(netTotal) : '—'}
                </div>
                <div className="text-[10px] text-white/50 mt-0.5">
                  Academic {fmt(netAcademicAmount)}{lateFineNum > 0 ? ` + ${fmt(lateFineNum)} fine` : ''}
                  {transportAmountNum > 0 ? ` + Transport ${fmt(transportAmountNum)}` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
  );
};