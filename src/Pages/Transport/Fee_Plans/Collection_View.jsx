// import { useEffect, useState, useCallback } from "react";
// import {
//   CreditCard, Search, Bus, GraduationCap, ChevronDown, User,
//   AlertTriangle, Loader2, CheckCircle2,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import { authFetch } from "../../../Authfetch/Authfetch";
// import { API_ENDPOINTS } from "../../../Constants/Endpoints";
// import {
//   getStudentTransportBilling,
//   payTransportBilling,
//   getTransportBillingConfig,
// } from "../../../Api/Transport/TransportAPI";
// import { normalizeTransportConfig, DEFAULT_TRANSPORT_CONFIG } from "./TransportBillingConfig";

// const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
// const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// /** Build the list of month columns (1..3) present on a transport billing record */
// const getMonthCols = (record) => {
//   const cols = [];
//   [1, 2, 3].forEach((n) => {
//     if (record?.[`month${n}Month`]) {
//       cols.push({
//         idx: n,
//         month: record[`month${n}Month`],
//         year: record[`month${n}Year`],
//         amount: record[`month${n}Amount`],
//         adjusted: record[`month${n}Adjusted`],
//         reason: record[`month${n}Reason`],
//       });
//     }
//   });
//   return cols;
// };

// const getFeePeriods = async () => {
//   const res = await authFetch(API_ENDPOINTS.FEE_PERIODS, { method: "GET" });
//   if (!res.ok) throw new Error("Failed to fetch fee periods");
//   return (await res.json()).data || [];
// };

// const searchStudents = async (query) => {
//   const res = await authFetch(`${API_ENDPOINTS.STUDENTS_SEARCH}?q=${encodeURIComponent(query)}`, { method: "GET" });
//   if (!res.ok) throw new Error("Failed to search students");
//   return (await res.json()).data?.content || (await res.json()).data || [];
// };

// const getAcademicOutstanding = async (studentId, periodId, classId) => {
//   const params = new URLSearchParams({ periodId, studentId });
//   if (classId) params.append("classId", classId);
//   const res = await authFetch(`${API_ENDPOINTS.FEE_COLLECTIONS_OUTSTANDING}?${params.toString()}`, { method: "GET" });
//   if (!res.ok) throw new Error("Failed to fetch academic outstanding");
//   return (await res.json()).data;
// };

// const submitFeeCollection = async (payload) => {
//   const res = await authFetch(API_ENDPOINTS.FEE_COLLECTIONS, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) throw new Error("Failed to record payment");
//   return await res.json();
// };

// export default function Collection_View() {
//   const [feePeriods, setFeePeriods] = useState([]);
//   const [periodId, setPeriodId] = useState(null);

//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [searching, setSearching] = useState(false);
//   const [student, setStudent] = useState(null);

//   const [academic, setAcademic] = useState(null);
//   const [transport, setTransport] = useState(null);
//   const [loadingFee, setLoadingFee] = useState(false);
//   const [paying, setPaying] = useState(null); // which button

//   const [config, setConfig] = useState(DEFAULT_TRANSPORT_CONFIG);

//   useEffect(() => {
//     (async () => {
//       try {
//         const periods = await getFeePeriods();
//         setFeePeriods(periods);
//         if (periods.length) setPeriodId(periods[0].id);
//       } catch (err) {
//         console.error(err);
//       }
//       try {
//         const rawConfig = await getTransportBillingConfig();
//         setConfig(normalizeTransportConfig(rawConfig));
//       } catch (err) {
//         console.error(err);
//         // fall back to defaults — transport section still works
//       }
//     })();
//   }, []);

//   // Transport section should render only when transport billing is enabled
//   // AND it's allowed to show inside the collection modal.
//   const transportEnabled = config.enableTransportBilling && config.showInCollectionModal;

