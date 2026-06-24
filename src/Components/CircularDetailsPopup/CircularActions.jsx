import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

/**
 * Drop this hook / state block into whichever component
 * currently owns handleReject and handleDelete.
 *
 * Replace your old window.prompt / window.confirm calls
 * with the handlers below, and render <CircularModals /> 
 * anywhere inside that component's JSX.
 */

export function useCircularActions({ rejectCircular, deleteCircular, load, setActionId }) {
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  /* ── Reject ─────────────────────────────── */
  const handleReject = (id) => {
    setRejectModal({ open: true, id, reason: "" });
  };

  const confirmReject = async () => {
    const { id, reason } = rejectModal;
    setRejectModal((s) => ({ ...s, open: false }));
    setActionId(id);
    const { error: err } = await rejectCircular(id, reason);
    if (!err) load();
    else alert(err);
    setActionId(null);
  };

  const cancelReject = () => {
    setRejectModal({ open: false, id: null, reason: "" });
  };

  /* ── Delete ─────────────────────────────── */
  const handleDelete = (id) => {
    setDeleteModal({ open: true, id });
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    setDeleteModal({ open: false, id: null });
    setActionId(id);
    const { error: err } = await deleteCircular(id);
    if (!err) load();
    else alert(err);
    setActionId(null);
  };

  const cancelDelete = () => {
    setDeleteModal({ open: false, id: null });
  };

  /* ── Modals JSX ─────────────────────────── */
  const CircularModals = (
    <>
      {/* Rejection modal — with reason input */}
      <ConfirmModal
        open={rejectModal.open}
        title="Reject circular"
        message="Please provide a reason for rejection. This will be shared with the sender."
        withInput
        inputLabel="Reason for rejection"
        inputValue={rejectModal.reason}
        onInputChange={(val) =>
          setRejectModal((s) => ({ ...s, reason: val }))
        }
        confirmLabel="Reject circular"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmReject}
        onCancel={cancelReject}
      />

      {/* Delete modal */}
      <ConfirmModal
        open={deleteModal.open}
        title="Delete circular"
        message="Are you sure you want to permanently delete this circular? This action cannot be undone."
        confirmLabel="Delete circular"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );

  return {
    handleReject,
    handleDelete,
    CircularModals,
  };
}


/**
 * ─── USAGE EXAMPLE ────────────────────────────────────────────────────────────
 *
 * import { useCircularActions } from "./CircularActions";
 * import { rejectCircular, deleteCircular } from "../api/circulars"; // your API helpers
 *
 * export default function CircularsPage() {
 *   const load = () => { ... };
 *
 *   const { actionId, handleReject, handleDelete, CircularModals } =
 *     useCircularActions({ rejectCircular, deleteCircular, load });
 *
 *   return (
 *     <div>
 *       {CircularModals}
 *
 *       {circulars.map((c) => (
 *         <div key={c.id}>
 *           <span>{c.title}</span>
 *           <button onClick={() => handleReject(c.id)} disabled={actionId === c.id}>
 *             Reject
 *           </button>
 *           <button onClick={() => handleDelete(c.id)} disabled={actionId === c.id}>
 *             Delete
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
