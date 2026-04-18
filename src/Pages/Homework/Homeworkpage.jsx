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
  cancelHomework,
  uploadHomeworkAttachment,
  getHomework,
  getActiveSubjectsBySection,
  getTeacherLookup,
} from "../../Api/Homework";

import { getActiveClasses, getSectionsByClass } from "../../Api/ClassSectionAPI";

const showError = (err, fallback = "Something went wrong") =>
    toast.error(typeof err?.message === "string" ? err.message : fallback);

const getDefaultDates = () => {
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const format = (d) => d.toISOString().split("T")[0];
  return { dateFrom: format(oneWeekAgo), dateTo: format(today) };
};

const EMPTY_FILTERS = {
  subjectFilter: "",
  statusFilter:  "",
  search:        "",
  ...getDefaultDates(),
};

const normClass   = (item) => ({ id: item.id ?? item.classId ?? "",   label: item.name ?? item.className ?? item.label ?? "" });
const normSection = (item) => ({ id: item.id ?? item.sectionId ?? "", label: item.name ?? item.sectionName ?? item.label ?? "" });
const normSubject = (item) => ({ id: item.subjectId ?? item.id ?? "", label: item.subjectName ?? item.name ?? item.label ?? "" });

// ── Normalise teacher records from the lookup API { id, name } ──────────────
// The lookup endpoint returns { id, name }. We keep the raw shape as-is so
// AssignModal can resolve it with its own resolveTeacherName helper, but we
// also normalise here in case any other part of the page reads teacher.name.
const normTeacher = (item) => ({
  ...item,
  id: item.id ?? item.userId ?? item.profile?.id ?? "",
  name: (
    item.name ??
    item.fullName ??
    item.profile?.fullName ??
    `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim()
  ) || item.email || `Teacher #${item.id ?? "?"}`,
});
export default function HomeworkPage() {

  const { user, profile } = useDecodedUser();
  const schoolId  = user?.schoolId ? Number(user.schoolId) : 1;
  const isTeacher = user?.userType === "TEACHER";
  const teacherId = isTeacher ? profile?.id : null;

  // ── Teachers ──────────────────────────────────────────────────────────────
  // Only loaded for non-teacher users (admin, principal, staff, etc.)
  // so they can assign homework on behalf of a teacher.
  const [teachers,        setTeachers]        = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  // Around line where teachers are fetched:
useEffect(() => {
  if (isTeacher) return;
  const fetch_ = async () => {
    setTeachersLoading(true);
    try {
      const list = await getTeacherLookup();
      const raw  = Array.isArray(list) ? list : [];
      console.log("[HomeworkPage] teachers loaded:", raw); // ← confirm shape here
      setTeachers(raw.map(normTeacher));
    } catch (err) {
      showError(err, "Failed to load teachers");
    } finally {
      setTeachersLoading(false);
    }
  };
  fetch_();
}, [isTeacher]);

  // ── Classes ───────────────────────────────────────────────────────────────
  const [classes,        setClasses]        = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [confirmCancel,  setConfirmCancel]  = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      setClassesLoading(true);
      try {
        const raw  = await getActiveClasses(schoolId);
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const map  = new Map();
        data.map(normClass).forEach((item) => { const k = item.id || item.label; if (!map.has(k)) map.set(k, item); });
        setClasses(Array.from(map.values()));
      } catch (err) { showError(err, "Failed to load classes"); }
      finally { setClassesLoading(false); }
    };
    fetch_();
  }, [schoolId]);

  // ── Sections ──────────────────────────────────────────────────────────────
  const [selectedClassId,   setSelectedClassId]   = useState("");
  const [sections,          setSections]          = useState([]);
  const [sectionsLoading,   setSectionsLoading]   = useState(false);

  useEffect(() => {
    setSections([]); setSelectedSectionId(""); setSubjects([]); setRows([]);
    if (!selectedClassId) return;
    setSectionsLoading(true);
    getSectionsByClass(selectedClassId)
        .then((raw) => setSections((Array.isArray(raw) ? raw : raw?.data ?? []).map(normSection)))
        .catch((err) => showError(err, "Failed to load sections"))
        .finally(() => setSectionsLoading(false));
  }, [selectedClassId]);

  // ── Subjects ──────────────────────────────────────────────────────────────
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [subjects,          setSubjects]          = useState([]);
  const [subjectsLoading,   setSubjectsLoading]   = useState(false);

  useEffect(() => {
    setSubjects([]); setFilters((f) => ({ ...f, subjectFilter: "" })); setRows([]);
    if (!selectedSectionId) return;
    const fetch_ = async () => {
      setSubjectsLoading(true);
      try {
        const list = await getActiveSubjectsBySection(selectedSectionId);
        setSubjects(list.map(normSubject));
      } catch (err) { showError(err, "Failed to load subjects"); }
      finally { setSubjectsLoading(false); }
    };
    fetch_();
  }, [selectedSectionId]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const setFilter = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));

  // ── Homework list ─────────────────────────────────────────────────────────
  const [rows,        setRows]        = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  // Returns the fresh rows so callers can sync dependent state (e.g. viewHw)
  const fetchHomework = useCallback(async (currentFilters) => {
    if (!selectedClassId || !selectedSectionId) {
      toast.warn("Please select a class and section first.");
      return [];
    }
    setListLoading(true);
    try {
      const result = await getHomework({
        sectionId: selectedSectionId,
        subjectId: currentFilters.subjectFilter || undefined,
        status:    currentFilters.statusFilter  || undefined,
        dueAfter:  currentFilters.dateFrom      || undefined,
        dueBefore: currentFilters.dateTo        || undefined,
      });
      const fresh = Array.isArray(result) ? result : [];
      setRows(fresh);
      return fresh;
    } catch (err) {
      showError(err, "Failed to load homework");
      return [];
    } finally {
      setListLoading(false);
    }
  }, [selectedClassId, selectedSectionId]);

  useEffect(() => {
    if (selectedClassId && selectedSectionId) fetchHomework(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId]);

  const handleApply = useCallback(() => fetchHomework(filters), [fetchHomework, filters]);

  const handleReset = () => {
    const def = EMPTY_FILTERS;
    setFilters(def);
    if (selectedSectionId) fetchHomework(def);
  };

  const visibleRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return rows.filter((hw) =>
      !q ||
      (hw.title       ?? "").toLowerCase().includes(q) ||
      (hw.description ?? hw.desc ?? "").toLowerCase().includes(q)
    );
  }, [rows, filters.search]);

  const stats = useMemo(() => ({
    total:   rows.length,
    active:  rows.filter((hw) => hw.status === "PUBLISHED").length,
    overdue: rows.filter((hw) => hw.dueDate && new Date(hw.dueDate) < new Date() && hw.status !== "CANCELLED").length,
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
    const editingId = editHw?.id ?? null;

    try {
      const enriched = {
        ...payload,
        sectionId: Number(selectedSectionId),
        teacherId: isTeacher ? teacherId : payload.teacherId,
      };

      let saved;
      if (editHw) {
        saved = await updateHomework(editHw.id, enriched);
      } else {
        saved = await createHomework(enriched);
      }

      const savedId = saved?.id ?? saved?.data?.id ?? saved?.data?.homeworkId;

      /*
        Only call uploadHomeworkAttachment when the user actually picked a new file.
        If file is null (user kept existing attachment), we skip the upload entirely
        so the backend never overwrites / clears the stored file.
      */
      if (file && savedId) {
        await uploadHomeworkAttachment(savedId, file);
      }

      toast.success(editHw ? "Homework updated!" : "Homework published!");
      closeAssign();

      // Re-fetch and refresh viewHw so the ViewModal reflects the latest data
      const freshRows = await fetchHomework(filters);
      if (editingId && freshRows.length > 0) {
        const updated = freshRows.find((r) => r.id === editingId);
        if (updated) {
          setViewHw((prev) => (prev?.id === editingId ? updated : prev));
        }
      }
    } catch (err) {
      showError(err, "Failed to save homework");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = (hwId) => setConfirmCancel(hwId);

  const handleConfirmCancel = async () => {
    const hwId = confirmCancel;
    setConfirmCancel(null);
    setSubmitting(true);
    try {
      await cancelHomework(hwId);
      toast.success("Homework cancelled");
      fetchHomework(filters);
    } catch (err) {
      showError(err, "Failed to cancel homework");
    } finally {
      setSubmitting(false);
    }
  };

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
                isTeacher       = {isTeacher}
                teacherId       = {teacherId}
                teacherName     = {profile?.fullName}
                teachers        = {teachers}
                teachersLoading = {teachersLoading}
            />
        )}

        {confirmCancel && (
            <ConfirmModal
                message   = "Are you sure you want to cancel this homework? This action cannot be undone."
                onConfirm = {handleConfirmCancel}
                onClose   = {() => setConfirmCancel(null)}
            />
        )}
      </div>
  );
}