//   useEffect(() => {
//     if (query.trim().length < 2) { setResults([]); return; }
//     const t = setTimeout(async () => {
//       try {
//         setSearching(true);
//         const data = await searchStudents(query.trim());
//         setResults(data || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setSearching(false);
//       }
//     }, 350);
//     return () => clearTimeout(t);
//   }, [query]);

//   const loadFeeData = useCallback(async (st, pId) => {
//     if (!st || !pId) return;
//     try {
//       setLoadingFee(true);
//       // Transport billing disabled (or hidden from collection modal) at config level
//       // — don't even hit the API, just treat transport as not applicable.
//       const [academicData, transportData] = await Promise.all([
//         getAcademicOutstanding(st.id, pId, st.classId).catch(() => null),
//         transportEnabled ? getStudentTransportBilling(st.id, pId).catch(() => null) : Promise.resolve(null),
//       ]);
//       setAcademic(academicData);
//       setTransport(transportData);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load fee details");
//     } finally {
//       setLoadingFee(false);
//     }
//   }, [transportEnabled]);

//   const selectStudent = (st) => {
//     setStudent(st);
//     setResults([]);
//     setQuery(`${st.name || st.studentName} · #${st.admissionNumber}`);
//     loadFeeData(st, periodId);
//   };

//   useEffect(() => {
//     if (student && periodId) loadFeeData(student, periodId);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [periodId]);

//   const academicDue = academic?.outstandingAmount ?? academic?.due ?? academic?.amount ?? 0;
//   const transportDue = transport?.outstandingAmount ?? 0;
//   const totalDue = Number(academicDue) + Number(transportDue);

//   const [showMonthDetail, setShowMonthDetail] = useState(true);

//   const selectedPeriodLabel = feePeriods.find((p) => p.id === periodId)?.name
//     || feePeriods.find((p) => p.id === periodId)?.label
//     || "";

//   // "May waived — school closure" style one-line summary of the first
//   // adjusted month that has a reason attached (waived or reduced).
//   const adjustmentSummary = (() => {
//     if (!transport) return "";
//     const adjustedMonth = getMonthCols(transport).find((m) => m.adjusted && m.reason);
//     if (!adjustedMonth) return "";
//     const verb = adjustedMonth.amount === 0 ? "waived" : "adjusted";
//     return `${MONTH_NAMES[adjustedMonth.month]} ${verb} — ${adjustedMonth.reason}`;
//   })();

//   const handlePay = async (mode) => {
//     if (!student) return;
//     try {
//       setPaying(mode);
//       if (mode === "transport") {
//         if (!transport?.id) throw new Error("No transport billing record");
//         await payTransportBilling(transport.id, {
//           amount: transportDue,
//           paymentMode: "CASH",
//           paymentDate: new Date().toISOString().slice(0, 10),
//         });
//       } else {
//         const body = {
//           feeStructureId: academic?.feeStructureId,
//           amountPaid: academicDue,
//           paymentMode: "CASH",
//           paymentDate: new Date().toISOString().slice(0, 10),
//         };
//         if (mode === "all" && transportDue > 0) body.transportAmount = transportDue;
//         await submitFeeCollection(body);
//       }
//       toast.success("Payment recorded successfully");
//       loadFeeData(student, periodId);
//     } catch (err) {
//       console.error(err);
//       toast.error(err.message || "Payment failed");
//     } finally {
//       setPaying(null);
//     }
//   };

//   return (
//     <div className="w-full max-w-full min-w-0">
//       {/* Header */}
//       <div className="mb-6">
//         <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
//           <CreditCard className="w-6 h-6 text-indigo-600" />
//           Collection View
//         </h2>
//         <p className="text-gray-500 text-sm mt-1">
//           How transport fee appears alongside academic fees when collecting payment for a student.
//         </p>
//       </div>

