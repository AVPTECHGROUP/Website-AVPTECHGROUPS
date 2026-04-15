import { useState, useEffect, useMemo, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../../Components/Homework/confirmmodal";

import { useDecodedUser } from "../../ContextAPI/UserContext";

import ControlBar    from "../../Components/Homework/Controlbar";
import HomeworkTable from "../../Components/Homework/Homeworktable";
import AssignModal   from "../../Components/Homework/Assignmodal";
import ViewModal     from "../../Components/Homework/Viewmodal";

import {
  createHomework,
  updateHomework,
  cancelHomework,           // PATCH /homework/:id/status?status=CANCELLED
  uploadHomeworkAttachment,
  getHomework,              // GET  /homework/section/:sectionId
} from "../../Api/Homework";

import { getActiveSubjectsBySection } from "../../Api/Homework";
import SectionSubjectService from "../../Api/SectionSubjectService";
// ── Error toast helper — always shows the message string, never a raw object ──
const showError = (err, fallback = "Something went wrong") =>
    toast.error(typeof err?.message === "string" ? err.message : fallback);
const getDefaultDates = () => {
  const today = new Date();

  const before = new Date(today);
  before.setDate(today.getDate() - 2);

  const after = new Date(today);
  after.setDate(today.getDate() + 2);

  const format = (d) => d.toISOString().split("T")[0];

  return {
    dateFrom: format(before),
    dateTo: format(after),
  };
};

const EMPTY_FILTERS = {
  subjectFilter: "",
  statusFilter:  "",
  search:        "",
  ...getDefaultDates(),   // dateFrom = today-2, dateTo = today — not overridden
};
console.log("EMPTY_FILTERS dates →", EMPTY_FILTERS.dateFrom, EMPTY_FILTERS.dateTo);
// ── Normalise class / section / subject shapes from different API responses ───
const normClass = (item) => ({
  id:    item.id        ?? item.classId    ?? "",
  label: item.name      ?? item.className  ?? item.label ?? "",
});

const normSection = (item) => ({
  id:    item.id        ?? item.sectionId   ?? "",
  label: item.name      ?? item.sectionName ?? item.label ?? "",
});

const normSubject = (item) => ({
  id:    item.subjectId ?? item.id     ?? "",
  label: item.subjectName ?? item.name ?? item.label ?? "",
});

// ─────────────────────────────────────────────────────────────────────────────
export default function HomeworkPage() {

  // ── Teacher ID from decoded JWT ───────────────────────────────────────────
  const { user } = useDecodedUser();
  // Coerce to number here so it's ready for the payload
  // const teacherId = user?.teacherId
  // ? Number(user.teacherId)
  // : user?.id
  // ? Number(user.id)
  // : undefined;
  const teacherId=62;

  // ── Classes ───────────────────────────────────────────────────────────────
  const [classes,        setClasses]        = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
  const fetchClasses = async () => {
    setClassesLoading(true);
    try {
      const data = await SectionSubjectService.getAllClasses();

      // Normalize first
      const normalized = data.map(normClass);

      // Remove duplicates based on ID (preferred) or label fallback
      const uniqueMap = new Map();

      normalized.forEach((item) => {
        const key = item.id || item.label; // fallback if id missing
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      setClasses(Array.from(uniqueMap.values()));
    } catch (err) {
      showError(err, "Failed to load classes");
    } finally {
      setClassesLoading(false);
    }
  };

  fetchClasses();
}, []);
  

  // ── Sections — reload when selected class changes ─────────────────────────
  const [selectedClassId,   setSelectedClassId]   = useState("");
  const [sections,          setSections]          = useState([]);
  const [sectionsLoading,   setSectionsLoading]   = useState(false);

  useEffect(() => {
    setSections([]);
    setSelectedSectionId("");
    setSubjects([]);
    if (!selectedClassId) return;

    setSectionsLoading(true);
    SectionSubjectService.getSectionsByClass(selectedClassId)
        .then((data) => setSections(data.map(normSection)))
        .catch((err) => showError(err, "Failed to load sections"))
        .finally(() => setSectionsLoading(false));
  }, [selectedClassId]);

  // ── Subjects — reload when selected section changes ───────────────────────
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [subjects,          setSubjects]          = useState([]);
  const [subjectsLoading,   setSubjectsLoading]   = useState(false);

useEffect(() => {
  setSubjects([]);
  setFilters((f) => ({ ...f, subjectFilter: "" }));

  if (!selectedSectionId) return;

  const fetchSubjects = async () => {
    setSubjectsLoading(true);
    try {
      const list = await getActiveSubjectsBySection(selectedSectionId);
      setSubjects(list.map(normSubject));
    } catch (err) {
      showError(err, "Failed to load subjects");
    } finally {
      setSubjectsLoading(false);
    }
  };

  fetchSubjects();
}, [selectedSectionId]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const setFilter = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    if (selectedSectionId) setApplyTrigger((n) => n + 1);
  };

  // ── Apply trigger — fetch fires ONLY when user clicks Apply ───────────────
  const [applyTrigger, setApplyTrigger] = useState(0);
  const handleApply = useCallback(() => {
    if (!selectedSectionId) return;
    setApplyTrigger((n) => n + 1);
  }, [selectedSectionId]);

  // ── Homework list ─────────────────────────────────────────────────────────
  const [rows,        setRows]        = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

const fetchHomework = useCallback(async () => {
  if (!selectedClassId || !selectedSectionId) {
    setRows([]);
    return;
  }

  setListLoading(true);

  try {
    const result = await getHomework({
      sectionId: selectedSectionId,
      subjectId: filters.subjectFilter || undefined,
      status:    filters.statusFilter  || undefined,

      // ✅ USE UI VALUES
      dueAfter: filters.dateFrom || undefined,
      dueBefore: filters.dateTo || undefined,
    });

    setRows(Array.isArray(result) ? result : []);
  } catch (err) {
    showError(err, "Failed to load homework");
  } finally {
    setListLoading(false);
  }
}, [selectedClassId, selectedSectionId, filters]);

  useEffect(() => {
    if (applyTrigger > 0) fetchHomework();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyTrigger]);

  // Clear table when class / section selection changes
  useEffect(() => {
  setRows([]);
  if (selectedClassId && selectedSectionId) {
    setApplyTrigger((n) => n + 1);   // reuses existing fetch path — no new logic
  }
}, [selectedClassId, selectedSectionId]);

  // ── Client-side search + date filters ────────────────────────────────────
  const visibleRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return rows.filter((hw) => {
      const textMatch = !q ||
          (hw.title       ?? "").toLowerCase().includes(q) ||
          (hw.description ?? hw.desc ?? "").toLowerCase().includes(q);

      const subjectMatch = !filters.subjectFilter ||
          String(hw.subjectId ?? "") === String(filters.subjectFilter);

      const statusMatch = !filters.statusFilter ||
          String(hw.status ?? "") === String(filters.statusFilter);

      const hwDue = hw.dueDate ? new Date(hw.dueDate) : null;
      const fromMatch = !filters.dateFrom || !hwDue || hwDue >= new Date(filters.dateFrom);
      const toMatch   = !filters.dateTo   || !hwDue || hwDue <= new Date(filters.dateTo);

      return textMatch && subjectMatch && statusMatch && fromMatch && toMatch;
    });
  }, [rows, filters]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   rows.length,
    active:  rows.filter((hw) => hw.status === "PUBLISHED").length,
    overdue: rows.filter((hw) =>
        hw.dueDate && new Date(hw.dueDate) < new Date() && hw.status !== "CANCELLED"
    ).length,
  }), [rows]);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [assignOpen, setAssignOpen] = useState(false);
  const [viewHw,     setViewHw]     = useState(null);
  const [editHw,     setEditHw]     = useState(null);

  const openEdit    = (hw) => { setEditHw(hw); setAssignOpen(true); };
  const closeAssign = ()   => { setAssignOpen(false); setEditHw(null); };

  // ── Save — POST /homework  |  PUT /homework/:id ───────────────────────────
  const handleSave = async (payload, file) => {
    setSubmitting(true);
    try {
      // Numeric IDs must be numbers — strings cause 500 on the Java side.
      // sanitizePayload inside the API layer handles this, but we also coerce
      // here for clarity and to avoid the round-trip if validation is server-side.
      const enriched = {
        ...payload,
        sectionId: Number(selectedSectionId),   // string → number
        teacherId,                               // already a number (see top)
      };

      let saved;
      if (editHw) {
        saved = await updateHomework(editHw.id, enriched);
      } else {
        saved = await createHomework(enriched);
      }

      // The saved ID may live at different depths depending on the API envelope
      const savedId = saved?.id ?? saved?.data?.id ?? saved?.data?.homeworkId;

      if (file && savedId) {
        await uploadHomeworkAttachment(savedId, file);
      }

      toast.success(editHw ? "Homework updated!" : "Homework published!");
      closeAssign();
      setApplyTrigger((n) => n + 1);   // re-fetch after save
    } catch (err) {
      showError(err, "Failed to save homework");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel — PATCH /homework/:id/status?status=CANCELLED ─────────────────
 const handleCancel = (hwId) => setConfirmCancel(hwId); // just open the modal

const handleConfirmCancel = async () => {
  const hwId = confirmCancel;
  setConfirmCancel(null);
  setSubmitting(true);
  try {
    await cancelHomework(hwId);
    toast.success("Homework cancelled");
    setApplyTrigger((n) => n + 1);
  } catch (err) {
    showError(err, "Failed to cancel homework");
  } finally {
    setSubmitting(false);
  }
};

  // ─────────────────────────────────────────────────────────────────────────
  return (
      <div className="flex flex-col h-full">

        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 bg-white">
          <BookOpen size={18} className="text-blue-700" />
          <h1 className="text-sm font-bold text-gray-900">Homework Management</h1>
        </div>

        <div className="flex-1 overflow-hidden m-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">

          <ControlBar
              classes         = {classes}
              classesLoading  = {classesLoading}
              sections        = {sections}
              sectionsLoading = {sectionsLoading}
              subjects        = {subjects}
              subjectsLoading = {subjectsLoading}

              selectedClassId      = {selectedClassId}
              setSelectedClassId   = {setSelectedClassId}
              selectedSectionId    = {selectedSectionId}
              setSelectedSectionId = {setSelectedSectionId}

              total   = {stats.total}
              active  = {stats.active}
              overdue = {stats.overdue}

              subjectFilter    = {filters.subjectFilter}
              setSubjectFilter = {setFilter("subjectFilter")}
              statusFilter     = {filters.statusFilter}
              setStatusFilter  = {setFilter("statusFilter")}
              dateFrom         = {filters.dateFrom}
              setDateFrom      = {setFilter("dateFrom")}
              dateTo           = {filters.dateTo}
              setDateTo        = {setFilter("dateTo")}
              search           = {filters.search}
              setSearch        = {setFilter("search")}

              onReset  = {handleReset}
              onApply  = {handleApply}
              onAssign = {() => setAssignOpen(true)}
          />

          <div className="flex-1 overflow-auto">
            <HomeworkTable
                rows       = {visibleRows}
                loading    = {listLoading}
                submitting = {submitting}
                onView     = {(hw) => setViewHw(hw)}
                onEdit     = {openEdit}
                onCancel   = {handleCancel}
            />
          </div>
        </div>

        {viewHw && (
            <ViewModal
                hw      = {viewHw}
                onClose = {() => setViewHw(null)}
                onEdit  = {openEdit}
            />
        )}

        {assignOpen && (
            <AssignModal
                mode            = {editHw ? "edit" : "assign"}
                hw              = {editHw}
                subjects        = {subjects}
                subjectsLoading = {subjectsLoading}
                submitting      = {submitting}
                onClose         = {closeAssign}
                onSave          = {handleSave}
            />
        )}

        {confirmCancel && (
  <ConfirmModal
    message="Are you sure you want to cancel this homework? This action cannot be undone."
    onConfirm={handleConfirmCancel}
    onClose={() => setConfirmCancel(null)}
  />
)}
      </div>
  );
}