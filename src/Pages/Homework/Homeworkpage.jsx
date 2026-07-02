import { useState, useEffect, useMemo, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../../Components/Homework/confirmmodal";

import { useDecodedUser } from "../../ContextAPI/UserContext";

import ControlBar from "../../Components/Homework/Controlbar";
import HomeworkTable from "../../Components/Homework/Homeworktable";
import AssignModal from "../../Components/Homework/Assignmodal";
import ViewModal from "../../Components/Homework/Viewmodal";

import {
  createHomework,
  updateHomework,
  cancelHomework,
  uploadHomeworkAttachment,
  getHomework,
  getHomeworkById,
  getActiveSubjectsBySection,
  getTeacherLookup,
} from "../../Api/Academics/Homework";

import { getActiveClasses, getSectionsByClass } from "../../Api/Academics/ClassSectionAPI";
import { HOMEWORK_CONSTS, COMMON_STATUS } from "../../Constants/StringConstants/AcademicsConstants";

const showError = (err, fallback = HOMEWORK_CONSTS.ERRORS.FALLBACK) =>
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
  statusFilter: "",
  search: "",
  ...getDefaultDates(),
};

const normClass = (item) => ({ id: item.id ?? item.classId ?? "", label: item.name ?? item.className ?? item.label ?? "" });
const normSection = (item) => ({ id: item.id ?? item.sectionId ?? "", label: item.name ?? item.sectionName ?? item.label ?? "" });
const normSubject = (item) => ({ id: item.subjectId ?? item.id ?? "", label: item.subjectName ?? item.name ?? item.label ?? "" });

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

async function fetchFullRecord(id) {
  const res = await getHomeworkById(id);
  const full = res?.data ?? res;
  return full?.id ? full : null;
}