//       {/* Search + Period */}
//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-3">
//         <div className="relative flex-1">
//           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search student by name or admission no..."
//             value={query}
//             onChange={(e) => { setQuery(e.target.value); setStudent(null); }}
//             className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
//           />
//           {searching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
//           {results.length > 0 && (
//             <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
//               {results.map((st) => (
//                 <button
//                   key={st.id}
//                   onClick={() => selectStudent(st)}
//                   className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-2 text-sm border-b border-gray-50 last:border-0"
//                 >
//                   <User className="w-4 h-4 text-gray-400 shrink-0" />
//                   <span className="font-semibold text-gray-800">{st.name || st.studentName}</span>
//                   <span className="text-gray-400">#{st.admissionNumber} · {st.className} {st.sectionName}</span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="relative w-full md:w-64">
//           <select
//             value={periodId || ""}
//             onChange={(e) => setPeriodId(Number(e.target.value))}
//             className="appearance-none w-full pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
//           >
//             {feePeriods.map((p) => (
//               <option key={p.id} value={p.id}>{p.name || p.label}</option>
//             ))}
//           </select>
//           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
//         </div>
//       </div>

//       {!student ? (
//         <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-400">
//           <Search className="w-10 h-10 mx-auto mb-3 text-gray-200" />
//           <p className="font-medium">Search and select a student to view their collection details</p>
//         </div>
//       ) : loadingFee ? (
//         <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center text-gray-400">
//           <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
//           <p className="font-medium">Loading fee details...</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           {/* Card header */}
//           <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
//             <h3 className="font-bold text-gray-900 flex items-center gap-2">
//               <CreditCard className="w-4 h-4 text-indigo-600" /> Collect Fee — {student.name || student.studentName}
//             </h3>
//             <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{fmt(totalDue)} due</span>
//           </div>

//           <div className="p-5 space-y-4">
//             {/* Student info */}
//             <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
//                   {(student.name || student.studentName || "?").charAt(0)}
//                 </div>
//                 <div>
//                   <p className="font-bold text-gray-900 text-sm">{student.name || student.studentName} · #{student.admissionNumber}</p>
//                   <p className="text-xs text-gray-400">{student.className} {student.sectionName}</p>
//                 </div>
//               </div>
//               <div className="text-right text-xs">
//                 <p className="text-gray-400">Due date</p>
//                 <p className="font-bold text-red-600">{feePeriods.find((p) => p.id === periodId)?.dueDate || "—"}</p>
//               </div>
//             </div>

//             {/* Academic Fee */}
//             <div className="border border-gray-200 rounded-xl overflow-hidden">
//               <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50/60 border-b border-gray-100">
//                 <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
//                   <GraduationCap className="w-4 h-4 text-indigo-600" /> Academic Fee
//                 </span>
//                 <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200">{fmt(academicDue)}</span>
//               </div>
//               <div className="px-4 py-3 space-y-1.5 text-sm">
//                 {Array.isArray(academic?.components) && academic.components.length > 0 ? (
//                   academic.components.map((c, i) => (
//                     <div key={i} className="flex justify-between">
//                       <span className="text-gray-600">{c.name || c.label}</span>
//                       <span className="font-semibold text-gray-800">{fmt(c.amount)}</span>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Outstanding balance</span>
//                     <span className="font-semibold text-gray-800">{fmt(academicDue)}</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Transport Fee — hidden entirely when transport billing is disabled
//                 or hidden-from-collection-modal at the config level */}
//             {transportEnabled && transport ? (
//               <div className="border border-blue-200 rounded-xl overflow-hidden">
//                 <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-b border-blue-100 gap-2">
//                   <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
//                     <Bus className="w-4 h-4 text-blue-600" /> Transport Fee — {selectedPeriodLabel}
//                   </span>
//                   <div className="flex items-center gap-2 shrink-0">
//                     <span className="text-xs font-bold bg-white text-green-700 px-2 py-0.5 rounded-full border border-green-200">
//                       {fmt(transport.finalTotal)}
//                     </span>
//                     <button
//                       onClick={() => setShowMonthDetail((v) => !v)}
//                       className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-full hover:bg-gray-50"
//                     >
//                       {showMonthDetail ? "▲" : "▼"} Month detail
//                     </button>
//                   </div>
//                 </div>
//                 <div className="px-4 py-3">
//                   <div className="flex items-center justify-between text-sm mb-1">
//                     <span className="text-gray-600">
//                       {transport.routeName} · {transport.stopName} <span className="text-gray-400">· {getMonthCols(transport).length} months</span>
//                     </span>
//                     <span className="font-semibold text-blue-700">{fmt(transport.finalTotal)}</span>
//                   </div>

