import { useState, useEffect, useMemo, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "react-toastify";

import { useDecodedUser } from "../../ContextAPI/UserContext";

import ControlBar    from "../../Components/Homework/Controlbar";
import HomeworkTable from "../../Components/Homework/Homeworktable";
import AssignModal   from "../../Components/Homework/Assignmodal";
import ViewModal     from "../../Components/Homework/Viewmodal";

import {
  createHomework,
  updateHomework,
  cancelHomework,
  uploadHomeworkAttachment,
  getHomework,
  getActiveSubjectsBySection,
} from "../../Api/Homework";

import SectionSubjectService from "../../Api/SectionSubjectService";

// ── Date helpers ──────────────────────────────────────────────────────────────
const toDateStr = (date) => date.toISOString().split("T")[0];

const defaultDateRange = (offsetDays = 2) => {
  const today = new Date();
  const from  = new Date(today);
  const to    = new Date(today);
  from.setDate(today.getDate() - offsetDays);
  to.setDate(today.getDate()   + offsetDays);
  return { dateFrom: toDateStr(from), dateTo: toDateStr(to) };
};

// ── Error toast ───────────────────────────────────────────────────────────────
const showError = (err, fallback = "Something went wrong") =>
  toast.error(typeof err?.message === "string" ? err.message : fallback);

// ── Default filters — dates pre-seeded with ±2 days around today ──────────────
const makeEmptyFilters = () => ({
  subjectFilter: "",
  statusFilter:  "",
  search:        "",
  ...defaultDateRange(2),
});

const normClass   = (item) => ({ id: item.id ?? item.classId ?? "",    label: item.name ?? item.className   ?? item.label ?? "" });
const normSection = (item) => ({ id: item.id ?? item.sectionId ?? "",  label: item.name ?? item.sectionName ?? item.label ?? "" });
const normSubject = (item) => ({ id: item.subjectId ?? item.id ?? "",  label: item.subjectName ?? item.name ?? item.label ?? "" });

// ─────────────────────────────────────────────────────────────────────────────
export default function HomeworkPage() {

  const { user } = useDecodedUser();
  const teacherId = user?.teacherId
    ? Number(user.teacherId)
    : user?.id ? Number(user.id) : undefined;

  // ── Classes ───────────────────────────────────────────────────────────────
  const [classes,        setClasses]        = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  useEffect(() => {
    setClassesLoading(true);
    SectionSubjectService.getAllClasses()
      .then((data) => {
        const normalized = data.map(normClass);
        const unique = Array.from(new Map(normalized.map((c) => [c.id || c.label, c])).values());
        setClasses(unique);
      })
      .catch((err) => showError(err, "Failed to load classes"))
      .finally(() => setClassesLoading(false));
  }, []);

  // ── Sections ──────────────────────────────────────────────────────────────
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

  // ── Subjects ──────────────────────────────────────────────────────────────
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [subjects,          setSubjects]          = useState([]);
  const [subjectsLoading,   setSubjectsLoading]   = useState(false);

  useEffect(() => {
    setSubjects([]);
    setFilters((f) => ({ ...f, subjectFilter: "" }));
    if (!selectedSectionId) return;

    setSubjectsLoading(true);
    getActiveSubjectsBySection(selectedSectionId)
      .then((raw) => {
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        setSubjects(list.map(normSubject));
      })
      .catch((err) => showError(err, "Failed to load subjects"))
      .finally(() => setSubjectsLoading(false));
  }, [selectedSectionId]);

  // ── Filters — default dates are ±2 days from today ────────────────────────
  const [filters, setFilters] = useState(makeEmptyFilters);
  const setFilter = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));

  // Reset restores default ±2-day window, not blank dates
  const handleReset = () => {
    setFilters(makeEmptyFilters());
    if (selectedSectionId) setApplyTrigger((n) => n + 1);
  };

  // ── Apply trigger ─────────────────────────────────────────────────────────
  const [applyTrigger, setApplyTrigger] = useState(0);

  const handleApply = useCallback(() => {
    if (!selectedSectionId) return;
    setApplyTrigger((n) => n + 1);
  }, [selectedSectionId]);

  // Auto-fetch as soon as a section is chosen (uses the default date window)
  useEffect(() => {
    if (selectedSectionId) setApplyTrigger((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId]);

  // ── Homework fetch ────────────────────────────────────────────────────────
  const [rows,        setRows]        = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const fetchHomework = useCallback(async () => {
    if (!selectedSectionId) { setRows([]); return; }

    setListLoading(true);
    try {
      const result = await getHomework({
        sectionId: selectedSectionId,
        subjectId: filters.subjectFilter || undefined,
        status:    filters.statusFilter  || undefined,
        dueAfter:  filters.dateFrom      || undefined,
        dueBefore: filters.dateTo        || undefined,
      });

      setRows(Array.isArray(result) ? result : []);
    } catch (err) {
      showError(err, "Failed to load homework");
    } finally {
      setListLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId, filters.subjectFilter, filters.statusFilter, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    if (applyTrigger > 0) fetchHomework();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyTrigger]);

  // Clear rows when selection changes so stale data never shows
  useEffect(() => { setRows([]); }, [selectedClassId, selectedSectionId]);

  // ── Client-side search ────────────────────────────────────────────────────
  const visibleRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((hw) =>
      (hw.title       ?? "").toLowerCase().includes(q) ||
      (hw.description ?? hw.desc ?? "").toLowerCase().includes(q)
    );
  }, [rows, filters.search]);

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

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (payload, file) => {
    setSubmitting(true);
    try {
      const enriched = {
        ...payload,
        sectionId: Number(selectedSectionId),
        teacherId,
      };

      let saved;
      if (editHw) {
        saved = await updateHomework(editHw.id, enriched);
      } else {
        saved = await createHomework(enriched);
      }

      const savedId = saved?.id ?? saved?.data?.id ?? saved?.data?.homeworkId;
      if (file && savedId) await uploadHomeworkAttachment(savedId, file);

      toast.success(editHw ? "Homework updated!" : "Homework published!");
      closeAssign();
      setApplyTrigger((n) => n + 1);
    } catch (err) {
      showError(err, "Failed to save homework");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Inline date save — called when user clicks a date cell in the table ───
  // Sends a minimal PATCH/PUT with only the changed date field.
  const handleDateSave = async (hw, field, isoDate) => {
    setSubmitting(true);
    try {
      await updateHomework(hw.id, {
        ...hw,
        [field]: isoDate,
        sectionId: Number(selectedSectionId),
        teacherId,
      });
      toast.success("Date updated!");
      setApplyTrigger((n) => n + 1);
    } catch (err) {
      showError(err, "Failed to update date");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = async (hwId) => {
    if (!window.confirm("Cancel this homework?")) return;
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
            onDateSave = {handleDateSave}
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
    </div>
  );
}