export default function HomeworkPage() {

  const { user, profile } = useDecodedUser();
  const schoolId = user?.schoolId ? Number(user.schoolId) : 1;
  const isTeacher = user?.userType === "TEACHER";
  const teacherId = isTeacher ? profile?.id : null;

  // ── Teachers ──────────────────────────────────────────────────────────────
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  useEffect(() => {
    if (isTeacher) return;
    const fetch_ = async () => {
      setTeachersLoading(true);
      try {
        const list = await getTeacherLookup();
        setTeachers((Array.isArray(list) ? list : []).map(normTeacher));
      } catch (err) { showError(err, HOMEWORK_CONSTS.ERRORS.LOAD_TEACHERS); }
      finally { setTeachersLoading(false); }
    };
    fetch_();
  }, [isTeacher]);

  // ── Classes ───────────────────────────────────────────────────────────────
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      setClassesLoading(true);
      try {
        const raw = await getActiveClasses(schoolId);
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const map = new Map();
        data.map(normClass).forEach((item) => {
          const k = item.id || item.label;
          if (!map.has(k)) map.set(k, item);
        });
        setClasses(Array.from(map.values()));
      } catch (err) { showError(err, HOMEWORK_CONSTS.ERRORS.LOAD_CLASSES); }
      finally { setClassesLoading(false); }
    };
    fetch_();
  }, [schoolId]);

  // ── Sections ──────────────────────────────────────────────────────────────
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  useEffect(() => {
    setSections([]);
    setSelectedSectionId("");
    setSubjects([]);
    setRows([]);
    if (!selectedClassId) return;
    setSectionsLoading(true);
    getSectionsByClass(selectedClassId)
      .then((raw) => setSections((Array.isArray(raw) ? raw : raw?.data ?? []).map(normSection)))
      .catch((err) => showError(err, HOMEWORK_CONSTS.ERRORS.LOAD_SECTIONS))
      .finally(() => setSectionsLoading(false));
  }, [selectedClassId]);

  // ── Subjects ──────────────────────────────────────────────────────────────
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  useEffect(() => {
    setSubjects([]);
    setFilters((f) => ({ ...f, subjectFilter: "" }));
    setRows([]);
    if (!selectedSectionId) return;
    const fetch_ = async () => {
      setSubjectsLoading(true);
      try {
        const list = await getActiveSubjectsBySection(selectedSectionId);
        setSubjects((Array.isArray(list) ? list : []).map(normSubject));
      } catch (err) { showError(err, HOMEWORK_CONSTS.ERRORS.LOAD_SUBJECTS); }
      finally { setSubjectsLoading(false); }
    };
    fetch_();
  }, [selectedSectionId]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const setFilter = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));

  // ── Homework list ─────────────────────────────────────────────────────────
  const [rows, setRows] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  const doFetch = async (sectionId, currentFilters) => {
    if (!sectionId) return;
    setListLoading(true);
    try {
      const result = await getHomework({
        sectionId,
        subjectId: currentFilters.subjectFilter || undefined,
        status: currentFilters.statusFilter || undefined,
        dueAfter: currentFilters.dateFrom || undefined,
        dueBefore: currentFilters.dateTo || undefined,
      });
      setRows(Array.isArray(result) ? result : []);
    } catch (err) {
      showError(err, HOMEWORK_CONSTS.ERRORS.LOAD_HOMEWORK);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedSectionId) return;
    doFetch(selectedSectionId, filters);
  }, [selectedSectionId]);

  const handleApply = () => {
    if (!selectedSectionId) {
      toast.warn(HOMEWORK_CONSTS.WARNINGS.SELECT_FIRST);
      return;
    }
    doFetch(selectedSectionId, filters);
  };

  const handleReset = () => {
    const def = { ...EMPTY_FILTERS };
    setFilters(def);
    doFetch(selectedSectionId, def);
  };

  // ── Search: client-side only ──────────────────────────────────────────────
  const visibleRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((hw) =>
      (hw.title ?? "").toLowerCase().includes(q) ||
      (hw.description ?? hw.desc ?? "").toLowerCase().includes(q)
    );
  }, [rows, filters.search]);

  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((hw) => hw.status === COMMON_STATUS.PUBLISHED).length,
    overdue: rows.filter((hw) => hw.dueDate && new Date(hw.dueDate) < new Date() && hw.status !== COMMON_STATUS.CANCELLED).length,
  }), [rows]);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [assignOpen, setAssignOpen] = useState(false);
  const [viewHw, setViewHw] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [editHw, setEditHw] = useState(null);

  const closeAssign = () => { setAssignOpen(false); setEditHw(null); };

  const handleView = useCallback(async (hw) => {
    setViewLoading(true);
    setViewHw(hw);
    try {
      const full = await fetchFullRecord(hw.id);
      if (full) setViewHw(full);
    } catch { /* keep list row */ }
    finally { setViewLoading(false); }
  }, []);

  const openEdit = useCallback(async (hw) => {
    setViewHw(null);
    setViewLoading(false);
    if (viewHw?.id === hw.id && viewHw?.academicYearLabel != null) {
      setEditHw(viewHw);
      setAssignOpen(true);
      return;
    }
    try {
      const full = await fetchFullRecord(hw.id);
      setEditHw(full ?? hw);
    } catch { setEditHw(hw); }
    setAssignOpen(true);
  }, [viewHw]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (payload, file) => {
    setSubmitting(true);
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
      if (file && savedId) await uploadHomeworkAttachment(savedId, file);
      toast.success(editHw ? HOMEWORK_CONSTS.SUCCESS.UPDATED : HOMEWORK_CONSTS.SUCCESS.PUBLISHED);
      setAssignOpen(false);
      setEditHw(null);
      setViewHw(null);
      await doFetch(selectedSectionId, filters);
    } catch (err) {
      showError(err, HOMEWORK_CONSTS.ERRORS.SAVE_HOMEWORK);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel homework ───────────────────────────────────────────────────────
  const handleCancel = (hwId) => setConfirmCancel(hwId);

  const handleConfirmCancel = async () => {
    const hwId = confirmCancel;
    setConfirmCancel(null);
    setSubmitting(true);
    try {
      await cancelHomework(hwId);
      toast.success(HOMEWORK_CONSTS.SUCCESS.CANCELLED);
      await doFetch(selectedSectionId, filters);
    } catch (err) { showError(err, HOMEWORK_CONSTS.ERRORS.CANCEL_HOMEWORK); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="flex flex-col min-h-0 h-full">

      <div className="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <BookOpen size={18} className="text-blue-700 shrink-0" />
        <h1 className="text-sm font-bold text-gray-900">{HOMEWORK_CONSTS.PAGE_TITLE}</h1>
      </div>

      <div className="flex-1 min-h-0 m-3 sm:m-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <ControlBar
          classes={classes}
          classesLoading={classesLoading}
          sections={sections}
          sectionsLoading={sectionsLoading}
          subjects={subjects}
          subjectsLoading={subjectsLoading}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          total={stats.total}
          active={stats.active}
          overdue={stats.overdue}
          subjectFilter={filters.subjectFilter}
          setSubjectFilter={setFilter("subjectFilter")}
          statusFilter={filters.statusFilter}
          setStatusFilter={setFilter("statusFilter")}
          dateFrom={filters.dateFrom}
          setDateFrom={setFilter("dateFrom")}
          dateTo={filters.dateTo}
          setDateTo={setFilter("dateTo")}
          search={filters.search}
          setSearch={setFilter("search")}
          onReset={handleReset}
          onApply={handleApply}
          onAssign={() => setAssignOpen(true)}
        />

        <div className="flex-1 min-h-0 overflow-auto">
          <HomeworkTable
            rows={visibleRows}
            loading={listLoading}
            submitting={submitting}
            onView={handleView}
            onEdit={openEdit}
            onCancel={handleCancel}
          />
        </div>
      </div>

      {viewHw && (
        <ViewModal
          hw={viewHw}
          loading={viewLoading}
          onClose={() => { setViewHw(null); setViewLoading(false); }}
          onEdit={openEdit}
        />
      )}

      {assignOpen && (
        <AssignModal
          mode={editHw ? "edit" : "assign"}
          hw={editHw}
          subjects={subjects}
          subjectsLoading={subjectsLoading}
          submitting={submitting}
          onClose={closeAssign}
          onSave={handleSave}
          isTeacher={isTeacher}
          teacherId={teacherId}
          teacherName={profile?.fullName}
          teachers={teachers}
          teachersLoading={teachersLoading}
        />
      )}

      {confirmCancel && (
        <ConfirmModal
          message={HOMEWORK_CONSTS.CONFIRM.CANCEL_MSG}
          onConfirm={handleConfirmCancel}
          onClose={() => setConfirmCancel(null)}
        />
      )}
    </div>
  );
}