//                   {/* Adjustment reason banner — e.g. "May waived — school closure" */}
//                   {adjustmentSummary && (
//                     <p className="text-xs text-amber-700 flex items-center gap-1 mb-2">
//                       <AlertTriangle className="w-3.5 h-3.5" /> {adjustmentSummary}
//                     </p>
//                   )}

//                   {showMonthDetail && (
//                     <div className="flex flex-wrap gap-2 mt-1">
//                       {getMonthCols(transport).map((m) => (
//                         <div
//                           key={m.idx}
//                           className={`flex-1 min-w-[86px] flex flex-col items-center justify-center text-center rounded-lg border px-3 py-2 ${m.adjusted && m.amount === 0
//                             ? "bg-red-50 border-red-200 text-red-600"
//                             : "bg-gray-50 border-gray-200 text-gray-700"
//                             }`}
//                         >
//                           <span className="text-[10px] font-semibold uppercase">{MONTH_NAMES[m.month]} {m.year}</span>
//                           <span className="font-bold text-sm">{fmt(m.amount)}</span>
//                           {m.adjusted && m.amount === 0 && <span className="text-[10px] font-semibold">WAIVED</span>}
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {transport.paidAmount > 0 && (
//                     <p className="text-xs text-green-700 flex items-center gap-1 mt-2">
//                       <CheckCircle2 className="w-3.5 h-3.5" /> {fmt(transport.paidAmount)} already paid
//                     </p>
//                   )}
//                 </div>
//               </div>
//             ) : transportEnabled ? (
//               <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
//                 <AlertTriangle className="w-4 h-4" /> No transport allocation for this student
//               </div>
//             ) : null}

//             {/* Total Due */}
//             <div className="bg-[#1A1A2E] text-white rounded-xl px-4 py-3 flex items-center justify-between">
//               <span className="font-semibold text-sm">Total Due (Academic + Transport)</span>
//               <span className="font-bold text-lg">{fmt(totalDue)}</span>
//             </div>

//             {/* Payment options — Transport Only only shows up when transport
//                 billing is enabled and visible in the collection modal */}
//             <div className={`grid grid-cols-1 gap-2 pt-1 ${transportEnabled && transport ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
//               <button
//                 onClick={() => handlePay("all")}
//                 disabled={paying !== null || totalDue <= 0}
//                 className="bg-[#1A1A2E] hover:bg-black text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50"
//               >
//                 {paying === "all" ? "Processing..." : `Pay All ${fmt(totalDue)}`}
//               </button>
//               <button
//                 onClick={() => handlePay("academic")}
//                 disabled={paying !== null || academicDue <= 0}
//                 className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold py-2.5 rounded-xl border border-blue-200 disabled:opacity-50"
//               >
//                 {paying === "academic" ? "Processing..." : `Academic Only ${fmt(academicDue)}`}
//               </button>
//               {transportEnabled && transport && (
//                 <button
//                   onClick={() => handlePay("transport")}
//                   disabled={paying !== null || transportDue <= 0}
//                   className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold py-2.5 rounded-xl border border-indigo-200 disabled:opacity-50">
//                   {paying === "transport" ? "Processing..." : `Transport Only ${fmt(transportDue)}`}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }