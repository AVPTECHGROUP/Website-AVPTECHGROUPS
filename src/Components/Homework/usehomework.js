import { useState, useCallback } from "react";
import {
  createHomework,
  updateHomework,
  deleteHomework,
  uploadHomeworkAttachment,
  updateHomeworkStatus,
  getHomeworkBySection,
} from "../../Api/Homework";

/**
 * useHomework
 *
 * Owns the homework list + all CRUD operations.
 * Every operation calls the matching homework.js API function,
 * updates local state, and shows a toast.
 *
 * @param {object} toast  – { success, error, warning } from useToast()
 */
export function useHomework(toast) {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── GET /homework/section/:sectionId ────────────────────────────────────────
  // subjectId and status are only appended when they have a real value,
  // so the API never receives ?subjectId=&status=
  const fetchHomework = useCallback(
    async ({
      sectionId,
      subjectId = "",   // LOV id — sent only when non-empty
      status    = "",   // "PUBLISHED" | "DRAFT" | "CANCELLED" | ""
      page      = 0,
      size      = 10,
      sort      = "assignedDate,desc",
    }) => {
      if (!sectionId) return;
      setLoading(true);
      try {
        const data = await getHomeworkBySection({
          sectionId,
          subjectId: subjectId || undefined,   // omit when blank → API ignores param
          status:    status    || undefined,
          page,
          size,
          sort,
        });
        // Spring Page wrapper → use content array; fall back to plain array
        setRows(data?.content ?? data ?? []);
      } catch (err) {
        toast.error("Failed to load homework", err.message);
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // ── POST /homework ───────────────────────────────────────────────────────────
  // payload must include sectionId (injected by HomeworkPage before calling this)
  const addHomework = useCallback(
    async (payload, attachFile = null) => {
      setSubmitting(true);
      try {
        const created = await createHomework(payload);

        // POST /homework/:id/attachment — only when a file was picked
        if (attachFile && created?.id) {
          await uploadHomeworkAttachment(created.id, attachFile);
        }

        // Optimistic prepend — re-fetch will overwrite with server data
        setRows((prev) => [created, ...prev]);
        toast.success(
          "Homework assigned",
          created?.message ?? "New homework has been published."
        );
        return created;
      } catch (err) {
        toast.error("Failed to assign homework", err.message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [toast]
  );

  // ── PUT /homework/:id ────────────────────────────────────────────────────────
  const editHomework = useCallback(
    async (id, payload, attachFile = null) => {
      setSubmitting(true);
      try {
        const updated = await updateHomework(id, payload);

        // POST /homework/:id/attachment — upload new file if provided
        if (attachFile && id) {
          await uploadHomeworkAttachment(id, attachFile);
        }

        setRows((prev) =>
          prev.map((h) => (h.id === id ? { ...h, ...updated } : h))
        );
        toast.success(
          "Homework updated",
          updated?.message ?? "Changes have been saved."
        );
        return updated;
      } catch (err) {
        toast.error("Failed to update homework", err.message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [toast]
  );

  // ── PATCH /homework/:id/status?status=STATUS ─────────────────────────────────
  const changeStatus = useCallback(
    async (id, status) => {
      setSubmitting(true);
      try {
        const result = await updateHomeworkStatus(id, status);
        setRows((prev) =>
          prev.map((h) => (h.id === id ? { ...h, status, ...result } : h))
        );
        const label =
          status === "CANCELLED" ? "Homework cancelled" : `Status changed to ${status}`;
        toast.success(label, result?.message ?? "");
        return result;
      } catch (err) {
        toast.error("Failed to change status", err.message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [toast]
  );

  // ── DELETE /homework/:id ─────────────────────────────────────────────────────
  const removeHomework = useCallback(
    async (id) => {
      setSubmitting(true);
      try {
        const result = await deleteHomework(id);
        setRows((prev) => prev.filter((h) => h.id !== id));
        toast.success(
          "Homework deleted",
          typeof result === "object" ? (result?.message ?? "") : ""
        );
        return result;
      } catch (err) {
        toast.error("Failed to delete homework", err.message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [toast]
  );

  return {
    rows,
    loading,
    submitting,
    fetchHomework,
    addHomework,
    editHomework,
    changeStatus,
    removeHomework,
  };
}